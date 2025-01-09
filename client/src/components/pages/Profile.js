import React, { useCallback, useEffect, useState } from "react";
import styles from "./Profile.module.css";
import ProfilePhotoContainer from "../layout/ProfilePhotoContainer";
import complaintIcon from "../../img/icons/socialMedia/complaintIcon.png";
import complaintedIcon from "../../img/icons/socialMedia/complaintedIcon.png";
import { useNavigate, useParams } from "react-router-dom";
import { useProfile } from "../../ProfileContext";
import formatNumber from "../../utils/NumberFormatter";
import axios from "axios";
import SubmitButton from "../form/SubmitButton";
import MainInput from "../form/MainInput";
import PostItemsContainer from "../layout/PostItemsContainer";
import Message from "../layout/Message";
import loading from "../../img/animations/loading.svg";

function Profile() {
    const [thumbnails, setThumbnails] = useState([]);
    const [followersNumber, setFollowersNumber] = useState(0);
    const [profile, setProfile] = useState({});
    const { profileId } = useProfile();
    const [complaintReasons, setComplaintReasons] = useState([]);
    const [showComplaintReasons, setShowComplaintReasons] = useState(false);  
    const [selectedComplaintReasons, setSelectedComplaintReasons] = useState([]);
    const [profileComplaintReasons, setProfileComplaintReasons] = useState([]);
    const [complaintDescription, setComplaintDescription] = useState("");
    const [message, setMessage] = useState({});

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const viwerId = profileId || localStorage.getItem("athleteConnectProfileId");

        if (id === viwerId) navigate("/myProfile");

        const url = id
        ? `http://localhost:5000/profiles/users/${id}?viewerId=${viwerId}`
        : `http://localhost:5000/profiles/users/${viwerId}`;
        
        axios.get(url)
        .then(resp => {
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})                
            } else {
                setProfile({
                    ...data, 
                    preferences: data.preferences.map(sport => (
                        {...sport, icone: require(`../../img/${sport.icone}`)}
                    ))
                });

                setFollowersNumber(data.followers.length);
            }
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error('Erro ao fazer a requisição:', err);
        });
    }, [id, navigate, profileId])

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

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

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
        
        axios.post(`http://localhost:5000/profiles/${id}/follow`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setFollowersNumber(profile.isFollowed ? followersNumber - 1 : followersNumber + 1);

                setProfile({...profile, isFollowed: !profile.isFollowed});
            }
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        });
    }

    function complaintSubmit(e) {
        e.preventDefault();

        if ((!complaintDescription && (!selectedComplaintReasons || selectedComplaintReasons.length === 0)) || (complaintDescription && complaintDescription.length > 255)) return;
       
        const formData = new FormData();
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        formData.append("description", complaintDescription.trim());
        formData.append("authorId", confirmedProfileId);
        profileComplaintReasons.forEach(reason => formData.append("complaintReasonsIds", reason.id_motivo_denuncia));

        axios.post(`http://localhost:5000/profiles/${id}/complaint`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setProfile({...profile, isComplainted: !profile.isComplainted})
    
                setMessageWithReset("Perfil denunciado! Aguarde para analisarmos a denúncia", "success");
            }
        })
        .catch(err => {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        });

        setSelectedComplaintReasons([]);
        setProfileComplaintReasons([]);
        setComplaintDescription("");
        setShowComplaintReasons(!showComplaintReasons);                  
    }


    const handleClickComplaintReason = (item) => {
        setProfileComplaintReasons(prevs => {
            if (prevs.includes(item)) {
                return prevs.filter(prevItem => prevItem !== item);
            } else {
                return [...prevs, item];
            }
        });

        setSelectedComplaintReasons(prevSelected => {
            if (prevSelected.includes(item)) {
                return prevSelected.filter(prevItem => prevItem !== item);
            } else {
                return [...prevSelected, item];
            }
        });
    };

    function viewComplaint() {
        setSelectedComplaintReasons([]);
        setProfileComplaintReasons([])
        setComplaintDescription("");
        setShowComplaintReasons(!showComplaintReasons);  
    }

    function handleOnChangeComplaintDescription(e) {
        e.target.value = e.target.value.replace(/\s{2,}/g, ' ').trimStart();

        setComplaintDescription(e.target.value);
    }

    const validateComplaintDescription = useCallback(() => {
        return (complaintDescription && 
            complaintDescription.length <= 255) || 
            !complaintDescription;
    }, [complaintDescription]);

    return (
        <main className={styles.profile_page}>
            {message && <Message message={message.message} type={message.type}/>}

            <div className={styles.profile_main_info}>
                <ProfilePhotoContainer profilePhotoPath={profile.media?.caminho} size="large"/>
                
                <span>{profile.nome}</span>

                <p>{profile.biografia}</p>
            </div>

            {(profile.qualifications && profile.qualifications.length !== 0) && (   
                <>
                    {/* <hr/> */}

                    <ul className={styles.profile_qualifications}>
                        {profile.qualifications.map((qualification, index) => (
                            <li key={index}>
                                <span>{`${qualification.grau} em ${qualification.curso}`}</span>

                                <span>{`${qualification.instituicao} - ${qualification.estado} - ${qualification.cidade}`}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <hr/>

            <div className={styles.profile_stats}>
                <div>
                    <span>{formatNumber(profile.posts ? profile.posts.length : 0)}</span>
                    <span>Postagens</span>
                </div>

                <div>
                    <span>{formatNumber(followersNumber)}</span>

                    <span>Seguidores</span>
                </div>

                <div>
                    <span>{formatNumber(profile.likes)}</span>

                    <span>Curtidas</span>
                </div>
            </div>

            <hr/>

            {(profile.preferences && profile.preferences.length !== 0) && (
                <>
                    <ul className={styles.profile_preferences}>
                        {profile.preferences.map((sport, index) => (
                            <li key={index}>
                                <img src={sport.icone} alt={`${sport.nome} Icon`}/>

                                <span>{sport.nome}</span>
                            </li>
                        ))}
                    </ul>   

                    <hr/>
                </>
            )}


            <div className={styles.profile_actions}>
                {id ? (
                    <>
                        <button className={`${styles.follow_button} ${profile.isFollowed && styles.follow_button_selected}`} onClick={followProfile}>
                            {profile.isFollowed ? "Seguindo" : "Seguir"}
                        </button>

                        <button className={`${styles.complaint_button} ${profile.isComplainted && styles.complaint_button_selected}`}>
                            <img src={profile.isComplainted ? complaintIcon : complaintedIcon} alt="Complaint" onClick={!profile.isComplainted ? viewComplaint : undefined}/>

                            {showComplaintReasons && (
                                <div className={styles.profile_complaint}>
                                    <span onClick={viewComplaint}>Voltar</span>

                                    <form onSubmit={complaintSubmit}>
                                        <SubmitButton text="Denunciar"/>
                                        
                                        <MainInput 
                                            type="text" 
                                            name="complaintDescription" 
                                            placeholder="Descreva o motivo da sua denúncia" 
                                            maxLength={255}
                                            alertMessage="A descrição não pode ter mais que 255 caracteres"
                                            handleChange={handleOnChangeComplaintDescription}    
                                            showAlert={!validateComplaintDescription()}
                                            value={complaintDescription}
                                        />
                                    </form>

                                    <PostItemsContainer
                                        searchText={true}
                                        filteredItems={complaintReasons}
                                        handleClick={handleClickComplaintReason}
                                        isSelectable
                                        selectedItems={selectedComplaintReasons}
                                        isComplaintReasons
                                    />
                                </div>
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        <button className={styles.follow_button}>Editar perfil</button>

                        <button className={styles.follow_button}>Editar preferências</button>

                        <button className={styles.follow_button}>Adicionar formação</button>
                    </>
                )}
            </div>

            <section className={styles.profile_posts}>
                {!profile.posts && (
                    <img className="loading" src={loading} alt="Loading"/>
                )}
                
                {profile.posts ? 
                    profile.posts.length !== 0 ? profile.posts.map((post, index) => (
                        <div key={index}>
                            <span>{post.medias.length > 1 ? `${post.medias.length - 1} +` : ""}</span>

                            <img 
                                src={thumbnails[index]} 
                                alt={`Post ${index}`} 
                            />
                        </div>
                    )) : <p>{id ? `${profile.nome} ainda não publicou nada.` : "Faça sua primeira publicação!"}</p>
                : null}
            </section>
        </main>
    );
}

export default Profile;
