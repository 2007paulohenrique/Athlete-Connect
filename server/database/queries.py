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

def insert_profile(con, email, password, name, bio, private):
     cursor = con.cursor()
     sql = "INSERT INTO perfil (email, senha, nome, verificado, ativo, privado, biografia) VALUES (%s, %s, %s, %s, %s, %s, %s)"
     cursor.execute(sql, (email, password, name, 0, 1, 1 if private else 0, bio))
     con.commit() 
     profile_id = cursor.lastrowid
     cursor.close()
     return profile_id

def insert_post(con, caption, profile_id):
     cursor = con.cursor()
     sql = "INSERT INTO postagem (legenda, data_publicacao, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
     date = datetime.now()
     cursor.execute(sql, (caption, date, profile_id))
     con.commit()
     cursor.close()

def check_followeds(con, follower_profile):
     cursor = con.cursor()
     sql = "SELECT * FROM segue WHERE fk_perfil_id_seguidor = %s"
     cursor.execute(sql, (follower_profile,))
     result = cursor.fetchall()
     cursor.close()

     followeds_ids = []

     for item in result:
          if item['fk_perfil_id_seguidor'] == follower_profile:
               followeds_ids.add(item['fk_perfil_id_seguido'])

     return followeds_ids

def get_post_medias(con, post_id):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM midia WHERE fk_postagem_id_postagem = %s"
     cursor.execute(sql, (post_id,))
     result = cursor.fetchall()
     cursor.close()

     return result

def get_post_author(con, profile_id):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM perfil WHERE id_perfil = %s"
     cursor.execute(sql, (profile_id,))
     result = cursor.fetchone()
     cursor.close()

     return result

def get_feed_posts(con, profile_id):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM postagem"
     cursor.execute(sql)
     result = cursor.fetchall()

     followeds_ids = check_followeds(con, profile_id)
     feed = []

     for item in result:
          if (item["fk_perfil_id_perfil"] in followeds_ids):
               item["medias"] = get_post_medias(con, item["id_postagem"])
               item["author"] = get_post_author(con, item["fk_perfil_id_perfil"])
               feed.add(item)

     cursor.close()

     return feed

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
               flashs.add(item)

     return flashs

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
               print("comando", command)
               cursor.execute(command)

     con.commit()
     cursor.close()