from database.queries import *
from database.connection import *
import os

con_params = (
    os.getenv("DB_HOST"),
    os.getenv("DB_USER"),
    os.getenv("DB_PASSWORD"),
    os.getenv("DB_NAME"),
)

def main():
    try:
        con1 = open_connection(*con_params)

        if con1 is None or not create_database(con1):
            print("Erro ao abrir conexão e criar banco de dados")
            return False
        
        con2 = open_connection(*con_params)

        if con2 is None or not seed_data(con2):
            print("Erro ao inserir dados de inicialização no banco de dados")
            return False
    except Exception as e:
        print(f"Erro ao inicializar banco de dados: {e}")
        return False
    finally:
        if con1:
            close_connection(con1)  

        if con2:
            close_connection(con2)

    return True

if __name__ == '__main__':
    main()