import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Config.module.css";
import PhotoInput from "../form/PhotoInput";
import MainInput from "../form/MainInput";
import Textarea from "../form/Textarea";
import SubmitButton from "../form/SubmitButton";
import Select from "../form/Select";
import { useProfile } from "../../ProfileContext";
import ConfirmationBox from "../layout/ConfirmationBox";
import axios from "axios";
import PostsFullScreen from "../layout/PostsFullScreen";
import About from "./about/About";
import Features from "./about/Features";
import Security from "./about/Security";
import Questions from "./about/Questions";
import Complaints from "./about/Complaints";
import Collaborate from "./about/Collaborate";
import PostsInSection from "../layout/PostsInSection";
import { useNavigate } from "react-router-dom";
import formatDate from "../../utils/DateFormatter";
import ExitPageBar from "../layout/ExitPageBar";

function Config() {
    const [configType, setConfigType] = useState("profile");
    const [profile, setProfile] = useState({});
    const [config, setConfig] = useState({});
    const {profileId, setProfileId} = useProfile();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [handleOnConfirmation, setHandleOnConfirmation] = useState();
    const [posts, setPosts] = useState({});
    const [postsToShowType, setPostsToShowType] = useState("liked");
    const [likedPostsOffset, setLikedPostsOffset] = useState(0);
    const [commentedPostsOffset, setCommentedPostsOffset] = useState(0);
    const [sharedPostsOffset, setSharedPostsOffset] = useState(0);
    const [likedPostsLoading, setLikedPostsLoading] = useState(false);
    const [commentedPostsLoading, setCommentedPostsLoading] = useState(false);
    const [sharedPostsLoading, setSharedPostsLoading] = useState(false);
    const [postsFullScreen, setPostsFullScreen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [likedPostsEnd, setLikedPostsEnd] = useState(0);
    const [commentedPostsEnd, setCommentedPostsEnd] = useState(0);
    const [sharedPostsEnd, setSharedPostsEnd] = useState(0);
    const [aboutItem, setAboutItem] = useState("about");

    const postsLimit = useRef(24);
    const navigate = useNavigate();

    const loadLikedPosts = useCallback(async (id) => {
        if (likedPostsLoading || likedPostsEnd) return;

        setLikedPostsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/posts/liked?offset=${likedPostsOffset}&limit=${postsLimit.current}`);
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                if (data.length < postsLimit.current) {
                    setLikedPostsEnd(true);
                    return;
                }

                const formattedPosts = data.map(post => ({
                    ...post,
                    data_publicacao: formatDate(post.data_publicacao),
                    comments: post.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                }));

                setPosts(prevPosts => ({
                    ...prevPosts, 
                    liked: [...prevPosts.liked, ...formattedPosts],
                })); 

                setLikedPostsOffset(prevOffset => postsFullScreen ? prevOffset + 6 : prevOffset + 24);   
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setLikedPostsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [likedPostsLoading, posts.liked, likedPostsOffset, navigate]);

    const loadCommentedPosts = useCallback(async (id) => {
        if (commentedPostsLoading || commentedPostsEnd) return;

        setCommentedPostsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/posts/commented?offset=${commentedPostsOffset}&limit=${postsLimit.current}`);
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                if (data.length < postsLimit.current) {
                    setCommentedPostsEnd(true);
                    return;
                }

                const formattedPosts = data.map(post => ({
                    ...post,
                    data_publicacao: formatDate(post.data_publicacao),
                    comments: post.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                }));

                setPosts(prevPosts => ({
                    ...prevPosts, 
                    commented: [...prevPosts.commented, ...formattedPosts],
                })); 

                setCommentedPostsOffset(prevOffset => postsFullScreen ? prevOffset + 6 : prevOffset + 24);   
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setCommentedPostsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commentedPostsLoading, posts.commented, commentedPostsOffset, navigate]);

    const loadSharedPosts = useCallback(async (id) => {
        if (sharedPostsLoading || sharedPostsEnd) return;

        setSharedPostsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/posts/shared?offset=${sharedPostsOffset}&limit=${postsLimit.current}`);
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                if (data.length < postsLimit.current) {
                    setSharedPostsEnd(true);
                    return;
                }

                const formattedPosts = data.map(post => ({
                    ...post,
                    data_publicacao: formatDate(post.data_publicacao),
                    comments: post.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                }));

                setPosts(prevPosts => ({
                    ...prevPosts, 
                    shared: [...prevPosts.shared, ...formattedPosts],
                })); 

                setSharedPostsOffset(prevOffset => postsFullScreen ? prevOffset + 6 : prevOffset + 24);   
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setSharedPostsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharedPostsLoading, posts.shared, sharedPostsOffset, navigate]);

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
    }, [navigate]);  
    
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


    function desactiveAccountConfirmation() {
        setConfirmationText('Caso desative seu perfil, ele não poderá mais ser usado ou encontrado no Athlete Connect. Clique em "confirmar" para desativar seu perfil.')
        setHandleOnConfirmation(() => desactiveAccountCallback(profile.is_perfil));
        setShowConfirmation(true);
    }

    function exitAccountConfirmation() {
        setConfirmationText('Caso saia da sua conta, basta realizar login para acessá-la novamente. Clique em "confirmar" para sair da sua conta.')
        setHandleOnConfirmation(exitAccount)
        setShowConfirmation(true);
    }

    function modifyProfileConfirmation() {
        setConfirmationText('Sempre será possível modificar seu perfil, mas lembre-se que os outros usuários não vão saber dessa mudança. Clique em "confirmar" para confirmar as mudanças.');
        setHandleOnConfirmation(() => modifyProfile(profile.id_perfil));
        setShowConfirmation(true);
    }

    function handleOnChangeProfile(e) {
        if (e.target.name === "nome") e.target.value = e.target.value.replace(/\s+/g, "");

        if (e.target.name === "biografia") {    
            e.target.value = e.target.value.trimStart().replace(/\n+/g, "").replace(/\s+/g, " ")
        }

        setProfile(prevProfile => ({...prevProfile, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value}));
    }

    async function handleOnChangeConfig(e) {    
        try {
            await modifyConfig(profile.id_perfil, e.target.name, e.target.type === "checkbox" ? e.target.checked : e.target.value);
            
            setConfig(prevConfig => ({...prevConfig, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value}));
        } catch (error) {
            console.error("Erro ao modificar configuração:", error);
        }
    }

    function handleOnChangeProfilePhoto(e) {
        const files = Array.from(e.target.files);
    
        if (files.length === 0) return; 
    
        const blobUrl = URL.createObjectURL(files[0]); 
    
        if (files.length === 1) {
            setProfile(prevProfile => ({...prevProfile, blobUrl, photo: files}));
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

    const timeoutIdRef = useRef(null);
    
    const handleScroll = useCallback((loadFunction) => {
        if (timeoutIdRef.current) return;

        timeoutIdRef.current = setTimeout(() => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - (postsFullScreen ? 450 : 100)) {
                loadFunction();
            }

            timeoutIdRef.current = null;
        }, 1000);
    }, [postsFullScreen]);

    useEffect(() => {
        if (postsToShowType === "commented") {
            const handleScrollCommentedPosts = () => handleScroll(() => loadCommentedPosts(profile.id_perfil));

            window.addEventListener("scroll", handleScrollCommentedPosts);
            
            return () => window.removeEventListener("scroll", handleScrollCommentedPosts);
        }
    }, [loadCommentedPosts, handleScroll, postsToShowType, profile.id_perfil]);

    useEffect(() => {
        if (postsToShowType === "liked") {   
            const handleScrollLikedPosts = () => handleScroll(() => loadLikedPosts(profile.id_perfil));

            window.addEventListener("scroll", handleScrollLikedPosts);
            
            return () => window.removeEventListener("scroll", handleScrollLikedPosts);
        }
    }, [handleScroll, postsToShowType, loadLikedPosts, profile.id_perfil]);

    useEffect(() => {
        if (postsToShowType === "shared") {   
            const handleScrollSharedPosts = () => handleScroll(() => loadSharedPosts(profile.id_perfil));

            window.addEventListener("scroll", handleScrollSharedPosts);
            
            return () => window.removeEventListener("scroll", handleScrollSharedPosts);
        }
    }, [handleScroll, postsToShowType, loadSharedPosts, profile.id_perfil]);

    function handlePostClick(postId) {
        setSelectedPostId(postId)
        setPostsFullScreen(true);
        postsLimit.current = 6;
    }

    function exitPostsFullscreen() {
        setPostsFullScreen(false);
        setSelectedPostId(null)
        postsLimit.current = 24;
    }

    const updatePosts = (updater, type) => {
        if (type === "liked") {
            setPosts(prevPosts => ({
                ...prevPosts,
                liked: updater(prevPosts.liked),
            }));
        } else if (type === "shared") {
            setPosts(prevPosts => ({
                ...prevPosts,
                shared: updater(prevPosts.shared),
            }));
        } else if (type === "commented") {
            setPosts(prevPosts => ({
                ...prevPosts,
                commented: updater(prevPosts.commented),
            }));
        }
    };

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

            <button onClick={() => navigate("/profilePreferences", {state: {prevPreferences: profile.preferences, modifyProfile: profile}})}>
                Editar preferências
            </button>

            <button >
                Adicionar formação
            </button>

            <button onClick={desactiveAccountConfirmation}>
                Desativar perfil
            </button>

            <button onClick={exitAccountConfirmation}>
                Sair da conta
            </button>
        </form>
    )

    const PermissionConfig = (
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

    const VisibilityConfig = (
        <ul>
            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_curtidas"  
                    labelText="Clique abaixo para que o número de curtidas apareça em suas postagens" 
                    handleChange={handleOnChangeConfig} 
                    value={config.visibilidade_curtidas}
                    checked={config.visibilidade_curtidas}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_compartilhamentos"  
                    labelText="Clique abaixo para que o número de compartilhamentos apareça em suas postagens" 
                    handleChange={handleOnChangeConfig} 
                    value={config.visibilidade_compartilhamentos}
                    checked={config.visibilidade_compartilhamentos}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_comentarios"  
                    labelText="Clique abaixo para que o número de comentários apareça em suas postagens" 
                    handleChange={handleOnChangeConfig} 
                    value={config.visibilidade_comentarios}
                    checked={config.visibilidade_comentarios}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_seguindo"  
                    labelText="Clique abaixo para que outros perfis possam ver quem você segue" 
                    handleChange={handleOnChangeConfig} 
                    value={config.visibilidade_seguindo}
                    checked={config.visibilidade_seguindo}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_seguidores"  
                    labelText="Clique abaixo para que outros perfis possam ver quem te segue" 
                    handleChange={handleOnChangeConfig} 
                    value={config.visibilidade_seguidores}
                    checked={config.visibilidade_seguidores}
                /> 
            </li>
        </ul>
    )

    const NotificationConfig = (
        <ul>
            <li>
                <MainInput 
                    type="checkbox" 
                    name="notificacoes"  
                    labelText="Clique abaixo para que você receba notificações do Athlete Connect" 
                    handleChange={handleOnChangeConfig} 
                    value={config.notificacoes}
                    checked={config.notificacoes}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="notificacoes_email"  
                    labelText="Clique abaixo para que você receba notificações no E-mail do Athlete Connect" 
                    handleChange={handleOnChangeConfig} 
                    value={config.notificacoes_email}
                    checked={config.notificacoes_email}
                /> 
            </li>
        </ul>
    )

    const History = (
        <ul>
            <li>
                <button onClick={() => setPostsToShowType("liked")}>
                    Postagens curtidas
                </button>

                <button onClick={() => setPostsToShowType("shared")}>
                    Postagens compartilhadas
                </button>

                <button onClick={() => setPostsToShowType("commented")}>
                    Postagens comentadas
                </button>

                <section>
                    <PostsInSection 
                        posts={posts[postsToShowType]} 
                        notFoundText={`Você ainda não ${postsToShowType === "liked" ? "curtiu" : postsToShowType === "commented" ? "comentou" : "compartilhou"} nenhuma postagem.`}
                        handlePostClick={(postId) => handlePostClick(postId)}
                        postsLoading={postsToShowType === "liked" ? likedPostsLoading : postsToShowType === "commented" ? commentedPostsLoading : sharedPostsLoading}
                    />
                </section>
            </li>
        </ul>
    )

    const aboutComponents = {
        about: <About/>,
        features: <Features/>,
        security: <Security/>,
        questions: <Questions/>,
        complaints: <Complaints/>,
        collaborate: <Collaborate/>,
    };
    
    const AboutInfo = (
        <ul>
            <li>
                <button onClick={() => setAboutItem("about")}>
                    O que é o Athlete Connect?
                </button>

                <button onClick={() => setAboutItem("features")}>
                    Quais recursos eu posso usar?
                </button>

                <button onClick={() => setAboutItem("security")}>
                    Minha segurança é garantida?
                </button>

                <button onClick={() => setAboutItem("questions")}>
                    Como posso tirar dúvidas?
                </button>

                <button onClick={() => setAboutItem("complaints")}>
                    Como faço para enviar uma reclamação?
                </button>

                <button onClick={() => setAboutItem("collaborate")}>
                    Como posso colaborar?
                </button>

                {aboutComponents[aboutItem]}
            </li>
        </ul>
    )

    const configs = {
        profile: {title: "Perfil e Conta", component: <ProfileConfig/>},
        permission: {title: "Permissões", component: <PermissionConfig/>},
        notification: {title: "Notificações", component: <NotificationConfig/>},
        visibility: {title: "Visibilidade", component: <VisibilityConfig/>},
        history: {title: "Histórico", component: <History/>},
        about: {title: "Athlete Connect", component: <AboutInfo/>},
    }

    return (
        !postsFullScreen ?
            <main className={styles.config_page}>
                <ExitPageBar handleExitPage={() => navigate(-1)}/>

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
                    <li onClick={() => setConfigType("profile")}>Perfil</li>
                    <li onClick={() => setConfigType("permission")}>Permissões</li>
                    <li onClick={() => setConfigType("visibility")}>Visibilidade</li>
                    <li onClick={() => setConfigType("notification")}>Notificações</li>
                    <li onClick={() => setConfigType("history")}>Histórico</li>
                    <li onClick={() => setConfigType("about")}>Athlete Connect</li>
                </ul>

                <section className={styles.configs}>
                    <h2>{configs[configType].title}</h2>

                    <hr/>

                    {configs[configType].component}
                </section>
            </main>
        :
            <PostsFullScreen
                posts={posts[postsToShowType]} 
                setPosts={(updater) => updatePosts(updater, postsToShowType)} 
                postsLoading={postsToShowType === "liked" ? likedPostsLoading : postsToShowType === "commented" ? commentedPostsLoading : sharedPostsLoading}
                initialPostToShow={selectedPostId}
                handleExitPostsFullscreen={exitPostsFullscreen}   
            />
    );
}

export default Config;