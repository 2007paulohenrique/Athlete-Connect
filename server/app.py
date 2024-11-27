from flask import Flask, jsonify, request
from flask_cors import CORS
from database.queries import *
from database.connection import *

app = Flask(__name__)
CORS(app)

# con_params = ("localhost", "estudante1", "estudante1", "reservasalas")   
con_params = ("localhost", "root", "1234", "athleteconnect")   
# con_params = ("localhost", "troarmen", "0000", "reservasalas")   

con = open_connection(*con_params)
create_database(con)
close_connection(con)

@app.route('/profiles', methods=['GET'])
def get_profiles_r():
    con = open_connection(*con_params)
    profiles = get_profiles(con)
    close_connection(con)
    return jsonify(profiles)

@app.route('/profiles', methods=['POST'])
def post_profile():
    profile = request.get_json()

    con = open_connection(*con_params)
    profile_id = insert_profile(con, profile["emailSignUp"], profile["passwordSignUp"], profile["nameSignUp"])
    close_connection(con)
    return jsonify({"profileId": profile_id})

@app.route('/feeds/<int:profile_id>', methods=['GET'])
def get_feed(profile_id):
    con = open_connection(*con_params)
    feed = get_feed_posts(con, profile_id)
    close_connection(con)
    return jsonify(feed)

@app.route('/posts', methods=['POST'])
def post_post():
    post = request.get_json()

    con = open_connection(*con_params)
    insert_post(con, post["caption"], post["profile_id"])
    close_connection(con)

# flashs dos perfis que o usuário segue
@app.route('/flashs_list/<int:profile_id>', methods=['GET'])
def get_flashs_r(profile_id):
    con = open_connection(*con_params)
    flashs = get_flashs(con, profile_id)
    close_connection(con)
    return jsonify(flashs)

# todos os flashs
@app.route('/flashs', methods=['POST'])
def post_flash():
    flash = request.get_json()

    con = open_connection(*con_params)
    insert_flash(con, flash["available_time"], flash["profile_id"], flash["media_id"])
    close_connection(con)

if __name__ == '__main__':
    app.run(debug=True, port=5000)