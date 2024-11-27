import mysql.connector;
# import mariadb

def open_connection(host, user, password, database):
    return mysql.connector.connect(host=host, user=user, password=password, database=database)
    # try:
    #     print("Deu certo!")
    #     return mariadb.connect(host=host, user=usuario, password=senha, database=banco)
    # except mariadb.Error as e:
    #     print(f"Erro ao conectar: {e}")
    #     return None

def close_connection(con):
    con.close