import AppNavBar from "../layout/AppNavBar";
import FlashesSection from "../layout/FlashesSection";
import Post from "../layout/Post";
import ProfileNavBar from "../layout/ProfileNavBar";
import styles from "./Home.module.css";
import arrowIcon from "../../img/icons/socialMedia/arrowIcon.png";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from '../../ProfileContext';
import Message from "../layout/Message";
import loading from "../../img/animations/loading.svg";
import formatDate from "../../utils/DateFormatter";

function Home() {
    const [feed, setFeed] = useState();
    const {profileId} = useProfile();
    const [profile, setProfile] = useState({});
    const [message, setMessage] = useState({});
    const [tags, setTags] = useState([]);
    const [complaintReasons, setComplaintReasons] = useState([]);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const msg = location?.state

        if (msg) setMessageWithReset(msg.message, msg.type)
    }, [location])

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        if (!confirmedProfileId) {
            navigate("/login");
        } else {
            axios.get(`http://localhost:5000/profiles/${confirmedProfileId}`)
            .then(resp => {
                const data = resp.data;
                
                if (data.error) {
                    if (resp.status === 404) {
                        navigate("/login", {state: {message: data.error, type: "error"}});
                    } else {
                        navigate("/errorPage", {state: {error: data.error}})
                    }
                } else {
                    setProfile(data);

                    axios.get(`http://localhost:5000/profiles/${confirmedProfileId}/feed`)
                    .then(resp => {
                        const data2 = resp.data;

                        if (data2.error) {
                            navigate("/errorPage", {state: {error: data2.error}});
                        } else {
                            const formattedFeed = data2.map(post => ({
                                ...post,
                                data_publicacao: formatDate(post.data_publicacao),
                                comments: post.comments.map(comment => ({
                                    ...comment,
                                    data_comentario: formatDate(comment.data_comentario)
                                }))
                            }));
                            
                            setFeed(formattedFeed);
                        }
                    })
                    .catch(err => {
                        navigate("/errorPage", {state: {error: err.message}})

                        console.error('Erro ao fazer a requisição:', err);
                    });
                }
            })
            .catch(err => {
                navigate("/login", {state: {message: "Não foi possível encontrar nenhum perfil com o id fornecido. Tente fazer login ou criar um perfil.", type: "error"}})

                console.error('Erro ao fazer a requisição:', err);
            });
        }
    }, [navigate, profileId, setProfile]);

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    useEffect(() => {
        axios.get("http://localhost:5000/complaintReasons")
        .then(resp => {
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setComplaintReasons(data);
            }
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error('Erro ao fazer a requisição:', err);
        });
    }, [navigate]);

    useEffect(() => {
        axios.get("http://localhost:5000/tags")
        .then(resp => {
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setTags(data);
            }
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error('Erro ao fazer a requisição:', err);
        });
    }, [navigate]);


    function goToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function likeAction(post) {
        const formData = new FormData();
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
        
        formData.append("profileId", confirmedProfileId);
        
        axios.post(`http://localhost:5000/posts/${post.id_postagem}/like`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
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
            
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        });
    }

    function sharingSubmit(e, post, sharingCaption, sharings) {
        e.preventDefault();
        
        const formData = new FormData();
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        formData.append("caption", sharingCaption.trim());
        formData.append("authorId", confirmedProfileId);
        sharings.forEach(sharing => formData.append("targetProfilesIds", sharing.id_perfil));

        axios.post(`http://localhost:5000/posts/${post.id_postagem}/sharing`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
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
            
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        });
    }

    function complaintSubmit(e, post, complaintDescription, postComplaintReasons) {
        e.preventDefault();
                
        const formData = new FormData();
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        formData.append("description", complaintDescription.trim());
        formData.append("authorId", confirmedProfileId);
        postComplaintReasons.forEach(reason => formData.append("complaintReasonsIds", reason.id_motivo_denuncia));

        axios.post(`http://localhost:5000/posts/${post.id_postagem}/complaint`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
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
            
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        });
    }

    function commentSubmit(e, post, commentText) {
        e.preventDefault();
                
        const formData = new FormData();
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        formData.append("text", commentText.trim());
        formData.append("authorId", confirmedProfileId);

        axios.post(`http://localhost:5000/posts/${post.id_postagem}/comment`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
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
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        });
    }

    return (
        <main className={styles.home_page}>
            {message && <Message message={message.message} type={message.type}/>}


            <ProfileNavBar/>

            <FlashesSection/>

            <section className={styles.posts_section}> 
                {!feed && (
                    <img className="loading" src={loading} alt="Loading"/>
                )}

                {feed && feed.map((post) => (
                    <Post 
                        key={post.id_postagem}
                        authorUserName={post.author.nome}
                        authorPhotoPath={post.author.media ? post.author.media.caminho : ""}
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

            <AppNavBar profilePhotoPath={profile && profile.media ? profile.media.caminho : ""}/>
        </main>
    );
}

export default Home;