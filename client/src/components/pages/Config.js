import { useEffect, useState } from "react";
import styles from "./Config.module.css";
import PhotoInput from "../form/PhotoInput";
import MainInput from "../form/MainInput";
import Textarea from "../form/Textarea";
import SubmitButton from "../form/SubmitButton";
import Select from "../form/Select";
import { useProfile } from "../../ProfileContext";
import ConfirmationBox from "../layout/ConfirmationBox";
import axios from "axios";

function Config() {
    const [configType, setConfigType] = useState("perfil");
    const [profile, setProfile] = useState({});
    const [config, setConfig] = useState({});
    const {profileId, setProfileId} = useProfile();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [handleOnConfirmation, setHandleOnConfirmation] = useState();

    const fetchProfile = useCallback(async (id) => {
        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}`);
            const data = resp.data;
            
            if (data.error) {
                if (resp.status === 404 || resp.status === 204) {
                    navigate("/login", {state: {message: data.error, type: "error"}});
                } else {
                    navigate("/errorPage", {state: {error: data.error}})
                }
            } else {
                const {config, ...others} = data;

                setProfile(others);
                setConfig(config);
                }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [navigate]);  
    
    const desactiveAccountCallback = useCallback(async (id) => {
        try {
            const resp = await axios.put(`http://localhost:5000/profiles/${id}/active/${false}`);
            const data = resp.data;
            
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                navigate("/login", {state: {message: "Conta desativada. Crie ou entre em outra conta para continuar no Athlete Connect.", type: "success"}})
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [loadPosts, navigate]);  
    
    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        if (!confirmedProfileId) {
            navigate("/login");
        } else {
            fetchProfile(confirmedProfileId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validateName = useCallback(() => {
        return (profile.nome && 
            /^[a-zA-Z0-9_@+&.]{4,30}$/.test(profile.nome)) ||
            !profile.nome;
    }, [profile]); 
    
    const validateBio = useCallback(() => {
        return (profile.biografia && profile.biografia.length <= 150) || 
            !profile.biografia;
    }, [profile]); 

    function exitAccount() {
        localStorage.removeItem("athleteConnectProfileId");
        setProfileId(null);

        navigate("/login", {state: {message: "Crie ou entre em uma conta para continuar no Athlete Connect.", type: "success"}})
    }

    function desactiveAccount() {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        desactiveAccountCallback(confirmedProfileId);
    }

    function desactiveAccountConfirmation() {
        setConfirmationText('Caso desative seu perfil, ele não poderá mais ser usado ou encontrado no Athlete Connect. Clique em "confirmar" para desativar seu perfil.')
        setHandleOnConfirmation(desactiveAccount)
        setShowConfirmation(true);
    }

    function exitAccountConfirmation() {
        setConfirmationText('Caso saia da sua conta, basta realizar login para acessá-la novamente. Clique em "confirmar" para sair da sua conta.')
        setHandleOnConfirmation(exitAccount)
        setShowConfirmation(true);
    }

    function modifyProfileConfirmation() {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        setConfirmationText('Sempre será possível modificar seu perfil, mas lembre-se que os outros usuários não vão saber dessa mudança. Clique em "confirmar" para confirmar as mudanças.');
        setHandleOnConfirmation(() => modifyProfile(confirmedProfileId));
        setShowConfirmation(true);
    }

    function handleOnChangeProfile(e) {
        if (e.target.name === "nome") e.target.value = e.target.value.replace(/\s+/g, "");

        if (e.target.name === "biografia") {    
            e.target.value = e.target.value.trimStart().replace(/\n+/g, "").replace(/\s+/g, " ")
        }

        setProfile({...profile, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value});
    }

    async function handleOnChangeConfig(e) {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
    
        try {
            await modifyConfig(confirmedProfileId, e.target.name, e.target.type === "checkbox" ? e.target.checked : e.target.value);
            
            setConfig({...config, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value});
        } catch (error) {
            console.error("Erro ao modificar configuração:", error);
        }
    }

    function handleOnChangeProfilePhoto(e) {
        const files = Array.from(e.target.files);
    
        if (files.length === 0) return; 
    
        const blobUrl = URL.createObjectURL(files[0]); 
    
        if (files.length === 1) {
            setProfile({...profile, blobUrl, photo: files});
        }
    }

    const modifyProfile = async (id) => {
        try {
            const formData = new FormData();

            formData.append("name", profile.nome);
            formData.append("bio", profile.biografia);
            formData.append("private", profile.privado);

            if (profile.photo && profile.photo.length > 0) formData.append("photo", profile.photo[0]);

            const resp = await axios.put(`http://localhost:5000/profiles/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            }
        } catch (err) {                    
            navigate("/errorPage", {state: {error: err.message}})

            console.error('Erro ao fazer a requisição:', err);
        }
    }

    const modifyConfig = async (id, fieldName, value) => {
        try {
            const formData = new FormData();

            formData.append(fieldName, value);

            const resp = await axios.put(`http://localhost:5000/profiles/${id}/config/${fieldName}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            }
        } catch (err) {                    
            navigate("/errorPage", {state: {error: err.message}})

            console.error('Erro ao fazer a requisição:', err);
        }
    }

    // O atributo name dos inputs possuem o valor = nome do campo no banco de dados para melhor manipulação dos dados durante a mudança de estados
    
    const ProfileConfig = (
        <form onSubmit={modifyProfileConfirmation}>
            <PhotoInput 
                name="profilePhoto" 
                photoPath={profile?.blobUrl || profile?.media?.caminho} 
                handleChange={handleOnChangeProfilePhoto} 
                size="big"
            />

            <MainInput
                type="text"
                name="nome"
                placeholder="Insira o nome de usuário" 
                labelText="Nome de Usuário*"
                maxLength={30} 
                alertMessage='O nome de usuário deve ter entre 4 e 30 caracteres, sem espaços e símbolos diferentes de: "_", "@", "+","&" e ".".' 
                handleChange={handleOnChangeProfile} 
                showAlert={!validateName()}
                value={profile.nome}
            />

            <Textarea 
                name="biografia" 
                placeholder="Insira sua biografia" 
                maxLength={150}
                labelText="Biografia" 
                alertMessage="A biografia não pode ter mais que 150 caracteres." 
                handleChange={handleOnChangeProfile} 
                showAlert={!validateBio()}
                value={profile.biografia}
            />     

            <MainInput 
                type="checkbox" 
                name="privado"  
                labelText="Clique abaixo para tornar seu perfil privado, com isso, somente seus seguidores terão acesso às suas publicações e flashes" 
                handleChange={handleOnChangeProfile} 
                value={profile.privado}
                checked={profile.privado}
            />                  

            <SubmitButton text="Confirmar alterações"/>

            <button onClick={desactiveAccountConfirmation}>
                Desativar perfil
            </button>

            <button onClick={exitAccountConfirmation}>
                Sair da conta
            </button>
        </form>
    )

    const permissionConfig = (
        <ul>
            <h3>Permissões do Aplicativo</h3>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="permissao_camera"  
                    labelText="Clique abaixo para permitir que o Athlete Connect acesse a câmera do seu dispositivo" 
                    handleChange={handleOnChangeConfig} 
                    value={config.permissao_camera}
                    checked={config.permissao_camera}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="permissao_microfone"  
                    labelText="Clique abaixo para permitir que o Athlete Connect acesse o microfone do seu dispositivo" 
                    handleChange={handleOnChangeConfig} 
                    value={config.permissao_microfone}
                    checked={config.permissao_microfone}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="permissao_fotos_videos"  
                    labelText="Clique abaixo para permitir que o Athlete Connect acesse o armazenamento do seu dispositivo" 
                    handleChange={handleOnChangeConfig} 
                    value={config.permissao_fotos_videos}
                    checked={config.permissao_fotos_videos}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="permissao_localizacao"  
                    labelText="Clique abaixo para permitir que o Athlete Connect acesse a sua localização" 
                    handleChange={handleOnChangeConfig} 
                    value={config.permissao_localizacao}
                    checked={config.permissao_localizacao}
                /> 
            </li>

            <h3>Permissões do perfil</h3>

            <li>
                <Select 
                    name="permissao_marcacao" 
                    labelText="Marcações"
                    handleChange={handleOnChangeConfig}
                    values={["Todos", "Seguidores", "Seguidos", "Ninguém"]}
                    selectedValue={config.permissao_marcacao}
                    description="Indica quem pode te marcar em publicações."
                />
            </li>

            <li>
                <Select 
                    name="permissao_compartilhamento" 
                    labelText="Compartilhamentos"
                    handleChange={handleOnChangeConfig}
                    values={["Todos", "Seguidores", "Seguidos", "Ninguém"]}
                    selectedValue={config.permissao_compartilhamento}
                    description="Indica quem pode compartilhar algo para você."
                />
            </li>

            <li>
                <Select 
                    name="permissao_comentario" 
                    labelText="Comentários"
                    handleChange={handleOnChangeConfig}
                    values={["Todos", "Seguidores", "Seguidos", "Ninguém"]}
                    selectedValue={config.permissao_comentario}
                    description="Indica quem pode comentar em suas publicações."
                />
            </li>
        </ul>
    )

    const visibilityConfig = (
        <ul>
            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_curtidas"  
                    labelText="Clique abaixo para que o número de curtidas apareça em suas postagens" 
                    handleChange={handleOnChangeConfig} 
                    value={}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_compartilhamentos"  
                    labelText="Clique abaixo para que o número de compartilhamentos apareça em suas postagens" 
                    handleChange={handleOnChangeConfig} 
                    value={}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_comentarios"  
                    labelText="Clique abaixo para que o número de comentários apareça em suas postagens" 
                    handleChange={handleOnChangeConfig} 
                    value={}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_seguindo"  
                    labelText="Clique abaixo para que outros perfis possam ver quem você segue" 
                    handleChange={handleOnChangeConfig} 
                    value={}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_seguidores"  
                    labelText="Clique abaixo para que outros perfis possam ver quem te segue" 
                    handleChange={handleOnChangeConfig} 
                    value={}
                /> 
            </li>
        </ul>
    )

    const notificationConfig = (
        <ul>
            <li>
                <MainInput 
                    type="checkbox" 
                    name="notifications"  
                    labelText="Clique abaixo para que você receba notificações do Athlete Connect" 
                    handleChange={} 
                    value={}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="notificationsEmail"  
                    labelText="Clique abaixo para que você receba notificações no E-mail do Athlete Connect" 
                    handleChange={} 
                    value={}
                /> 
            </li>
        </ul>
    )

    const historyConfig = (
        <ul>
            <li>
                <button onClick={}>
                    Postagens curtidas
                </button>

                <button onClick={}>
                    Postagens compartilhadas
                </button>

                <button onClick={}>
                    Postagens comentadas
                </button>

                <button onClick={}>
                    Postagens denunciadas
                </button>

                <button onClick={}>
                    Perfis denunciados
                </button>

                <button onClick={}>
                    Perfis bloqueados
                </button>
            </li>
        </ul>
    )

    const about = (
        <ul>
            <li>
                <button onClick={}>
                    O que é o Athlete Connect?
                </button>

                <button onClick={}>
                    O que posso fazer aqui?
                </button>

                <button onClick={}>
                    Estou seguro?
                </button>

                <button onClick={}>
                    Como posso tirar dúvidas?
                </button>

                <button onClick={}>
                    Como faço para mandar uma reclamação?
                </button>

                <button onClick={}>
                    Como posso colaborar?
                </button>
            </li>
        </ul>
    )

    return (
        <main className={styles.config_page}>
            {showConfirmation && 
                <ConfirmationBox 
                    text={confirmationText} 
                    handleConfirmation={handleOnConfirmation} 
                    setShowConfirmation={setShowConfirmation}
                />
            }

            <h1>Configuração</h1>

            <hr/>

            <ul className={styles.config_types}>
                <li onClick={() => setConfigType("perfil")}>Perfil</li>
                <li onClick={() => setConfigType("permissoes")}>Permissões</li>
                <li onClick={() => setConfigType("visibilidade")}>Visibilidade</li>
                <li onClick={() => setConfigType("notificacoes")}>Notificações</li>
                <li onClick={() => setConfigType("historico")}>Histórico</li>
                <li onClick={() => setConfigType("sobre")}>Sobre</li>
            </ul>

            <section className={styles.configs}>
                <h2>{configType}</h2>

                <hr/>

                <ProfileConfig/>
            </section>
        </main>
    );
}

export default Config;