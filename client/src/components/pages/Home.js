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
        fetchComplaintReasons(setComplaintReasons, navigate);
    }, [navigate]);

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
                            likeSubmit={() => toggleLike(profileId, post, navigate, setFeed)}
                            isLiked={post.isLiked}
                            sharingSubmit={(sharings, sharingCaption) => 
                                createSharing(profileId, post, sharings, sharingCaption, navigate, setMessage, setFeed)
                            }
                            complaintReasons={complaintReasons}
                            tags={tags}
                            isComplainted={post.isComplainted}
                            complaintSubmit={(postComplaintReasons, complaintDescription) => 
                                createComplaint(profileId, post, postComplaintReasons, complaintDescription, navigate, setFeed, setMessage)
                            }
                            commentSubmit={(commentText) => createComment(profileId, post, commentText, navigate, setFeed)}
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