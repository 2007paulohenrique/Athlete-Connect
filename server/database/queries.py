from datetime import datetime
import sqlparse
# import mariadb

def get_profiles(con):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM perfil"
     cursor.execute(sql)
     result = cursor.fetchall()
     cursor.close()
     return result

def get_profile(con, profile_id):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM perfil WHERE id_perfil = %s"
     cursor.execute(sql, (profile_id,))
     result = cursor.fetchone()
     if result:
          if "fk_midia_id_midia" in result and result["fk_midia_id_midia"]:
               result["media"] = get_media(con, result["fk_midia_id_midia"])
     cursor.close()
     return result

def insert_profile(con, email, password, name, bio, private):
     cursor = con.cursor()
     sql = "INSERT INTO perfil (email, senha, nome, verificado, ativo, privado, biografia) VALUES (%s, %s, %s, %s, %s, %s, %s)"
     cursor.execute(sql, (email, password, name, 0, 1, 1 if private else 0, bio))
     con.commit() 
     profile_id = cursor.lastrowid
     insert_user(con, profile_id)
     insert_default_profile_config(con, profile_id, private)
     cursor.close()
     return profile_id

def insert_profile_preferences(con, profile_id, sports_ids):
     cursor = con.cursor()
     sql = "INSERT INTO preferencia (fk_perfil_id_perfil, fk_esporte_id_esporte) VALUES (%s, %s)"
     
     for sport_id in sports_ids:
        cursor.execute(sql, (profile_id, sport_id))
    
     con.commit() 
     cursor.close()

def insert_user(con, profile_id):
     cursor = con.cursor()
     sql = "INSERT INTO usuario (fk_perfil_id_perfil) VALUES (%s)"
     cursor.execute(sql, (profile_id,))
     con.commit() 
     cursor.close()

def insert_default_profile_config(con, profile_id, is_private):
     cursor = con.cursor()
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
     con.commit() 
     cursor.close()

def insert_post(con, caption, profile_id, hashtag_ids, medias):
     cursor = con.cursor()
     date = datetime.now()

     sql = "INSERT INTO postagem (legenda, data_publicacao, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
     cursor.execute(sql, (caption, date, profile_id))
     con.commit()
     post_id = cursor.lastrowid

     for item in hashtag_ids:
          insert_post_hashtag(con, post_id, item)

     for item in medias:
          insert_post_media(con, item["path"], item["type"], item["format"], post_id)
     
     cursor.close()

def insert_post_hashtag(con, post_id, hashtag_id):
     cursor = con.cursor()
     sql = "INSERT INTO postagem_hashtag (fk_postagem_id_postagem, fk_hashtag_id_hashtag) VALUES (%s, %s)"
     cursor.execute(sql, (post_id, hashtag_id))
     con.commit()
     cursor.close()

def insert_post_media(con, path, type, format, post_id):
     cursor = con.cursor()
     sql = "INSERT INTO midia (caminho, tipo, formato, fk_postagem_id_postagem) VALUES (%s, %s, %s, %s)"
     cursor.execute(sql, (path, type, format, post_id))
     con.commit()
     cursor.close()

def insert_media(con, path, type, format):
     cursor = con.cursor()
     sql = "INSERT INTO midia (caminho, tipo, formato) VALUES (%s, %s, %s)"
     cursor.execute(sql, (path, type, format))
     con.commit()
     media_id = cursor.lastrowid
     cursor.close()
     return media_id

def get_media(con, media_id):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM midia WHERE id_midia = %s"
     cursor.execute(sql, (media_id,))
     result = cursor.fetchone()
     cursor.close()
     return result

def insert_profile_photo(con, profile_id, media_id):
     cursor = con.cursor()
     sql = "UPDATE perfil SET fk_midia_id_midia = %s WHERE id_perfil = %s"
     cursor.execute(sql, (media_id, profile_id))
     con.commit()
     cursor.close()

def check_followeds(con, follower_profile_id):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM segue WHERE fk_perfil_id_seguidor = %s"
     cursor.execute(sql, (follower_profile_id,))
     result = cursor.fetchall()
     cursor.close()

     followeds_ids = []

     for item in result:
          followeds_ids.append(item['fk_perfil_id_seguido'])

     return followeds_ids

def get_post_medias(con, post_id):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM midia WHERE fk_postagem_id_postagem = %s"
     cursor.execute(sql, (post_id,))
     result = cursor.fetchall()
     cursor.close()

     return result

def get_feed_posts(con, profile_id):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM postagem"
     cursor.execute(sql)
     posts = cursor.fetchall()

     followeds_ids = check_followeds(con, profile_id)
     feed = []

     for item in posts:
          if (item["fk_perfil_id_perfil"] in followeds_ids):
               item["medias"] = get_post_medias(con, item["id_postagem"])
               item["author"] = get_profile(con, item["fk_perfil_id_perfil"])
               item["hashtags"] = get_post_hashtags(con, item["id_postagem"])
               feed.append(item)

     cursor.close()

     return feed

def insert_like(con, profile_id, post_id):
     cursor = con.cursor()
     sql = "INSERT INTO curte (fk_perfil_id_perfil, fk_postagem_id_postagem) VALUES (%s, %s)"
     cursor.execute(sql, (profile_id, post_id))
     con.commit()
     cursor.close()

