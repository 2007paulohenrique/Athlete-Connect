from flask import Flask, jsonify
from queries import *
from conection import *

app = Flask(__name__)

con_params = ("localhost", "estudante1", "estudante1", "athlete_connect")   
# con_params = ("localhost", "root", "1234", "athlete_connect")   
# con_params = ("localhost", "troarmen", "0000", "athlete_connect")   

con = conexao_abrir(*con_params)
criarBanco(con)
conexao_fechar(con)

@app.route("/api/perfis", methods=["GET"])
def obter_perfis():
    con = conexao_abrir(*con_params)
    perfil = obterPerfis(con)
    conexao_fechar(con)

    return jsonify(perfil)

if __name__ == "__main__":
    app.run(debug=True)