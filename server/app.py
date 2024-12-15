from flask import Flask, jsonify, request
from flask_cors import CORS
from database.queries import *
from database.connection import *
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join('../client/src/img/users')

# con_params = ("localhost", "estudante1", "estudante1", "athleteconnect")   
con_params = ("localhost", "root", "1234", "athleteconnect")   
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
    con = open_connection(*con_params)

    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')
    bio = request.form.get('bio')
    private = request.form.get('private')
    private = private.lower() == 'true' if private else False
    photo = request.files.get('photo')
    preferences = request.form.getlist('preferences')
    preferences = [int(pref) for pref in preferences]

    profile_id = insert_profile(con, email, password, name, bio, private)
    insert_profile_preferences(con, profile_id, preferences)

    user_folder = os.path.join(UPLOAD_FOLDER, f"{profile_id}")

    os.makedirs(user_folder, exist_ok=True)
    os.makedirs(os.path.join(user_folder, "posts"), exist_ok=True)
    os.makedirs(os.path.join(user_folder, "flashs"), exist_ok=True)
    os.makedirs(os.path.join(user_folder, "profilePhoto"), exist_ok=True)
    
    if photo:
        filename = photo.filename
        filename = os.path.basename(filename)

        _, file_extension = os.path.splitext(filename)  
        file_extension = file_extension.lower()

        filepath = os.path.join(user_folder, "profilePhoto", filename)
        photo.save(filepath)

        saved_file = {
            "path": f"users/{profile_id}/profilePhoto/{filename}",
            "type": "image" if photo.mimetype.startswith('image/') else "video",
            "format": file_extension,
        }

        media_id = insert_media(con, saved_file["path"], saved_file["type"], saved_file["format"])   
        insert_profile_photo(con, profile_id, media_id)    

    close_connection(con)
        
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
    con = open_connection(*con_params)

    user_folder = os.path.join(UPLOAD_FOLDER, f"{profile_id}", "posts")
    os.makedirs(user_folder, exist_ok=True)

    caption = request.form.get('caption')

    hashtags = request.form.getlist('hashtags')
    hashtag_ids = []
    for hashtag in hashtags:
        hashtag_id = int(hashtag) 
        hashtag_ids.append(hashtag_id) 

    medias = request.files.getlist('medias')
    saved_files = []

    for file in medias:
        filename = file.filename
        filename = os.path.basename(filename)

        base_filename, file_extension = os.path.splitext(filename)
        file_extension = file_extension.lower()

        counter = 1
        new_filename = filename

        while os.path.exists(os.path.join(user_folder, new_filename)):
            new_filename = f"{base_filename}_{counter}{file_extension}"
            counter += 1

        filepath = os.path.join(user_folder, new_filename)
        file.save(filepath)

        saved_files.append({
            "path": f"users/{profile_id}/posts/{new_filename}",
            "type": "image" if file.mimetype.startswith('image/') else "video",
            "format": file_extension,
        })

    insert_post(con, caption, profile_id, hashtag_ids, saved_files)
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