import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Config.module.css";
import { useProfile } from "../../ProfileContext";
import ConfirmationBox from "../layout/ConfirmationBox";
import axios from "axios";
import PostsFullScreen from "../layout/PostsFullScreen";
import { useNavigate } from "react-router-dom";
import formatDate from "../../utils/DateFormatter";
import ExitPageBar from "../layout/ExitPageBar";
import ProfileConfig from "./config/ProfileConfig";
import PermissionConfig from "./config/PermissionConfig";
import NotificationConfig from "./config/NotificationConfig";
import VisibilityConfig from "./config/VisibilityConfig";
import AboutInfo from "./config/AboutInfo";
import History from "./config/History";
import Message from "../layout/Message";
import loading from "../../img/animations/loading.svg";
import { EXPIRATION_TIME } from "../../App";

function Config() {
    const [configType, setConfigType] = useState("profile");
    const [profile, setProfile] = useState({});
    const [initialProfile, setInitialProfile] = useState();
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
    const [profileSubmitError, setProfileSubmiterror] = useState(false);
    const [message, setMessage] = useState({});

    const postsLimit = useRef(12);
    const navigate = useNavigate();

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

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
                    liked: [...(prevPosts.liked || []), ...formattedPosts],
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
                    commented: [...(prevPosts.commented || []), ...formattedPosts],
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
                    shared: [...(prevPosts.shared || []), ...formattedPosts],
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
        const storageData = localStorage.getItem("profile");
        
        if (storageData) {
            try {
                const parsedData = JSON.parse(storageData);
                
                if (Date.now() - parsedData.updateDate < EXPIRATION_TIME) {
                    const {config, ...others} = parsedData.profile;

                    setProfile(others);
                    setConfig(config);
                }
            } catch (err) {
                console.error("Erro ao recuperar o perfil do cache:", err);

                localStorage.removeItem("profile");
            }
        }
        
        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}?viewerId=${id}`);
            const data = resp.data;

            if (resp.status === 204) {
                navigate("/login", {state: {message: "Seu perfil foi desativado. Faça login e o ative para voltar a usá-lo.", type: "error"}});
                return;
            }
            
            if (data.error) {
                if (resp.status === 404) {
                    navigate("/login", {state: {message: data.error, type: "error"}});
                } else {
                    navigate("/errorPage", {state: {error: data.error}})
                }
            } else {
                const {config, ...others} = data;

                setInitialProfile(others);
                setProfile(others);
                localStorage.setItem('profile', JSON.stringify({profile: data, updateDate: Date.now()}));
                setConfig(config);

                loadLikedPosts(others.id_perfil);
                loadCommentedPosts(others.id_perfil);
                loadSharedPosts(others.id_perfil);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);  
    
    const desactiveProfileCallback = useCallback(async (id) => {
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

    function exitAccount() {
        localStorage.removeItem("athleteConnectProfileId");
        setProfileId(null);

        navigate("/login", {state: {message: "Crie ou entre em uma conta para continuar no Athlete Connect.", type: "success"}})
    }


    function desactiveProfileConfirmation() {
        setConfirmationText('Caso desative seu perfil, ele não poderá mais ser usado ou encontrado no Athlete Connect. Clique em "confirmar" para desativar seu perfil.')
        setHandleOnConfirmation(() => () => desactiveProfileCallback(profile?.id_perfil));
        setShowConfirmation(true);
    }

    function exitAccountConfirmation() {
        setConfirmationText('Caso saia da sua conta, basta realizar login para acessá-la novamente. Clique em "confirmar" para sair da sua conta.')
        setHandleOnConfirmation(() => exitAccount)
        setShowConfirmation(true);
    }

    function modifyProfileConfirmation(e) {
        e.preventDefault();
        
        if (profileSubmitError) return;

        setConfirmationText('Sempre será possível modificar seu perfil, mas lembre-se que os outros usuários não vão saber dessa mudança. Clique em "confirmar" para confirmar as mudanças.');
        setHandleOnConfirmation(() => () => modifyProfile(profile?.id_perfil));
        setShowConfirmation(true);
    }

    async function handleOnChangeConfig(e) {    
        try {
            const newValue = e.target.type === "checkbox" ? e.target.checked : e.target.value;

            await modifyConfig(profile?.id_perfil, e.target.name, newValue);
            
            setConfig(prevConfig => ({...prevConfig, [e.target.name]: newValue}));
        } catch (error) {
            console.error("Erro ao modificar configuração:", error);
        }
    }

    const modifyProfile = async (id) => {
        try {
            const formData = new FormData();

            formData.append("name", profile?.nome);
            formData.append("bio", profile?.biografia);
            formData.append("private", profile?.privado);

            if (profile?.photo && profile?.photo.length > 0) formData.append("photo", profile?.photo[0]);

            const resp = await axios.put(`http://localhost:5000/profiles/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setInitialProfile(profile);
                setMessageWithReset("Modificações concluídas .", "success");
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
        if (configType === "history" && postsToShowType === "commented") {
            const handleScrollCommentedPosts = () => handleScroll(() => loadCommentedPosts(profile?.id_perfil));

            window.addEventListener("scroll", handleScrollCommentedPosts);
            
            return () => window.removeEventListener("scroll", handleScrollCommentedPosts);
        }
    }, [loadCommentedPosts, configType, handleScroll, postsToShowType, profile?.id_perfil]);

    useEffect(() => {
        if (configType === "history" && postsToShowType === "liked") {   
            const handleScrollLikedPosts = () => handleScroll(() => loadLikedPosts(profile?.id_perfil));

            window.addEventListener("scroll", handleScrollLikedPosts);
            
            return () => window.removeEventListener("scroll", handleScrollLikedPosts);
        }
    }, [handleScroll, postsToShowType, configType, loadLikedPosts, profile?.id_perfil]);

    useEffect(() => {
        if (configType === "history" && postsToShowType === "shared") {   
            const handleScrollSharedPosts = () => handleScroll(() => loadSharedPosts(profile?.id_perfil));

            window.addEventListener("scroll", handleScrollSharedPosts);
            
            return () => window.removeEventListener("scroll", handleScrollSharedPosts);
        }
    }, [handleScroll, postsToShowType, configType, loadSharedPosts, profile?.id_perfil]);

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

    useEffect(() => {
        setProfile(initialProfile);
    }, [configType, initialProfile]);

    const configs = {
        profile: {
            title: "Perfil e Conta", 
            component: <ProfileConfig 
                initialProfile={initialProfile}
                profile={profile} 
                setProfile={setProfile}
                handleModifyProfile={modifyProfileConfirmation}
                setSubmitError={setProfileSubmiterror}
                handleDesactiveProfile={desactiveProfileConfirmation}
                handleExitAccount={exitAccountConfirmation}
            />
        },
        permission: {
            title: "Permissões", 
            component: <PermissionConfig
                config={config}
                handleChange={handleOnChangeConfig}
            />
        },
        notification: {
            title: "Notificações", 
            component: <NotificationConfig
                config={config}
                handleChange={handleOnChangeConfig}
            />
        },
        visibility: {
            title: "Visibilidade", 
            component: <VisibilityConfig
                config={config}
                handleChange={handleOnChangeConfig}
            />
        },
        history: {
            title: "Histórico", 
            component: <History
                posts={posts}
                postsToShowType={postsToShowType}
                setPostsToShowType={setPostsToShowType}
                likedPostsLoading={likedPostsLoading}
                commentedPostsLoading={commentedPostsLoading}
                sharedPostsLoading={sharedPostsLoading}
                handlePostClick={handlePostClick}
            />
        },
        about: {
            title: "Athlete Connect", 
            component: <AboutInfo
            />
        },
    }

    return (
        !postsFullScreen ?
            <main className={styles.config_page}>
                {message && <Message type={message.type} message={message.message}/>}

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

                <div className={styles.config}>
                    <ul className={styles.config_types}>
                        <li 
                            onClick={() => setConfigType("profile")} 
                            className={configType === "profile" ? styles.selected_config : undefined}
                        >
                            Perfil e Conta
                        </li>

                        <li 
                            onClick={() => setConfigType("permission")} 
                            className={configType === "permission" ? styles.selected_config : undefined}
                        >
                            Permissões
                        </li>

                        <li 
                            onClick={() => setConfigType("visibility")} 
                            className={configType === "visibility" ? styles.selected_config : undefined}
                        >
                            Visibilidade
                        </li>

                        <li 
                            onClick={() => setConfigType("notification")} 
                            className={configType === "notification" ? styles.selected_config : undefined}
                        >
                            Notificações
                        </li>

                        <li 
                            onClick={() => setConfigType("history")} 
                            className={configType === "history" ? styles.selected_config : undefined}
                        >
                            Histórico
                        </li>

                        <li 
                            onClick={() => setConfigType("about")} 
                            className={configType === "about" ? styles.selected_config : undefined}
                        >
                            Athlete Connect
                        </li>
                    </ul>

                    <hr/>

                    <section className={styles.configs}>
                        <h2>{configs[configType].title}</h2>

                        <hr/>

                        {initialProfile ? 
                            configs[configType].component
                        : 
                            <img className="loading" src={loading} alt="Loading"/>
                        }
                    </section>
                </div>
            </main>
        :
            <PostsFullScreen
                posts={posts[postsToShowType]} 
                setPosts={(updater) => updatePosts(updater, postsToShowType)} 
                postsLoading={postsToShowType === "liked" ? likedPostsLoading : postsToShowType === "commented" ? commentedPostsLoading : sharedPostsLoading}
                initialPostToShow={selectedPostId}
                handleExitFullscreen={exitPostsFullscreen}   
            />
    );
}

export default Config;