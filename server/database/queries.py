from datetime import datetime
import sqlparse
# import mariadb

def get_profiles(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM perfil"
               cursor.execute(sql)
               result = cursor.fetchall()

          return result
     except Exception as e:
          print(f"Erro ao recuperar perfis: {e}")
          return None
          
     # cursor = con.cursor(dictionary=True)
     # sql = "SELECT * FROM perfil"
     # cursor.execute(sql)
     # result = cursor.fetchall()
     # cursor.close()
     # return result

def get_profile(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM perfil WHERE id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

               if result:
                    media_id = result.get("fk_midia_id_midia")

                    if media_id:
                         result["media"] = get_media(con, media_id)

                         if result["media"] is None:
                              raise Exception("Erro ao recuperar foto de perfil.")
          return result
     except Exception as e:
          print(f"Erro ao recuperar perfil: {e}")
          return None
          
     # cursor = con.cursor(dictionary=True)
     # sql = "SELECT * FROM perfil WHERE id_perfil = %s"
     # cursor.execute(sql, (profile_id,))
     # result = cursor.fetchone()

     # if result:
     #      media_id = result.get("fk_midia_id_midia")

     #      if media_id:
     #           result["media"] = get_media(con, media_id)

     # cursor.close()
     # return result

def insert_profile(con, email, password, name, bio, private):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "INSERT INTO perfil (email, senha, nome, verificado, ativo, privado, biografia) VALUES (%s, %s, %s, %s, %s, %s, %s)"
               cursor.execute(sql, (email, password, name, 0, 1, 1 if private else 0, bio))
               profile_id = cursor.lastrowid

               if insert_user(con, profile_id) is None:
                    raise Exception("Erro ao inserir usuário do perfil.")

               if insert_default_profile_config(con, profile_id, private) is None:
                    raise Exception("Erro ao inserir configuração do perfil.")

          con.commit() 
          return profile_id
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir perfil: {e}")
          return None

     # cursor = con.cursor()
     # sql = "INSERT INTO perfil (email, senha, nome, verificado, ativo, privado, biografia) VALUES (%s, %s, %s, %s, %s, %s, %s)"
     # cursor.execute(sql, (email, password, name, 0, 1, 1 if private else 0, bio))
     # con.commit() 
     # profile_id = cursor.lastrowid

     # insert_user(con, profile_id)
     # insert_default_profile_config(con, profile_id, private)

     # cursor.close()
     # return profile_id

def insert_profile_preferences(con, profile_id, sports_ids):
     if not sports_ids:
          return True

     try:
          with con.cursor() as cursor:
               data = [(profile_id, sport_id) for sport_id in sports_ids]
               sql = "INSERT INTO preferencia (fk_perfil_id_perfil, fk_esporte_id_esporte) VALUES (%s, %s)"
               cursor.executemany(sql, data)    

          con.commit() 
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir preferências do perfil: {e}")
          return False
    
     # con.cursor()
     # sql = "INSERT INTO preferencia (fk_perfil_id_perfil, fk_esporte_id_esporte) VALUES (%s, %s)"
     
     # for sport_id in sports_ids:
     #      cursor.execute(sql, (profile_id, sport_id))
    
     # con.commit() 
     # cursor.close()
     # return True

def insert_user(con, profile_id):
     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO usuario (fk_perfil_id_perfil) VALUES (%s)"
               cursor.execute(sql, (profile_id,))
               user_id = cursor.lastrowid

          con.commit()
          return user_id
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir usuário: {e}")
          return None

     # cursor = con.cursor()
     # sql = "INSERT INTO usuario (fk_perfil_id_perfil) VALUES (%s)"
     # cursor.execute(sql, (profile_id,))
     # user_id = cursor.lastrowid
     # con.commit() 
     # cursor.close()
     # return user_id

def insert_default_profile_config(con, profile_id, is_private):
     try:
          with con.cursor() as cursor:
               sql = """
                    INSERT INTO configuracao (
                    permissao_camera,
                    permissao_microfone,
                    permissao_fotos_videos,
                    permissao_localizacao,
                    visibilidade_curtidas,
                    visibilidade_compartilhamentos,
                    visibilidade_comentarios,
                    visibilidade_seguidores,
                    visibilidade_seguindo,
                    permissao_marcacao,
                    permissao_compartilhamento,
                    permissao_comentario,
                    notificacoes,
                    notificacoes_email,
                    fk_perfil_id_perfil
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               """

               default_values = (
                    False,  
                    False,  
                    False,  
                    False,  
                    not is_private,  
                    not is_private,  
                    not is_private,  
                    not is_private,  
                    not is_private,  
                    'todos',
                    'todos',
                    'todos',
                    True,  
                    True,  
                    profile_id
               )

               cursor.execute(sql, default_values)
               config_id = cursor.lastrowid
          
          con.commit() 
          return config_id
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir configuração do perfil: {e}")
          return None

     # cursor = con.cursor()
     # sql = """
     #      INSERT INTO configuracao (
     #      permissao_camera,
     #      permissao_microfone,
     #      permissao_fotos_videos,
     #      permissao_localizacao,
     #      visibilidade_curtidas,
     #      visibilidade_compartilhamentos,
     #      visibilidade_comentarios,
     #      visibilidade_seguidores,
     #      visibilidade_seguindo,
     #      permissao_marcacao,
     #      permissao_compartilhamento,
     #      permissao_comentario,
     #      notificacoes,
     #      notificacoes_email,
     #      fk_perfil_id_perfil
     #      ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
     # """

     # default_values = (
     #      False,  
     #      False,  
     #      False,  
     #      False,  
     #      not is_private,  
     #      not is_private,  
     #      not is_private,  
     #      not is_private,  
     #      not is_private,  
     #      'todos',
     #      'todos',
     #      'todos',
     #      True,  
     #      True,  
     #      profile_id
     # )

     # cursor.execute(sql, default_values)
     # con.commit() 
     # cursor.close()

def insert_post(con, caption, profile_id, hashtags_ids, tags_ids, medias):
     try:
          with con.cursor() as cursor:
               date = datetime.now()
               sql = "INSERT INTO postagem (legenda, data_publicacao, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
               cursor.execute(sql, (caption, date, profile_id))
               post_id = cursor.lastrowid

               if hashtags_ids:
                    if not insert_post_hashtags(con, post_id, hashtags_ids):
                         raise Exception("Erro ao inserir hashtags da postagem.")

               if tags_ids:
                    if not insert_post_tags(con, post_id, tags_ids):
                         raise Exception("Erro ao inserir marcações da postagem.")

               if not insert_post_medias(con, post_id, medias):
                    raise Exception("Erro ao inserir mídias da postagem.")

          con.commit()
          return post_id
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir postagem: {e}")
          return None

     # cursor = con.cursor()
     # date = datetime.now()
     # sql = "INSERT INTO postagem (legenda, data_publicacao, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
     # cursor.execute(sql, (caption, date, profile_id))
     # con.commit()
     # post_id = cursor.lastrowid

     # insert_post_hashtags(con, post_id, hashtags_ids)
     # insert_post_tags(con, post_id, tags_ids)
     # insert_post_medias(con, medias)
     
     # cursor.close()

def insert_post_hashtags(con, post_id, hashtags_ids):
     try:
          with con.cursor() as cursor:
               data = [(post_id, hashtag_id) for hashtag_id in hashtags_ids]
               sql = "INSERT INTO postagem_hashtag (fk_postagem_id_postagem, fk_hashtag_id_hashtag) VALUES (%s, %s)"
               cursor.executemany(sql, data)

          con.commit()
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir hashtags da postagem: {e}")
          return False

     # cursor = con.cursor()
     # sql = "INSERT INTO postagem_hashtag (fk_postagem_id_postagem, fk_hashtag_id_hashtag) VALUES (%s, %s)"

     # for hashtag_id in hashtags_ids:
     #      cursor.execute(sql, (post_id, hashtag_id))
    
     # con.commit() 
     # cursor.close()

def insert_post_tags(con, post_id, profiles_ids):
     try:
          with con.cursor() as cursor:
               data = [(post_id, profile_id) for profile_id in profiles_ids]
               sql = "INSERT INTO marcacao_postagem (fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s)"
               cursor.executemany(sql, data) 

          con.commit()
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir marcações da postagem: {e}")      
          return False

     # cursor = con.cursor()
     # sql = "INSERT INTO marcacao_postagem (fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s)"
     
     # for profile_id in profiles_ids:
     #      cursor.execute(sql, (profile_id, post_id))
    
     # con.commit() 
     # cursor.close()

def insert_post_medias(con, post_id, medias):
     try:
          with con.cursor() as cursor:
               data = [(post_id, media["path"], media["type"], media["format"]) for media in medias]
               sql = "INSERT INTO midia (fk_postagem_id_postagem, caminho, tipo, formato) VALUES (%s, %s, %s, %s)"
               cursor.executemany(sql, data) 

          con.commit()
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir mídias da postagem: {e}")      
          return False

     # cursor = con.cursor()
     # sql = "INSERT INTO midia (caminho, tipo, formato, fk_postagem_id_postagem) VALUES (%s, %s, %s, %s)"
     
     # for media in medias:
     #      cursor.execute(sql, (media["path"], media["type"], media["format"], post_id))
    
     # con.commit() 
     # cursor.close()

def insert_media(con, path, type, format):
     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO midia (caminho, tipo, formato) VALUES (%s, %s, %s)"
               cursor.execute(sql, (path, type, format))
               media_id = cursor.lastrowid
          
          con.commit()
          return media_id
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir mídia: {e}")
          return None

     # cursor = con.cursor()
     # sql = "INSERT INTO midia (caminho, tipo, formato) VALUES (%s, %s, %s)"
     # cursor.execute(sql, (path, type, format))
     # con.commit()
     # media_id = cursor.lastrowid
     # cursor.close()
     # return media_id

def get_media(con, media_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM midia WHERE id_midia = %s"
               cursor.execute(sql, (media_id,))
               result = cursor.fetchone()

          return result
     except Exception as e:
          print(f"Erro ao recuperar mídia: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = "SELECT * FROM midia WHERE id_midia = %s"
     # cursor.execute(sql, (media_id,))
     # result = cursor.fetchone()
     # cursor.close()
     # return result

def insert_profile_photo(con, profile_id, media_id):
     try:
          with con.cursor() as cursor:
               sql = "UPDATE perfil SET fk_midia_id_midia = %s WHERE id_perfil = %s"
               cursor.execute(sql, (media_id, profile_id))          

          con.commit()
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir foto de perfil: {e}")
          return False
     
     # cursor = con.cursor()
     # sql = "UPDATE perfil SET fk_midia_id_midia = %s WHERE id_perfil = %s"
     # cursor.execute(sql, (media_id, profile_id))
     # con.commit()
     # cursor.close()

def get_followeds(con, follower_profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM segue WHERE fk_perfil_id_seguidor = %s"
               cursor.execute(sql, (follower_profile_id,))
               result = cursor.fetchall()

               followeds_ids = [item['fk_perfil_id_seguido'] for item in result]

          con.commit()
          return followeds_ids
     except Exception as e:
          print(f"Erro ao recuperar perfis seguidos: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = "SELECT * FROM segue WHERE fk_perfil_id_seguidor = %s"
     # cursor.execute(sql, (follower_profile_id,))
     # result = cursor.fetchall()
     # cursor.close()

     # followeds_ids = [item['fk_perfil_id_seguido'] for item in result]

     # return followeds_ids

def get_feed_posts(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               followeds_ids = get_followeds(con, profile_id)

               if not followeds_ids:
                    return []

               placeholders = ','.join(['%s'] * len(followeds_ids))
               sql = f"SELECT * FROM postagem WHERE fk_perfil_id_perfil IN ({placeholders})"
               cursor.execute(sql, tuple(followeds_ids))
               result = cursor.fetchall()

               posts_ids = [post["id_postagem"] for post in result]

               if not posts_ids:
                    return []
          
               medias = get_post_medias_for_feed(con, posts_ids) 
               hashtags = get_post_hashtags_for_feed(con, posts_ids) 
               tags = get_post_tags_for_feed(con, posts_ids) 
               comments = get_post_comments_for_feed(con, posts_ids)       

               authors_ids = [post["fk_perfil_id_perfil"] for post in result]
               authors = get_profiles_for_feed(con, authors_ids)

               if medias is None or hashtags is None or tags is None or comments is None or authors is None:
                    raise Exception("Erro ao recuperar dados das postagens.")

               feed = []

               for post in result:
                    post["medias"] = medias.get(post["id_postagem"], [])

                    if not post["medias"]:
                         raise Exception("Erro ao recuperar mídias da postagem.")

                    post["author"] = authors.get(post["fk_perfil_id_perfil"], {})
                    
                    if not post["author"]:
                         raise Exception("Erro ao recuperar autor da postagem.")

                    post["hashtags"] = hashtags.get(post["id_postagem"], [])
                    post["tags"] = tags.get(post["id_postagem"], [])
                    post["comments"] = comments.get(post["id_postagem"], [])
                    post["isLiked"] = check_like(con, profile_id, post["id_postagem"])
                    
                    if post["isLiked"] is None:
                         raise Exception("Erro ao recuperar status de curtida da postagem.")

                    post["isComplainted"] = check_complaint(con, profile_id, post["id_postagem"])
                    
                    if post["isComplainted"] is None:
                         raise Exception("Erro ao recuperar status de denúncia da postagem. ")

                    feed.append(post)

          return feed
     except Exception as e:
          print(f"Erro ao recuperar feed do perfil: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # followeds_ids = get_followeds(con, profile_id)
     
     # if not followeds_ids:
     #      return []
     
     # feed = []

     # placeholders = ','.join(['%s'] * len(followeds_ids))
     # sql = f"SELECT * FROM postagem WHERE fk_perfil_id_perfil IN ({placeholders})"
     # cursor.execute(sql, tuple(followeds_ids))
     # result = cursor.fetchall()

     # posts_ids = [post["id_postagem"] for post in result]

     # if posts_ids:
     #      medias = get_post_medias_for_feed(con, posts_ids) 
     #      hashtags = get_post_hashtags_for_feed(con, posts_ids) 
     #      tags = get_post_tags_for_feed(con, posts_ids) 
     #      comments = get_post_comments_for_feed(con, posts_ids)

     # authors_ids = [post["fk_perfil_id_perfil"] for post in result]
     # authors = get_profiles_for_feed(con, authors_ids)

     # for post in result:
     #      post["medias"] = medias.get(post["id_postagem"], [])
     #      post["author"] = authors.get(post["fk_perfil_id_perfil"], {})
     #      post["hashtags"] = hashtags.get(post["id_postagem"], [])
     #      post["tags"] = tags.get(post["id_postagem"], [])
     #      post["comments"] = comments.get(post["id_postagem"], [])
     #      post["isLiked"] = check_like(con, profile_id, post["id_postagem"])
     #      post["isComplainted"] = check_complaint(con, profile_id, post["id_postagem"])
     #      feed.append(post)

     # cursor.close()
     # return feed

def get_profiles_for_feed(con, profiles_ids):
     if not profiles_ids:
          return None
     
     try:
          with con.cursor(dictionary=True) as cursor:
               placeholders = ','.join(['%s'] * len(profiles_ids))
               sql = f"SELECT * FROM perfil WHERE id_perfil IN ({placeholders})"
               cursor.execute(sql, tuple(profiles_ids))
               result = cursor.fetchall()

               profiles = {profile['id_perfil']: profile for profile in result}
               profiles_photos = get_profiles_photos_for_feed(con, profiles_ids)

               for _, profile in profiles.items():
                    media_id = profile.get("fk_midia_id_midia")

                    if media_id:
                         profile["media"] = profiles_photos.get(profile["id_perfil"], {})
          return profiles
     except Exception as e:
          print(f"Erro ao recuperar perfis para o feed: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # placeholders = ','.join(['%s'] * len(profiles_ids))
     # sql = f"""
     #      SELECT * FROM perfil
     #      WHERE id_perfil IN ({placeholders})
     # """
     # cursor.execute(sql, tuple(profiles_ids))
     # result = cursor.fetchall()
     # cursor.close()

     # profiles = {profile['id_perfil']: profile for profile in result}
     # profiles_photos = get_profiles_photos_for_feed(con, profiles_ids)

     # for _, profile in profiles.items():
     #      if "fk_midia_id_midia" in profile and profile["fk_midia_id_midia"]:
     #           profile["media"] = profiles_photos.get(profile["fk_midia_id_midia"])

     # return profiles

def get_profiles_photos_for_feed(con, profiles_ids):
     try:
          with con.cursor(dictionary=True) as cursor:
               placeholders = ','.join(['%s'] * len(profiles_ids))
               sql = f"""
                    SELECT m.*, p.id_perfil
                    FROM perfil p
                    LEFT JOIN midia m ON p.fk_midia_id_midia = m.id_midia
                    WHERE p.id_perfil IN ({placeholders})
               """
               cursor.execute(sql, tuple(profiles_ids))
               result = cursor.fetchall()

               profiles_photos = {media['id_perfil']: media for media in result}
          
          return profiles_photos
     except Exception as e:
          print(f"Erro ao recuperar fotos dos perfis: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # placeholders = ','.join(['%s'] * len(profiles_ids))
     # sql = f"""
     #      SELECT m.*, p.id_perfil
     #      FROM perfil p
     #      LEFT JOIN midia m ON p.fk_midia_id_midia = m.id_midia
     #      WHERE p.id_perfil IN ({placeholders})
     # """
     # cursor.execute(sql, tuple(profiles_ids))
     # result = cursor.fetchall()
     # cursor.close()

     # profiles_photos = {media['id_perfil']: media for media in result}

     # return profiles_photos

def get_post_medias(con, post_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM midia WHERE fk_postagem_id_postagem = %s"
               cursor.execute(sql, (post_id,))
               result = cursor.fetchall()

          return result
     except Exception as e:
          print(f"Erro ao recuperar mídias do post: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = "SELECT * FROM midia WHERE fk_postagem_id_postagem = %s"
     # cursor.execute(sql, (post_id,))
     # result = cursor.fetchall()
     # cursor.close()
     # return result

def get_post_medias_for_feed(con, posts_ids):
     try:
          with con.cursor(dictionary=True) as cursor:
               placeholders = ','.join(['%s'] * len(posts_ids))
               sql = f"""
                    SELECT * FROM midia
                    WHERE fk_postagem_id_postagem IN ({placeholders})
               """
               cursor.execute(sql, tuple(posts_ids))
               result = cursor.fetchall()

               medias = {}

               for media in result:
                    medias.setdefault(media['fk_postagem_id_postagem'], []).append(media)

          return medias
     except Exception as e:
          print(f"Erro ao recuperar mídias das postagens: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # placeholders = ','.join(['%s'] * len(posts_ids))
     # sql = f"""
     #      SELECT * FROM midia
     #      WHERE fk_postagem_id_postagem IN ({placeholders})
     # """
     # cursor.execute(sql, tuple(posts_ids))
     # result = cursor.fetchall()
     # cursor.close()

     # medias = {}

     # for media in result:
     #      medias.setdefault(media['fk_postagem_id_postagem'], []).append(media)

     # return medias

def get_post_hashtags(con, post_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT h.*
                    FROM hashtag h
                    JOIN postagem_hashtag ph ON h.id_hashtag = ph.fk_hashtag_id_hashtag
                    WHERE ph.fk_postagem_id_postagem = %s;
               """
               cursor.execute(sql, (post_id,))
               result = cursor.fetchall()

          return result
     except Exception as e:
          print(f"Erro ao recuperar hashtags da postagem: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = """
     #      SELECT h.*
     #      FROM hashtag h
     #      JOIN postagem_hashtag ph ON h.id_hashtag = ph.fk_hashtag_id_hashtag
     #      WHERE ph.fk_postagem_id_postagem = %s;
     # """
     # cursor.execute(sql, (post_id,))
     # result = cursor.fetchall()
     # cursor.close()
     # return result

def get_post_hashtags_for_feed(con, posts_ids):
     try:
          with con.cursor(dictionary=True) as cursor:
               placeholders = ','.join(['%s'] * len(posts_ids))
               sql = f"""
                    SELECT h.*, ph.fk_postagem_id_postagem
                    FROM hashtag h
                    JOIN postagem_hashtag ph ON h.id_hashtag = ph.fk_hashtag_id_hashtag
                    WHERE ph.fk_postagem_id_postagem IN ({placeholders})
               """
               cursor.execute(sql, tuple(posts_ids))
               result = cursor.fetchall()

               hashtags = {}

               for hashtag in result:
                    hashtags.setdefault(hashtag['fk_postagem_id_postagem'], []).append(hashtag)

          return hashtags
     except Exception as e:
          print(f"Erro ao recuperar hashtags das postagens: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # placeholders = ','.join(['%s'] * len(posts_ids))
     # sql = f"""
     #      SELECT h.*, ph.fk_postagem_id_postagem
     #      FROM hashtag h
     #      JOIN postagem_hashtag ph ON h.id_hashtag = ph.fk_hashtag_id_hashtag
     #      WHERE ph.fk_postagem_id_postagem IN ({placeholders})
     # """
     # cursor.execute(sql, tuple(posts_ids))
     # result = cursor.fetchall()
     # cursor.close()

     # hashtags = {}

     # for hashtag in result:
     #      hashtags.setdefault(hashtag['fk_postagem_id_postagem'], []).append(hashtag)

     # return hashtags

def get_post_comments(con, post_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT c.texto, m.caminho
                    FROM comentario c
                    JOIN perfil p ON p.id_perfil = c.fk_perfil_id_perfil
                    LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
                    WHERE c.fk_postagem_id_postagem = %s;
               """
               cursor.execute(sql, (post_id,))
               result = cursor.fetchall()

          return result
     except Exception as e:
          print(f"Erro ao recuperar comentários da postagem: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = """
     #      SELECT c.texto, m.caminho
     #      FROM comentario c
     #      JOIN perfil p ON p.id_perfil = c.fk_perfil_id_perfil
     #      LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
     #      WHERE c.fk_postagem_id_postagem = %s;
     # """
     # cursor.execute(sql, (post_id,))
     # result = cursor.fetchall()
     # cursor.close()
     # return result

def get_post_comments_for_feed(con, post_ids):
     try:
          with con.cursor(dictionary=True) as cursor:
               placeholders = ','.join(['%s'] * len(post_ids))
               sql = f"""
                    SELECT c.texto, c.fk_postagem_id_postagem, c.data_comentario, m.caminho
                    FROM comentario c
                    JOIN perfil p ON p.id_perfil = c.fk_perfil_id_perfil
                    LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
                    WHERE c.fk_postagem_id_postagem IN ({placeholders})
                    ORDER BY c.data_comentario
               """
               cursor.execute(sql, tuple(post_ids))
               result = cursor.fetchall()

               comments = {}

               for comment in result:
                    comments.setdefault(comment['fk_postagem_id_postagem'], []).append(comment)

          return comments
     except Exception as e:
          print(f"Erro ao recuperar comentários das postagens: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # placeholders = ','.join(['%s'] * len(post_ids))
     # sql = f"""
     #      SELECT c.texto, c.fk_postagem_id_postagem, m.caminho
     #      FROM comentario c
     #      JOIN perfil p ON p.id_perfil = c.fk_perfil_id_perfil
     #      LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
     #      WHERE c.fk_postagem_id_postagem IN ({placeholders})
     # """
     # cursor.execute(sql, tuple(post_ids))
     # result = cursor.fetchall()
     # cursor.close()

     # comments = {}

     # for comment in result:
     #      comments.setdefault(comment['fk_postagem_id_postagem'], []).append(comment)

     # return comments

def get_post_tags(con, post_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT p.id_perfil, p.nome, m.caminho 
                    FROM perfil p
                    LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
                    JOIN marcacao_postagem mp ON mp.fk_perfil_id_perfil = p.id_perfil 
                    WHERE mp.fk_postagem_id_postagem = %s
               """
               cursor.execute(sql, (post_id,))
               result = cursor.fetchall()

          return result
     except Exception as e:
          print(f"Erro ao recuperar marcações da postagem: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = """
     #      SELECT p.id_perfil, p.nome, m.caminho 
     #      FROM perfil p
     #      LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
     #      JOIN marcacao_postagem mp ON mp.fk_perfil_id_perfil = p.id_perfil 
     #      WHERE mp.fk_postagem_id_postagem = %s
     # """
     # cursor.execute(sql, (post_id,))
     # result = cursor.fetchall()
     # cursor.close()
     # return result

def get_post_tags_for_feed(con, posts_ids):
     try:
          with con.cursor(dictionary=True) as cursor:
               placeholders = ','.join(['%s'] * len(posts_ids))
               sql = f"""
                    SELECT p.id_perfil, p.nome, m.caminho, mp.fk_postagem_id_postagem
                    FROM perfil p
                    LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
                    JOIN marcacao_postagem mp ON mp.fk_perfil_id_perfil = p.id_perfil 
                    WHERE mp.fk_postagem_id_postagem IN ({placeholders})
               """
               cursor.execute(sql, tuple(posts_ids))
               result = cursor.fetchall()

               tags = {}

               for tag in result:
                    tags.setdefault(tag['fk_postagem_id_postagem'], []).append(tag)

          return tags
     except Exception as e:
          print(f"Erro ao recuperar marcações das postagens: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # placeholders = ','.join(['%s'] * len(posts_ids))
     # sql = f"""
     #      SELECT p.id_perfil, p.nome, m.caminho, mp.fk_postagem_id_postagem
     #      FROM perfil p
     #      LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
     #      JOIN marcacao_postagem mp ON mp.fk_perfil_id_perfil = p.id_perfil 
     #      WHERE mp.fk_postagem_id_postagem IN ({placeholders})
     # """
     # cursor.execute(sql, tuple(posts_ids))
     # result = cursor.fetchall()
     # cursor.close()

     # tags = {}

     # for tag in result:
     #      tags.setdefault(tag['fk_postagem_id_postagem'], []).append(tag)

     # return tags

def toggle_like(con, profile_id, post_id):
     try:
          with con.cursor() as cursor:
               sql_check = "SELECT * FROM curte WHERE fk_perfil_id_perfil = %s AND fk_postagem_id_postagem = %s"
               cursor.execute(sql_check, (profile_id, post_id))
               result = cursor.fetchone()

               if result:
                    sql_delete = "DELETE FROM curte WHERE fk_perfil_id_perfil = %s AND fk_postagem_id_postagem = %s"
                    cursor.execute(sql_delete, (profile_id, post_id))
                    is_liked = False
               else:
                    sql_insert = "INSERT INTO curte (fk_perfil_id_perfil, fk_postagem_id_postagem) VALUES (%s, %s)"
                    cursor.execute(sql_insert, (profile_id, post_id))
                    is_liked = True
                    
          con.commit()
          return is_liked
     except Exception as e:
          con.rollback()
          print(f"Erro ao curtir postagem: {e}")
          return None

     # cursor = con.cursor()
     # sql_check = "SELECT * FROM curte WHERE fk_perfil_id_perfil = %s AND fk_postagem_id_postagem = %s"
     # cursor.execute(sql_check, (profile_id, post_id))
     # result = cursor.fetchone()

     # if result:
     #           sql_delete = "DELETE FROM curte WHERE fk_perfil_id_perfil = %s AND fk_postagem_id_postagem = %s"
     #           cursor.execute(sql_delete, (profile_id, post_id))
     #           is_liked = False
     # else:
     #           sql_insert = "INSERT INTO curte (fk_perfil_id_perfil, fk_postagem_id_postagem) VALUES (%s, %s)"
     #           cursor.execute(sql_insert, (profile_id, post_id))
     #           is_liked = True
          
     # con.commit()
     # cursor.close()
     # return is_liked

def check_like(con, profile_id, post_id):
     try:
          with con.cursor() as cursor:
               sql = "SELECT * FROM curte WHERE fk_perfil_id_perfil = %s AND fk_postagem_id_postagem = %s"
               cursor.execute(sql, (profile_id, post_id))
               result = cursor.fetchone()

          return result is not None
     except Exception as e:
          print(f"Erro ao conferir curtida da postagem: {e}")
          return None

     # cursor = con.cursor()
     # sql = "SELECT * FROM curte WHERE fk_perfil_id_perfil = %s AND fk_postagem_id_postagem = %s"
     # cursor.execute(sql, (profile_id, post_id))
     # result = cursor.fetchone()
     # cursor.close()
     # return result is not None

def check_complaint(con, profile_id, post_id):
     try:
          with con.cursor() as cursor:
               sql = "SELECT * FROM denuncia WHERE fk_perfil_id_autor = %s AND fk_postagem_id_postagem = %s"
               cursor.execute(sql, (profile_id, post_id))
               result = cursor.fetchone()

          return result is not None
     except Exception as e:
          print(f"Erro ao conferir denúncia da postagem: {e}")
          return None

     # cursor = con.cursor()
     # sql = "SELECT * FROM denuncia WHERE fk_perfil_id_autor = %s AND fk_postagem_id_postagem = %s"
     # cursor.execute(sql, (profile_id, post_id))
     # result = cursor.fetchone()
     # cursor.close()
     # return result is not None

def insert_sharing(con, caption, post_id, profile_id, shared_profiles_ids):
     if not shared_profiles_ids:
          return False

     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO compartilhamento (legenda, fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
               cursor.execute(sql, (caption, post_id, profile_id))
               sharing_id = cursor.lastrowid

               if not insert_shareds(con, shared_profiles_ids, sharing_id):
                    raise Exception("Erro ao compartilhar postagem.")

          con.commit() 
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao compartilhar postagem: {e}")
          return False

     # cursor = con.cursor()
     # sql = "INSERT INTO compartilhamento (legenda, fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
     # cursor.execute(sql, (caption, post_id, profile_id))
     # con.commit()
     # sharing_id = cursor.lastrowid

     # insert_shareds(con, shared_profiles_ids, sharing_id)

     # cursor.close()

def insert_shareds(con, shared_profiles_ids, sharing_id):
     if not shared_profiles_ids:
          return False

     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO compartilhado (fk_perfil_id_perfil, fk_compartilhamento_id_compartilhamento) VALUES (%s, %s)"

               for shared_profile_id in shared_profiles_ids:
                    cursor.execute(sql, (shared_profile_id, sharing_id))
          
          con.commit() 
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao compartilhar postagem: {e}")
          return False
               
     # cursor = con.cursor()
     # sql = "INSERT INTO compartilhado (fk_perfil_id_perfil, fk_compartilhamento_id_compartilhamento) VALUES (%s, %s)"

     # for shared_profile_id in shared_profiles_ids:
     #      cursor.execute(sql, (shared_profile_id, sharing_id))
    
     # con.commit() 
     # cursor.close()

def insert_comment(con, text, post_id, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               date = datetime.now()
               sql_insert = "INSERT INTO comentario (texto, data_comentario, fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s, %s, %s)"
               cursor.execute(sql_insert, (text, date, post_id, profile_id))
               comment_id = cursor.lastrowid
               sql_get = """
                    SELECT c.*, m.caminho
                    FROM comentario c
                    JOIN perfil p ON p.id_perfil = c.fk_perfil_id_perfil
                    LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
                    WHERE c.id_comentario = %s;
               """
               cursor.execute(sql_get, (comment_id,))
               new_comment = cursor.fetchone()

          con.commit() 
          return new_comment
     except Exception as e:
          con.rollback()
          print(f"Erro ao comentar na postagem: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql_insert = "INSERT INTO comentario (texto, fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
     # cursor.execute(sql_insert, (text, post_id, profile_id))
     # comment_id = cursor.lastrowid
     # sql_get = """
     #      SELECT c.*, m.caminho
     #      FROM comentario c
     #      JOIN perfil p ON p.id_perfil = c.fk_perfil_id_perfil
     #      LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
     #      WHERE c.id_comentario = %s;
     # """
     # cursor.execute(sql_get, (comment_id,))
     # new_comment = cursor.fetchone()
     # con.commit()
     # cursor.close()
     # return new_comment

def insert_post_complaint(con, description, profile_id, post_id, complaint_reasons_ids):
     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO denuncia (descricao, fk_perfil_id_autor, fk_postagem_id_postagem) VALUES (%s, %s, %s)"
               cursor.execute(sql, (description, profile_id, post_id))
               complaint_id = cursor.lastrowid

               if complaint_reasons_ids:
                    if not insert_post_complaint_reasons(con, complaint_reasons_ids, complaint_id):
                         raise Exception("Erro ao inserir motivos da denúncia.")

          con.commit() 
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao denúnciar postagem: {e}")
          return False

     # cursor = con.cursor()
     # sql = "INSERT INTO denuncia (descricao, fk_perfil_id_autor, fk_postagem_id_postagem) VALUES (%s, %s, %s)"
     # cursor.execute(sql, (description, profile_id, post_id))
     # con.commit()
     # complaint_id = cursor.lastrowid

     # insert_post_complaint_reasons(con, complaint_reasons_ids, complaint_id)

     # cursor.close()

def insert_post_complaint_reasons(con, complaint_reasons_ids, complaint_id):
     if not complaint_reasons_ids:
          return False

     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO motivos_denuncia (fk_motivo_denuncia_id_motivo_denuncia, fk_denuncia_id_denuncia) VALUES (%s, %s)"
     
               for complaint_reason_id in complaint_reasons_ids:
                    cursor.execute(sql, (complaint_reason_id, complaint_id))

          con.commit() 
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir motivos da denúncia: {e}")
          return False

     # cursor = con.cursor()
     # sql = "INSERT INTO motivos_denuncia (fk_motivo_denuncia_id_motivo_denuncia, fk_denuncia_id_denuncia) VALUES (%s, %s)"
     
     # for complaint_reason_id in complaint_reasons_ids:
     #      cursor.execute(sql, (complaint_reason_id, complaint_id))

     # con.commit()
     # cursor.close()
     
def get_complaint_reasons(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM motivo_denuncia ORDER BY motivo"
               cursor.execute(sql)
               result = cursor.fetchall()
     
          return result
     except Exception as e:
          print(f"Erro ao recuperar motivos de denúncia: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = "SELECT * FROM motivo_denuncia ORDER BY motivo"
     # cursor.execute(sql)
     # result = cursor.fetchall()
     # cursor.close()
     # return result

def insert_flash(con, flash_available_time, profile_id, media_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "INSERT INTO flash (duracao_horas, fk_perfil_id_perfil, fk_midia_id_midia) VALUES (%s, %s, %s)"
               cursor.execute(sql, (flash_available_time, profile_id, media_id))
     
          con.commit()
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir flash: {e}")
          return False

     # cursor = con.cursor()
     # sql = "INSERT INTO flash (duracao_horas, fk_perfil_id_perfil, fk_midia_id_midia) VALUES (%s, %s, %s)"
     # cursor.execute(sql, (flash_available_time, profile_id, media_id))
     # con.commit()
     # cursor.close()

def get_flashs(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               followeds_ids = get_followeds(con, profile_id)
               
               if followeds_ids is None:
                    return []

               placeholders = ','.join(['%s'] * len(followeds_ids))
               sql = f"SELECT * FROM flash WHERE fk_perfil_id_perfil IN ({placeholders})"
               cursor.execute(sql, tuple(followeds_ids))
               result = cursor.fetchall()

          return result
     except Exception as e:
          print(f"Erro ao recuperar flashs: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # followeds_ids = get_followeds(con, profile_id)
     
     # if followeds_ids is None:
     #      return []

     # placeholders = ','.join(['%s'] * len(followeds_ids))
     # sql = f"SELECT * FROM flash WHERE fk_perfil_id_perfil IN ({placeholders})"
     # cursor.execute(sql, tuple(followeds_ids))
     # result = cursor.fetchall()

     # return result

def get_sports(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM esporte ORDER BY nome"
               cursor.execute(sql)
               result = cursor.fetchall()

               sports_ids = [sport["id_esporte"] for sport in result]

               if not sports_ids:
                    return None

               categories = get_sports_categories_for_preferences(con) 
               icons = get_sports_icons_for_preferences(con)

               if categories is None or icons is None:
                    raise Exception("Erro ao recuperar dados dos esportes")
                    
               sports = []

               for sport in result:
                    sport_id = sport["id_esporte"]

                    sport['categories'] = categories.get(sport_id, [])

                    if not sport['categories']:
                         raise Exception("Erro ao recuperar categorias do esporte.")
                    
                    sport['iconPath'] = icons.get(sport_id, None)

                    if sport['iconPath'] is None:
                         raise Exception("Erro ao recuperar ícone do esporte.")

                    sports.append(sport)

          return sports
     except Exception as e:
          print(f"Erro ao recuperar esportes: {e}")
          return None
               
     # cursor = con.cursor(dictionary=True)
     # sql = "SELECT * FROM esporte ORDER BY nome"
     # cursor.execute(sql)
     # result = cursor.fetchall()

     # sports_ids = [sport["id_esporte"] for sport in result]
     # sports = []
     
     # if sports_ids:
     #      categories = get_sports_categories_for_preferences(con) 
     #      icons = get_sports_icons_for_preferences(con)
          
     # for sport in result:
     #      sport['categories'] = categories.get(sport["id_esporte"], [])
     #      sport['iconPath'] = icons.get(sport["id_esporte"], None)
     #      sports.append(sport)

     # cursor.close()
     # return sports

def get_sport_categories(con, sport_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT c.*
                    FROM esporte e
                    JOIN categorias_esporte cs ON e.id_esporte = cs.fk_esporte_id_esporte
                    JOIN categoria_esporte c ON cs.fk_categoria_esporte_id_categoria_esporte = c.id_categoria_esporte
                    WHERE e.id_esporte = %s
               """
               cursor.execute(sql, (sport_id,))
               result = cursor.fetchall()

          return result
     except Exception as e:
          print(f"Erro ao recuperar categorias do esporte: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = """
     #      SELECT c.*
     #      FROM esporte e
     #      JOIN categorias_esporte cs ON e.id_esporte = cs.fk_esporte_id_esporte
     #      JOIN categoria_esporte c ON cs.fk_categoria_esporte_id_categoria_esporte = c.id_categoria_esporte
     #      WHERE e.id_esporte = %s
     # """
     # cursor.execute(sql, (sport_id,))
     # result = cursor.fetchall()
     # cursor.close()
     # return result

def get_sports_categories_for_preferences(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT c.*, e.id_esporte
                    FROM esporte e
                    JOIN categorias_esporte cs ON e.id_esporte = cs.fk_esporte_id_esporte
                    JOIN categoria_esporte c ON cs.fk_categoria_esporte_id_categoria_esporte = c.id_categoria_esporte
               """
               cursor.execute(sql)
               result = cursor.fetchall()

               categories = {}

               for category in result:
                    categories.setdefault(category['id_esporte'], []).append(category)

          return categories
     except Exception as e:
          print(f"Erro ao recuperar categorias dos esportes: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = """
     #      SELECT c.*, e.id_esporte
     #      FROM esporte e
     #      JOIN categorias_esporte cs ON e.id_esporte = cs.fk_esporte_id_esporte
     #      JOIN categoria_esporte c ON cs.fk_categoria_esporte_id_categoria_esporte = c.id_categoria_esporte
     # """
     # cursor.execute(sql)
     # result = cursor.fetchall()
     # cursor.close()

     # categories = {}

     # for category in result:
     #      categories.setdefault(category['id_esporte'], []).append(category)

     # return categories

def get_sports_icons_for_preferences(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT m.caminho, e.id_esporte
                    FROM esporte e
                    LEFT JOIN midia m ON e.fk_midia_id_icone = m.id_midia
               """
               cursor.execute(sql)
               result = cursor.fetchall()

               sports_icons_paths = {icon['id_esporte']: icon["caminho"] for icon in result}

          return sports_icons_paths
     except Exception as e:
          print(f"Erro ao recuperar ícones dos esportes: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = f"""
     #      SELECT m.caminho, e.id_esporte
     #      FROM esporte e
     #      LEFT JOIN midia m ON e.fk_midia_id_icone = m.id_midia
     # """
     # cursor.execute(sql)
     # result = cursor.fetchall()
     # cursor.close()

     # sports_icons_paths = {icon['id_esporte']: icon["caminho"] for icon in result}

     # return sports_icons_paths

def get_hashtags(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM hashtag ORDER BY nome"
               cursor.execute(sql)
               result = cursor.fetchall()

          return result
     except Exception as e:
          print(f"Erro ao recuperar hashtags: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = "SELECT * FROM hashtag ORDER BY nome"
     # cursor.execute(sql)
     # result = cursor.fetchall()
     # cursor.close()
     # return result

def get_tags(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT p.id_perfil, p.nome, m.caminho 
                    FROM perfil p
                    LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
               """
               cursor.execute(sql)
               result = cursor.fetchall()

          return result
     except Exception as e:
          print(f"Erro ao recuperar tags dos perfis: {e}")
          return None

     # cursor = con.cursor(dictionary=True)
     # sql = """
     #      SELECT p.id_perfil, p.nome, m.caminho 
     #      FROM perfil p
     #      LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
     # """
     # cursor.execute(sql)
     # result = cursor.fetchall()
     # cursor.close()
     # return result

def create_database(con):
     try: 
          with open("database/sql_tds.sql", "r", encoding="utf-8") as file:
               sql = file.read()

          commands = sqlparse.split(sql)

          with con.cursor() as cursor:
               for command in commands:
                    command = command.strip()

                    if command:
                         cursor.execute(command)

          con.commit()
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao criar base de dados: {e}")
          return False

     # with open("database/sql_tds.sql", "r", encoding="utf-8") as file:
     #      sql = file.read()

     # commands = sqlparse.split(sql)
     # cursor = con.cursor()

     # for command in commands:
     #      command = command.strip()

     #      if command:
     #           cursor.execute(command)

     # con.commit()
     # cursor.close()

def seed_data(con):
     try: 
          with open("database/seed_data.sql", "r", encoding="utf-8") as file:
               sql = file.read()

          commands = sqlparse.split(sql)

          with con.cursor() as cursor:
               for command in commands:
                    command = command.strip()

                    if command:
                         cursor.execute(command)

          con.commit()
          return True
     except Exception as e:
          con.rollback()
          print(f"Erro ao inserir dados de inicialização: {e}")
          return False
          
     # with open("database/seed_data.sql", "r", encoding="utf-8") as file:
     #      sql = file.read()

     # commands = sqlparse.split(sql)
     # cursor = con.cursor()

     # for command in commands:
     #      command = command.strip()

     #      if command:
     #           cursor.execute(command)

     # con.commit()
     # cursor.close()