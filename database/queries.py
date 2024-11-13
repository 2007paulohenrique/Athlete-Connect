from datetime import datetime
from conexao_bd import conexao_fechar, conexao_abrir
import mariadb


def obterPerfis(con):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM perfil"
     cursor.execute(sql)
     resultado = cursor.fetchall()
     cursor.close()
     return resultado

def inserirPerfil(con, email, senha, nome, biografia, privado):
     cursor = con.cursor()
     sql = "INSERT INTO perfil (email, senha, nome, verificado, biografia, ativo, privado) VALUES (%s, %s, %s, %s, %s, %s, %s)"
     cursor.execute(sql, (email, senha, nome, 0, biografia, 1, 0))
     con.commit() 
     cursor.close()

def inserirPostagem(con, legenda, id_perfil):
     cursor = con.cursor()
     sql = "INSERT INTO postagem (legenda, data_publicacao, fk_perfil_id_perfil) VALUES (%s, %s, %s)"
     data_agora = datetime.now()
     cursor.execute(sql, (legenda, data_agora, id_perfil))
     con.commit()
     cursor.close()

def conferirSeguidor(con, perfil_seguidor):
    cursor = con.cursor()
    sql = "SELECT * FROM segue"
    cursor.execute(sql)
    resultado = cursor.fetchall()
    cursor.close()

    ids_seguidos = []

    for (item in resultado):
        if (item['fk_perfil_id_seguidor'] = perfil_seguidor):
            ids_seguidos.add(item['fk_perfil_id_seguido'])

    return ids_seguidos

def listarPostagens(con, id_perfil):
    cursor = con.cursor(dictionary=True)
    sql = "SELECT * FROM postagem"
    cursor.execute(sql)
    resultado = cursor.fetchall()
    cursor.close()

    ids_seguidos = conferirSeguidor(con, id_perfil)
    feed = []

    for (item in resultado):
        if (item["fk_perfil_id_perfil"] in ids_seguidos):
            feed.add(item)

    return feed

def inserirFlash(con, legenda, id_perfil):
     cursor = con.cursor()
     sql = "INSERT INTO flash (legenda, fk_perfil_id_perfil) VALUES (%s, %s)"
     cursor.execute(sql, (legenda, id_perfil))
     con.commit()
     cursor.close()

def listarflashs(con):
     cursor = con.cursor(dictionary=True)
     sql = "SELECT * FROM flash"
     cursor.execute(sql)
     resultado = cursor.fetchall()
     cursor.close()
     return resultado


# def filtrarReservasPorData(con, data):
#      cursor = con.cursor(dictionary=True)

#      data_type_datetime = datetime.strptime(data, "%Y-%m-%d")

#      data_inicio = data_type_datetime.strftime("%Y-%m-%d 00:00:00") 
#      data_fim = data_type_datetime.strftime("%Y-%m-%d 23:59:59")

#      sql = "SELECT * FROM reservas WHERE (inicio BETWEEN %s AND %s) OR (fim BETWEEN %s AND %s) OR (inicio < %s AND fim > %s)"
#      cursor.execute(sql, (data_inicio, data_fim, data_inicio, data_fim, data_inicio, data_fim))
#      resultado = cursor.fetchall()
#      cursor.close()
#      return resultado

def criarBanco(con):
     with open("sql_tds", "r") as file:
          sql = file.read()

     cursor = con.cursor()
     cursor.execute(sql)
     cursor.close()