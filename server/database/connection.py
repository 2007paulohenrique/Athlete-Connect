import mysql.connector;

def open_connection(host, user, password, database):
    try:
        con = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            charset="utf8mb4"
        )

        if con.is_connected():
            return con
        else:
            return None
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None
    
def close_connection(con):
    if con:
        con.close