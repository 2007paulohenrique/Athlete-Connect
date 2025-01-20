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

function Home() {
    const [feed, setFeed] = useState();
    const { profileId }  = useProfile();
    const [profile, setProfile] = useState({});
    const [message, setMessage] = useState({});
    const [tags, setTags] = useState();
    const [complaintReasons, setComplaintReasons] = useState([]);    
    const [postsLoading, setPostsLoading] = useState(false);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [searchTextTag, setSearchTextTag] = useState("");
    
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const msg = location?.state
        
        if (msg) setMessageWithReset(msg.message, msg.type)
        }, [location])
    
    const fetchComplaintReasons = useCallback(async () => {
        if (complaintReasons.length !== 0) return;

        try {
            const resp = await axios.get("http://localhost:5000/complaintReasons");
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                setComplaintReasons(data);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [complaintReasons.length, navigate]);
    
    const loadTags = useCallback(async () => {
        if (!searchTextTag) return;

        setTagsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/search/profiles/${searchTextTag}`);
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
                const filteredData = data.filter(tag => String(tag.id_perfil) !== String(confirmedProfileId));

                setTags(filteredData);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setTagsLoading(false);
        }
    }, [navigate, profileId, searchTextTag]);

    const loadPosts = useCallback(async (id) => {
        if (postsLoading || (feed && feed?.length % 6 !== 0)) return;

        setPostsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/feed?offset=${offset}`);
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                const formattedFeed = data.map(post => ({
                    ...post,
                    data_publicacao: formatDate(post.data_publicacao),
                    comments: post.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                }));

                if (feed) {
                    setFeed((prevPosts) => [...prevPosts, ...formattedFeed]);
                } else {
                    setFeed(formattedFeed);
                }

                setOffset((prevOffset) => prevOffset + 6);   
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setPostsLoading(false);
        }
    }, [feed, postsLoading, navigate, offset]);

    const fetchProfile = useCallback(async (id) => {
        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}`);
            const data = resp.data;
            
            if (data.error) {
                if (resp.status === 404) {
                    navigate("/login", {state: {message: data.error, type: "error"}});
                } else {
                    navigate("/errorPage", {state: {error: data.error}})
                }
            } else {
                setProfile(data);
    
                loadPosts(id);
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

    useEffect(() => {
        fetchComplaintReasons();
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

    function likeAction(post) {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
        
        toggleLike(confirmedProfileId, post);
    }

    const toggleLike = async (id, post) => {
        try {
            const formData = new FormData();

            formData.append("profileId", id);

            const resp = await axios.post(`http://localhost:5000/posts/${post.id_postagem}/like`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setFeed(prevPosts =>
                    prevPosts.map(p => p.id_postagem === post.id_postagem ? {
                        ...p, 
                        isLiked: !p.isLiked, 
                        total_curtidas:  p.isLiked ? p.total_curtidas - 1 : p.total_curtidas + 1
                    } : p)
                );
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        }
    }

    function sharingSubmit(post, sharingCaption, sharings) {     
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
        
       createSharing(confirmedProfileId, post, sharings, sharingCaption);
    }

    const createSharing = async (id, post, sharings, sharingCaption) => {
        console.log(sharings)
        try {
            const formData = new FormData();

            formData.append("caption", sharingCaption.trim());
            formData.append("authorId", id);
            sharings.forEach(sharing => formData.append("targetProfilesIds", sharing.id_perfil));

            const resp = await axios.post(`http://localhost:5000/posts/${post.id_postagem}/sharing`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setFeed(prevPosts =>
                    prevPosts.map(p => p.id_postagem === post.id_postagem ? { 
                        ...p, 
                        total_compartilhamentos: p.total_compartilhamentos + 1
                    } : p)
                );
                
                setMessageWithReset("Postagem compartilhada com sucesso!", "success");
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        }
    }

    function complaintSubmit(post, complaintDescription, postComplaintReasons) {                
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        createComplaint(confirmedProfileId, post, complaintDescription, postComplaintReasons);
    }

    const createComplaint = async (id, post, postComplaintReasons, complaintDescription) => {
        try {
            const formData = new FormData();

            formData.append("description", complaintDescription.trim());
            formData.append("authorId", id);
            postComplaintReasons.forEach(reason => formData.append("complaintReasonsIds", reason.id_motivo_denuncia));

            const resp = await axios.post(`http://localhost:5000/posts/${post.id_postagem}/complaint`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setFeed(prevPosts =>
                    prevPosts.map(p => p.id_postagem === post.id_postagem ? { ...p, isComplainted: true } : p
                    )
                );
    
                setMessageWithReset("Postagem denunciada! Aguarde para analisarmos a denúncia", "success");
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        }
    }

    function commentSubmit(post, commentText) {        
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
        
        createComment(confirmedProfileId, post, commentText);
    }

    const createComment = async (id, post, commentText) => {
        try {
            const formData = new FormData();

            formData.append("text", commentText.trim());
            formData.append("authorId", id);
    
            const resp = await axios.post(`http://localhost:5000/posts/${post.id_postagem}/comment`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                const newComment = data.newComment;
    
                setFeed(prevPosts =>
                    prevPosts.map(p => p.id_postagem === post.id_postagem ? { 
                        ...p, 
                        comments: [...p.comments, {...newComment, data_comentario: formatDate(newComment.data_comentario)}],
                        total_comentarios: p.total_comentarios + 1
                    } : p)
                );
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        }
    }
    
    useEffect(() => {
        let timeoutId;
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        const handleScroll = () => {
            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 450) {
                    loadPosts(confirmedProfileId);
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
            <ProfileNavBar/>
        
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
                            likeSubmit={() => likeAction(post)}
                            isLiked={post.isLiked}
                            sharingSubmit={sharingSubmit}
                            complaintReasons={complaintReasons}
                            tags={tags}
                            isComplainted={post.isComplainted}
                            complaintSubmit={complaintSubmit}
                            commentSubmit={commentSubmit}
                            comments={post.comments}
                            post={post}
                            filteredSharings={tags}
                            searchTextSharing={searchTextTag}
                            setSearchTextSharing={setSearchTextTag}
                            tagsLoading={tagsLoading}
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