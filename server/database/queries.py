from datetime import datetime
import sqlparse
import sys

def get_profiles(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT id_perfil, nome, email, senha FROM perfil"
               cursor.execute(sql)
               result = cursor.fetchall()

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar perfis: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_profile_email(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT email FROM perfil WHERE id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

          return result["email"]
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar email do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_profile_name(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT nome FROM perfil WHERE id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

          return result["nome"]
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar nome do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def check_email_notification_permission(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT notificacoes_email FROM configuracao WHERE fk_perfil_id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

          return True if result["notificacoes_email"] == 1 else False
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar permissão de notificação por e-mail do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_profile_photo_path(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT fk_midia_id_midia FROM perfil WHERE id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

               if not result["fk_midia_id_midia"]:
                    return None

               profile_photo = get_media(con, result["fk_midia_id_midia"])

          return profile_photo["caminho"]
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar foto do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_post_author_id(con, post_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT fk_perfil_id_perfil FROM postagem WHERE id_postagem = %s"
               cursor.execute(sql, (post_id,))
               result = cursor.fetchone()

          return result["fk_perfil_id_perfil"]
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar id do autor da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_profile_main_info(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM perfil WHERE id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

               if result:
                    result["ativo"] = True if result["ativo"] == 1 else False

                    media_id = result.get("fk_midia_id_midia")

                    if media_id:
                         result["media"] = get_media(con, media_id)

                         if result["media"] is None:
                              raise Exception("Erro ao recuperar foto de perfil.")
               
          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

          
def get_profile(con, profile_id, profile_viewer_id=None):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT id_perfil, nome, verificado, biografia, ativo, privado, fk_midia_id_midia FROM perfil WHERE id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

               if result:
                    result["ativo"] = True if result["ativo"] == 1 else False

                    media_id = result.get("fk_midia_id_midia")

                    if media_id:
                         result["media"] = get_media(con, media_id)

                         if result["media"] is None:
                              raise Exception("Erro ao recuperar foto de perfil.")
                         
                    result["preferences"] = get_profile_preferences(con, profile_id)

                    if result["preferences"] is None:
                         raise Exception("Erro ao recuperar preferências do perfil.")  

                    result["posts"] = get_profile_posts(con, profile_id, profile_viewer_id, 0)

                    if result["posts"] is None:
                         raise Exception("Erro ao recuperar postagens do perfil.")  
                    
                    result["tagPosts"] = get_profile_tag_posts(con, profile_id, profile_viewer_id, 0)

                    if result["tagPosts"] is None:
                         raise Exception("Erro ao recuperar postagens em que o perfil foi marcado.")  

                    result["config"] = get_profile_config(con, profile_id)

                    if result["config"] is None:
                         raise Exception("Erro ao recuperar configurações do perfil.")  

                    result["followers"] = get_followers(con, profile_id)
                    
                    if result["followers"] is None:
                         raise Exception("Erro ao recuperar seguidores do perfil.")  
                    
                    likes = get_profile_likes(con, profile_id)
                    
                    if likes is None:
                         raise Exception("Erro ao recuperar número de curtidas do perfil.")  
                    
                    result["likes"] = likes
                    
                    if profile_viewer_id:
                         result["isFollowed"] = check_follow(con, profile_viewer_id, profile_id)
                         
                         if result["isFollowed"] is None:
                              raise Exception("Erro ao recuperar estado de seguidor do perfil.")

                         result["isComplainted"] = check_profile_complaint(con, profile_viewer_id, profile_id)
                    
                         if result["isComplainted"] is None:
                              raise Exception("Erro ao recuperar estado de denúncia do perfil. ")
                    
          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_profile_likes(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT COUNT(c.fk_postagem_id_postagem) AS total_likes
                    FROM postagem po
                    JOIN curte c ON po.id_postagem = c.fk_postagem_id_postagem
                    JOIN perfil p ON po.fk_perfil_id_perfil = p.id_perfil
                    WHERE p.id_perfil = %s
               """
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

          return result['total_likes'] if result else 0  
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar número de curtidas do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
# O usuário é recuperado através do id do perfil
def get_user(con, profile_id, profile_viewer_id = None):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM usuario WHERE fk_perfil_id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

               if result:
                    profile = get_profile(con, profile_id, profile_viewer_id)

                    if profile is None:
                         raise Exception("Erro ao recuperar perfil do usuário.")  
                    
                    profile["qualifications"] = get_user_qualifications(con, profile_id)

                    if profile["qualifications"] is None:
                         raise Exception("Erro ao recuperar formações do usuário.")  

          return profile
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar usuário: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_profile_posts(con, profile_id, profile_viewer_id = None, offset=None, limit=24):
     # quando nao for necessario obter as postagens do perfil
     if offset is None:
          return []
     
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT p.*, con.permissao_comentario, con.permissao_marcacao, con.permissao_compartilhamento, con.visibilidade_curtidas, con.visibilidade_compartilhamentos, con.visibilidade_comentarios, 
                    COUNT(DISTINCT c.fk_perfil_id_perfil) AS total_curtidas,
                    COUNT(DISTINCT cp.id_compartilhamento) AS total_compartilhamentos,
                    COUNT(DISTINCT co.id_comentario) AS total_comentarios
                    FROM postagem p
                    LEFT JOIN curte c ON c.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN compartilhamento cp ON cp.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN comentario co ON co.fk_postagem_id_postagem = p.id_postagem
                    JOIN perfil pe ON pe.id_perfil = p.fk_perfil_id_perfil
                    JOIN configuracao con ON con.fk_perfil_id_perfil = pe.id_perfil
                    WHERE p.fk_perfil_id_perfil = %s
                    GROUP BY p.id_postagem
                    ORDER BY p.data_publicacao DESC
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, limit, offset))
               result = cursor.fetchall()

               if not result:
                    return []

               posts_ids = [post["id_postagem"] for post in result]
          
               medias = get_post_medias_for_feed(con, posts_ids) 
               hashtags = get_post_hashtags_for_feed(con, posts_ids) 
               tags = get_post_tags_for_feed(con, posts_ids) 
               comments = get_post_comments_for_feed(con, posts_ids)       

               if medias is None or hashtags is None or tags is None or comments is None:
                    raise Exception("Erro ao recuperar dados das postagens do perfil.")

               posts = []

               for post in result:
                    post["medias"] = medias.get(post["id_postagem"], [])

                    if not post["medias"]:
                         raise Exception("Erro ao recuperar mídias da postagem.")

                    post["hashtags"] = hashtags.get(post["id_postagem"], [])
                    post["tags"] = tags.get(post["id_postagem"], [])
                    post["comments"] = comments.get(post["id_postagem"], [])
                    post["isLiked"] = check_like(con, profile_viewer_id, post["id_postagem"])
                    post["author"] = get_profile_main_info(con, profile_id)

                    if not post["author"]:
                         raise Exception("Erro ao recuperar autor da postagem.")
                      
                    if post["isLiked"] is None:
                         raise Exception("Erro ao recuperar estado de curtida da postagem.")

                    post["isComplainted"] = check_post_complaint(con, profile_viewer_id, post["id_postagem"])
                    
                    if post["isComplainted"] is None:
                         raise Exception("Erro ao recuperar estado de denúncia da postagem. ")
                    
                    comment_permission = post["permissao_comentario"].lower()
                    
                    if profile_id == profile_viewer_id:
                         post["canComment"] = True
                    elif comment_permission == "ninguém":
                         post["canComment"] = False
                    elif (comment_permission == "seguidos" and not check_follow(con, post["fk_perfil_id_perfil"], profile_viewer_id)) or (comment_permission == "seguidores" and not check_follow(con, profile_viewer_id, post["fk_perfil_id_perfil"])):
                         post["canComment"] = False
                    else:
                         post["canComment"] = True
                    
                    posts.append(post)

          return posts
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar postagens do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_profile_tag_posts(con, profile_id, profile_viewer_id=None, offset=None, limit=24):
     # quando nao for necessario obter as postagens do perfil
     if offset is None:
          return []
     
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT p.*, con.permissao_comentario, con.permissao_marcacao, con.permissao_compartilhamento, con.visibilidade_curtidas, con.visibilidade_compartilhamentos, con.visibilidade_comentarios,
                    COUNT(DISTINCT c.fk_perfil_id_perfil) AS total_curtidas,
                    COUNT(DISTINCT cp.id_compartilhamento) AS total_compartilhamentos,
                    COUNT(DISTINCT co.id_comentario) AS total_comentarios
                    FROM postagem p
                    LEFT JOIN curte c ON c.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN compartilhamento cp ON cp.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN comentario co ON co.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN marcacao_postagem mp ON mp.fk_postagem_id_postagem = p.id_postagem
                    JOIN perfil pe ON pe.id_perfil = p.fk_perfil_id_perfil
                    JOIN configuracao con ON con.fk_perfil_id_perfil = pe.id_perfil
                    WHERE mp.fk_perfil_id_perfil = %s
                    GROUP BY p.id_postagem
                    ORDER BY p.data_publicacao DESC
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, limit, offset))
               result = cursor.fetchall()

               if not result:
                    return []

               posts_ids = [post["id_postagem"] for post in result]
          
               medias = get_post_medias_for_feed(con, posts_ids) 
               hashtags = get_post_hashtags_for_feed(con, posts_ids) 
               tags = get_post_tags_for_feed(con, posts_ids) 
               comments = get_post_comments_for_feed(con, posts_ids)     
               authors_ids = [post["fk_perfil_id_perfil"] for post in result]
               authors = get_profiles_for_feed(con, authors_ids)  

               if medias is None or hashtags is None or tags is None or comments is None or authors is None:
                    raise Exception("Erro ao recuperar dados das postagens em que o perfil foi marcado.")

               posts = []

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
                    post["isLiked"] = check_like(con, profile_viewer_id, post["id_postagem"])
                    
                    if post["isLiked"] is None:
                         raise Exception("Erro ao recuperar estado de curtida da postagem.")

                    post["isComplainted"] = check_post_complaint(con, profile_viewer_id, post["id_postagem"])
                    
                    if post["isComplainted"] is None:
                         raise Exception("Erro ao recuperar estado de denúncia da postagem. ")

                    comment_permission = post["permissao_comentario"].lower()

                    if profile_id == post["fk_perfil_id_perfil"]:
                         post["canComment"] = True
                    elif comment_permission == "ninguém":
                         post["canComment"] = False
                    elif (comment_permission == "seguidos" and not check_follow(con, post["fk_perfil_id_perfil"], profile_viewer_id)) or (comment_permission == "seguidores" and not check_follow(con, profile_viewer_id, post["fk_perfil_id_perfil"])):
                         post["canComment"] = False
                    else:
                         post["canComment"] = True
                    
                    posts.append(post)

          return posts
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar postagens em que o perfil foi marcado: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
          
def insert_profile(con, email, password, name, bio, private):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "INSERT INTO perfil (email, senha, nome, verificado, ativo, privado, biografia) VALUES (%s, %s, %s, %s, %s, %s, %s)"
               cursor.execute(sql, (email, password, name, 0, 1, 1 if private else 0, bio))
               profile_id = cursor.lastrowid

               if insert_user(con, profile_id) is None:
                    raise Exception("Erro ao inserir usuário do perfil.")

               if insert_default_profile_config(con, profile_id) is None:
                    raise Exception("Erro ao inserir configuração do perfil.")

          con.commit() 
          return profile_id
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def put_profile(con, profile_id, name=None, bio=None, private=None, active=None):
     try:
          with con.cursor(dictionary=True) as cursor:
               if active is not None:
                    sql = """
                         UPDATE perfil 
                         SET ativo = %s
                         WHERE id_perfil = %s
                    """
                    cursor.execute(sql, (1 if active else 0, profile_id))
               else:                   
                    sql = """
                         UPDATE perfil 
                         SET nome = %s, privado = %s, biografia = %s 
                         WHERE id_perfil = %s
                    """
                    cursor.execute(sql, (name, 1 if private else 0, bio, profile_id))

          con.commit() 
          return profile_id
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao modificar perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def put_config(con, field_name, field_value, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = f"""
                    UPDATE configuracao 
                    SET {field_name} = %s
                    WHERE fk_perfil_id_perfil = %s
               """

               if isinstance(field_value, bool):
                    field_value = 1 if field_value else 0

               cursor.execute(sql, (field_value, profile_id))

          con.commit() 
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao modificar perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

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
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir preferências do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

def put_profile_preferences(con, profile_id, sports_ids):
     try:
          with con.cursor() as cursor:
               sql_delete = "DELETE FROM preferencia WHERE fk_perfil_id_perfil = %s"
               cursor.execute(sql_delete, (profile_id,))    

               if not sports_ids:
                    con.commit()
                    return True
               
               data = [(profile_id, sport_id) for sport_id in sports_ids]
               sql = "INSERT INTO preferencia (fk_perfil_id_perfil, fk_esporte_id_esporte) VALUES (%s, %s)"
               cursor.executemany(sql, data)  

          con.commit() 
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao modificar preferências do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False
             
def get_user_qualifications(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT 
                    f.id_formacao,
                    c.nome AS curso,
                    i.nome AS instituicao,
                    gf.grau AS grau,
                    e.sigla AS estado,
                    ci.nome AS cidade
                    FROM formacao f
                    JOIN grau_formacao gf ON f.fk_grau_formacao_id_grau_formacao = gf.id_grau_formacao
                    JOIN curso_instituicao cui ON f.fk_curso_instituicao_id_curso_instituicao = cui.id_curso_instituicao
                    JOIN curso c ON cui.fk_curso_id_curso = c.id_curso
                    JOIN instituicao i ON cui.fk_instituicao_id_instituicao = i.id_instituicao
                    JOIN cidade ci ON i.fk_cidade_id_cidade = ci.id_cidade
                    JOIN estado e ON ci.fk_estado_id_estado = e.id_estado
                    JOIN usuario u ON u.id_usuario = f.fk_usuario_id_usuario
                    WHERE u.fk_perfil_id_perfil = %s
               """
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchall()

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar formações do usuário: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_profile_preferences(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT 
                    e.nome, e.id_esporte,
                    m.caminho AS icone
                    FROM preferencia p
                    JOIN esporte e ON p.fk_esporte_id_esporte = e.id_esporte
                    JOIN midia m ON e.fk_midia_id_icone = m.id_midia
                    WHERE p.fk_perfil_id_perfil = %s
               """
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchall()

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar preferências do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None 

def get_profile_config(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT *
                    FROM configuracao
                    WHERE fk_perfil_id_perfil = %s
               """
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

               if result:
                    result = {key: (True if value == 1 else False if value == 0 else value) for key, value in result.items()}

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar configurações do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def insert_user(con, profile_id):
     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO usuario (fk_perfil_id_perfil) VALUES (%s)"
               cursor.execute(sql, (profile_id,))
               user_id = cursor.lastrowid

          con.commit()
          return user_id
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir usuário: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def insert_default_profile_config(con, profile_id):
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
                    notificacoes_dispositivos,
                    notificacoes_email,
                    maximo_notificacoes_diarias,
                    fk_perfil_id_perfil
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               """

               default_values = (
                    False,  
                    False,  
                    False,  
                    False,  
                    True,  
                    True,  
                    True,  
                    True,  
                    True,  
                    'todos',
                    'todos',
                    'todos',
                    True,  
                    True,  
                    50,
                    profile_id
               )

               cursor.execute(sql, default_values)
               config_id = cursor.lastrowid
          
          con.commit() 
          return config_id
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir configuração do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_profile_max_daily_notifications(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT maximo_notificacoes_diarias FROM configuracao WHERE fk_perfil_id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

          return result["maximo_notificacoes_diarias"]
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar configuração de número máximo de notificações diárias: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def check_can_insert_notification(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT COUNT(id_notificacao) AS notificacoes_dia
                    FROM notificacao 
                    WHERE fk_perfil_id_perfil_destino = %s AND lancamento BETWEEN NOW() - INTERVAL 1 DAY AND NOW()
               """
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()

               max_daily_notifications = get_profile_max_daily_notifications(con, profile_id)

               if max_daily_notifications is not None and result["notificacoes_dia"] < max_daily_notifications:
                    return True
               else:
                    print("Limite máximo de notificações diárias atingido")
                    return False
               
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao conferir possibilidade de criação da notificação: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

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
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def insert_post_hashtags(con, post_id, hashtags_ids):
     try:
          with con.cursor() as cursor:
               data = [(post_id, hashtag_id) for hashtag_id in hashtags_ids]
               sql = "INSERT INTO postagem_hashtag (fk_postagem_id_postagem, fk_hashtag_id_hashtag) VALUES (%s, %s)"
               cursor.executemany(sql, data)

          con.commit()
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir hashtags da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False
    
def insert_post_tags(con, post_id, profiles_ids):
     try:
          with con.cursor() as cursor:
               data = [(post_id, profile_id) for profile_id in profiles_ids]
               sql = "INSERT INTO marcacao_postagem (fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s)"
               cursor.executemany(sql, data) 

          con.commit()
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir marcações da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")      
          return False
         
def insert_post_medias(con, post_id, medias):
     try:
          with con.cursor() as cursor:
               data = [(post_id, media["path"], media["type"], media["format"]) for media in medias]
               sql = "INSERT INTO midia (fk_postagem_id_postagem, caminho, tipo, formato) VALUES (%s, %s, %s, %s)"
               cursor.executemany(sql, data) 

          con.commit()
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir mídias da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")      
          return False
         
def insert_media(con, path, type, format):
     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO midia (caminho, tipo, formato) VALUES (%s, %s, %s)"
               cursor.execute(sql, (path, type, format))
               media_id = cursor.lastrowid
          
          con.commit()
          return media_id
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir mídia: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_media(con, media_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM midia WHERE id_midia = %s"
               cursor.execute(sql, (media_id,))
               result = cursor.fetchone()

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar mídia: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def insert_profile_photo(con, profile_id, media_id):
     try:
          with con.cursor() as cursor:
               sql = "UPDATE perfil SET fk_midia_id_midia = %s WHERE id_perfil = %s"
               cursor.execute(sql, (media_id, profile_id))          

          con.commit()
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir foto de perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False
     
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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar perfis seguidos: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_followers(con, followed_profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM segue WHERE fk_perfil_id_seguido = %s"
               cursor.execute(sql, (followed_profile_id,))
               result = cursor.fetchall()

               followers_ids = [item['fk_perfil_id_seguidor'] for item in result]

          con.commit()
          return followers_ids
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar perfis seguidores: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_feed_posts(con, profile_id, offset):
     try:
          with con.cursor(dictionary=True) as cursor:
               followeds_ids = get_followeds(con, profile_id)

               if not followeds_ids:
                    return []
               
               LIMIT = 6

               placeholders = ','.join(['%s'] * len(followeds_ids))
               sql = f"""
                    SELECT p.*, con.permissao_comentario, con.permissao_marcacao, con.permissao_compartilhamento, con.visibilidade_curtidas, con.visibilidade_compartilhamentos, con.visibilidade_comentarios,
                    COUNT(DISTINCT c.fk_perfil_id_perfil) AS total_curtidas,
                    COUNT(DISTINCT cp.id_compartilhamento) AS total_compartilhamentos,
                    COUNT(DISTINCT co.id_comentario) AS total_comentarios
                    FROM postagem p
                    LEFT JOIN curte c ON c.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN compartilhamento cp ON cp.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN comentario co ON co.fk_postagem_id_postagem = p.id_postagem
                    JOIN perfil pe ON pe.id_perfil = p.fk_perfil_id_perfil
                    JOIN configuracao con ON con.fk_perfil_id_perfil = pe.id_perfil
                    WHERE p.fk_perfil_id_perfil IN ({placeholders}) AND pe.ativo = 1 AND p.data_publicacao BETWEEN NOW() - INTERVAL 1 DAY AND NOW()
                    GROUP BY p.id_postagem
                    ORDER BY p.data_publicacao DESC
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, tuple(followeds_ids) + (LIMIT, offset))
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
                         raise Exception("Erro ao recuperar estado de curtida da postagem.")

                    post["isComplainted"] = check_post_complaint(con, profile_id, post["id_postagem"])
                    
                    if post["isComplainted"] is None:
                         raise Exception("Erro ao recuperar estado de denúncia da postagem. ")

                    if post["isComplainted"] == True:
                         continue
                    
                    comment_permission = post["permissao_comentario"].lower()

                    if profile_id == post["fk_perfil_id_perfil"]:
                         post["canComment"] = True
                    elif comment_permission == "ninguém":
                         post["canComment"] = False
                    elif (comment_permission == "seguidos" and not check_follow(con, post["fk_perfil_id_perfil"], profile_id)) or (comment_permission == "seguidores" and not check_follow(con, profile_id, post["fk_perfil_id_perfil"])):
                         post["canComment"] = False
                    else:
                         post["canComment"] = True

                    feed.append(post)

          return feed
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar feed do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_post(con, post_id, profile_viewer_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = f"""
                    SELECT p.*, con.permissao_comentario, con.permissao_marcacao, con.permissao_compartilhamento, con.visibilidade_curtidas, con.visibilidade_compartilhamentos, con.visibilidade_comentarios,
                    COUNT(DISTINCT c.fk_perfil_id_perfil) AS total_curtidas,
                    COUNT(DISTINCT cp.id_compartilhamento) AS total_compartilhamentos,
                    COUNT(DISTINCT co.id_comentario) AS total_comentarios
                    FROM postagem p
                    LEFT JOIN curte c ON c.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN compartilhamento cp ON cp.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN comentario co ON co.fk_postagem_id_postagem = p.id_postagem
                    JOIN perfil pe ON pe.id_perfil = p.fk_perfil_id_perfil
                    JOIN configuracao con ON con.fk_perfil_id_perfil = pe.id_perfil
                    WHERE p.id_postagem = %s AND pe.ativo = 1 
                    GROUP BY p.id_postagem
               """
               cursor.execute(sql, (post_id,))
               result = cursor.fetchone()
          
               medias = get_post_medias_for_feed(con, [post_id]) 
               hashtags = get_post_hashtags_for_feed(con, [post_id]) 
               tags = get_post_tags_for_feed(con, [post_id]) 
               comments = get_post_comments_for_feed(con, [post_id])       
               authors = get_profiles_for_feed(con, [result["fk_perfil_id_perfil"]])

               if medias is None or hashtags is None or tags is None or comments is None or authors is None:
                    raise Exception("Erro ao recuperar dados da postagem.")

               result["medias"] = medias.get(result["id_postagem"], [])

               if not result["medias"]:
                    raise Exception("Erro ao recuperar mídias da postagem.")

               result["author"] = authors.get(result["fk_perfil_id_perfil"], {})
               
               if not result["author"]:
                    raise Exception("Erro ao recuperar autor da postagem.")

               result["hashtags"] = hashtags.get(result["id_postagem"], [])
               result["tags"] = tags.get(result["id_postagem"], [])
               result["comments"] = comments.get(result["id_postagem"], [])
               result["isLiked"] = check_like(con, profile_viewer_id, result["id_postagem"])
               
               if result["isLiked"] is None:
                    raise Exception("Erro ao recuperar estado de curtida da postagem.")

               result["isComplainted"] = check_post_complaint(con, profile_viewer_id, result["id_postagem"])
               
               if result["isComplainted"] is None:
                    raise Exception("Erro ao recuperar estado de denúncia da postagem. ")
               
               comment_permission = result["permissao_comentario"].lower()

               if profile_viewer_id == result["fk_perfil_id_perfil"]:
                    result["canComment"] = True
               elif comment_permission == "ninguém":
                    result["canComment"] = False
               elif (comment_permission == "seguidos" and not check_follow(con, result["fk_perfil_id_perfil"], profile_viewer_id)) or (comment_permission == "seguidores" and not check_follow(con, profile_viewer_id, result["fk_perfil_id_perfil"])):
                    result["canComment"] = False
               else:
                    result["canComment"] = True

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
          
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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar perfis para o feed: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar fotos dos perfis: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_post_medias(con, post_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM midia WHERE fk_postagem_id_postagem = %s"
               cursor.execute(sql, (post_id,))
               result = cursor.fetchall()

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar mídias do post: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar mídias das postagens: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar hashtags da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar hashtags das postagens: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar comentários da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_post_comments_for_feed(con, post_ids):
     try:
          with con.cursor(dictionary=True) as cursor:
               placeholders = ','.join(['%s'] * len(post_ids))
               sql = f"""
                    SELECT c.texto, c.fk_postagem_id_postagem, c.data_comentario, m.caminho, p.id_perfil, p.nome
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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar comentários das postagens: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar marcações da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar marcações das postagens: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
                    date = datetime.now()
                    sql_insert = "INSERT INTO curte (data_curtida, fk_perfil_id_perfil, fk_postagem_id_postagem) VALUES (%s, %s, %s)"
                    cursor.execute(sql_insert, (date, profile_id, post_id))
                    is_liked = True
                    
          con.commit()
          return is_liked
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao curtir postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def toggle_follow(con, follower_id, followed_id):
     try:
          with con.cursor() as cursor:
               sql_check = "SELECT * FROM segue WHERE fk_perfil_id_seguidor = %s AND fk_perfil_id_seguido = %s"
               cursor.execute(sql_check, (follower_id, followed_id))
               result = cursor.fetchone()

               if result:
                    sql_delete = "DELETE FROM segue WHERE fk_perfil_id_seguidor = %s AND fk_perfil_id_seguido = %s"
                    cursor.execute(sql_delete, (follower_id, followed_id))
                    is_followed = False
               else:
                    sql_insert = "INSERT INTO segue (fk_perfil_id_seguidor, fk_perfil_id_seguido) VALUES (%s, %s)"
                    cursor.execute(sql_insert, (follower_id, followed_id))
                    is_followed = True
                    
          con.commit()
          return is_followed
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao seguir perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def check_follow(con, follower_id, followed_id):
     try:
          with con.cursor() as cursor:
               sql = "SELECT * FROM segue WHERE fk_perfil_id_seguidor = %s AND fk_perfil_id_seguido = %s"
               cursor.execute(sql, (follower_id, followed_id))
               result = cursor.fetchone()

          return result is not None
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao conferir estado de seguidor do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
               
def check_like(con, profile_id, post_id):
     try:
          with con.cursor() as cursor:
               sql = "SELECT * FROM curte WHERE fk_perfil_id_perfil = %s AND fk_postagem_id_postagem = %s"
               cursor.execute(sql, (profile_id, post_id))
               result = cursor.fetchone()

          return result is not None
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao conferir estado de curtida da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def check_post_complaint(con, author_id, post_id):
     try:
          with con.cursor() as cursor:
               sql = "SELECT * FROM denuncia WHERE fk_perfil_id_autor = %s AND fk_postagem_id_postagem = %s"
               cursor.execute(sql, (author_id, post_id))
               result = cursor.fetchone()

          return result is not None
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao conferir denúncia da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def check_profile_complaint(con, author_id, profile_id):
     try:
          with con.cursor() as cursor:
               sql = "SELECT * FROM denuncia WHERE fk_perfil_id_autor = %s AND fk_perfil_id_denunciado = %s"
               cursor.execute(sql, (author_id, profile_id))
               result = cursor.fetchone()

          return result is not None
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao conferir denúncia do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def insert_search(con, text, profile_id):
     try:
          with con.cursor() as cursor:
               date = datetime.now()
               sql = "INSERT INTO pesquisa (texto, data_pesquisa, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
               cursor.execute(sql, (text, date, profile_id))

          con.commit() 
          return text
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir pesquisa: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return 
     
def get_search_sugestions(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql_all_favorites = """
                    SELECT texto, COUNT(*) AS numero_pesquisas 
                    FROM pesquisa 
                    GROUP BY texto
                    ORDER BY numero_pesquisas DESC, texto ASC
                    LIMIT 3   
               """  
               cursor.execute(sql_all_favorites)
               all_favorites = cursor.fetchall()

               sql_profile_favorites = """
                    SELECT * 
                    FROM pesquisa
                    WHERE fk_perfil_id_perfil = %s
                    ORDER BY data_pesquisa DESC 
                    LIMIT 5
               """
               cursor.execute(sql_profile_favorites, (profile_id,))
               profile_favorites = cursor.fetchall()

               result = all_favorites + profile_favorites
               
          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar sugestões de pesquisa do usuário: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def insert_sharing(con, caption, post_id, profile_id, shared_profiles_ids):
     if not shared_profiles_ids:
          return False

     try:
          with con.cursor() as cursor:
               date = datetime.now()
               sql = "INSERT INTO compartilhamento (legenda, data_compartilhamento, fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s, %s, %s)"
               cursor.execute(sql, (caption, date, post_id, profile_id))
               sharing_id = cursor.lastrowid

               if not insert_shareds(con, shared_profiles_ids, sharing_id):
                    raise Exception("Erro ao compartilhar postagem.")

          con.commit() 
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao compartilhar postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

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
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao compartilhar postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False
                   
def insert_comment(con, text, post_id, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               date = datetime.now()
               sql_insert = "INSERT INTO comentario (texto, data_comentario, fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s, %s, %s)"
               cursor.execute(sql_insert, (text, date, post_id, profile_id))
               comment_id = cursor.lastrowid
               sql_get = """
                    SELECT c.*, m.caminho, p.nome
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
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao comentar na postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def insert_post_complaint(con, description, author_id, post_id, complaint_reasons_ids):
     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO denuncia (descricao, fk_perfil_id_autor, fk_postagem_id_postagem) VALUES (%s, %s, %s)"
               cursor.execute(sql, (description, author_id, post_id))
               complaint_id = cursor.lastrowid

               if complaint_reasons_ids:
                    if not insert_complaint_reasons(con, complaint_reasons_ids, complaint_id):
                         raise Exception("Erro ao inserir motivos da denúncia.")

          con.commit() 
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao denúnciar postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

def insert_profile_complaint(con, description, author_id, profile_id, complaint_reasons_ids):
     try:
          with con.cursor() as cursor:
               sql = "INSERT INTO denuncia (descricao, fk_perfil_id_autor, fk_perfil_id_denunciado) VALUES (%s, %s, %s)"
               cursor.execute(sql, (description, author_id, profile_id))
               complaint_id = cursor.lastrowid

               if complaint_reasons_ids:
                    if not insert_complaint_reasons(con, complaint_reasons_ids, complaint_id):
                         raise Exception("Erro ao inserir motivos da denúncia.")

          con.commit() 
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao denúnciar perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False
     
def insert_user_qualification(con, user_id, course_institution_id, degree_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql_check = """
                    SELECT * 
                    FROM formacao 
                    WHERE 
                         fk_usuario_id_usuario = %s AND 
                         fk_grau_formacao_id_grau_formacao = %s AND 
                         fk_curso_instituicao_id_curso_instituicao = %s
                    """
               cursor.execute(sql_check, (user_id, degree_id, course_institution_id))
               result = cursor.fetchone()

               if not result:     
                    sql_insert = "INSERT INTO formacao (fk_usuario_id_usuario, fk_grau_formacao_id_grau_formacao, fk_curso_instituicao_id_curso_instituicao) VALUES (%s, %s, %s)"
                    cursor.execute(sql_insert, (user_id, degree_id, course_institution_id))

                    con.commit()   

          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao adicionar formação: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

def insert_complaint_reasons(con, complaint_reasons_ids, complaint_id):
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
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir motivos da denúncia: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False
          
def get_complaint_reasons(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM motivo_denuncia ORDER BY motivo"
               cursor.execute(sql)
               result = cursor.fetchall()
     
          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar motivos de denúncia: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def insert_flash(con, flash_available_time, profile_id, media_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "INSERT INTO flash (duracao_horas, fk_perfil_id_perfil, fk_midia_id_midia) VALUES (%s, %s, %s)"
               cursor.execute(sql, (flash_available_time, profile_id, media_id))
               flash_id = cursor.lastrowid
     
          con.commit()
          return flash_id
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir flash: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar flashs: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_sports(con, text=None):
     try:
          with con.cursor(dictionary=True) as cursor:
               if text is None:
                    sql = """
                         SELECT * 
                         FROM esporte 
                         ORDER BY nome
                    """
                    cursor.execute(sql)
               else:
                    sql = """
                         SELECT DISTINCT e.* 
                         FROM esporte e
                         LEFT JOIN categorias_esporte cse ON cse.fk_esporte_id_esporte = e.id_esporte
                         JOIN categoria_esporte ce ON ce.id_categoria_esporte = cse.fk_categoria_esporte_id_categoria_esporte
                         WHERE LOWER(REPLACE(e.nome, ' ', '')) LIKE LOWER(%s) OR LOWER(REPLACE(ce.nome, ' ', '')) LIKE LOWER(%s)
                         ORDER BY e.nome
                    """
                    search_text = f"%{text}%"
                    cursor.execute(sql, (search_text, search_text))
                    
               result = cursor.fetchall()

               if not result:
                    return []
               
               sports_ids = [sport["id_esporte"] for sport in result]

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar esportes: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
                              
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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar categorias do esporte: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar categorias dos esportes: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

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
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar ícones dos esportes: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_hashtags(con, text=None):
     try:
          with con.cursor(dictionary=True) as cursor:
               if text is None:
                    sql = "SELECT * FROM hashtag ORDER BY nome"
                    cursor.execute(sql)
               else:                    
                    sql = """
                         SELECT * 
                         FROM hashtag 
                         WHERE LOWER(nome) LIKE LOWER(%s)
                         ORDER BY nome
                    """
                    search_text = f"%{text}%"
                    cursor.execute(sql, (search_text,))

               result = cursor.fetchall()

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar hashtags: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_tags(con, profile_viewer_id, offset, text, limit=None):
     try:
          with con.cursor(dictionary=True) as cursor:
               search_text = f"%{text}%"

               if limit is None:
                    sql = """
                         SELECT p.id_perfil, p.nome, m.caminho, c.permissao_marcacao, c.permissao_compartilhamento, 
                         (SELECT COUNT(*) FROM segue WHERE fk_perfil_id_seguido = p.id_perfil) AS numero_seguidores
                         FROM perfil p
                         LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
                         LEFT JOIN segue s ON s.fk_perfil_id_seguido = p.id_perfil
                         JOIN configuracao c ON c.fk_perfil_id_perfil = p.id_perfil
                         WHERE LOWER(p.nome) LIKE LOWER(%s) AND p.ativo = 1
                         GROUP BY p.id_perfil
                         LIMIT %s
                    """
               else:
                    sql = """
                         SELECT p.id_perfil, p.nome, m.caminho, c.permissao_marcacao, c.permissao_compartilhamento,
                         (SELECT COUNT(*) FROM segue WHERE fk_perfil_id_seguido = p.id_perfil) AS numero_seguidores
                         FROM perfil p
                         LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
                         LEFT JOIN segue s ON s.fk_perfil_id_seguido = p.id_perfil
                         JOIN configuracao c ON c.fk_perfil_id_perfil = p.id_perfil
                         WHERE LOWER(p.nome) LIKE LOWER(%s) AND p.ativo = 1
                         GROUP BY p.id_perfil
                         LIMIT %s OFFSET %s
                    """
               cursor.execute(sql, (search_text,) + ((limit, offset) if limit is not None else (25,)))
               result = cursor.fetchall()

               for tag in result:
                    sharing_permission = tag["permissao_compartilhamento"].lower()
                    tag_permission = tag["permissao_marcacao"].lower()

                    if tag["id_perfil"] == profile_viewer_id:
                         tag["canShare"] = True
                         tag["canTag"] = True
                    else:
                         if sharing_permission == "ninguém":
                              tag["canShare"] = False
                         elif (sharing_permission == "seguidos" and not check_follow(con, tag["id_perfil"], profile_viewer_id)) or (sharing_permission == "seguidores" and not check_follow(con, profile_viewer_id, tag["id_perfil"])):
                              tag["canShare"] = False
                         else:
                              tag["canShare"] = True

                         if tag_permission == "ninguém":
                              tag["canTag"] = False
                         elif (tag_permission == "seguidos" and not check_follow(con, tag["id_perfil"], profile_viewer_id)) or (tag_permission == "seguidores" and not check_follow(con, profile_viewer_id, tag["id_perfil"])):
                              tag["canTag"] = False
                         else:
                              tag["canTag"] = True

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar tags dos perfis: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_followers_tags(con, offset, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               LIMIT = 10

               sql = """
                    SELECT p.id_perfil, p.nome, m.caminho, 
                    (SELECT COUNT(DISTINCT s.fk_perfil_id_seguidor) FROM segue WHERE fk_perfil_id_seguido = p.id_perfil) AS numero_seguidores
                    FROM perfil p
                    LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
                    LEFT JOIN segue s ON s.fk_perfil_id_seguidor = p.id_perfil
                    WHERE s.fk_perfil_id_seguido = %s AND p.ativo = 1
                    GROUP BY p.id_perfil
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, LIMIT, offset))
               result = cursor.fetchall()

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar seguidores do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None


def get_followeds_tags(con, offset, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               LIMIT = 10

               sql = """
                    SELECT p.id_perfil, p.nome, m.caminho, 
                    (SELECT COUNT(DISTINCT s.fk_perfil_id_seguidor) FROM segue WHERE fk_perfil_id_seguido = p.id_perfil) AS numero_seguidores
                    FROM perfil p
                    LEFT JOIN midia m ON m.id_midia = p.fk_midia_id_midia
                    LEFT JOIN segue s ON s.fk_perfil_id_seguido = p.id_perfil
                    WHERE s.fk_perfil_id_seguidor = %s AND p.ativo = 1 
                    GROUP BY p.id_perfil
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, LIMIT, offset))
               result = cursor.fetchall()

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar perfis seguidos: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_search_result(con, text):
     try:
          result = {}

          result["hashtags"] = get_hashtags(con, text)
          result["sports"] = get_sports(con, text)

          if result["hashtags"] is None or result["sports"] is None:
               raise Exception("Erro ao recuperar resultados da pesquisa.")

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar resultados da pesquisa: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_posts_for_search(con, text, offset, profile_viewer_id, limit=24):
     try:
          with con.cursor(dictionary=True) as cursor:
               # As postagens são selecionadas de forma que as com maior número de compartilhamentos, comentários e curtidas (pesos diferentes), 
               # sejam mais valorizadas, porém quanto mais tempo passa, mais a postagem é desvalorizada 
               # (o aumento da desvalorização fica mais lento com o passar dos dias).
               sql = """
                    SELECT DISTINCT p.*, con.permissao_comentario, con.permissao_marcacao, con.permissao_compartilhamento, con.visibilidade_curtidas, con.visibilidade_compartilhamentos, con.visibilidade_comentarios,
                    COUNT(DISTINCT c.fk_perfil_id_perfil) AS total_curtidas,
                    COUNT(DISTINCT cp.id_compartilhamento) AS total_compartilhamentos,
                    COUNT(DISTINCT co.id_comentario) AS total_comentarios
                    FROM postagem p
                    JOIN perfil pe ON pe.id_perfil = p.fk_perfil_id_perfil
                    JOIN configuracao con ON con.fk_perfil_id_perfil = pe.id_perfil
                    LEFT JOIN postagem_hashtag ph ON p.id_postagem = ph.fk_postagem_id_postagem
                    LEFT JOIN hashtag h ON ph.fk_hashtag_id_hashtag = h.id_hashtag
                    LEFT JOIN curte c ON c.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN compartilhamento cp ON cp.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN comentario co ON co.fk_postagem_id_postagem = p.id_postagem
                    WHERE LOWER(h.nome) LIKE LOWER(%s) OR LOWER(pe.nome) = LOWER(%s) AND pe.ativo = 1
                    GROUP BY p.id_postagem
                    ORDER BY 
                         ((COUNT(DISTINCT cp.id_compartilhamento) * 3) +
                         (COUNT(DISTINCT c.fk_perfil_id_perfil) * 1) +
                         (COUNT(DISTINCT co.id_comentario) * 2)) /
                         CASE 
                              WHEN DATEDIFF(NOW(), p.data_publicacao) < 6 THEN 1
                              ELSE LOG10(DATEDIFF(NOW(), p.data_publicacao) + 0.25)
                         END DESC, data_publicacao DESC
                    LIMIT %s OFFSET %s
               """
               search_text = f"%{text}%"
               cursor.execute(sql, (search_text, text, limit, offset))
               result = cursor.fetchall()

               if not result:
                    return []

               posts_ids = [post["id_postagem"] for post in result]
          
               medias = get_post_medias_for_feed(con, posts_ids) 
               hashtags = get_post_hashtags_for_feed(con, posts_ids) 
               tags = get_post_tags_for_feed(con, posts_ids) 
               comments = get_post_comments_for_feed(con, posts_ids)    
               authors_ids = [post["fk_perfil_id_perfil"] for post in result]
               authors = get_profiles_for_feed(con, authors_ids)     

               if medias is None or hashtags is None or tags is None or comments is None or authors is None:
                    raise Exception("Erro ao recuperar dados das postagens da pesquisa.")

               posts = []

               for post in result:
                    post["author"] = authors.get(post["fk_perfil_id_perfil"], {})
                    
                    if not post["author"]:
                         raise Exception("Erro ao recuperar autor da postagem.")
                    
                    if post["fk_perfil_id_perfil"] != profile_viewer_id and (post["author"]["privado"] and not check_follow(con, profile_viewer_id, post["fk_perfil_id_perfil"])):
                         continue

                    post["medias"] = medias.get(post["id_postagem"], [])

                    if not post["medias"]:
                         raise Exception("Erro ao recuperar mídias da postagem.")
                    
                    post["hashtags"] = hashtags.get(post["id_postagem"], [])
                    post["tags"] = tags.get(post["id_postagem"], [])
                    post["comments"] = comments.get(post["id_postagem"], [])
                    post["isLiked"] = check_like(con, profile_viewer_id, post["id_postagem"])
                    if post["isLiked"] is None:
                         raise Exception("Erro ao recuperar estado de curtida da postagem.")

                    post["isComplainted"] = check_post_complaint(con, profile_viewer_id, post["id_postagem"])
                    
                    if post["isComplainted"] is None:
                         raise Exception("Erro ao recuperar estado de denúncia da postagem. ")

                    comment_permission = post["permissao_comentario"].lower()
                    
                    if post["fk_perfil_id_perfil"] == profile_viewer_id:
                         post["canComment"] = True
                    elif comment_permission == "ninguém":
                         post["canComment"] = False
                    elif (comment_permission == "seguidos" and not check_follow(con, post["fk_perfil_id_perfil"], profile_viewer_id)) or (comment_permission == "seguidores" and not check_follow(con, profile_viewer_id, post["fk_perfil_id_perfil"])):
                         post["canComment"] = False
                    else:
                         post["canComment"] = True
                    
                    posts.append(post)

          return posts
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar resultados de postagens: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_profile_liked_posts(con, profile_id, offset=None, limit=24):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT p.*, con.permissao_comentario, con.permissao_marcacao, con.permissao_compartilhamento, con.visibilidade_curtidas, con.visibilidade_compartilhamentos, con.visibilidade_comentarios, 
                    COUNT(DISTINCT c.fk_perfil_id_perfil) AS total_curtidas,
                    COUNT(DISTINCT cp.id_compartilhamento) AS total_compartilhamentos,
                    COUNT(DISTINCT co.id_comentario) AS total_comentarios,
                         (SELECT MAX(c2.data_curtida)
                         FROM curte c2 
                         WHERE c2.fk_perfil_id_perfil = %s AND c2.fk_postagem_id_postagem = p.id_postagem) AS max_data_curtida 
                    FROM postagem p
                    LEFT JOIN curte c ON c.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN compartilhamento cp ON cp.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN comentario co ON co.fk_postagem_id_postagem = p.id_postagem
                    JOIN perfil pe ON pe.id_perfil = p.fk_perfil_id_perfil
                    JOIN configuracao con ON con.fk_perfil_id_perfil = pe.id_perfil
                    WHERE c.fk_perfil_id_perfil = %s
                    GROUP BY p.id_postagem
                    ORDER BY max_data_curtida DESC
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, profile_id, limit, offset))
               result = cursor.fetchall()

               if not result:
                    return []

               posts_ids = [post["id_postagem"] for post in result]
          
               medias = get_post_medias_for_feed(con, posts_ids) 
               hashtags = get_post_hashtags_for_feed(con, posts_ids) 
               tags = get_post_tags_for_feed(con, posts_ids) 
               comments = get_post_comments_for_feed(con, posts_ids)       
               authors_ids = [post["fk_perfil_id_perfil"] for post in result]
               authors = get_profiles_for_feed(con, authors_ids)

               if medias is None or hashtags is None or tags is None or comments is None:
                    raise Exception("Erro ao recuperar dados das postagens curtidas pelo perfil.")

               posts = []

               for post in result:
                    post["author"] = authors.get(post["fk_perfil_id_perfil"], {})
                    
                    if not post["author"]:
                         raise Exception("Erro ao recuperar autor da postagem.")
                    
                    post["medias"] = medias.get(post["id_postagem"], [])

                    if not post["medias"]:
                         raise Exception("Erro ao recuperar mídias da postagem.")

                    post["hashtags"] = hashtags.get(post["id_postagem"], [])
                    post["tags"] = tags.get(post["id_postagem"], [])
                    post["comments"] = comments.get(post["id_postagem"], [])
                    post["isLiked"] = True
                      
                    if post["isLiked"] is None:
                         raise Exception("Erro ao recuperar estado de curtida da postagem.")

                    post["isComplainted"] = check_post_complaint(con, profile_id, post["id_postagem"])
                    
                    if post["isComplainted"] is None:
                         raise Exception("Erro ao recuperar estado de denúncia da postagem. ")

                    comment_permission = post["permissao_comentario"].lower()
                    
                    if profile_id == post["fk_perfil_id_perfil"]:
                         post["canComment"] = True
                    elif comment_permission == "ninguém":
                         post["canComment"] = False
                    elif (comment_permission == "seguidos" and not check_follow(con, post["fk_perfil_id_perfil"], profile_id)) or (comment_permission == "seguidores" and not check_follow(con, profile_id, post["fk_perfil_id_perfil"])):
                         post["canComment"] = False
                    else:
                         post["canComment"] = True
                    
                    posts.append(post)

          return posts
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar postagens curtidas pelo perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_profile_commented_posts(con, profile_id, offset=None, limit=24):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT p.*, con.permissao_comentario, con.permissao_marcacao, con.permissao_compartilhamento, con.visibilidade_curtidas, con.visibilidade_compartilhamentos, con.visibilidade_comentarios, 
                    COUNT(DISTINCT c.fk_perfil_id_perfil) AS total_curtidas,
                    COUNT(DISTINCT cp.id_compartilhamento) AS total_compartilhamentos,
                    COUNT(DISTINCT co.id_comentario) AS total_comentarios,
                         (SELECT MAX(co2.data_comentario) 
                         FROM comentario co2 
                         WHERE co2.fk_perfil_id_perfil = %s AND co2.fk_postagem_id_postagem = p.id_postagem) AS max_data_comentario
                    FROM postagem p
                    LEFT JOIN curte c ON c.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN compartilhamento cp ON cp.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN comentario co ON co.fk_postagem_id_postagem = p.id_postagem
                    JOIN perfil pe ON pe.id_perfil = p.fk_perfil_id_perfil
                    JOIN configuracao con ON con.fk_perfil_id_perfil = pe.id_perfil
                    WHERE co.fk_perfil_id_perfil = %s
                    GROUP BY p.id_postagem
                    ORDER BY max_data_comentario DESC
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, profile_id, limit, offset))
               result = cursor.fetchall()

               if not result:
                    return []

               posts_ids = [post["id_postagem"] for post in result]
          
               medias = get_post_medias_for_feed(con, posts_ids) 
               hashtags = get_post_hashtags_for_feed(con, posts_ids) 
               tags = get_post_tags_for_feed(con, posts_ids) 
               comments = get_post_comments_for_feed(con, posts_ids) 
               authors_ids = [post["fk_perfil_id_perfil"] for post in result]
               authors = get_profiles_for_feed(con, authors_ids)      

               if medias is None or hashtags is None or tags is None or comments is None:
                    raise Exception("Erro ao recuperar dados das postagens comentadas pelo perfil.")

               posts = []

               for post in result:
                    post["author"] = authors.get(post["fk_perfil_id_perfil"], {})
                    
                    if not post["author"]:
                         raise Exception("Erro ao recuperar autor da postagem.")
                    
                    post["medias"] = medias.get(post["id_postagem"], [])

                    if not post["medias"]:
                         raise Exception("Erro ao recuperar mídias da postagem.")

                    post["hashtags"] = hashtags.get(post["id_postagem"], [])
                    post["tags"] = tags.get(post["id_postagem"], [])
                    post["comments"] = comments.get(post["id_postagem"], [])
                    post["isLiked"] = check_like(con, profile_id, post["id_postagem"])
                    
                    if post["isLiked"] is None:
                         raise Exception("Erro ao recuperar estado de curtida da postagem.")

                    post["isComplainted"] = check_post_complaint(con, profile_id, post["id_postagem"])
                    
                    if post["isComplainted"] is None:
                         raise Exception("Erro ao recuperar estado de denúncia da postagem. ")

                    comment_permission = post["permissao_comentario"].lower()
                    
                    if profile_id == post["fk_perfil_id_perfil"]:
                         post["canComment"] = True
                    elif comment_permission == "ninguém":
                         post["canComment"] = False
                    elif (comment_permission == "seguidos" and not check_follow(con, post["fk_perfil_id_perfil"], profile_id)) or (comment_permission == "seguidores" and not check_follow(con, profile_id, post["fk_perfil_id_perfil"])):
                         post["canComment"] = False
                    else:
                         post["canComment"] = True
                    
                    posts.append(post)

          return posts
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar postagens comentadas pelo perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_profile_shared_posts(con, profile_id, offset=None, limit=24):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT p.*, con.permissao_comentario, con.permissao_marcacao, con.permissao_compartilhamento, con.visibilidade_curtidas, con.visibilidade_compartilhamentos, con.visibilidade_comentarios, 
                    COUNT(DISTINCT c.fk_perfil_id_perfil) AS total_curtidas,
                    COUNT(DISTINCT cp.id_compartilhamento) AS total_compartilhamentos,
                    COUNT(DISTINCT co.id_comentario) AS total_comentarios,
                         (SELECT MAX(cp2.data_compartilhamento) 
                         FROM compartilhamento cp2 
                         WHERE cp2.fk_perfil_id_perfil = %s AND cp2.fk_postagem_id_postagem = p.id_postagem) AS max_data_compartilhamento
                    FROM postagem p
                    LEFT JOIN curte c ON c.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN compartilhamento cp ON cp.fk_postagem_id_postagem = p.id_postagem
                    LEFT JOIN comentario co ON co.fk_postagem_id_postagem = p.id_postagem
                    JOIN perfil pe ON pe.id_perfil = p.fk_perfil_id_perfil
                    JOIN configuracao con ON con.fk_perfil_id_perfil = pe.id_perfil
                    WHERE cp.fk_perfil_id_perfil = %s
                    GROUP BY p.id_postagem
                    ORDER BY max_data_compartilhamento DESC
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, profile_id, limit, offset))
               result = cursor.fetchall()

               if not result:
                    return []

               posts_ids = [post["id_postagem"] for post in result]
          
               medias = get_post_medias_for_feed(con, posts_ids) 
               hashtags = get_post_hashtags_for_feed(con, posts_ids) 
               tags = get_post_tags_for_feed(con, posts_ids) 
               comments = get_post_comments_for_feed(con, posts_ids)  
               authors_ids = [post["fk_perfil_id_perfil"] for post in result]
               authors = get_profiles_for_feed(con, authors_ids)         

               if medias is None or hashtags is None or tags is None or comments is None:
                    raise Exception("Erro ao recuperar dados das postagens compartilhadas pelo perfil.")

               posts = []

               for post in result:
                    post["author"] = authors.get(post["fk_perfil_id_perfil"], {})
                    
                    if not post["author"]:
                         raise Exception("Erro ao recuperar autor da postagem.")
                    
                    post["medias"] = medias.get(post["id_postagem"], [])

                    if not post["medias"]:
                         raise Exception("Erro ao recuperar mídias da postagem.")

                    post["hashtags"] = hashtags.get(post["id_postagem"], [])
                    post["tags"] = tags.get(post["id_postagem"], [])
                    post["comments"] = comments.get(post["id_postagem"], [])
                    post["isLiked"] = check_like(con, profile_id, post["id_postagem"])
                      
                    if post["isLiked"] is None:
                         raise Exception("Erro ao recuperar estado de curtida da postagem.")

                    post["isComplainted"] = check_post_complaint(con, profile_id, post["id_postagem"])
                    
                    if post["isComplainted"] is None:
                         raise Exception("Erro ao recuperar estado de denúncia da postagem. ")

                    comment_permission = post["permissao_comentario"].lower()
                    
                    if profile_id == post["fk_perfil_id_perfil"]:
                         post["canComment"] = True
                    elif comment_permission == "ninguém":
                         post["canComment"] = False
                    elif (comment_permission == "seguidos" and not check_follow(con, post["fk_perfil_id_perfil"], profile_id)) or (comment_permission == "seguidores" and not check_follow(con, profile_id, post["fk_perfil_id_perfil"])):
                         post["canComment"] = False
                    else:
                         post["canComment"] = True
                    
                    posts.append(post)

          return posts
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar postagens compartilhadas pelo perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def send_follower_request(con, follower_id, followed_id):
     try:
          with con.cursor() as cursor:
               date = datetime.now()

               sql_delete = "DELETE FROM solicitacao_seguidor WHERE fk_perfil_id_seguidor = %s AND fk_perfil_id_seguido = %s"
               cursor.execute(sql_delete, (follower_id, followed_id))

               sql_insert = "INSERT INTO solicitacao_seguidor (fk_perfil_id_seguidor, fk_perfil_id_seguido, envio) VALUES (%s, %s, %s)"
               cursor.execute(sql_insert, (follower_id, followed_id, date))

          con.commit()
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao enviar solicitação de seguidor: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False
     
def accept_follower_request(con, follower_id, followed_id):
     try:
          with con.cursor() as cursor:
               date = datetime.now()

               sql = "DELETE FROM solicitacao_seguidor WHERE fk_perfil_id_seguidor = %s AND fk_perfil_id_seguido = %s"
               cursor.execute(sql, (follower_id, followed_id))

               if check_follow(con, follower_id, followed_id):
                    return

               if toggle_follow(con, follower_id, followed_id) is None:
                    raise Exception("Erro ao aceitar solicitação de seguidor")

          con.commit()
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao aceitar solicitação de seguidor: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False
     
def insert_notification(con, type, message, profile_destiny_id, profile_origin_id=None, post_id=None):
     try:
          with con.cursor() as cursor:
               if not check_can_insert_notification(con, profile_destiny_id):
                    return
               
               date = datetime.now()

               columns = ["tipo", "mensagem", "lancamento", "fk_perfil_id_perfil_destino"]
               values = ["%s", "%s", "%s", "%s"]
               params = [type, message, date, profile_destiny_id]

               if profile_origin_id is not None:
                    columns.append("fk_perfil_id_perfil_origem")
                    values.append("%s")
                    params.append(profile_origin_id)

               if post_id is not None:
                    columns.append("fk_postagem_id_postagem")
                    values.append("%s")
                    params.append(post_id)

               sql = f"""
                    INSERT INTO notificacao ({", ".join(columns)}) 
                    VALUES ({", ".join(values)})
               """
               cursor.execute(sql, tuple(params))
               
          con.commit()
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao criar notificação: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

def get_profile_notifications(con, profile_id, offset, limit):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT * 
                    FROM notificacao 
                    WHERE fk_perfil_id_perfil_destino = %s
                    ORDER BY lancamento DESC
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, limit, offset))
               result = cursor.fetchall()

               notifications = []

               for notification in result:
                    if notification["fk_perfil_id_perfil_origem"]:
                         notification["origin_profile_photo"] = get_profile_photo_path(con, notification["fk_perfil_id_perfil_origem"])
                    
                    notifications.append(notification)

          return notifications
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar notificações do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_profile_follow_requests(con, profile_id, offset, limit):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT * 
                    FROM solicitacao_seguidor 
                    WHERE fk_perfil_id_seguido = %s
                    ORDER BY envio DESC
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, limit, offset))
               result = cursor.fetchall()

               follow_requests = []

               for follow_request in result:
                    follow_request["follower_photo"] = get_profile_photo_path(con, follow_request["fk_perfil_id_seguidor"])
                    follow_request["follower_name"] = get_profile_name(con, follow_request["fk_perfil_id_seguidor"])

                    if follow_request["follower_name"] is None:
                         print("Erro ao recuperar dados do perfil que fez a solicitação")
                    
                    follow_requests.append(follow_request)

          return follow_requests
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar solicitações para seguir o perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_profile_sharings(con, profile_id, offset, limit):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT c.* 
                    FROM compartilhamento c
                    JOIN compartilhado co ON co.fk_compartilhamento_id_compartilhamento = c.id_compartilhamento
                    WHERE c.fk_perfil_id_perfil = %s OR co.fk_perfil_id_perfil = %s
                    ORDER BY c.data_compartilhamento DESC
                    LIMIT %s OFFSET %s
               """
               cursor.execute(sql, (profile_id, profile_id, limit, offset))
               result = cursor.fetchall()

               sharings = []

               for sharing in result:
                    if profile_id == sharing["fk_perfil_id_perfil"]:
                         sharing["shareds"] = get_sharing_shareds(con, sharing["id_compartilhamento"])

                         if sharing["shareds"] is None:
                              raise Exception("Erro ao recuperar os compartilhados do compartilhamento")

                    sharing["profile_origin_name"] = get_profile_name(con, sharing["fk_perfil_id_perfil"])
                    sharing["profile_origin_photo"] = get_profile_photo_path(con, sharing["fk_perfil_id_perfil"])

                    if sharing["profile_origin_name"] is None or sharing["profile_origin_photo"] is None:
                         print("Erro ao recuperar dados do perfil que compartilhou a postagem")

                    sharing["post"] = get_post(con, sharing["fk_postagem_id_postagem"], profile_id)

                    if sharing["post"] is None:
                         print('Erro ao recuperar postagem do compartilhamento')
                    
                    sharings.append(sharing)

          return sharings
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar compartilhamentos do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_sharing_shareds(con, sharing_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT fk_perfil_id_perfil
                    FROM compartilhado
                    WHERE fk_compartilhamento_id_compartilhamento = %s
               """
               cursor.execute(sql, (sharing_id,))
               result = cursor.fetchall()

               shareds = []

               for shared in result:
                    shared["name"] = get_profile_name(con, shared["fk_perfil_id_perfil"])
                    shared["photo"] = get_profile_photo_path(con, shared["fk_perfil_id_perfil"])

                    if shared["name"] is None or shared["photo"] is None:
                         print("Erro ao recuperar dados do perfil da tabela compartilhado")

                    shareds.append(shared)

          return shareds
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar compartilhados do compartilhamento: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_states(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM estado ORDER BY sigla"
               cursor.execute(sql)
               result = cursor.fetchall()
     
          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar estados: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_degrees(con):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM grau_formacao ORDER BY grau"
               cursor.execute(sql)
               result = cursor.fetchall()
     
          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar graus de formação: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_cities(con, state_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM cidade WHERE fk_estado_id_estado = %s ORDER BY nome"
               cursor.execute(sql, (state_id,))
               result = cursor.fetchall()
     
          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar cidades: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_institutions(con, city_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT * FROM instituicao WHERE fk_cidade_id_cidade = %s ORDER BY nome"
               cursor.execute(sql, (city_id,))
               result = cursor.fetchall()
     
          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar instituições: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None
     
def get_courses(con, institution_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT ci.id_curso_instituicao, c.nome 
                    FROM curso_instituicao ci 
                    JOIN curso c ON c.id_curso = ci.fk_curso_id_curso
                    WHERE ci.fk_instituicao_id_instituicao = %s
                    ORDER BY c.nome 
               """
               cursor.execute(sql, (institution_id,))
               result = cursor.fetchall()
     
          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar cursos: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_user_id_by_profile(con, profile_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = "SELECT id_usuario FROM usuario WHERE fk_perfil_id_perfil = %s"
               cursor.execute(sql, (profile_id,))
               result = cursor.fetchone()
     
          return result["id_usuario"]
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar id do usuário: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_places(con, offset, limit, text = None, profile_id = None):
     try:
          with con.cursor(dictionary=True) as cursor:
               if not text:
                    sql = """
                         SELECT DISTINCT e.*, m.caminho as caminho_midia, lf.id_local_favorito, p.id_perfil
                         FROM endereco e
                         LEFT JOIN midia m ON m.id_midia = e.fk_midia_id_midia
                         JOIN local_favorito lf ON lf.fk_endereco_id_endereco = e.id_endereco
                         LEFT JOIN usuario u ON u.id_usuario = lf.fk_usuario_id_usuario
                         LEFT JOIN perfil p ON p.id_perfil = u.fk_perfil_id_perfil
                         WHERE lf.fk_usuario_id_usuario = %s
                         LIMIT %s OFFSET %s
                    """
                    user_id = get_user_id_by_profile(con, profile_id)

                    if user_id is None:
                         raise Exception("Erro ao recuperar id do usuário para recuperar seus lugares marcados.")

                    cursor.execute(sql, (user_id, limit, offset))
               else:
                    lower_text = text.lower()
                    sql = """
                         SELECT DISTINCT e.*, m.caminho as caminho_midia, lf.id_local_favorito, p.id_perfil
                         FROM endereco e
                         LEFT JOIN midia m ON m.id_midia = e.fk_midia_id_midia
                         JOIN local_favorito lf ON lf.fk_endereco_id_endereco = e.id_endereco
                         LEFT JOIN local_favorito_esportes lfe ON lfe.fk_local_favorito_id_local_favorito = lf.id_local_favorito
                         LEFT JOIN esporte es ON es.id_esporte = lfe.fk_esporte_id_esporte
                         LEFT JOIN usuario u ON u.id_usuario = lf.fk_usuario_id_usuario
                         LEFT JOIN perfil p ON p.id_perfil = u.fk_perfil_id_perfil
                         WHERE LOWER(es.nome) = %s OR LOWER(p.nome) = %s OR LOWER(e.bairro) = %s OR LOWER(e.cidade) = %s
                         LIMIT %s OFFSET %s
                    """
                    cursor.execute(sql, (lower_text, lower_text, lower_text, lower_text, limit, offset))
               
               result = cursor.fetchall()

               places = []

               for place in result:
                    place["author"] = get_profile_main_info(con, place["id_perfil"])

                    if not place["author"]:
                         raise Exception("Erro ao recuperar perfil marcador do lugar.")
               
                    place["sports"] = get_place_sports(con, place["id_local_favorito"])

                    if place["sports"] is None:
                         raise Exception("Erro ao recuperar esportes do lugar marcado.")

                    places.append(place) 
          
          return places
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar lugares: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def get_place_sports(con, favorite_place_id):
     try:
          with con.cursor(dictionary=True) as cursor:
               sql = """
                    SELECT 
                    e.nome, e.id_esporte,
                    m.caminho AS icone
                    FROM local_favorito_esportes lfe
                    JOIN esporte e ON lfe.fk_esporte_id_esporte = e.id_esporte
                    JOIN midia m ON e.fk_midia_id_icone = m.id_midia
                    WHERE lfe.fk_local_favorito_id_local_favorito = %s
               """
               cursor.execute(sql, (favorite_place_id,))
               result = cursor.fetchall()

          return result
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          print(f"Erro ao recuperar esportes do lugar marcado: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None


def insert_place(con, street, number, complement, neighborhood, state, city, postal_code, description, photo):
     try:
          with con.cursor() as cursor:
               if photo is not None:
                    media_id = insert_media(con, photo["path"], photo["type"], photo["format"])

                    if media_id is None:
                         raise Exception("Erro ao inserir foto do lugar marcado.")

               columns = ["logradouro", "estado", "cidade", "descricao"]
               values = ["%s", "%s", "%s", "%s"]
               params = [street, state, city, description]

               if number is not None and number != "":
                    columns.append("numero")
                    values.append("%s")
                    params.append(number)

               if complement is not None and complement != "":
                    columns.append("complemento")
                    values.append("%s")
                    params.append(complement)

               if neighborhood is not None and neighborhood != "":
                    columns.append("bairro")
                    values.append("%s")
                    params.append(neighborhood)

               if postal_code is not None and postal_code != "":
                    columns.append("cep")
                    values.append("%s")
                    params.append(postal_code)

               if photo is not None:
                    columns.append("fk_midia_id_midia")
                    values.append("%s")
                    params.append(media_id)

               sql = f"""
                    INSERT INTO endereco ({", ".join(columns)}) 
                    VALUES ({", ".join(values)})
               """
               cursor.execute(sql, tuple(params))
               address_id = cursor.lastrowid

          con.commit()
          return address_id
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir endereço: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return None

def insert_favorite_place(con, address_id, profile_id, place_sports_ids):
     try:
          with con.cursor() as cursor:
               user_id = get_user_id_by_profile(con, profile_id)

               if user_id is None:
                    raise Exception("Erro ao recuperar id do usuário para marcar lugar.")
               
               sql = """
                    INSERT INTO local_favorito (fk_endereco_id_endereco, fk_usuario_id_usuario) 
                    VALUES (%s, %s)
               """
               cursor.execute(sql, (address_id, user_id))
               favorite_place_id = cursor.lastrowid

               if place_sports_ids:
                    if not insert_favorite_place_sports(con, favorite_place_id, place_sports_ids):
                         raise Exception("Erro ao inserir esportes do lugar marcado.")

          con.commit()
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao favoritar lugar: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

def insert_favorite_place_sports(con, favorite_place_id, sports_ids):
     try:
          with con.cursor() as cursor:
               data = [(favorite_place_id, sport_id) for sport_id in sports_ids]
               sql = """
                    INSERT INTO local_favorito_esportes (fk_local_favorito_id_local_favorito, fk_esporte_id_esporte) 
                    VALUES (%s, %s)
               """
               cursor.executemany(sql, data)

          con.commit()
          return True
     except Exception as e:
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao favoritar lugar: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

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
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao criar banco de dados: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False

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
          _, _, exc_tb = sys.exc_info()
          con.rollback()
          print(f"Erro ao inserir dados de inicialização: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
          return False
          