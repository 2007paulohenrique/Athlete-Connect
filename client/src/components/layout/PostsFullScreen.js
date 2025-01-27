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

function PostsFullScreen({ posts, setPosts, postsLoading, initialPostToShow, handleExitFullscreen }) {
    const [complaintReasons, setComplaintReasons] = useState([]);
    const {profileId} = useProfile();
    const [tags, setTags] = useState();
    const [tagsLoading, setTagsLoading] = useState(false);
    const [searchTextTag, setSearchTextTag] = useState("");
    const [message, setMessage] = useState({});

    const postsRef = useRef([]);
    const navigate = useNavigate();

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

    useEffect(() => {
        fetchComplaintReasons(setComplaintReasons, navigate)
    }, [navigate])

    useEffect(() => {
        loadTags();
    }, [loadTags, searchTextTag]);

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

            <div className={styles.exit_fullscreen} onClick={handleExitFullscreen}>
                Voltar
            </div>

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
                    likeSubmit={() => toggleLike(profileId, post, navigate, setPosts)}
                    isLiked={post.isLiked}
                    sharingSubmit={(sharings, sharingCaption) => 
                        createSharing(profileId, post, sharings, sharingCaption, navigate, setMessage, setPosts)
                    }
                    complaintReasons={complaintReasons}
                    tags={tags}
                    isComplainted={post.isComplainted}
                    complaintSubmit={(postComplaintReasons, complaintDescription) => 
                        createComplaint(profileId, post, postComplaintReasons, complaintDescription, navigate, setPosts, setMessage)
                    }
                    commentSubmit={(commentText) => createComment(profileId, post, commentText, navigate, setPosts)}
                    comments={post.comments}
                    post={post}
                    filteredSharings={tags}
                    searchTextSharing={searchTextTag}
                    setSearchTextSharing={setSearchTextTag}
                    tagsLoading={tagsLoading}
                    canComment={post.canComment}
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