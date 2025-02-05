import { useCallback, useEffect, useRef, useState } from "react";
import Post from "./Post";
import styles from "./PostsFullScreen.module.css";
import fetchComplaintReasons from "../../utils/post/FetchComplaintReasons";
import { useNavigate } from "react-router-dom";
import createComplaint from "../../utils/post/HandleComplaint";
import { useProfile } from "../../ProfileContext";
import Message from "./Message";
import createSharing from "../../utils/post/HandleSharing";
import toggleLike from "../../utils/post/HandleLike";
import createComment from "../../utils/post/HandleComment";
import axios from "axios";
import loading from "../../img/animations/loading.svg";
import ExitPageBar from "./ExitPageBar";

function PostsFullScreen({ posts, setPosts, postsLoading, initialPostToShow, handleExitFullscreen }) {
    const [complaintReasons, setComplaintReasons] = useState([]);
    const {profileId} = useProfile();
    const [tags, setTags] = useState();
    const [tagsLoading, setTagsLoading] = useState(false);
    const [searchTextTag, setSearchTextTag] = useState("");
    const [message, setMessage] = useState({});

    const postsRef = useRef([]);
    const navigate = useNavigate();

    const loadTags = useCallback(async (id) => {
        if (!searchTextTag) return;

        setTagsLoading(true);

        try {            
            const resp = await axios.get(`http://localhost:5000/search/profiles/${searchTextTag}?profileId=${id}`);
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                const filteredData = data.filter(tag => String(tag.id_perfil) !== String(id));

                setTags(filteredData);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setTagsLoading(false);
        }
    }, [navigate, searchTextTag]);

    useEffect(() => {
        fetchComplaintReasons(setComplaintReasons, navigate)
    }, [navigate])

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        loadTags(confirmedProfileId);
    }, [loadTags, profileId, searchTextTag]);

    useEffect(() => {
        if (initialPostToShow) {
            postsRef.current[initialPostToShow]?.scrollIntoView({behavior: "smooth"});
        }
    }, [initialPostToShow]);

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    return (
        <section className={styles.posts_full_screen}>
            {message && <Message message={message.message} type={message.type}/>}

            <ExitPageBar handleExitPage={handleExitFullscreen}/>

            {posts && posts.map((post) => (
                <Post 
                    key={post.id_postagem}
                    ref={(el) => postsRef.current[post.id_postagem] = el}
                    author={post.author}
                    moment={post.data_publicacao}
                    mediasPath={post.medias.map(media => media.caminho)}
                    caption={post.legenda}
                    postHashtags={post.hashtags || ""}
                    postTags={post.tags || ""}
                    likeSubmit={() => toggleLike(profileId, post, navigate, setPosts, setMessageWithReset)}
                    isLiked={post.isLiked}
                    sharingSubmit={(sharings, sharingCaption) => 
                        createSharing(profileId, post, sharings, sharingCaption, navigate, setMessageWithReset, setPosts)
                    }
                    complaintReasons={complaintReasons}
                    tags={tags}
                    isComplainted={post.isComplainted}
                    complaintSubmit={(postComplaintReasons, complaintDescription) => 
                        createComplaint(profileId, post, postComplaintReasons, complaintDescription, navigate, setPosts, setMessageWithReset)
                    }
                    commentSubmit={(commentText) => createComment(profileId, post, commentText, navigate, setPosts, setMessageWithReset)}
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

            {postsLoading && 
                <img  className="loading" src={loading} alt="loading"/>
            }
        </section>
    );
}

export default PostsFullScreen;