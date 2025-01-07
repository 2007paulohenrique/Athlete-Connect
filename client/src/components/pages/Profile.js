import React, { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import ProfilePhotoContainer from "../layout/ProfilePhotoContainer";
import shareIcon from "../../img/icons/socialMedia/shareIcon.png";
import complaintIcon from "../../img/icons/socialMedia/complaintIcon.png";
import { useNavigate, useParams } from "react-router-dom";
import { useProfile } from "../../ProfileContext";
import axios from "axios";

function Profile() {
    const [thumbnails, setThumbnails] = useState([]);
    const [profile, setProfile] = useState({});
    const { profileId } = useProfile();

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const followerId = profileId || localStorage.getItem("athleteConnectProfileId");

        axios.get(`http://localhost:5000/profiles/users/${id}?viewerId=${followerId}`)
        .then(resp => {
            const data = resp.data;
            console.log(data);

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})                
            } else {
                setProfile({
                    ...data, 
                    preferences: data.preferences.map(sport => (
                        {...sport, icone: require(`../../img/${sport.icone}`)}
                    ))
                });
            }
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error('Erro ao fazer a requisição:', err);
        });
    }, [id, navigate, profileId])

    const generateVideoThumbnail = (videoPath) => {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            video.src = videoPath;

            video.addEventListener("loadeddata", () => {
                const canvas = document.createElement("canvas");

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const context = canvas.getContext("2d");

                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const thumbnailURL = canvas.toDataURL("image/png");

                resolve(thumbnailURL);
            });
        });
    };

    useEffect(() => {
        if (profile.posts) {
            const fetchThumbnails = async () => {
                const newThumbnails = await Promise.all(
                    profile.posts.map(async (post) => {
                        if (post.medias[0].tipo === "video") {
                            return await generateVideoThumbnail(post.medias[0].caminho);
                        } else {
                            return require(`../../img/${post.medias[0].caminho}`)
                        }    
                    })
                );
    
                setThumbnails(newThumbnails);
            };
    
            fetchThumbnails();
        }
    }, [profile.posts]);

    function followProfile() {
        const formData = new FormData();
        const followerId = profileId || localStorage.getItem("athleteConnectProfileId");
        
        formData.append("followerId", followerId);
        
        axios.post(`http://localhost:5000/profiles/${profile.id_perfil}/follow`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setProfile({...profile, isFollowed: !profile.isFollowed})
            }
            
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        });
    }

    return (
        <main className={styles.profile_page}>
            <div className={styles.profile_main_info}>

                <ProfilePhotoContainer profilePhotoPath={profile.media?.caminho} size="large"/>
                
                <span>{profile.nome}</span>

                <p>{profile.biografia}</p>

                <ul className={styles.profile_qualifications}>
                    {(profile.qualifications && profile.qualifications.length !== 0) && profile.qualifications.map((qualification, index) => (
                        <ul key={index}>
                            <span>{`${qualification.grau} em ${qualification.curso}`}</span>

                            <span>{`${qualification.instituicao} - ${qualification.estado} - ${qualification.cidade}`}</span>
                        </ul>
                    ))}
                </ul>
            </div>

            <div className={styles.profile_stats}>
                <div>
                    {profile.posts ? profile.posts.length : 0}

                    <span>Postagens</span>
                </div>

                <div>
                    {profile.followers ? profile.followers.length : 0}

                    <span>Seguidores</span>
                </div>

                <div>
                    {profile.likes}

                    <span>Curtidas</span>
                </div>
            </div>

            <ul className={styles.profile_preferences}>
                {(profile.preferences && profile.preferences.length !== 0) && profile.preferences.map((sport, index) => (
                    <li key={index}>
                        <img src={sport.icone} alt={`${sport.nome} Icon`}/>

                        <span>{sport.nome}</span>
                    </li>
                ))}
            </ul>

            <div className={styles.profile_actions}>
                <button onClick={followProfile}>{profile.isFollowed ? "Seguindo" : "Seguir"}</button>
                
                <img src={shareIcon} alt="Share"/>
                <img src={complaintIcon} alt="Complaint"/>
            </div>

            <section className={styles.profile_posts}>
                {(profile.posts && profile.posts.length !== 0) ? profile.posts.map((post, index) => (
                    <div key={index}>
                        <img 
                            src={thumbnails[index]} 
                            alt={`Post ${index}`} 
                        />
                    </div>
                )) : (
                    <p>O perfil ainda não publicou nada.</p>
                )}
            </section>
        </main>
    );
}

export default Profile;
