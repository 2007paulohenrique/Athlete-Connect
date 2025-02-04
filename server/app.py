from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from database.queries import *
from database.connection import *
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from flask_mail import Mail, Message
import os

load_dotenv()

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)

con_params = (
    os.getenv("DB_HOST"),
    os.getenv("DB_USER"),
    os.getenv("DB_PASSWORD"),
    os.getenv("DB_NAME"),
)  

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)

UPLOAD_FOLDER = os.path.join('../client/src/img/users')

def send_email_notification(email_dest, subject, message, profile_photo_path=None):
    email_template = render_template("email.html", profile_photo_path=profile_photo_path, message=message)

    msg = Message(subject, html=email_template, sender=app.config['MAIL_USERNAME'], recipients=[email_dest])

    with app.app_context():
        try:
            mail.send(msg)

            return True 
        except Exception as e:
            print(f'Erro ao enviar email: {e}')
            return False

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

# @app.route('/tags', methods=['GET'])
# def get_tags_route():
#     try:
#         con = open_connection(*con_params)

#         if con is None:
#             print('Erro ao abrir conexão com banco de dados')
#             return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
#         tags = get_tags(con)

#         if tags is None:
#             print('Erro ao recuperar tags')
#             return jsonify({'error': 'Não foi possível recuperar as tags devido a um erro no nosso servidor.'}), 500

#         return jsonify(tags), 200
#     except Exception as e:
#         print(f'Erro ao recuperar tags: {e}')
#         return jsonify({'error': 'Não foi possível recuperar as tags devido a um erro no nosso servidor.'}), 500
#     finally:
#         if con:
#             close_connection(con)

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

