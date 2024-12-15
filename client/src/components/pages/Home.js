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
    const [profile, setProfile] = useState();
    const [message, setMessage] = useState({});

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
                    console.log(resp.data);

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

    // "10/12/2024 12:10"

    return (
        <main className={styles.home_page}>
            {message && <Message message={message.message} type={message.type}/>}

            <ProfileNavBar/>

            <FlashesSection/>

            <section className={styles.posts_section}> 
                {feed.map(post => (
                    <Post 
                        authorUserName={post["author"]["nome"]}
                        authorPhotoPath={post["author"]["media"] ? post["author"]["media"]["caminho"] : ""}
                        moment={post["data_publicacao"]}
                        mediasPath={post["medias"].map(media => media["caminho"])}
                        caption={post["legenda"]}
                        setHashtagsInPost={post["hashtags"]}
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