def insert_sharing(con, caption, post_id, profile_id, target_profiles_ids):
     cursor = con.cursor()
     sql = "INSERT INTO compartilhamento (legenda, fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s)"
     cursor.execute(sql, (caption, post_id, profile_id))
     con.commit()
     sharing_id = cursor.lastrowid

     for target_id in target_profiles_ids:
          insert_shared(con, target_id, sharing_id)

     cursor.close()

def insert_shared(con, profile_id, sharing_id):
     cursor = con.cursor()
     sql = "INSERT INTO compartilhado (fk_perfil_id_perfil, fk_compartilhamento_id_compartilhamento) VALUES (%s, %s)"
     cursor.execute(sql, (profile_id, sharing_id))
     con.commit()
     cursor.close()

def insert_comment(con, text, post_id, profile_id):
     cursor = con.cursor()
     sql = "INSERT INTO comentario (texto, fk_postagem_id_postagem, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
     cursor.execute(sql, (text, post_id, profile_id))
     con.commit()
     cursor.close()

def insert_post_complaint(con, description, profile_id, post_id, complaint_reasons_ids):
     cursor = con.cursor()
     sql = "INSERT INTO denuncia (descricao, fk_perfil_id_autor, fk_postagem_id_postagem) VALUES (%s, %s, %s)"
     cursor.execute(sql, (description, profile_id, post_id))
     con.commit()
     complaint_id = cursor.lastrowid

     for reason_id in complaint_reasons_ids:
          insert_post_complaint_reason(con, reason_id, complaint_id)

     cursor.close()

def insert_post_complaint_reason(con, complaint_reason_id, complaint_id):
     cursor = con.cursor()
     sql = "INSERT INTO motivos_denuncia (fk_motivo_denuncia_id_motivo_denuncia, fk_denuncia_id_denuncia) VALUES (%s, %s)"
     cursor.execute(sql, (complaint_reason_id, complaint_id))
     con.commit()
     cursor.close()
     
def get_complaint_reasons(con):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM motivo_denuncia ORDER BY motivo"
     cursor.execute(sql)
     result = cursor.fetchall()
     con.commit()
     cursor.close()
     return result

def insert_flash(con, flash_available_time, profile_id, media_id):
     cursor = con.cursor()
     sql = "INSERT INTO flash (duracao_horas, fk_perfil_id_perfil, fk_midia_id_midia) VALUES (%s, %s, %s)"
     cursor.execute(sql, (flash_available_time, profile_id, media_id))
     con.commit()
     cursor.close()

def get_flashs(con, profile_id):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM flash"
     cursor.execute(sql)
     result = cursor.fetchall()
     cursor.close()

     followeds_ids = check_followeds(con, profile_id)
     flashs = []

     for item in result:
          if (item["fk_perfil_id_perfil"] in followeds_ids):
               flashs.append(item)

     return flashs

def get_sports(con):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM esporte ORDER BY nome"
     cursor.execute(sql)
     result = cursor.fetchall()
     cursor.close()

     for sport in result:
        sport_id = sport['id_esporte']
        categories = get_sports_categories(con, sport_id)
        sport['categories'] = categories
        icon = get_sports_icon(con, sport['fk_midia_id_icone'])
        sport['iconPath'] = icon 

     return result

def get_sports_categories(con, sport_id):
     cursor = con.cursor(dictionary=True)
     sql = """
          SELECT c.*
          FROM esporte e
          JOIN categorias_esporte cs ON e.id_esporte = cs.fk_esporte_id_esporte
          JOIN categoria_esporte c ON cs.fk_categoria_esporte_id_categoria_esporte = c.id_categoria_esporte
          WHERE e.id_esporte = %s
     """
     cursor.execute(sql, (sport_id,))
     result = cursor.fetchall()
     cursor.close()

     return result

def get_sports_icon(con, midia_id):
     cursor = con.cursor(dictionary=True)
     sql = """
          SELECT caminho 
          FROM midia 
          WHERE id_midia = %s AND tipo = 'icone'
     """
     cursor.execute(sql, (midia_id,))
     result = cursor.fetchone()
     cursor.close()

     return result

def get_hashtags(con):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM hashtag ORDER BY nome"
     cursor.execute(sql)
     result = cursor.fetchall()
     cursor.close()
     return result

def get_post_hashtags(con, post_id):
     cursor = con.cursor(dictionary=True)
     sql = """
          SELECT h.*
          FROM hashtag h
          JOIN postagem_hashtag ph ON h.id_hashtag = ph.fk_hashtag_id_hashtag
          WHERE ph.fk_postagem_id_postagem = %s;
     """
     cursor.execute(sql, (post_id,))
     result = cursor.fetchall()
     cursor.close()
     return result

def create_database(con):
     with open("database/sql_tds.sql", "r", encoding="utf-8") as file:
          sql = file.read()

     commands = sqlparse.split(sql)
     cursor = con.cursor()

     for command in commands:
          command = command.strip()

          if command:
               cursor.execute(command)

     con.commit()
     cursor.close()

def seed_data(con):
     with open("database/seed_data.sql", "r", encoding="utf-8") as file:
          sql = file.read()

     commands = sqlparse.split(sql)
     cursor = con.cursor()

     for command in commands:
          command = command.strip()

          if command:
               cursor.execute(command)

     con.commit()
     cursor.close()