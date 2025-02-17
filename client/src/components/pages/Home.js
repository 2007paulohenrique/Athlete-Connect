import AppNavBar from "../layout/AppNavBar";
import FlashesSection from "../layout/FlashesSection";
import Post from "../layout/Post";
import ProfileNavBar from "../layout/ProfileNavBar";
import styles from "./Home.module.css";
import arrowIcon from "../../img/icons/socialMedia/arrowIcon.png";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from '../../ProfileContext';
import Message from "../layout/Message";
import loading from "../../img/animations/loading.svg";
import formatDate from "../../utils/DateFormatter";
import fetchComplaintReasons from "../../utils/post/FetchComplaintReasons";
import createComplaint from "../../utils/post/HandleComplaint";
import toggleLike from "../../utils/post/HandleLike";
import createSharing from "../../utils/post/HandleSharing";
import createComment from "../../utils/post/HandleComment";
import { EXPIRATION_TIME } from "../../App";

function Home() {
    const [feed, setFeed] = useState();
    const {profileId}  = useProfile();
    const [profile, setProfile] = useState({});
    const [message, setMessage] = useState({});
    const [tags, setTags] = useState();
    const [searchTextTag, setSearchTextTag] = useState("");
    const [tagsLoading, setTagsLoading] = useState(false);
    const [complaintReasons, setComplaintReasons] = useState([]);    
    const [postsLoading, setPostsLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const msg = location?.state
        
        if (msg) setMessageWithReset(msg.message, msg.type)
    }, [location])
    
    const loadTags = useCallback(async () => {
        if (!searchTextTag) return;

        setTagsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/search/profiles/${searchTextTag}?profileId=${profile.id_perfil}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar as tags dos perfis.", "error");

                throw new Error("Erro ao recuperar tags");
            } else {
                const filteredData = data.filter(tag => String(tag.id_perfil) !== String(profile.id_perfil) && tag.permissao_compartilhamento);

                setTags(filteredData);
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar as tags dos perfis.", "error");
    
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setTagsLoading(false);
        }
    }, [profile.id_perfil, searchTextTag]);

    const loadPosts = useCallback(async (id) => {
        const isFirstLoading = !feed;

        const storageData = localStorage.getItem("athleteConnectFeed");
                
        if (storageData && isFirstLoading) {
            try {
                const parsedData = JSON.parse(storageData);
                
                if (Date.now() - parsedData.updateDate < EXPIRATION_TIME) {
                    setFeed(parsedData.feed);
                }
            } catch (err) {
                console.error("Erro ao recuperar o feed do perfil do cache:", err);

                localStorage.removeItem("athleteConnectFeed");
            }
        }
        
        if (postsLoading || (feed && feed?.length % 6 !== 0)) return;

        setPostsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/feed?offset=${offset}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar seu feed.", "error");

                throw new Error("Erro ao recuperar feed");
            } else {
                const formattedFeed = data.map(post => ({
                    ...post,
                    data_publicacao: formatDate(post.data_publicacao),
                    comments: post.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                }));

                if (isFirstLoading) {
                    setFeed(formattedFeed);
                    localStorage.setItem('athleteConnectFeed', JSON.stringify({feed: formattedFeed, updateDate: Date.now()}));
                } else {
                    setFeed(prevPosts => [...prevPosts, ...formattedFeed]);
                    localStorage.setItem('athleteConnectFeed', JSON.stringify({feed: [...feed, ...formattedFeed], updateDate: Date.now()}));
                }

                setOffset((prevOffset) => prevOffset + 6);   
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar seu feed.", "error");
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setPostsLoading(false);
        }
    }, [feed, postsLoading, offset]);

    const fetchProfile = useCallback(async (id) => {
        const storageData = localStorage.getItem("athleteConnectProfile");

        if (storageData) {
            try {
                const parsedData = JSON.parse(storageData);
                
                if (Date.now() - parsedData.updateDate < EXPIRATION_TIME) {
                    setProfile(parsedData.profile);

                    loadPosts(parsedData.profile.id_perfil);

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

                throw new Error("Erro ao buscar perfil");
            } else {
                setProfile(data);
                localStorage.setItem('athleteConnectProfile', JSON.stringify({profile: data, updateDate: Date.now()}));
                
                loadPosts(id);
            }
        } catch (err) {
            console.error('Erro ao fazer a requisição:', err);

            if (err.response.status === 404) {
                navigate("/login", {state: {message: "Não foi possível encontrar nenhum perfil com o id fornecido. Tente fazer o login.", type: "error"}});
            }    

            throw err;
        }
    }, [loadPosts, navigate]);   
    
    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        if (!confirmedProfileId) {
            console.error("Erro ao identificar perfil");

            navigate("/login", {state: {message: "Não conseguimos identificar seu perfil. Tente fazer o login.", type: "error"}});

            return;
        }
    
        const fetchData = async () => {
            try {
                await fetchProfile(confirmedProfileId);
                await fetchComplaintReasons(setComplaintReasons, navigate, setMessageWithReset);
            } catch (err) {
                console.error("Erro ao recuperar perfil:", err);
            }
        };
    
        fetchData();
            
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    function goToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    useEffect(() => {
        if (!profile.id_perfil) return;

        let timeoutId;

        const handleScroll = () => {
            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 450) {
                    loadPosts(profile.id_perfil);
                }
            }, 200);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset, postsLoading, loadPosts]);

    useEffect(() => {
        loadTags();
    }, [loadTags, searchTextTag]);

    return (
        <>
            <ProfileNavBar setMessage={setMessageWithReset} permission={JSON.stringify(profile) !== "{}"}/>
        
            <main className={styles.home_page}>
                {message && <Message message={message.message} type={message.type}/>}

                <FlashesSection/>

                <section className={styles.posts_section}> 
                    {!feed && (
                        <img className="loading" src={loading} alt="Loading"/>
                    )}

                    {feed && feed.map((post) => (
                        <Post 
                            key={post.id_postagem}
                            author={post.author}
                            moment={post.data_publicacao}
                            mediasPath={post.medias.map(media => media.caminho)}
                            caption={post.legenda}
                            postHashtags={post.hashtags || ""}
                            postTags={post.tags || ""}
                            likeSubmit={() => toggleLike(profile.id_perfil, post, navigate, setFeed, setMessageWithReset)}
                            isLiked={post.isLiked}
                            sharingSubmit={(sharings, sharingCaption) => 
                                createSharing(profile.id_perfil, post, sharings, sharingCaption, navigate, setMessageWithReset, setFeed)
                            }
                            complaintReasons={complaintReasons}
                            tags={tags}
                            isComplainted={post.isComplainted}
                            complaintSubmit={(postComplaintReasons, complaintDescription) => 
                                createComplaint(profile.id_perfil, post, postComplaintReasons, complaintDescription, navigate, setFeed, setMessageWithReset)
                            }
                            commentSubmit={(commentText) => createComment(profile.id_perfil, post, commentText, navigate, setFeed, setMessageWithReset)}
                            comments={post.comments}
                            post={post}
                            filteredSharings={tags}
                            searchTextSharing={searchTextTag}
                            setSearchTextSharing={setSearchTextTag}
                            tagsLoading={tagsLoading}
                            canComment={post.canComment}
                            likesVisibility={post.visibilidade_curtidas}
                            sharingsVisibility={post.visibilidade_compartilhamentos}
                            commentsVisibility={post.visibilidade_comentarios}
                            setMessage={setMessageWithReset}
                        />
                    ))}

                    {feed && feed.length > 0 && (
                        <div className={styles.posts_ending}>
                            Você chegou ao fim das atividades. :´(
                            <br/>
                            Continue descendo para encontrar algo que te interesse! : )
                        </div>
                    )}

                    <button type="button" onClick={goToTop} className={styles.go_to_top}>
                        <img src={arrowIcon} alt="Go to top"/>
                    </button>
                </section>

            </main>
        
            <AppNavBar profilePhotoPath={profile?.media ? profile.media.caminho : ""}/>
        </>
    );
}

export default Home;