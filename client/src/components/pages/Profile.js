import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Profile.module.css";
import ProfilePhotoContainer from "../layout/ProfilePhotoContainer";
import complaintIcon from "../../img/icons/socialMedia/complaintIcon.png";
import complaintedIcon from "../../img/icons/socialMedia/complaintedIcon.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useProfile } from "../../ProfileContext";
import formatNumber from "../../utils/NumberFormatter";
import axios from "axios";
import SubmitButton from "../form/SubmitButton";
import MainInput from "../form/MainInput";
import PostItemsContainer from "../layout/PostItemsContainer";
import Message from "../layout/Message";
import AppNavBar from "../layout/AppNavBar";
import ProfileNavBar from "../layout/ProfileNavBar";
import PostsInSection from "../layout/PostsInSection";
import formatDate from "../../utils/DateFormatter";
import PostsFullScreen from "../layout/PostsFullScreen";
import fetchComplaintReasons from "../../utils/post/FetchComplaintReasons";
import SearchResultsContainer from "../layout/SearchResultsContainer";
import { EXPIRATION_TIME } from "../../App";

function Profile() {
    const [followersNumber, setFollowersNumber] = useState(0);
    const [profile, setProfile] = useState({});
    const [viewer, setViewer] = useState({});
    const {profileId} = useProfile();
    const [complaintReasons, setComplaintReasons] = useState([]);
    const [showComplaintReasons, setShowComplaintReasons] = useState(false);  
    const [selectedComplaintReasons, setSelectedComplaintReasons] = useState([]);
    const [profileComplaintReasons, setProfileComplaintReasons] = useState([]);
    const [complaintDescription, setComplaintDescription] = useState("");
    const [message, setMessage] = useState({});
    const [postsToShowType, setPostsToShowType] = useState("posts");
    const [postsOffset, setPostsOffset] = useState(24);
    const [tagPostsOffset, setTagPostsOffset] = useState(24);
    const [tagPostsLoading, setTagPostsLoading] = useState(false);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsFullScreen, setPostsFullScreen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [postsEnd, setPostsEnd] = useState(true);
    const [tagPostsEnd, setTagPostsEnd] = useState(true);
    const [tagsType, setTagsType] = useState("followers");
    const [followersOffset, setFollowersOffset] = useState(0);
    const [followedsOffset, setFollowedsOffset] = useState(0);
    const [followersLoading, setFollowersLoading] = useState(false);
    const [followedsLoading, setFollowedsLoading] = useState(false);
    const [tagsFullScreen, setTagsFullScreen] = useState(false);
    const [tags, setTags] = useState({followers: [], followeds: []});
    const [followersEnd, setFollowersEnd] = useState();
    const [followedsEnd, setFollowedsEnd] = useState();
    const [initialLoading, setInitialLoading] = useState(false);

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const postsLimit = useRef(24);

    useEffect(() => {
        const msg = location?.state
        
        if (msg) setMessageWithReset(msg.message, msg.type)
    }, [location])

    const loadFollowers = useCallback(async (id) => {
        if (followersLoading || followersEnd) return;

        setFollowersLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/followers?offset=${followersOffset}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar os seguidores do perfil.", "error");

                throw new Error("Erro ao recuperar seguidores");
            } else {
                if (data.length < 10) {
                    setFollowersEnd(true);
                }

                setTags(prevTags => ({...prevTags, followers: [...(initialLoading ? prevTags.followers || [] : []), ...data]}));
                setFollowersOffset(prevOffset => prevOffset + 10);   
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar os seguidores do perfil.", "error");

            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setFollowersLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [followersLoading, tags.followers, followersOffset, navigate]);

    const loadFolloweds = useCallback(async (id) => {
        if (followedsLoading || followedsEnd) return;

        setFollowedsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/followeds?offset=${followedsOffset}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar os seguidos do perfil.", "error");

                throw new Error("Erro ao recuperar seguidos");
            } else {
                if (data.length < 10) {
                    setFollowedsEnd(true);
                }

                setTags(prevTags => ({...prevTags, followeds: [...(initialLoading ? prevTags.followeds || [] : []), ...data]}));
                setFollowedsOffset(prevOffset => prevOffset + 10);   
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar os seguidos do perfil.", "error");

            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setFollowedsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [followedsLoading, tags.followeds, followedsOffset, navigate]);

    const loadPosts = useCallback(async (id) => {
        if (postsLoading || postsEnd) return;

        setPostsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/posts?offset=${postsOffset}&limit=${postsLimit.current}&viewerId=${viewer.id_perfil}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar as postagens do perfil.", "error");

                throw new Error("Erro ao recuperar postagens do perfil");
            } else {
                if (data.length < postsLimit.current) {
                    setPostsEnd(true);
                }

                const formattedPosts = data.map(post => ({
                    ...post,
                    data_publicacao: formatDate(post.data_publicacao),
                    comments: post.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                }));

                setProfile(prevProfile => ({
                    ...prevProfile, 
                    posts: [...prevProfile.posts, ...formattedPosts],
                })); 

                setPostsOffset(prevOffset => postsFullScreen ? prevOffset + 6 : prevOffset + 24);   
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar as postagens do perfil.", "error");
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setPostsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postsLoading, profile.posts, postsOffset, navigate]);

    const loadTagPosts = useCallback(async (id) => {
        if (tagPostsLoading || tagPostsEnd) return;

        setTagPostsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/tagPosts?offset=${tagPostsOffset}&limit=${postsLimit.current}&viewerId=${viewer.id_perfil}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar as marcações do perfil.", "error");

                throw new Error("Erro ao recuperar marcações do perfil");
            } else {
                if (data.length < postsLimit.current) {
                    setTagPostsEnd(true);
                }

                const formattedPosts = data.map(post => ({
                    ...post,
                    data_publicacao: formatDate(post.data_publicacao),
                    comments: post.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                }));

                setProfile(prevProfile => ({
                    ...prevProfile,
                    tagPosts: [...prevProfile.tagPosts, ...formattedPosts]     
                })); 

                setTagPostsOffset(prevOffset => postsFullScreen ? prevOffset + 6 : prevOffset + 24);   
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar as marcações do perfil.", "error");
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setTagPostsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tagPostsLoading, profile.tagPosts, tagPostsOffset, navigate]);

    const fetchUser = useCallback(async (viewerId) => {
        try {
            const url = id
            ? `http://localhost:5000/profiles/users/${id}?viewerId=${viewerId}`
            : `http://localhost:5000/profiles/users/${viewerId}`;
            
            const resp = await axios.get(url)
            const data = resp.data;

            if (resp.status === 204) {
                navigate(id ? -1 : "/login", !id && {state: {message: "O perfil foi desativado", type: "error"}})
                            
                throw new Error("Perfil desativado");
            }

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});

                throw new Error("Erro ao recuperar perfil do usuário");                
            } else {
                const formatPosts = (posts) => {
                    return posts.map(post => ({
                        ...post, 
                        data_publicacao: formatDate(post.data_publicacao),
                        comments: post.comments.map(comment => ({
                            ...comment,
                            data_comentario: formatDate(comment.data_comentario)
                        }))}
                    ));
                }

                const posts = formatPosts(data.posts);
                const tagPosts = formatPosts(data.tagPosts);

                setProfile({
                    ...data, 
                    preferences: data.preferences.map(sport => (
                        {...sport, icone: require(`../../img/${sport.icone}`)}
                    )),
                    posts: posts,
                    tagPosts: tagPosts     
                });    

                setFollowersNumber(data.followers.length);
                setPostsToShowType("posts");

                setPostsEnd(posts.length < postsLimit.current);
                setTagPostsEnd(tagPosts.length < postsLimit.current);

                await loadFollowers(data.id_perfil);
                await loadFolloweds(data.id_perfil);

                setInitialLoading(true);

                fetchComplaintReasons(setComplaintReasons, navigate, setMessageWithReset);
            }    
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})
    
            console.error('Erro ao fazer a requisição:', err);

            throw err;
        }    
    }, [id, loadFolloweds, loadFollowers, navigate])    
    
    const fetchProfile = useCallback(async (id) => {
        const storageData = localStorage.getItem("athleteConnectProfile");
        
        if (storageData) {
            try {
                const parsedData = JSON.parse(storageData);
                
                if (Date.now() - parsedData.updateDate < EXPIRATION_TIME) {
                    setViewer(parsedData.profile);

                    return;
                }
            } catch (err) {
                console.error("Erro ao recuperar o perfil do cache:", err);

                localStorage.removeItem("athleteConnectProfile");
            }
        }
        
        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}?viewerId=${id}`);
            const data = resp.data;
            
            if (resp.status === 204) {
                navigate("/login", {state: {message: "Seu perfil foi desativado. Faça login e o ative para voltar a usá-lo.", type: "error"}});
                
                throw new Error("Perfil desativado");
            }

            if (data.error) {
                if (resp.status === 404) {
                    navigate("/login", {state: {message: data.error, type: "error"}});
                } else {
                    navigate("/errorPage", {state: {error: data.error}})
                }

                throw new Error("Erro ao buscar perfil")
            } else {
                setViewer(data);  
                localStorage.setItem('athleteConnectProfile', JSON.stringify({profile: data, updateDate: Date.now()}));      
            }
        } catch (err) {    
            console.error('Erro ao fazer a requisição:', err);
            
            if (err.response.status === 404) {
                navigate("/login", {state: {message: "Não foi possível encontrar nenhum perfil com o id fornecido. Tente fazer o login.", type: "error"}});
                
                throw err
            }
        }
    }, [navigate]);   
    
    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
    
        if (!confirmedProfileId) {
            console.error("Erro ao indentificar perfil");

            navigate("/login", {state: {message: "Não conseguimos identificar seu perfil. Tente fazer o login.", type: "error"}});
            
            return;
        }
    
        const fetchData = async () => {
            try {
                await fetchProfile(confirmedProfileId);

                if (id === confirmedProfileId) {
                    navigate("/myProfile");
                    return;
                }

                await fetchUser(confirmedProfileId);
            } catch (err) {
                console.error("Erro ao recuperar perfis:", err);

                throw err;
            }
        };
    
        fetchData();
    
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);
    
    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    function sendFollowRequest() {
        const trySendFollowRequest = async () => {
            try {
                await followRequest(viewer.id_perfil);
    
                setMessageWithReset(`Solicitação para ${profile.nome} enviada.`, "success");
            } catch (err) {
                console.Error(err)
            }
        };

        trySendFollowRequest();
    }

    const toggleFollow = async (followerId) => {
        try {
            const formData = new FormData();
            
            formData.append("followerId", followerId);
            
            const resp = await axios.post(`http://localhost:5000/profiles/${id}/follow`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;
        
            if (data.error) {
                setMessageWithReset(`Não foi possível ${profile.isFollowed ? "deixar de seguir" : "seguir"} ${profile.nome}.`, "error");

                throw new Error("Erro ao seguir ou deixar de seguir perfil");
            } else {
                setFollowersNumber(profile.isFollowed ? followersNumber - 1 : followersNumber + 1);
        
                setProfile(prevProfile => ({...prevProfile, isFollowed: !prevProfile.isFollowed}));
            }
        } catch (err) {
            setMessageWithReset(`Não foi possível ${profile.isFollowed ? "deixar de seguir" : "seguir"} ${profile.nome}.`, "error");
        
            console.error("Erro ao fazer a requisição:", err);
        }
    }

    const followRequest = async (followerId) => {
        try {
            const formData = new FormData();
            
            formData.append("followerId", followerId);
            
            const resp = await axios.post(`http://localhost:5000/profiles/${id}/followRequest`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;
        
            if (data.error) {
                setMessageWithReset(`Não foi possível enviar a solicitação para ${profile.nome}.`, "error");

                throw new Error("Erro ao enviar solicitação de seguidor");
            }
        } catch (err) {
            setMessageWithReset(`Não foi possível enviar a solicitação para ${profile.nome}.`, "error");
        
            console.error("Erro ao fazer a requisição:", err);
        }
    }

    function complaintSubmit(e) {
        e.preventDefault();

        if ((!complaintDescription && (!selectedComplaintReasons || selectedComplaintReasons.length === 0)) || (complaintDescription && complaintDescription.length > 255)) return;
       
        createComplaint();

        setSelectedComplaintReasons([]);
        setProfileComplaintReasons([]);
        setComplaintDescription("");
        setShowComplaintReasons(!showComplaintReasons);                  
    }

    const createComplaint = async () => {
        try {
            const formData = new FormData();
    
            formData.append("description", complaintDescription.trim());
            formData.append("authorId", viewer.id_perfil);
            profileComplaintReasons.forEach(reason => formData.append("complaintReasonsIds", reason.id_motivo_denuncia));
    
            const resp = await axios.post(`http://localhost:5000/profiles/${id}/complaint`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                setMessageWithReset("Não foi possível denunciar o perfil.", "error");

                throw new Error("Erro ao denunciar perfil");
            } else {
                setProfile(prevProfile => ({...prevProfile, isComplainted: !prevProfile.isComplainted}));
    
                setMessageWithReset("Perfil denunciado! Aguarde para analisarmos a denúncia.", "success");
            }
        } catch (err) {
            setMessageWithReset("Não foi possível denunciar o perfil.", "error");

            console.error("Erro ao fazer a requisição:", err);
        }
    }

    const handleClickComplaintReason = (item) => {
        setProfileComplaintReasons(prevs => {
            if (prevs.includes(item)) {
                return prevs.filter(prevItem => prevItem !== item);
            } else {
                return [...prevs, item];
            }
        });

        setSelectedComplaintReasons(prevSelected => {
            if (prevSelected.includes(item)) {
                return prevSelected.filter(prevItem => prevItem !== item);
            } else {
                return [...prevSelected, item];
            }
        });
    };

    function viewComplaint() {
        setSelectedComplaintReasons([]);
        setProfileComplaintReasons([])
        setComplaintDescription("");
        setShowComplaintReasons(!showComplaintReasons);  
    }

    function handleOnChangeComplaintDescription(e) {
        e.target.value = e.target.value.replace(/\s{2,}/g, ' ').trimStart();

        setComplaintDescription(e.target.value);
    }

    const validateComplaintDescription = useCallback(() => {
        return (complaintDescription && 
            complaintDescription.length <= 255) || 
            !complaintDescription;
    }, [complaintDescription]);

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
        if (!tagsFullScreen && postsToShowType === "posts" && profile.id_perfil) {

            const handleScrollPosts = () => handleScroll(() => loadPosts(profile.id_perfil));

            window.addEventListener("scroll", handleScrollPosts);
            
            return () => window.removeEventListener("scroll", handleScrollPosts);
        }
    }, [loadPosts, handleScroll, postsToShowType, profile.id_perfil, tagsFullScreen]);

    useEffect(() => {
        if (!tagsFullScreen && postsToShowType === "tagPosts" && profile.id_perfil) {   

            const handleScrollTagPosts = () => handleScroll(() => loadTagPosts(profile.id_perfil));

            window.addEventListener("scroll", handleScrollTagPosts);
            
            return () => window.removeEventListener("scroll", handleScrollTagPosts);
        }
    }, [handleScroll, postsToShowType, loadTagPosts, profile.id_perfil, tagsFullScreen]);

    useEffect(() => {
        if (tagsFullScreen && tagsType === "followers" && profile.id_perfil) {

            const handleScrollFollowers = () => handleScroll(() => loadFollowers(profile.id_perfil));

            window.addEventListener("scroll", handleScrollFollowers);
            
            return () => window.removeEventListener("scroll", handleScrollFollowers);
        }
    }, [handleScroll, tagsType, loadFollowers, profile.id_perfil, tagsFullScreen]);

    useEffect(() => {
        if (tagsFullScreen && tagsType === "followeds" && profile.id_perfil) {   
            const handleScrollFolloweds = () => handleScroll(() => loadFolloweds(profile.id_perfil));

            window.addEventListener("scroll", handleScrollFolloweds);
            
            return () => window.removeEventListener("scroll", handleScrollFolloweds);
        }
    }, [handleScroll, tagsType, loadFolloweds, profile.id_perfil, tagsFullScreen]);

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

    useEffect(() => {
        setPostsFullScreen(false);
        setTagsFullScreen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname])

    const setPosts = (updater, type) => {
        if (type === "posts") {
            setProfile(prevProfile => ({
                ...prevProfile,
                posts: updater(prevProfile.posts),
            }));
        } else if (type === "tagPosts") {
            setProfile(prevProfile => ({
                ...prevProfile,
                tagPosts: updater(prevProfile.tagPosts),
            }));
        }
    };

    return (
        <>
            {!tagsFullScreen ? (
                <>
                    {!postsFullScreen ? 
                        <>
                            <ProfileNavBar setMessage={setMessageWithReset} permission={JSON.stringify(viewer) !== "{}"}/>

                            <main className={styles.profile_page}>
                                {message && <Message message={message.message} type={message.type}/>}

                                <div className={styles.profile_main_info}>
                                    <ProfilePhotoContainer profilePhotoPath={profile.media?.caminho} size="large"/>
                                    
                                    <span>{profile.nome}</span>

                                    <p>{profile.biografia}</p>
                                </div>

                                {(profile.qualifications && profile.qualifications.length !== 0) && (   
                                    <>
                                        <ul className={styles.profile_qualifications}>
                                            {profile.qualifications.map((qualification, index) => (
                                                <li key={index}>
                                                    <span>{`${qualification.grau} em ${qualification.curso}`}</span>

                                                    <span>{`${qualification.instituicao} - ${qualification.estado} - ${qualification.cidade}`}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                <hr/>

                                <div className={styles.profile_stats}>
                                    <div>
                                        <span>{formatNumber(profile.posts ? profile.posts.length : 0)}</span>
                                        <span>Postagens</span>
                                    </div>

                                    <div onClick={() => setTagsFullScreen(true)}>
                                        <span>{formatNumber(followersNumber)}</span>

                                        <span>{followersNumber === 1 ? "seguidor" : "seguidores"}</span>
                                    </div>

                                    <div>
                                        <span>{formatNumber(profile.likes)}</span>

                                        <span>{profile.likes === 1 ? "curtida" : "curtidas"}</span>
                                    </div>
                                </div>

                                <hr/>

                                {(profile.preferences && profile.preferences.length !== 0) && (
                                    <>
                                        <ul className={styles.profile_preferences}>
                                            {profile.preferences.map((sport, index) => (
                                                <li key={index} onClick={() => navigate(`/search?text=${sport.nome}&type=posts`)}>
                                                    <img src={sport.icone} alt={`${sport.nome} Icon`}/>

                                                    <span>{sport.nome}</span>
                                                </li>
                                            ))}
                                        </ul>   

                                        <hr/>
                                    </>
                                )}

                                <div className={styles.profile_actions}>
                                    {id ? (
                                        <>
                                            <button 
                                                className={`${styles.follow_button} ${profile.isFollowed && styles.follow_button_selected}`} 
                                                onClick={profile.privado && !profile.isFollowed ? sendFollowRequest : () => toggleFollow(viewer.id_perfil)}
                                            >
                                                {profile.isFollowed ? "Seguindo" : "Seguir"}
                                            </button>

                                            <button className={`${styles.complaint_button} ${profile.isComplainted && styles.complaint_button_selected}`}>
                                                <img src={profile.isComplainted ? complaintIcon : complaintedIcon} alt="Complaint" onClick={!profile.isComplainted ? viewComplaint : undefined}/>

                                                {showComplaintReasons && (
                                                    <div className={styles.profile_complaint}>
                                                        <span onClick={viewComplaint}>Voltar</span>

                                                        <form onSubmit={complaintSubmit}>
                                                            <SubmitButton text="Denunciar"/>
                                                            
                                                            <MainInput 
                                                                type="text" 
                                                                name="complaintDescription" 
                                                                placeholder="Descreva o motivo da sua denúncia" 
                                                                maxLength={255}
                                                                alertMessage="A descrição não pode ter mais que 255 caracteres"
                                                                handleChange={handleOnChangeComplaintDescription}    
                                                                showAlert={!validateComplaintDescription()}
                                                                value={complaintDescription}
                                                            />
                                                        </form>

                                                        <PostItemsContainer
                                                            searchText={true}
                                                            filteredItems={complaintReasons}
                                                            handleClick={handleClickComplaintReason}
                                                            isSelectable
                                                            selectedItems={selectedComplaintReasons}
                                                            isComplaintReasons
                                                        />
                                                    </div>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className={styles.follow_button} onClick={() => navigate("/myProfile/config")}>Editar perfil</button>

                                            <button 
                                                className={styles.follow_button}
                                                onClick={() => navigate("/profilePreferences", {state: {prevPreferences: profile.preferences, modifyProfile: profile}})}
                                            >
                                                Editar preferências
                                            </button>

                                            <button className={styles.follow_button}>Adicionar formação</button>
                                        </>
                                    )}
                                </div>

                                <div className={styles.posts_type}>
                                    <ul>
                                        <li 
                                            onClick={() => {
                                                setPostsToShowType("posts");
                                            }} 
                                            className={postsToShowType === "posts" ? styles.selected_posts_type : null}
                                        >
                                                Postagens
                                        </li>

                                        <li 
                                            onClick={() => {
                                                setPostsToShowType("tagPosts");
                                            }} 
                                            className={postsToShowType === "tagPosts" ? styles.selected_posts_type : null}
                                        >
                                                Marcações
                                        </li>
                                    </ul>
                                </div>

                                <section className={styles.profile_posts}>
                                    {id && profile.privado && !profile.isFollowed ? 
                                        <p>O perfil de {profile.nome} é privado. Envie uma solicitação para seguí-lo e ver suas postagens.</p>
                                    : 
                                        <PostsInSection 
                                            posts={profile[postsToShowType]} 
                                            notFoundText={postsToShowType === "posts" && (id ? `${profile.nome} ainda não publicou nada.` : "Faça sua primeira publicação!")}
                                            handlePostClick={(postId) => handlePostClick(postId)}
                                            postsLoading={postsToShowType === "posts" ? postsLoading : tagPostsLoading}
                                        />
                                    }
                                </section>
                            </main>
                            
                            <AppNavBar profilePhotoPath={viewer?.media ? viewer.media?.caminho : ""}/>
                        </>
                    : 
                        <PostsFullScreen
                            posts={profile[postsToShowType]} 
                            setPosts={(updater) => setPosts(updater, postsToShowType)} 
                            postsLoading={postsToShowType === "posts" ? postsLoading : tagPostsLoading}
                            initialPostToShow={selectedPostId}
                            handleExitFullscreen={exitPostsFullscreen}   
                        />
                    }
                </>
            ) : 
                <main className={styles.profile_followers_followeds}>
                    <div className={styles.exit_fullscreen} onClick={() => setTagsFullScreen(false)}>
                        Voltar
                    </div>
                    
                     <div className={styles.posts_type}>
                        <ul>
                            <li 
                                onClick={() => {
                                    setTagsType("followers");
                                }} 
                                className={tagsType === "followers" ? styles.selected_posts_type : null}
                            >
                                    Seguidores
                            </li>

                            <li 
                                onClick={() => {
                                    setTagsType("followeds");
                                }} 
                                className={tagsType === "followeds" ? styles.selected_posts_type : null}
                            >
                                    Seguindo
                            </li>
                        </ul>
                    </div>

                    {!id || (tagsType === "followers" && profile.config.visibilidade_seguidores) || (tagsType === "followeds" && profile.config.visibilidade_seguindo) ? 
                        <SearchResultsContainer
                            results={tagsType === "followers" ? tags.followers : tags.followeds}   
                            resultType="profiles"
                            notFoundText={tagsType === "followers" ? `${id ? profile.nome : "Você"} não possui nenhum seguidor.` : `${id ? profile.nome : "Você"} não segue ninguém.`}
                            tagsLoading={tagsType === "followers" ? followersLoading : followedsLoading}
                        />
                    :
                        <p>{`${profile.nome} não permite que outros perfis vejam ${tagsType === "followers" ? "seus seguidores" : "os perfis que segue"}.`}</p>
                    }
                </main>
            }
        </>
    );
}

export default Profile;
