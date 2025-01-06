from flask import Flask, jsonify, request
from flask_cors import CORS
from database.queries import *
from database.connection import *
from flask_bcrypt import Bcrypt
import os

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)

UPLOAD_FOLDER = os.path.join('../client/src/img/users')

con_params = ('localhost', 'root', '1234', 'athleteconnect')   

@app.route('/hashtags', methods=['GET'])
def get_hastags_route():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        hashtags = get_hashtags(con)

        if hashtags is None:
            print('Erro ao recuperar hashtags')
            return jsonify({'error': 'Não foi possível recuperar as hashtags devido a um erro no nosso servidor.'}), 500

        return jsonify(hashtags), 200
    except Exception as e:
        print(f'Erro ao recuperar hashtags: {e}')
        return jsonify({'error': 'Não foi possível recuperar as hashtags devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/tags', methods=['GET'])
def get_tags_route():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        tags = get_tags(con)

        if tags is None:
            print('Erro ao recuperar tags')
            return jsonify({'error': 'Não foi possível recuperar as tags devido a um erro no nosso servidor.'}), 500

        return jsonify(tags), 200
    except Exception as e:
        print(f'Erro ao recuperar tags: {e}')
        return jsonify({'error': 'Não foi possível recuperar as tags devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/complaintReasons', methods=['GET'])
def get_complaint_reasons_route():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        reasons = get_complaint_reasons(con)

        if reasons is None:
            print('Erro ao recuperar motivos de denúncia')
            return jsonify({'error': 'Não foi possível recuperar os motivos de denúncia devido a um erro no nosso servidor.'}), 500

        return jsonify(reasons), 200
    except Exception as e:
        print(f'Erro ao recuperar motivos de denúncia: {e}')
        return jsonify({'error': 'Não foi possível recuperar os motivos de denúncia devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles', methods=['GET'])
def get_profiles_route():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        profiles = get_profiles(con)

        if profiles is None:
            print('Erro ao recuperar perfis')
            return jsonify({'error': 'Não foi possível recuperar os perfis devido a um erro no nosso servidor.'}), 500
        
        return jsonify(profiles), 200
    except Exception as e:
        print(f'Erro ao recuperar perfis: {e}')
        return jsonify({'error': 'Não foi possível recuperar os perfis devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles', methods=['POST'])
def post_profile():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        bio = request.form.get('bio')
        private = request.form.get('private')
        private = private.lower() == 'true' if private else False
        photo = request.files.get('photo')
        preferences = request.form.getlist('preferences')
        preferences = [int(pref) for pref in preferences]

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        profile_id = insert_profile(con, email, hashed_password, name, bio, private)

        if profile_id is None:
            print('Erro ao inserir perfil')
            return jsonify({'error': 'Não foi possível criar seu perfil devido a um erro no nosso servidor.'}), 500

        if not insert_profile_preferences(con, profile_id, preferences):
            print('Erro ao inserir preferências do perfil')
            return jsonify({'error': 'Não foi possível registrar suas preferências devido a um erro no nosso servidor'}), 500     

        user_folder = os.path.join(UPLOAD_FOLDER, f'{profile_id}')

        os.makedirs(user_folder, exist_ok=True)
        os.makedirs(os.path.join(user_folder, 'posts'), exist_ok=True)
        os.makedirs(os.path.join(user_folder, 'flashs'), exist_ok=True)
        os.makedirs(os.path.join(user_folder, 'profilePhoto'), exist_ok=True)
        
        if photo:
            filename = photo.filename
            filename = os.path.basename(filename)

            _, file_extension = os.path.splitext(filename)  
            file_extension = file_extension.lower()

            filepath = os.path.join(user_folder, 'profilePhoto', filename)
            photo.save(filepath)

            saved_file = {
                'path': f'users/{profile_id}/profilePhoto/{filename}',
                'type': 'image' if photo.mimetype.startswith('image/') else 'video',
                'format': file_extension,
            }

            media_id = insert_media(con, saved_file['path'], saved_file['type'], saved_file['format'])   

            if media_id is None or not insert_profile_photo(con, profile_id, media_id):
                print('Erro ao inserir foto de perfil')
                return jsonify({'error': 'Não foi possível registrar sua foto de perfil devido a um erro no nosso servidor.'}), 500     

        return jsonify({'profileId': profile_id}), 201
    except Exception as e:
        print(f'Erro ao inserir perfil: {e}')
        return jsonify({'error': 'Não foi possível criar seu perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/login', methods=['POST'])
def login():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        profiles = get_profiles(con)

        if profiles is None:
            print('Erro ao recuperar perfis')
            return jsonify({'error': 'Não foi possível recuperar os perfis para realizar o login devido a um erro no nosso servidor.'}), 500
        
        nameOrEmailLogin = request.form.get('nameOrEmail')
        passwordLogin = request.form.get('password')

        for profile in profiles:
            if profile['nome'] == nameOrEmailLogin or profile['email'] == nameOrEmailLogin:
                if bcrypt.check_password_hash(profile['senha'], passwordLogin):
                    return jsonify({'profileId': profile['id_perfil']}), 200
                else:
                    return jsonify({'error': 'login'}), 401
                
        return jsonify({'error': 'login'}), 401
    except Exception as e:
        print(f'Erro ao realizar login: {e}')
        return jsonify({'error': 'Não foi possível realizar o login devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/signup', methods=['POST'])
def signup():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        profiles = get_profiles(con)

        if profiles is None:
            print('Erro ao recuperar perfis')
            return jsonify({'error': 'Não foi possível recuperar os perfis para conferir a correspondência de dados no registro do perfil devido a um erro no nosso servidor.'}), 500

        name = request.form.get('name')
        email = request.form.get('email')

        for profile in profiles:
            if profile['nome'] == name or profile['email'] == email:
                return jsonify({'error': 'signup'}), 409
        
        return jsonify({'success': 'success'}), 200
    except Exception as e:
        print(f'Erro ao validar registro do perfil: {e}')
        return jsonify({'error': 'Não foi possível conferir a correspondência de dados no registro do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>', methods=['GET'])
def get_profile_route(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        profile = get_profile(con, profile_id)
    
        if profile is None:
            print('Erro ao recuperar perfil')
            return jsonify({'error': 'Não foi possível encontrar nenhum perfil com o id fornecido. Tente fazer o login.'}), 404

        return jsonify(profile), 200
    except Exception as e:
        print(f'Erro ao recuperar perfil: {e}')
        return jsonify({'error': 'Não foi possível recuperar o perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/feed', methods=['GET'])
def get_feed(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        feed = get_feed_posts(con, profile_id)

        if feed is None:
            print('Erro ao recuperar feed fo perfil')
            return jsonify({'error': 'Não foi possível recuperar o feed do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(feed), 200
    except Exception as e:
        print('Erro ao recuperar feed fo perfil')
        return jsonify({'error': 'Não foi possível recuperar o feed do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/posts', methods=['POST'])
def post_post(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        user_folder = os.path.join(UPLOAD_FOLDER, f'{profile_id}', 'posts')
        os.makedirs(user_folder, exist_ok=True)

        caption = request.form.get('caption')
        hashtags = request.form.getlist('hashtags')
        hashtag_ids = [int(hashtag) for hashtag in hashtags]
        tags = request.form.getlist('tags')
        tag_ids = [int(tag) for tag in tags]
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
                new_filename = f'{base_filename}_{counter}{file_extension}'
                counter += 1

            filepath = os.path.join(user_folder, new_filename)
            file.save(filepath)

            saved_files.append({
                'path': f'users/{profile_id}/posts/{new_filename}',
                'type': 'image' if file.mimetype.startswith('image/') else 'video',
                'format': file_extension,
            })

        post_id = insert_post(con, caption, profile_id, hashtag_ids, tag_ids, saved_files)

        if post_id is None:
            print('Erro ao inserir postagem')
            return jsonify({'error': 'Não foi possível publicar sua postagem devido a um erro no nosso servidor.'}), 500
        
        return jsonify({'postId': post_id}), 201
    except Exception as e:
        print('Erro ao inserir postagem')
        return jsonify({'error': 'Não foi possível publicar sua postagem devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/posts/<int:post_id>/like', methods=['POST'])
def post_like(post_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        profile_id = int(request.form.get('profileId'))
        is_liked = toggle_like(con, profile_id, post_id)

        if is_liked is None:
            print('Erro ao conferir estado de curtida da postagem')
            return jsonify({'error': 'Não foi possível conferir o estado de curtida da postagem devido a um erro no nosso servidor.'}), 500

        return jsonify({'isLiked': is_liked}), 200
    except Exception as e:
        print('Erro ao conferir estado de curtida da postagem')
        return jsonify({'error': 'Não foi possível conferir o estado de curtida da postagem devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/posts/<int:post_id>/sharing', methods=['POST'])
def post_sharing(post_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        caption = request.form.get('caption')
        author_id = int(request.form.get('authorId'))
        target_profiles_ids = request.form.getlist('targetProfilesIds')
        targets_ids = [int(target_id) for target_id in target_profiles_ids]

        sharing_result = insert_sharing(con, caption, post_id, author_id, targets_ids)

        if not sharing_result:
            print('Erro ao compartilhar postagem')
            return jsonify({'error': 'Não foi possível compartilhar a postagem devido a um erro no nosso servidor.'}), 500
        
        return ({'success': 'success'}), 201
    except Exception as e:
        print('Erro ao compartilhar postagem')
        return jsonify({'error': 'Não foi possível compartilhar a postagem devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/posts/<int:post_id>/complaint', methods=['POST'])
def post_complaint(post_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        description = request.form.get('description')
        author_id = int(request.form.get('authorId'))
        complaint_reasons_ids = request.form.getlist('complaintReasonsIds')
        reason_ids = [int(reason_id) for reason_id in complaint_reasons_ids]
    
        complaint_result = insert_post_complaint(con, description, author_id, post_id, reason_ids)

        if not complaint_result:
            print('Erro ao denunciar postagem')
            return jsonify({'error': 'Não foi possível denunciar a postagem devido a um erro no nosso servidor.'}), 500
        
        return ({'success': 'success'}), 201
    except Exception as e:
        print('Erro ao denunciar postagem')
        return jsonify({'error': 'Não foi possível denunciar a postagem devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/posts/<int:post_id>/comment', methods=['POST'])
def post_comment(post_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        text = request.form.get('text')
        author_id = int(request.form.get('authorId'))

        new_comment = insert_comment(con, text, post_id, author_id)

        if new_comment is None:
            print('Erro ao comentar na postagem')
            return jsonify({'error': 'Não foi possível comentar na postagem devido a um erro no nosso servidor.'}), 500
        
        return jsonify({'newComment': new_comment}), 201
    except Exception as e:
        print('Erro ao comentar na postagem')
        return jsonify({'error': 'Não foi possível comentar na postagem devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/flashs', methods=['GET'])
def get_flashs_route(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        flashs = get_flashs(con, profile_id)

        if flashs is None:
            print('Erro ao recuperar flashs')
            return jsonify({'error': 'Não foi possível recuperar os flashs devido a um erro no nosso servidor.'}), 500
        
        return jsonify(flashs), 200
    except Exception as e:
        print('Erro ao recuperar flashs')
        return jsonify({'error': 'Não foi possível recuperar os flashs devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/flashs', methods=['POST'])
def post_flash(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        user_folder = os.path.join(UPLOAD_FOLDER, f'{profile_id}', 'flashs')
        os.makedirs(user_folder, exist_ok=True)

        available_time = int(request.form.get('availableTime'))
        media = request.files.get('media')

        filename = media.filename
        filename = os.path.basename(filename)

        base_filename, file_extension = os.path.splitext(filename)
        file_extension = file_extension.lower()

        counter = 1
        new_filename = filename

        while os.path.exists(os.path.join(user_folder, new_filename)):
            new_filename = f'{base_filename}_{counter}{file_extension}'
            counter += 1

        filepath = os.path.join(user_folder, new_filename)
        media.save(filepath)

        saved_file = {
            'path': f'users/{profile_id}/posts/{new_filename}',
            'type': 'image' if media.mimetype.startswith('image/') else 'video',
            'format': file_extension,
        }

        media_id = insert_media(con, saved_file['path'], saved_file['type'], saved_file['format'])

        if media_id is None:
            print('Erro ao inserir mídia do flash')
            return jsonify({'error': 'Não foi possível registrar a mídia do flash devido a um erro no nosso servidor.'}), 500
        
        flash_id = insert_flash(con, available_time, profile_id, media_id)

        if flash_id is None:
            print('Erro ao inserir flash')
            return jsonify({'error': 'Não foi possível criar seu flash devido a um erro no nosso servidor.'}), 500
        
        return jsonify({'flashId': flash_id}), 201
    except Exception as e:
        print('Erro ao inserir flash')
        return jsonify({'error': 'Não foi possível criar seu flash devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/sports', methods=['GET'])
def get_sports_route():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        sports = get_sports(con)

        if sports is None:
            print('Erro ao recuperar esportes')
            return jsonify({'error': 'Não foi possível recuperar os esportes devido a um erro no nosso servidor.'}), 500
        
        return jsonify(sports), 200
    except Exception as e:
        print('Erro ao recuperar os esportes')
        return jsonify({'error': 'Não foi possível recuperar os esportes devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

if __name__ == '__main__':
    app.run(debug=True, port=5000)