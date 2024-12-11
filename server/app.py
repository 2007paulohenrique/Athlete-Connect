from flask import Flask, jsonify, request
from flask_cors import CORS
from database.queries import *
from database.connection import *
import os

app = Flask(__name__)
CORS(app)

con_params = ("localhost", "estudante1", "estudante1", "athleteconnect")   
# con_params = ("localhost", "root", "1234", "athleteconnect")   
# con_params = ("localhost", "troarmen", "0000", "athleteconnect")   

@app.route('/hashtags', methods=['GET'])
def get_hastags_r():
    con = open_connection(*con_params)
    hashtags = get_hashtags(con)
    close_connection(con)
    return jsonify(hashtags)

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
    profile_id = insert_profile(con, profile["emailSignUp"], profile["passwordSignUp"], profile["confirmedNameSignUp"], profile["bio"], profile["private"])
    insert_profile_preferences(con, profile_id, profile["preferences"])
    close_connection(con)

    base_dir = os.path.join(os.getcwd(), "..", "client", "src", "img", "users")
    profile_name = profile["confirmedNameSignUp"]
    user_dir = os.path.join(base_dir, profile_name)
    os.makedirs(user_dir, exist_ok=True)
    os.makedirs(os.path.join(user_dir, "posts"), exist_ok=True)
    os.makedirs(os.path.join(user_dir, "flashs"), exist_ok=True)
        
    return jsonify({"profileId": profile_id})

@app.route('/profiles/<int:profile_id>', methods=['GET'])
def get_profile_r(profile_id):
    con = open_connection(*con_params)
    profile = get_profile(con, profile_id)
    close_connection(con)
    return jsonify(profile)

@app.route('/feeds/<int:profile_id>', methods=['GET'])
def get_feed(profile_id):
    con = open_connection(*con_params)
    feed = get_feed_posts(con, profile_id)
    close_connection(con)
    return jsonify(feed)

@app.route('/profiles/<int:profile_id>/posts', methods=['POST'])
def post_post(profile_id):
    post = request.get_json()

    con = open_connection(*con_params)
    insert_post(con, post["caption"], profile_id, post['hashtags'])
    close_connection(con)
    return ""

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

@app.route('/sports', methods=['GET'])
def get_sports_and_catetories():
    con = open_connection(*con_params)
    sports = get_sports(con)
    close_connection(con)
    return jsonify(sports)

if __name__ == '__main__':
    app.run(debug=True, port=5000)