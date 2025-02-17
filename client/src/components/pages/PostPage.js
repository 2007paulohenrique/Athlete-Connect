import { useNavigate, useParams } from "react-router-dom";
import styles from "./PostPage.module.css";
import Post from "../layout/Post";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useProfile } from "../../ProfileContext";
import formatDate from "../../utils/DateFormatter";
import toggleLike from "../../utils/post/HandleLike";
import Message from "../layout/Message";
import createSharing from "../../utils/post/HandleSharing";
import createComplaint from "../../utils/post/HandleComplaint";
import createComment from "../../utils/post/HandleComment";
import fetchComplaintReasons from "../../utils/post/FetchComplaintReasons";
import ExitPageBar from "../layout/ExitPageBar";
import loading from "../../img/animations/loading.svg";

function PostPage() {
    const [post, setPost] = useState();
    const [message, setMessage] = useState({});
    const [complaintReasons, setComplaintReasons] = useState([]);
    const [tags, setTags] = useState();
    const [searchTextTag, setSearchTextTag] = useState("");
    const [tagsLoading, setTagsLoading] = useState(false);
    const {profileId, setProfileId} = useProfile();

    const navigate = useNavigate();
    const {id} = useParams();

    const loadTags = useCallback(async (viewerId) => {
        if (!searchTextTag) return;

        setTagsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/search/profiles/${searchTextTag}?profileId=${viewerId}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar as tags dos perfis.", "error");

                throw new Error("Erro ao recuperar tags");
            } else {
                const filteredData = data.filter(tag => String(tag.id_perfil) !== String(viewerId) && tag.permissao_compartilhamento);

                setTags(filteredData);
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar as tags dos perfis.", "error");
    
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setTagsLoading(false);
        }
    }, [searchTextTag]);

    const fetchPost = useCallback(async (postId, viewerId) => {
        try {
            const resp = await axios.get(`http://localhost:5000/posts/${postId}?viewerId=${viewerId}`);
            const data = resp.data;

            if (data.error) {
                throw new Error("Erro ao recuperar postagem");
            } else {
                const formattedPost = {
                    ...data,
                    data_publicacao: formatDate(data.data_publicacao),
                    comments: data.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                };

                setPost([formattedPost]);
            }
        } catch (err) {
            navigate(-1, {state: {message: "Não foi possível recuperar a postagem.", type: "error"}});
            
            console.error('Erro ao fazer a requisição:', err);

            throw err;
        }
    }, [navigate]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        const fetchData = async () => {
            try {
                const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
            
                setProfileId(confirmedProfileId);

                await fetchPost(id, confirmedProfileId);
                await fetchComplaintReasons(setComplaintReasons, navigate, setMessageWithReset);
            } catch (err) {
                console.error("Erro ao recuperar postagem:", err);
            }
        };

        fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadTags();
    }, [loadTags, searchTextTag]);

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    return (
        <main className={styles.post_page}>
            {message && <Message message={message.message} type={message.type}/>}

            <ExitPageBar handleExitPage={() => navigate(-1)}/>

            {!post ? 
                <img className="loading" src={loading} alt="Loading"/>    
            :
                <Post
                    author={post[0]?.author}
                    moment={post[0]?.data_publicacao}
                    mediasPath={post[0]?.medias.map(media => media.caminho)}
                    caption={post[0]?.legenda}
                    postHashtags={post[0]?.hashtags || ""}
                    postTags={post[0]?.tags || ""}
                    likeSubmit={() => toggleLike(profileId, post[0], navigate, setPost, setMessageWithReset)}
                    isLiked={post[0]?.isLiked}
                    sharingSubmit={(sharings, sharingCaption) => 
                        createSharing(profileId, post[0], sharings, sharingCaption, navigate, setMessageWithReset, setPost)
                    }
                    complaintReasons={complaintReasons}
                    tags={tags}
                    isComplainted={post[0]?.isComplainted}
                    complaintSubmit={(postComplaintReasons, complaintDescription) => 
                        createComplaint(profileId, post[0], postComplaintReasons, complaintDescription, navigate, setPost, setMessageWithReset)
                    }
                    commentSubmit={(commentText) => createComment(profileId, post[0], commentText, navigate, setPost, setMessageWithReset)}
                    comments={post[0]?.comments}
                    post={post[0]}
                    filteredSharings={tags}
                    searchTextSharing={searchTextTag}
                    setSearchTextSharing={setSearchTextTag}
                    tagsLoading={tagsLoading}
                    canComment={post[0]?.canComment}
                    likesVisibility={post[0]?.visibilidade_curtidas}
                    sharingsVisibility={post[0]?.visibilidade_compartilhamentos}
                    commentsVisibility={post[0]?.visibilidade_comentarios}
                    setMessage={setMessageWithReset}
                />
            }
        </main>
    );
}

export default PostPage;