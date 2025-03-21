from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from database.queries import *
from database.connection import *
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from flask_mail import Mail, Message
import cloudinary
import redis
import string
import random
import cloudinary.uploader
import cloudinary.api
import os
import sys

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

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', '587')) 
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'False').lower() in ['true', '1', 'yes']
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

mail = Mail(app)

cloudinary.config( 
    cloud_name = os.getenv('CLOUD_NAME'),  
    api_key = os.getenv('API_KEY'),  
    api_secret = os.getenv('API_SECRET')  
)

def send_email_notification(email_dest, subject, message, key_word=None, profile_id=None, profile_photo_path=None, is_alert=False, is_code=False):
    con = open_connection(*con_params)

    if con is None:
        print('Erro ao abrir conexão com banco de dados')

    if not is_code:
        if profile_id is None or not check_can_insert_notification(con, profile_id) or not check_email_notification_permission(con, profile_id):
            return

    email_template = render_template("email.html", profile_photo_path=profile_photo_path, message=message, key_word=key_word, is_alert=is_alert)

    msg = Message(subject, html=email_template, sender=app.config['MAIL_USERNAME'], recipients=[email_dest])

    with app.app_context():
        try:
            mail.send(msg)

            return True 
        except Exception as e:
            _, _, exc_tb = sys.exc_info()
            print(f'Erro ao enviar email: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
            return False

def cloud_upload_media(media):
    try:
        result = cloudinary.uploader.upload(media)

        return result.get('secure_url')
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f"Erro ao fazer upload da mídia: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")
        return None
    
