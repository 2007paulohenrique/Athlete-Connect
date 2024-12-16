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

function Home() {
    const [feed, setFeed] = useState([]);
    const {profileId} = useProfile();
    const [profile, setProfile] = useState({});
    const [message, setMessage] = useState({});
    const [sharings, setSharings] = useState([]);
    const [sharingCaption, setSharingCaption] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        if (!confirmedProfileId) {
            navigate("/login");
        } else {
            axios.get(`http://localhost:5000/profiles/${confirmedProfileId}`)
            .then(resp => {
                if (resp.data) {
                    setProfile(resp.data);

                    axios.get(`http://localhost:5000/feeds/${confirmedProfileId}`)
                    .then(resp => {
                        if (resp.data) {
                            setFeed(resp.data);
                        } else {
                            navigate("/login"); 
                        }
                    })
                    .catch(err => {
                        console.error('Erro ao fazer a requisição:', err);
                    });
                } else {
                    navigate("/login"); 
                }
            })
            .catch(err => {
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
        if (location.state) {
            setMessageWithReset(location.state.message, location.state.type)
        }
    }, [location.state])

    function goToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function likeAction(post) {
        setFeed(prevPosts =>
            prevPosts.map(p => p.id_postagem === post.id_postagem ? { ...p, isLiked: !p.isLiked } : p
            )
        );

        const formData = new FormData();
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        formData.append("profileId", confirmedProfileId);

        axios.post(`http://localhost:5000/posts/${post["id_postagem"]}/like`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
        })
        .catch(err => {
            console.error("Erro ao fazer a requisição:", err);
        });
    }

    function sharingSubmit(e, post) {
        e.preventDefault();

        if (!sharings || sharings.length === 0) return       
        
        const formData = new FormData();
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        formData.append("caption", sharingCaption.trim());
        formData.append("authorId", confirmedProfileId);
        sharings.forEach(sharing => formData.append("targetProfilesIds", sharing["id_perfil"]));

        axios.post(`http://localhost:5000/posts/${post["id_postagem"]}/sharing`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
            setMessageWithReset("Postagem compartilhada com sucesso!", "success");
            setSharingCaption("");
        })
        .catch(err => {
            console.error("Erro ao fazer a requisição:", err);
        });
    }

    return (
        <main className={styles.home_page}>
            {message && <Message message={message.message} type={message.type}/>}

            <ProfileNavBar/>

            <FlashesSection/>

            <section className={styles.posts_section}> 
                {feed.map((post) => (
                    <Post 
                        authorUserName={post["author"]["nome"]}
                        authorPhotoPath={post["author"]["media"] ? post["author"]["media"]["caminho"] : ""}
                        moment={post["data_publicacao"]}
                        mediasPath={post["medias"].map(media => media["caminho"])}
                        caption={post["legenda"]}
                        postHashtags={post["hashtags"] || ""}
                        postTags={post["tags"] || ""}
                        likeAction={() => likeAction(post)}
                        isLiked={post["isLiked"]}
                        setSharings={setSharings}
                        sharingSubmit={sharingSubmit}
                        setSharingCaption={setSharingCaption}
                        sharingCaption={sharingCaption}
                        post={post}
                    />
                ))}

                <div className={styles.posts_ending}>
                    Você chegou ao fim das atividades. :´(
                    <br/>
                    Continue descendo para encontrar algo que te interesse! : )
                </div>

                <button type="button" onClick={goToTop} className={styles.go_to_top}>
                    <img src={arrowIcon} alt="Go to top"/>
                </button>
            </section>

            <AppNavBar profilePhotoPath={profile && profile["media"] ? profile["media"]["caminho"] : ""}/>
        </main>
    );
}

export default Home;