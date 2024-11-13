import mysql.connector;
import mariadb

def conexao_abrir(host, usuario, senha, banco):
    return mysql.connector.connect(host=host, user=usuario, password=senha, database=banco)
    # try:
    #     print("Deu certo!")
    #     return mariadb.connect(host=host, user=usuario, password=senha, database=banco)
    # except mariadb.Error as e:
    #     print(f"Erro ao conectar: {e}")
    #     return None

# Função para fechar a conexão com o banco
def conexao_fechar(con):
    con.close