def cloud_upload_medias(medias):
    try:
        urls = []

        for media in medias:
            url = cloud_upload_media(media)

            urls.append(url)
        
        return urls
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f"Erro ao fazer upload das mídias: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}")

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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar hashtags: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar as hashtags devido a um erro no nosso servidor.'}), 500
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar motivos de denúncia: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar os motivos de denúncia devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/config', methods=['GET'])
def get_profile_config_route(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        config = get_profile_config(con, profile_id)

        if config is None:
            print('Erro ao recuperar configuração do perfil')
            return jsonify({'error': 'Não foi possível recuperar a configuração do perfil devido a um erro no nosso servidor.'}), 500
        
        return jsonify(config), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar configuração do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar a configuração do perfil devido a um erro no nosso servidor.'}), 500
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar usuário: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
        
        if photo:
            photo_path = cloud_upload_media(photo)

            if photo_path is not None:    
                filename = os.path.basename(photo.filename)
                _, file_extension = os.path.splitext(filename)  
                file_extension = file_extension.lower()

                saved_file = {
                    'path': photo_path,
                    'type': 'image' if photo.mimetype.startswith('image/') else 'video',
                    'format': file_extension,
                }

                media_id = insert_media(con, saved_file['path'], saved_file['type'], saved_file['format'])   

                if media_id is None or not insert_profile_photo(con, profile_id, media_id):
                    print('Erro ao inserir foto de perfil')
                    return jsonify({'error': 'Não foi possível registrar sua foto de perfil devido a um erro no nosso servidor.'}), 500 
            else:
                print("Erro ao fazer upload da foto de perfil") 
            
        message = """
            Desejamos que você tenha ótimas experiências como amante dos esportes em nossa rede social. 
            Explore, conecte-se e compartilhe suas paixões esportivas com a nossa comunidade!
        """

        if not insert_notification(con, "generica", message, profile_id):
            print('Erro ao inserir notificação')
        
        send_email_notification(email, f"Criação de perfil no Athlete Connect", message, "Bem-vindo!", profile_id)

        profile = get_profile(con, profile_id, profile_id)   

        return jsonify(profile), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao inserir perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível criar seu perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/preferences', methods=['PUT'])
def put_profile_preferences_route(profile_id):
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao modificar preferências do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
            photo_path = cloud_upload_media(photo)

            if photo_path is not None:    
                filename = os.path.basename(photo.filename)
                _, file_extension = os.path.splitext(filename)  
                file_extension = file_extension.lower()

                saved_file = {
                    'path': photo_path,
                    'type': 'image' if photo.mimetype.startswith('image/') else 'video',
                    'format': file_extension,
                }

                media_id = insert_media(con, saved_file['path'], saved_file['type'], saved_file['format'])   

                if media_id is None or not insert_profile_photo(con, profile_id, media_id):
                    print('Erro ao modificar foto de perfil')
                    return jsonify({'error': 'Não foi possível modificar sua foto de perfil devido a um erro no nosso servidor.'}), 500   
            else:
                print("Erro ao fazer upload da nova foto de perfil")   

        return jsonify({'profileId': profile_id}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao modificar perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao modificar configuração: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
            key_word = "Bem-vindo de volta!"

            message = """    
                Agora que você ativou seu perfil, poderá voltar a usá-lo normalmente e os outros usuários poderão vê-lo.
            """
        else:
            key_word = "Você desativou seu perfil."

            message = """
                Ficaremos felizes em tê-lo de volta! Para isso, faça login em sua conta e reative seu perfil.
            """

        if not insert_notification(con, "generica", message, profile_id):
            print('Erro ao inserir notificação')

        email = get_profile_email(con, profile_id)

        if email is None:
            print("Erro ao recuperar email do perfil")
        else:
            send_email_notification(email, f"{'Ativação' if active_bool else 'Desativação'} do perfil no Athlete Connect", message, key_word, profile_id)
        
        return jsonify({'profileId': profile_id}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao modificar perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
        
        nameOrEmailLogin = request.form.get('nameOrEmail')
        passwordLogin = request.form.get('password')

        profile = get_profile_for_autentication(con, nameOrEmailLogin, nameOrEmailLogin)
        
        if profile is not None:
            if bcrypt.check_password_hash(profile['senha'], passwordLogin):
                correct_profile = get_profile(con, profile['id_perfil'], profile['id_perfil'])

                if correct_profile["ativo"]:
                    message = f"""
                        Estamos felizes em vê-lo novamente, {profile['nome']}! Insira o código enviado a você por e-mail 
                        na tela de confirmação de identidade e volte a usar nossos serviços 
                        e contribuir para o crescimento do mundo dos esportes.
                    """
                    
                    if not insert_notification(con, "generica", message, correct_profile['id_perfil']):
                        print('Erro ao inserir notificação')

                    send_email_notification(profile['email'], "Login no Athlete Connect", message, "Bem-vindo de volta!", correct_profile['id_perfil'])

                correct_profile['email'] = profile['email']

                return jsonify(correct_profile), 200
            else:
                message = f"""
                    Alguém acabou de tentar acessar a sua conta.
                    Caso esse alguém seja você, ignore essa mensagem, caso contrário,
                    lembre-se sempre de guardar sua credencias e não compartilhá-las com ninguém.
                """
                
                if not insert_notification(con, "alerta", message, profile['id_perfil']):
                    print('Erro ao inserir notificação')

                email = get_profile_email(con, profile["id_perfil"])

                if email is None:
                    print("Erro ao recuperar email do perfil")
                else:
                    send_email_notification(email, "Tentativa de login no Athlete Connect", message, "Cuidado!", profile['id_perfil'], is_alert=True)

                return jsonify({'error': 'login'}), 401
            
        return jsonify({'error': 'login'}), 401
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao realizar login: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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

        name = request.form.get('name')
        email = request.form.get('email')

        profile = get_profile_for_autentication(con, email, name)

        if profile is not None:
            return jsonify({'error': 'signup'}), 409
        
        return jsonify({'success': 'success'}), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao validar registro do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível conferir a correspondência de dados no registro do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/identityConfirmation', methods=['POST'])
def identity_confirmation():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        code = request.form.get('code')
        email = request.form.get('email')

        if not code:
            caracteres = string.ascii_uppercase + string.digits
            generated_code = ''.join(random.choices(caracteres, k=4))
            
            redis_client.setex(f"verify_code:{email}", 120, generated_code)

            msg = "Insira o código de verificação mostrado acima para confirmar sua identidade."

            if not send_email_notification(email, "Código de verificação no Athlete Connect", msg, generated_code, is_code=True):
                print('Erro ao enviar código de confirmação')
                
                return jsonify({'error': 'Não foi possível enviar o código de confirmação devido a um erro no nosso servidor.'}), 500
        else:
            stored_code = redis_client.get(f"verify_code:{email}")

            if stored_code is None:
                return jsonify({"error": "Código expirado."}), 410

            if stored_code != code:
                return jsonify({"error": "Código inválido."}), 400
            
            redis_client.delete(f"verify_code:{email}")
    
        return jsonify({'success': 'success'}), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao processar código de confirmação: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível processar código de confirmação devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)


@app.route('/changePassword', methods=['POST'])
def change_password():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        email = request.form.get('email')
        password = request.form.get('password')

        profile = get_profile_for_autentication(con, email)

        if profile is None:
            print('Erro ao recuperar perfil')
            return jsonify({'error': 'Não foi possível encontrar o perfil.'}), 404

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        if not change_profile_password(con, profile["id_perfil"], hashed_password):
            print('Erro ao alterar senha do perfil')
            return jsonify({'error': 'Não foi possível alterar a senha do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify({'success': 'success'}), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao alterar senha do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível alterar a senha do perfil devido a um erro no nosso servidor.'}), 500
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar o perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/qualifications', methods=['GET'])
def get_profile_qualifications(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        profile = get_profile_main_info(con, profile_id)
    
        if profile is None:
            print('Erro ao recuperar perfil')
            return jsonify({'error': 'Não foi possível encontrar nenhum perfil com o id fornecido. Tente fazer o login.'}), 404
        
        if profile["ativo"] == False:
            print('Perfil desativado')
            return jsonify({'error': 'O perfil foi desativado. Faça login e o ative para voltar a usá-lo.'}), 204
        
        qualifications = get_user_qualifications(con, profile_id)

        if qualifications is None:
            print('Erro ao recuperar formações do perfil')
            return jsonify({'error': 'Não foi possível recuperar as formações do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(qualifications), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar formações do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar as formações do perfil devido a um erro no nosso servidor.'}), 500
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
            return jsonify({'error': 'Não foi possível recuperar os seguidores do perfil devido a um erro no nosso servidor.'}), 500  
      
        return jsonify(followers), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar seguidores do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar os seguidores do perfil devido a um erro no nosso servidor.'}), 500  
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
            return jsonify({'error': 'Não foi possível recuperar os perfis seguidos devido a um erro no nosso servidor.'}), 500  
      
        return jsonify(followeds), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar perfis seguidos: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar os perfis seguidos devido a um erro no nosso servidor.'}), 500 
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
                
                if not insert_notification(con, "generica", message, profile_id, follower_id):
                    print('Erro ao inserir notificação')

                email = get_profile_email(con, profile_id)

                if email is None:
                    print("Erro ao recuperar email do perfil")
                else:
                    profile_photo = get_profile_photo_path(con, follower_id)

                    send_email_notification(email, "Novo seguidor no Athlete Connect", message, profile_id=profile_id, profile_photo_path=profile_photo if profile_photo is not None else True)

        req_status = 201 if is_followed else 204

        return jsonify({'isFollowed': is_followed}), req_status
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao conferir estado de seguidor do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível conferir o estado de seguidor do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/followRequest', methods=['POST'])
def post_follow_request(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        follower_id = int(request.form.get('followerId'))

        if not send_follower_request(con, follower_id, profile_id):
            print(f'Erro ao enviar solicitação de seguidor: {e}')
            return jsonify({'error': 'Não foi possível enviar solicitação de seguidor devido a um erro no nosso servidor.'}), 500

        name = get_profile_name(con, follower_id)

        if name is None:
            print("Erro ao recuperar nome do perfil")
        else:
            message = f"""
                {name} enviou uma solicitação para te seguir.
                Entre no Athlete Connect e aceite sua solicitação em notificações se quiser que ele te siga. 
            """

            email = get_profile_email(con, profile_id)

            if email is None:
                print("Erro ao recuperar email do perfil")
            else:
                profile_photo = get_profile_photo_path(con, follower_id)

                send_email_notification(email, "Solicitação no Athlete Connect", message, profile_id=profile_id, profile_photo_path=profile_photo if profile_photo is not None else True)

        return ({'success': 'success'}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao enviar solicitação de seguidor: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível enviar solicitação de seguidor devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/followRequest/accept', methods=['POST'])
def post_follow_request_accept(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        follower_id = int(request.form.get('followerId'))

        if not accept_follower_request(con, follower_id, profile_id):
            print('Erro ao aceitar solicitação')
            return jsonify({'error': 'Não foi possível aceitar solicitação devido a um erro no nosso servidor.'}), 500

        name = get_profile_name(con, profile_id)

        if name is None:
            print("Erro ao recuperar nome do perfil")
        else:
            message = f"""
                {name} aceitou a sua solicitação para seguí-lo .
            """
            
            if not insert_notification(con, "generica", message, follower_id, profile_id):
                print('Erro ao inserir notificação')

            email = get_profile_email(con, follower_id)

            if email is None:
                print("Erro ao recuperar email do perfil")
            else:
                profile_photo = get_profile_photo_path(con, profile_id)

                send_email_notification(email, "Solicitação aceita no Athlete Connect", message, profile_id=follower_id, profile_photo_path=profile_photo if profile_photo is not None else True)

        return ({'success': 'success'}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao aceitar solicitação: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível aceitar solicitação devido a um erro no nosso servidor.'}), 500
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
            Infringir uma lei e fazer algo que possa ofender alguém podem ser motivos para ter seu perfil denunciado.
            Nós analisaremos a denúncia e seu perfil, então não se preocupe caso não tenha feito nada. 
        """
        
        if not insert_notification(con, "denuncia", message, profile_id):
            print('Erro ao inserir notificação')

        email = get_profile_email(con, profile_id)

        if email is None:
            print("Erro ao recuperar email do perfil")
        else:
            send_email_notification(email, "Denúncia ao seu perfil no Athlete Connect", message, "Seu perfil foi denunciado!", profile_id, is_alert=True)
        
        return ({'success': 'success'}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao denunciar perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível denunciar o perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/qualifications', methods=['POST'])
def post_qualification(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        course_id = int(request.form.get('courseId'))
        degree_id = int(request.form.get('degreeId'))

        user_id = get_user_id_by_profile(con, profile_id)

        if user_id is None:
            print('Erro ao recuperar id do usuário')
            return jsonify({'error': 'Não foi possível recuperar o id do usuário devido a um erro no nosso servidor.'}), 500
 
        if not insert_user_qualification(con, user_id, course_id, degree_id):
            print('Erro ao adicionar formação')
            return jsonify({'error': 'Não foi possível adicionar a formação devido a um erro no nosso servidor.'}), 500
        
        message = """
            Agora, sua formação é exibida sempre que alguém visitar seu perfil.
            Você passa mais credibilidade e segurança ao ter uma comprovação das suas habilidade, por isso, 
            não se esqueça de adicionar suas formações.  
        """
        
        if not insert_notification(con, "generica", message, profile_id):
            print('Erro ao inserir notificação')

        email = get_profile_email(con, profile_id)

        if email is None:
            print("Erro ao recuperar email do perfil")
        else:
            send_email_notification(email, "Formação no Athlete Connect", message, "Parabéns!", profile_id, is_alert=True)
        
        return ({'success': 'success'}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao adicionar formação: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível adicionar a formação devido a um erro no nosso servidor.'}), 500
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar feed fo perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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

        caption = request.form.get('caption')
        hashtags = request.form.getlist('hashtags')
        hashtag_ids = [int(hashtag) for hashtag in hashtags]
        tags = request.form.getlist('tags')
        tag_ids = [int(tag) for tag in tags]
        medias = request.files.getlist('medias')

        medias_path = cloud_upload_medias(medias)

        if medias_path is None:
            print("Erro ao fazer upload das mídias da postagem")
            return jsonify({'error': 'Não foi possível publicar sua postagem devido a um erro durante o upload das suas imagens/vídeos.'}), 500
        
        saved_files = []

        for index, file in enumerate(medias):
            filename = os.path.basename(file.filename)
            _, file_extension = os.path.splitext(filename)
            file_extension = file_extension.lower()

            saved_files.append({
                'path': medias_path[index],
                'type': 'image' if file.mimetype.startswith('image/') else 'video',
                'format': file_extension,
            })

        post_id = insert_post(con, caption, profile_id, hashtag_ids, tag_ids, saved_files)

        if post_id is None:
            print('Erro ao inserir postagem')
            return jsonify({'error': 'Não foi possível publicar sua postagem devido a um erro no nosso servidor.'}), 500

        name = get_profile_name(con, profile_id)

        if name is None:
            print("Erro ao recuperar nome do perfil")
        else:
            for tag_id in tag_ids:
                    message = f"""
                        {name} publicou uma postagem e te marcou.
                    """

                    if not insert_notification(con, "marcacao", message, tag_id, profile_id, post_id):
                        print('Erro ao inserir notificação')

                    email = get_profile_email(con, tag_id)

                    if email is None:
                        print("Erro ao recuperar email do perfil")
                    else:
                        profile_photo = get_profile_photo_path(con, profile_id)

                        send_email_notification(email, "Marcação em postagem no Athlete Connect", message, profile_id=tag_id, profile_photo_path=profile_photo if profile_photo is not None else True)
    
        return jsonify({'postId': post_id}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao inserir postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
                    if not author_id == profile_id:
                        message = f"""
                            {name} curtiu sua postagem.
                        """

                        if not insert_notification(con, "curtida", message, author_id, profile_id, post_id):
                            print('Erro ao inserir notificação')

                        email = get_profile_email(con, author_id)

                        if email is None:
                            print("Erro ao recuperar email do perfil")
                        else:
                            profile_photo = get_profile_photo_path(con, profile_id)

                            send_email_notification(email, "Curtida no Athlete Connect", message, profile_id=author_id, profile_photo_path=profile_photo if profile_photo is not None else True)

        req_status = 201 if is_liked else 204

        return jsonify({'isLiked': is_liked}), req_status
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao conferir estado de curtida da postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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

                if not insert_notification(con, "compartilhamento", message, post_author_id, author_id, post_id):
                    print('Erro ao inserir notificação')

                email = get_profile_email(con, post_author_id)

                if email is None:
                    print("Erro ao recuperar email do perfil")
                else:
                    profile_photo = get_profile_photo_path(con, author_id)

                    send_email_notification(email, "Compartilhamento no Athlete Connect", message, profile_id=post_author_id, profile_photo_path=profile_photo if profile_photo is not None else True)
    
        return ({'success': 'success'}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao compartilhar postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
                Infringir uma lei e fazer algo que possa ofender alguém podem ser motivos para ter sua postagem denunciada.
                Nós analisaremos a denúncia e sua postagem, então não se preocupe caso não tenha feito nada. 
            """

            if not insert_notification(con, "denuncia", message, post_author_id, post_id=post_id):
                print('Erro ao inserir notificação')

            email = get_profile_email(con, post_author_id)

            if email is None:
                print("Erro ao recuperar email do perfil")
            else:
                send_email_notification(email, "Denúncia à sua postagem no Athlete Connect", message, "Sua postagem foi denunciada!", post_author_id, is_alert=True)
    
        return ({'success': 'success'}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao denunciar postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
        resp_comment_id = request.form.get('respCommentId')

        new_comment = insert_comment(con, text, post_id, author_id, int(resp_comment_id) if type(resp_comment_id) == str else None)

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
                if not author_id == post_author_id:
                    message = f"""
                        {name} comentou em sua postagem.
                    """

                    if not insert_notification(con, "comentario", message, post_author_id, author_id, post_id):
                        print('Erro ao inserir notificação')

                    email = get_profile_email(con, post_author_id)

                    if email is None:
                        print("Erro ao recuperar email do perfil")
                    else:
                        profile_photo = get_profile_photo_path(con, author_id)

                        send_email_notification(email, "Comentário no Athlete Connect", message, profile_id=post_author_id, profile_photo_path=profile_photo if profile_photo is not None else True)
            
        return jsonify({'newComment': new_comment}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao comentar na postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar flashs: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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

        available_time = int(request.form.get('availableTime'))
        media = request.files.get('media')

        media_path = cloud_upload_media(media)

        if media_path is not None:
            filename = os.path.basename(media.filename)
            _, file_extension = os.path.splitext(filename)
            file_extension = file_extension.lower()
                
            saved_file = {
                'path': media_path,
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
        else:
            print("Erro ao fazer upload da mídia do flash")
            return jsonify({'error': 'Não foi possível criar seu flash devido a um erro durante o upload da sua foto/vídeo.'}), 500
        
        return jsonify({'flashId': flash_id}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao inserir flash: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar os esportes: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar resultados da pesquisa: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar os resultados da pesquisa devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post_route(post_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        viewer_id = int(request.args.get('viewerId'))

        post = get_post(con, post_id, viewer_id)

        if post is None:
            print('Erro ao recuperar postagem')
            return jsonify({'error': 'Não foi possível recuperar a postagem devido a um erro no nosso servidor.'}), 500
        
        return jsonify(post), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar a postagem devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/search/sugestions', methods=['GET'])
def get_search_sugestions_route(profile_id):
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar sugestões de pesquisa do usuário: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar outros resultados de posts da pesquisa: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar outros resultados de perfis da pesquisa: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar outros resultados de perfis da pesquisa devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/posts', methods=['GET'])
def get_profile_posts_route(profile_id):
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar outras postagens do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/tagPosts', methods=['GET'])
def get_profile_tag_posts_route(profile_id):
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar outras postagens em que o perfil foi marcado: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens em que o perfil foi marcado devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/notifications', methods=['GET'])
def get_profile_notifications_route(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        offset = int(request.args.get('offset', 0))
        limit = int(request.args.get('limit', 15))

        result = get_profile_notifications(con, profile_id, offset, limit)

        if result is None:
            print('Erro ao recuperar notificações do perfil')
            return jsonify({'error': 'Não foi possível recuperar as notificações do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar notificações do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar as notificações do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/followRequests', methods=['GET'])
def get_profile_follow_requests_route(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        offset = int(request.args.get('offset', 0))
        limit = int(request.args.get('limit', 15))

        result = get_profile_follow_requests(con, profile_id, offset, limit)

        if result is None:
            print('Erro ao recuperar solicitações para seguir o perfil')
            return jsonify({'error': 'Não foi possível recuperar as solicitações para seguir o perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar solicitações para seguir o perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar as solicitações para seguir o perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/sharings', methods=['GET'])
def get_profile_sharings_route(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        offset = int(request.args.get('offset', 0))
        limit = int(request.args.get('limit', 15))

        result = get_profile_sharings(con, profile_id, offset, limit)

        if result is None:
            print('Erro ao recuperar compartilhamentos do perfil')
            return jsonify({'error': 'Não foi possível recuperar os compartilhamentos do perfil devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar compartilhamentos do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar os compartilhamentos do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/posts/liked', methods=['GET'])
def get_profile_liked_posts_route(profile_id):
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar outras postagens curtidas do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens curtidas do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/posts/commented', methods=['GET'])
def get_profile_commented_posts_route(profile_id):
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar outras postagens comentadas do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens comentadas do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/profiles/<int:profile_id>/posts/shared', methods=['GET'])
def get_profile_shared_posts_route(profile_id):
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
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar outras postagens compartilhadas do perfil: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar outras postagens compartilhadas do perfil devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/states', methods=['GET'])
def get_states_route():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        states = get_states(con)

        if states is None:
            print('Erro ao recuperar estados')
            return jsonify({'error': 'Não foi possível recuperar os estados devido a um erro no nosso servidor.'}), 500

        return jsonify(states), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar estados: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar os estados devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)


@app.route('/degrees', methods=['GET'])
def get_degrees_route():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        degrees = get_degrees(con)

        if degrees is None:
            print('Erro ao recuperar graus de formação')
            return jsonify({'error': 'Não foi possível recuperar os graus de formação devido a um erro no nosso servidor.'}), 500

        return jsonify(degrees), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar graus de formação: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar os graus de formação devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/states/<int:state_id>/cities', methods=['GET'])
def get_cities_route(state_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        cities = get_cities(con, state_id)

        if cities is None:
            print('Erro ao recuperar cidades')
            return jsonify({'error': 'Não foi possível recuperar as cidades devido a um erro no nosso servidor.'}), 500

        return jsonify(cities), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar cidades: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar as cidades devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/cities/<int:city_id>/institutions', methods=['GET'])
def get_institutions_route(city_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        institutions = get_institutions(con, city_id)

        if institutions is None:
            print('Erro ao recuperar instituições')
            return jsonify({'error': 'Não foi possível recuperar as instituições devido a um erro no nosso servidor.'}), 500

        return jsonify(institutions), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar instituições: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar as instituições devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/institutions/<int:institution_id>/courses', methods=['GET'])
def get_courses_route(institution_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        courses = get_courses(con, institution_id)

        if courses is None:
            print('Erro ao recuperar cursos')
            return jsonify({'error': 'Não foi possível recuperar os cursos devido a um erro no nosso servidor.'}), 500

        return jsonify(courses), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar cursos: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar os cursos devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

@app.route('/search/places', methods=['GET'])
def get_search_places():
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500
        
        text = request.args.get('text')
        profile_id = request.args.get('profileId')
        offset = int(request.args.get('offset', 10))
        limit = int(request.args.get('limit'))

        result = get_places(con, offset, limit, text, int(profile_id) if isinstance(profile_id, int) else None)

        if result is None:
            print('Erro ao recuperar lugares marcados')
            return jsonify({'error': 'Não foi possível recuperar os lugares marcados devido a um erro no nosso servidor.'}), 500

        return jsonify(result), 200
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao recuperar lugares marcados: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível recuperar lugares marcados devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)


@app.route('/profiles/<int:profile_id>/places', methods=['POST'])
def post_place(profile_id):
    try:
        con = open_connection(*con_params)

        if con is None:
            print('Erro ao abrir conexão com banco de dados')
            return jsonify({'error': 'Não foi possível se conectar a nossa base de dados.'}), 500

        
        place_sports = request.form.getlist('placeSports')
        place_sports_ids = [int(sport) for sport in place_sports]
        photo = request.files.get('photo')
        street = request.form.get('street')
        number = request.form.get('number')
        complement = request.form.get('complement')
        neighborhood = request.form.get('neighborhood')
        postal_code = request.form.get('postalCode')
        state = request.form.get('state')
        city = request.form.get('city')
        description = request.form.get('description')

        if photo is not None:
            photo_path = cloud_upload_media(photo)

            if photo_path is None:
                print("Erro ao fazer upload da foto do lugar marcado")
                return jsonify({'error': 'Não foi possível marcar seu lugar devido a um erro durante o upload da foto selecionada.'}), 500
            
            filename = os.path.basename(photo.filename)
            _, file_extension = os.path.splitext(filename)
            file_extension = file_extension.lower()

            saved_file = {
                'path': photo_path,
                'type': 'image' if photo.mimetype.startswith('image/') else 'video',
                'format': file_extension,
            }

        place_id = insert_place(con, street, number, complement, neighborhood, state, city, postal_code, description, saved_file if photo is not None else None)

        if place_id is None:
            print('Erro ao inserir endereço')
            return jsonify({'error': 'Não foi possível inserir o endreço devido a um erro no nosso servidor.'}), 500

        if not insert_favorite_place(con, place_id, profile_id, place_sports_ids):
            print('Erro ao inserir lugar favorito')
            return jsonify({'error': 'Não foi possível marcar seu lugar devido a um erro no nosso servidor.'}), 500

        return jsonify({'placeId': place_id}), 201
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f'Erro ao inserir postagem: {e} - No arquivo: {exc_tb.tb_frame.f_code.co_filename} - Na linha: {exc_tb.tb_lineno}')
        return jsonify({'error': 'Não foi possível publicar sua postagem devido a um erro no nosso servidor.'}), 500
    finally:
        if con:
            close_connection(con)

if __name__ == '__main__':
    app.run(debug=True, port=5000)