# O usuário é recuperado através do id do perfil
@app.route('/profiles/users/<int:profile_id>', methods=['GET'])
def get_user_route(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        profile_viewer_id = request.args.get('viewerId')

        user = get_user(con, profile_id, int(profile_viewer_id) if profile_viewer_id is not None else profile_id)

        if user is None:
            print('Erro ao recuperar usuário')
            return jsonify({'error': 'Usuário indisponível ou inexistente.'}), 404
        
        if user["ativo"] == False:
            print('Perfil desativado')
            return jsonify({'error': 'O perfil foi desativado. Faça login e o ative para voltar a usá-lo.'}), 204
        
        return jsonify(user), 200
    except Exception as e:
        print(f'Erro ao recuperar usuário: {e}')
        return jsonify({'error': 'Não foi possível recuperar o usuário devido a um erro no nosso servidor.'}), 500
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
            
        message = """
            Desejamos que você tenha ótimas experiências como amante dos esportes em nossa rede social. 
            Explore, conecte-se e compartilhe suas paixões esportivas com a nossa comunidade!
        """

        if not insert_notification(con, profile_id, message):
            print('Erro ao inserir notificação')
        
        send_email_notification(email, f"Bem-vindo ao Athlete Connect {name}!", message)

        profile = get_profile(con, profile_id, profile_id)   

        return jsonify({'profile': profile}), 201
    except Exception as e:
        print(f'Erro ao inserir perfil: {e}')
        return jsonify({'error': 'Não foi possível criar seu perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/preferences', methods=['PUT'])
def put_profile_preferences_r(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        preferences = request.form.getlist('preferences')
        preferences = [int(pref) for pref in preferences]

        if not put_profile_preferences(con, profile_id, preferences):
            print('Erro ao modificar preferências do perfil.')
            return jsonify({'error': 'Não foi possível modificar suas preferências devido a um erro no nosso servidor.'}), 500     
        
        return jsonify({'profileId': profile_id}), 201
    except Exception as e:
        print('Erro ao modificar preferências do perfil: {e}')
        return jsonify({'error': 'Não foi possível modificar suas preferências devido a um erro no nosso servidor.'}), 500     
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>', methods=['PUT'])
def put_profile_route(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        name = request.form.get('name')
        bio = request.form.get('bio')
        private = request.form.get('private')
        private = private.lower() == 'true' if private else False
        photo = request.files.get('photo')

        if put_profile(con, profile_id, name, bio, private) is None:
            print('Erro ao modificar perfil')
            return jsonify({'error': 'Não foi possível modificar seu perfil devido a um erro no nosso servidor.'}), 500
        
        if photo:
            filename = photo.filename
            filename = os.path.basename(filename)

            _, file_extension = os.path.splitext(filename)  
            file_extension = file_extension.lower()

            user_folder = os.path.join(UPLOAD_FOLDER, f'{profile_id}')

            filepath = os.path.join(user_folder, 'profilePhoto', filename)
            photo.save(filepath)

            saved_file = {
                'path': f'users/{profile_id}/profilePhoto/{filename}',
                'type': 'image' if photo.mimetype.startswith('image/') else 'video',
                'format': file_extension,
            }

            media_id = insert_media(con, saved_file['path'], saved_file['type'], saved_file['format'])   

            if media_id is None or not insert_profile_photo(con, profile_id, media_id):
                print('Erro ao modificar foto de perfil')
                return jsonify({'error': 'Não foi possível modificar sua foto de perfil devido a um erro no nosso servidor.'}), 500     

        return jsonify({'profileId': profile_id}), 201
    except Exception as e:
        print(f'Erro ao modificar perfil: {e}')
        return jsonify({'error': 'Não foi possível modificar seu perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/config/<string:field_name>', methods=['PUT'])
def put_config_route(profile_id, field_name):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        field_value = request.form.get(field_name)

        if field_value.lower() in ['true', 'false']:
            confirmed_field_value = field_value.lower() == 'true'
        else:
            confirmed_field_value = field_value

        if not put_config(con, field_name, confirmed_field_value, profile_id):
            print('Erro ao modificar configuração')
            return jsonify({'error': 'Não foi possível modificar sua configuração devido a um erro no nosso servidor.'}), 500
        
        return jsonify({'profileId': profile_id}), 201
    except Exception as e:
        print(f'Erro ao modificar configuração: {e}')
        return jsonify({'error': 'Não foi possível modificar sua configuração devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/active/<active>', methods=['PUT'])
def active_profile_route(profile_id, active):
    try:
        if active.lower() == 'true':
            active_bool = True
        elif active.lower() == 'false':
            active_bool = False
        else:
            return jsonify({'error': 'Parâmetro "active" deve ser "true" ou "false".'}), 400

        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        if put_profile(con, profile_id=profile_id, active=active_bool) is None:
            print('Erro ao modificar perfil')
            return jsonify({'error': 'Não foi possível modificar seu perfil devido a um erro no nosso servidor.'}), 500
        
        if active_bool:
            message = """
                Bem-vindo de volta!
                Agora que você ativou seu perfil, poderá voltar a usá-lo normalmente e os outros usuários poderão vê-lo.
            """
        else:
            message = """
                Você desativou seu perfil.
                Ficaremos felizes em tê-lo de volta! Para isso, faça login em sua conta e ative seu perfil.
            """

        if not insert_notification(con, profile_id, message):
            print('Erro ao inserir notificação')

        email = get_profile_email(con, profile_id)

        if email is None:
            print("Erro ao recuperar email do perfil")
        else:
            send_email_notification(email, "Ativação do perfil no Athlete Connect" if active_bool else "Desativação do perfil no Athlete Connect", message)
        
        return jsonify({'profileId': profile_id}), 201
    except Exception as e:
        print(f'Erro ao modificar perfil: {e}')
        return jsonify({'error': 'Não foi possível modificar seu perfil devido a um erro no nosso servidor.'}), 500
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
                    profile = get_profile(con, profile['id_perfil'], profile['id_perfil'])

                    message = f"""
                        Bem-vindo de volta {profile['nome']}!
                    """
                    
                    if not insert_notification(con, profile['id_perfil'], message):
                        print('Erro ao inserir notificação')

                    send_email_notification(profile['email'], "Login no Athlete Connect", message)

                    return jsonify({'profile': profile}), 200
                else:
                    message = f"""
                        Cuidado! 
                        Alguém acabou de tentar acessar a sua conta.
                        Caso esse alguém seja você, ignore essa mensagem, caso contrário,
                        lembre-se sempre de guardar sua credencias e não compartilhá-las com ninguém.
                    """
                    
                    if not insert_notification(con, profile['id_perfil'], message):
                        print('Erro ao inserir notificação')

                    email = get_profile_email(con, profile["id_perfil"])

                    if email is None:
                        print("Erro ao recuperar email do perfil")
                    else:
                        send_email_notification(email, "Tentativa de login no Athlete Connect", message)

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
        
        viewer_id = int(request.args.get('viewerId'))

        profile = get_profile(con, profile_id, viewer_id)
    
        if profile is None:
            print('Erro ao recuperar perfil')
            return jsonify({'error': 'Não foi possível encontrar nenhum perfil com o id fornecido. Tente fazer o login.'}), 404
        
        if profile["ativo"] == False:
            print('Perfil desativado')
            return jsonify({'error': 'O perfil foi desativado. Faça login e o ative para voltar a usá-lo.'}), 204

        return jsonify(profile), 200
    except Exception as e:
        print(f'Erro ao recuperar perfil: {e}')
        return jsonify({'error': 'Não foi possível recuperar o perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/followers', methods=['GET'])
def get_profile_followers(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados.')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        offset = int(request.args.get('offset', 0))

        followers = get_followers_tags(con, offset, profile_id)
    
        if followers is None:
            print('Erro ao recuperar seguidores do perfil.')
            return jsonify({'error': 'Não foi possível recuperar os seguidores do perfil devido a um erro no nosso servidor.'}), 404  
      
        return jsonify(followers), 200
    except Exception as e:
            print(f'Erro ao recuperar seguidores do perfil: {e}')
            return jsonify({'error': 'Não foi possível recuperar os seguidores do perfil devido a um erro no nosso servidor.'}), 404  
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/followeds', methods=['GET'])
def get_profile_followeds(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados.')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        offset = int(request.args.get('offset', 0))

        followeds = get_followeds_tags(con, offset, profile_id)
    
        if followeds is None:
            print('Erro ao recuperar perfis seguidos.')
            return jsonify({'error': 'Não foi possível recuperar os perfis seguidos devido a um erro no nosso servidor.'}), 404  
      
        return jsonify(followeds), 200
    except Exception as e:
            print(f'Erro ao recuperar perfis seguidos: {e}')
            return jsonify({'error': 'Não foi possível recuperar os perfis seguidos devido a um erro no nosso servidor.'}), 404  
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/follow', methods=['POST'])
def post_follow(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        follower_id = int(request.form.get('followerId'))
        is_followed = toggle_follow(con, follower_id, profile_id)

        if is_followed is None:
            print('Erro ao conferir estado de seguidor do perfil')
            return jsonify({'error': 'Não foi possível conferir o estado de seguidor do perfil devido a um erro no nosso servidor.'}), 500

        if is_followed:
            name = get_profile_name(con, follower_id)

            if name is None:
                print("Erro ao recuperar nome do perfil")
            else:
                message = f"""
                    {name} começou a te seguir.
                """
                
                if not insert_notification(con, profile_id, message):
                    print('Erro ao inserir notificação')

                email = get_profile_email(con, profile_id)

                if email is None:
                    print("Erro ao recuperar email do perfil")
                else:
                    profile_photo = get_profile_photo_path(con, follower_id)

                    send_email_notification(email, "Novo seguidor no Athlete Connect", message, profile_photo)

        req_status = 201 if is_followed else 204

        return jsonify({'isFollowed': is_followed}), req_status
    except Exception as e:
        print(f'Erro ao conferir estado de seguidor do perfil: {e}')
        return jsonify({'error': 'Não foi possível conferir o estado de seguidor do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/complaint', methods=['POST'])
def profile_complaint(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        description = request.form.get('description')
        author_id = int(request.form.get('authorId'))
        complaint_reasons_ids = request.form.getlist('complaintReasonsIds')
        reasons_ids = [int(reason_id) for reason_id in complaint_reasons_ids]

        if not insert_profile_complaint(con, description, author_id, profile_id, reasons_ids):
            print('Erro ao denunciar perfil')
            return jsonify({'error': 'Não foi possível denunciar o perfil devido a um erro no nosso servidor.'}), 500
        
        message = f"""
            Seu perfil foi denunciado.
            Infringir uma lei e fazer algo que possa ofender alguém podem ser motivos para ter seu perfil denunciado.
            Nós analisaremos a denúncia e seu perfil, então não se preocupe caso não tenha feito nada. 
        """
        
        if not insert_notification(con, profile_id, message):
            print('Erro ao inserir notificação')

        email = get_profile_email(con, profile_id)

        if email is None:
            print("Erro ao recuperar email do perfil")
        else:
            send_email_notification(email, "Denúncia ao seu perfil no Athlete Connect", message)
        
        return ({'success': 'success'}), 201
    except Exception as e:
        print(f'Erro ao denunciar perfil: {e}')
        return jsonify({'error': 'Não foi possível denunciar o perfil devido a um erro no nosso servidor.'}), 500
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
        
        offset = int(request.args.get('offset', 0))

        feed = get_feed_posts(con, profile_id, offset)

        if feed is None:
            print('Erro ao recuperar feed fo perfil')
            return jsonify({'error': 'Não foi possível recuperar o feed do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(feed), 200
    except Exception as e:
        print(f'Erro ao recuperar feed fo perfil: {e}')
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
        print(f'Erro ao inserir postagem: {e}')
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

        if is_liked:
            name = get_profile_name(con, profile_id)

            if name is None:
                print("Erro ao recuperar nome do perfil")
            else:
                author_id = get_post_author_id(con, post_id)

                if author_id is None:
                    print("Erro ao recuperar id do autor da postagem")
                else:
                    message = f"""
                        {name} curtiu sua postagem.
                    """

                    if not insert_notification(con, author_id, message):
                        print('Erro ao inserir notificação')

                    email = get_profile_email(con, author_id)

                    if email is None:
                        print("Erro ao recuperar email do perfil")
                    else:
                        profile_photo = get_profile_photo_path(con, profile_id)

                        send_email_notification(email, "Curtida no Athlete Connect", message, profile_photo)

        req_status = 201 if is_liked else 204

        return jsonify({'isLiked': is_liked}), req_status
    except Exception as e:
        print(f'Erro ao conferir estado de curtida da postagem: {e}')
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
        
        name = get_profile_name(con, author_id)

        if name is None:
            print("Erro ao recuperar nome do perfil")
        else:
            post_author_id = get_post_author_id(con, post_id)

            if post_author_id is None:
                print("Erro ao recuperar id do autor da postagem")
            else:
                message = f"""
                    {name} compartilhou sua postagem.
                """

                if not insert_notification(con, post_author_id, message):
                    print('Erro ao inserir notificação')

                email = get_profile_email(con, post_author_id)

                if email is None:
                    print("Erro ao recuperar email do perfil")
                else:
                    profile_photo = get_profile_photo_path(con, author_id)

                    send_email_notification(email, "Compartilhamento no Athlete Connect", message, profile_photo)
    
        return ({'success': 'success'}), 201
    except Exception as e:
        print(f'Erro ao compartilhar postagem: {e}')
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
        reasons_ids = [int(reason_id) for reason_id in complaint_reasons_ids]
    
        complaint_result = insert_post_complaint(con, description, author_id, post_id, reasons_ids)

        if not complaint_result:
            print('Erro ao denunciar postagem')
            return jsonify({'error': 'Não foi possível denunciar a postagem devido a um erro no nosso servidor.'}), 500

        post_author_id = get_post_author_id(con, post_id)

        if post_author_id is None:
            print("Erro ao recuperar id do autor da postagem")
        else:
            message = """
                Sua postagem foi denunciada.
                Infringir uma lei e fazer algo que possa ofender alguém podem ser motivos para ter sua postagem denunciada.
                Nós analisaremos a denúncia e sua postagem, então não se preocupe caso não tenha feito nada. 
            """

            if not insert_notification(con, post_author_id, message):
                print('Erro ao inserir notificação')

            email = get_profile_email(con, post_author_id)

            if email is None:
                print("Erro ao recuperar email do perfil")
            else:
                send_email_notification(email, "Denúncia à sua postagem no Athlete Connect", message)
    
        return ({'success': 'success'}), 201
    except Exception as e:
        print(f'Erro ao denunciar postagem: {e}')
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
        
        name = get_profile_name(con, author_id)

        if name is None:
            print("Erro ao recuperar nome do perfil")
        else:
            post_author_id = get_post_author_id(con, post_id)

            if post_author_id is None:
                print("Erro ao recuperar id do autor da postagem")
            else:
                message = f"""
                    {name} comentou em sua postagem.
                """

                if not insert_notification(con, post_author_id, message):
                    print('Erro ao inserir notificação')

                email = get_profile_email(con, post_author_id)

                if email is None:
                    print("Erro ao recuperar email do perfil")
                else:
                    profile_photo = get_profile_photo_path(con, author_id)

                    send_email_notification(email, "Comentário no Athlete Connect", message, profile_photo)
        
        return jsonify({'newComment': new_comment}), 201
    except Exception as e:
        print(f'Erro ao comentar na postagem: {e}')
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
        print(f'Erro ao recuperar flashs: {e}')
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
        print(f'Erro ao inserir flash: {e}')
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
        print(f'Erro ao recuperar os esportes: {e}')
        return jsonify({'error': 'Não foi possível recuperar os esportes devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/search/<string:text>', methods=['GET'])
def get_search(text):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        profile_id = int(request.args.get('profileId'))

        confirmed_text = insert_search(con, text, profile_id)

        if confirmed_text is None:
            print('Erro ao inserir pesquisa')
            return jsonify({'error': 'Não foi possível inserir a pesquisa em nosso banco de dados devido a um erro no nosso servidor.'}), 500
        
        result = get_search_result(con, confirmed_text)

        if result is None:
            print('Erro ao recuperar resultados da pesquisa')
            return jsonify({'error': 'Não foi possível recuperar os resultados da pesquisa devido a um erro no nosso servidor.'}), 500
        
        result["profiles"] = get_tags(con, profile_id, 0, text, 10)
        result["posts"] = get_posts_for_search(con, text, 0, profile_id, 24)
        
        if result["profiles"] is None or result["posts"] is None:
            print('Erro ao recuperar resultados da pesquisa')
            return jsonify({'error': 'Não foi possível recuperar os resultados da pesquisa devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        print(f'Erro ao recuperar resultados da pesquisa: {e}')
        return jsonify({'error': 'Não foi possível recuperar os resultados da pesquisa devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/search/sugestions', methods=['GET'])
def get_search_sugestions_r(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        result = get_search_sugestions(con, profile_id)

        if result is None:
            print('Erro ao recuperar sugestões de pesquisa do usuário')
            return jsonify({'error': 'Não foi possível recuperar as sugestões de pesquisa do usuário devido a um erro no nosso servidor.'}), 500
        
        return jsonify(result), 200
    except Exception as e:
        print(f'Erro ao recuperar sugestões de pesquisa do usuário: {e}')
        return jsonify({'error': 'Não foi possível recuperar as sugestões de pesquisa do usuário devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/search/posts/<string:text>', methods=['GET'])
def get_search_posts(text):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        offset = int(request.args.get('offset', 24))
        limit = request.args.get('limit')
        profile_id = int(request.args.get('profileId'))

        result = get_posts_for_search(con, text, offset, profile_id, int(limit) if limit is not None else 24)

        if result is None:
            print('Erro ao recuperar outros resultados de posts da pesquisa')
            return jsonify({'error': 'Não foi possível recuperar os outros resultados de posts da pesquisa devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        print(f'Erro ao recuperar outros resultados de posts da pesquisa: {e}')
        return jsonify({'error': 'Não foi possível recuperar outros resultados de posts da pesquisa devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/search/profiles/<string:text>', methods=['GET'])
def get_search_profiles(text):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        offset = int(request.args.get('offset', 0))
        limit = request.args.get('limit')
        profile_id = int(request.args.get('profileId'))

        result = get_tags(con, profile_id, offset, text, int(limit) if limit is not None else None)

        if result is None:
            print('Erro ao recuperar outros resultados de perfis da pesquisa')
            return jsonify({'error': 'Não foi possível recuperar outros resultados de perfis da pesquisa devido a um erro no nosso servidor.'}), 500
        
        return jsonify(result), 200
    except Exception as e:
        print(f'Erro ao recuperar outros resultados de perfis da pesquisa: {e}')
        return jsonify({'error': 'Não foi possível recuperar outros resultados de perfis da pesquisa devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/posts', methods=['GET'])
def get_profile_posts_r(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        offset = int(request.args.get('offset', 24))
        limit = request.args.get('limit')
        viewer_id = int(request.args.get('viewerId'))

        result = get_profile_posts(con, profile_id, viewer_id, offset, int(limit) if limit is not None else 24)

        if result is None:
            print('Erro ao recuperar outras postagens do perfil')
            return jsonify({'error': 'Não foi possível recuperar outras postagens do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        print(f'Erro ao recuperar outras postagens do perfil: {e}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/tagPosts', methods=['GET'])
def get_profile_tag_posts_r(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        offset = int(request.args.get('offset', 24))
        limit = request.args.get('limit')
        viewer_id = int(request.args.get('viewerId'))

        result = get_profile_tag_posts(con, profile_id, viewer_id, offset, int(limit) if limit is not None else 24)

        if result is None:
            print('Erro ao recuperar outras postagens em que o perfil foi marcado')
            return jsonify({'error': 'Não foi possível recuperar outras postagens em que o perfil foi marcado devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        print(f'Erro ao recuperar outras postagens em que o perfil foi marcado: {e}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens em que o perfil foi marcado devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/posts/liked', methods=['GET'])
def get_profile_liked_posts_r(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        offset = int(request.args.get('offset', 0))
        limit = request.args.get('limit')

        result = get_profile_liked_posts(con, profile_id, offset, int(limit) if limit is not None else 24)

        if result is None:
            print('Erro ao recuperar outras postagens curtidas do perfil')
            return jsonify({'error': 'Não foi possível recuperar outras postagens curtidas do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        print(f'Erro ao recuperar outras postagens curtidas do perfil: {e}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens curtidas do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/posts/commented', methods=['GET'])
def get_profile_commented_posts_r(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        offset = int(request.args.get('offset', 0))
        limit = request.args.get('limit')

        result = get_profile_commented_posts(con, profile_id, offset, int(limit) if limit is not None else 24)

        if result is None:
            print('Erro ao recuperar outras postagens comentadas do perfil')
            return jsonify({'error': 'Não foi possível recuperar outras postagens comentadas do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        print(f'Erro ao recuperar outras postagens comentadas do perfil: {e}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens comentadas do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/posts/shared', methods=['GET'])
def get_profile_shared_posts_r(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        offset = int(request.args.get('offset', 0))
        limit = request.args.get('limit')

        result = get_profile_shared_posts(con, profile_id, offset, int(limit) if limit is not None else 24)

        if result is None:
            print('Erro ao recuperar outras postagens compartilhadas do perfil')
            return jsonify({'error': 'Não foi possível recuperar outras postagens compartilhadas do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        print(f'Erro ao recuperar outras postagens compartilhadas do perfil: {e}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens compartilhadas do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

if __name__ == '__main__':
    app.run(debug=True, port=5000)