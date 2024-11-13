from flask import Flask
from queries import *
from conection import *

app = Flask(__name__)

con_params = ("localhost", "estudante1", "estudante1", "athlete_connect")   
# con_params = ("localhost", "root", "1234", "athlete_connect")   
# con_params = ("localhost", "troarmen", "0000", "athlete_connect")   

con = conexao_abrir(*con_params)
criarBanco(con)
conexao_fechar(con)
