import { useCallback, useEffect, useState } from "react";
import styles from "./NotificationsPage.module.css";
import { useProfile } from "../../ProfileContext";
import axios from "axios";
import Message from "../layout/Message";
import ExitPageBar from "../layout/ExitPageBar";
import { useNavigate } from "react-router-dom";
import loading from "../../img/animations/loading.svg";
import Notification from "../layout/Notification";
import SharingContainer from "../layout/SharingContainer";

function NotificationsPage() {
    const [notifications, setNotifications] = useState();
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsOffset, setNotificationsOffset] = useState(0);
    const [notificationsEnd, setNotificationsEnd] = useState(false);
    const [followRequests, setFollowRequests] = useState();
    const [followRequestsLoading, setFollowRequestsLoading] = useState(false);
    const [followRequestsOffset, setFollowRequestsOffset] = useState(0);
    const [followRequestsEnd, setFollowRequestsEnd] = useState(false);
    const [sharings, setSharings] = useState();
    const [sharingsLoading, setSharingsLoading] = useState(false);
    const [sharingsOffset, setSharingsOffset] = useState(0);
    const [sharingsEnd, setSharingsEnd] = useState(false);
    const [message, setMessage] = useState({});
    const [notificationsToShowType, setNotificationsToShowType] = useState("notifications")
    const {profileId, setProfileId} = useProfile();

    const navigate = useNavigate();

    const LIMIT = 15;

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    const loadNotifications = useCallback(async (id) => {
        if (notificationsLoading || notificationsEnd) return;

        setNotificationsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/notifications?offset=${notificationsOffset}&limit=${LIMIT}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar as notificações do perfil.", "error");

                throw new Error("Erro ao recuperar notificações do perfil");
            } else {
                if (data.length < LIMIT) {
                    setNotificationsEnd(true);
                }

                setNotifications(prevNotifications => [...(prevNotifications || []), ...data]); 

                setNotificationsOffset(prevOffset => prevOffset + LIMIT);   
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar as notificações do perfil.", "error");
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setNotificationsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notificationsLoading, notifications, notificationsOffset]);

    const loadFollowRequests = useCallback(async (id) => {
        if (followRequestsLoading || followRequestsEnd) return;

        setFollowRequestsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/followRequests?offset=${followRequestsOffset}&limit=${LIMIT}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar as solicitações para te seguir.", "error");

                throw new Error("Erro ao recuperar solicitações enviadas ao perfil");
            } else {
                if (data.length < LIMIT) {
                    setFollowRequestsEnd(true);
                }

                setFollowRequests(prevFollowRequests => [...(prevFollowRequests || []), ...data]); 

                setFollowRequestsOffset(prevOffset => prevOffset + LIMIT);   
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar as solicitações para te seguir.", "error");
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setFollowRequestsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [followRequestsLoading, followRequests, followRequestsOffset]);

    const loadSharings = useCallback(async (id) => {
        if (sharingsLoading || sharingsEnd) return;

        setSharingsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/sharings?offset=${sharingsOffset}&limit=${LIMIT}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar os compartilhamentos.", "error");

                throw new Error("Erro ao recuperar compartilhamentos");
            } else {
                if (data.length < LIMIT) {
                    setSharingsEnd(true);
                }

                setSharings(prevSharings => [...(prevSharings || []), ...data]); 

                setSharingsOffset(prevOffset => prevOffset + LIMIT);   
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar os compartilhamentos.", "error");
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setSharingsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharingsLoading, sharings, sharingsOffset]);

    const acceptFollowRequest = async (id, profileOriginId) => {
        try {
            const formData = new FormData();
            
            formData.append("followerId", profileOriginId);
            
            const resp = await axios.post(`http://localhost:5000/profiles/${id}/followRequest/accept`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;
        
            if (data.error) {
                setMessageWithReset(`Não foi possível aceitar a solicitação para seguí-lo.`, "error");

                throw new Error("Erro ao aceitar solicitação");
            } 
            
            setFollowRequests(prevFollowRequests => 
                prevFollowRequests.filter(followRequest => followRequest.fk_perfil_id_seguidor !== profileOriginId)
            );
        } catch (err) {
            setMessageWithReset(`Não foi possível aceitar a solicitação para seguí-lo.`, "error");
        
            console.error("Erro ao fazer a requisição:", err);
        }
    }

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        if (!confirmedProfileId) {
            console.error("Erro ao identificar perfil");

            navigate("/login", {state: {message: "Não conseguimos identificar seu perfil. Tente fazer o login.", type: "error"}});

            return;
        }

        setProfileId(confirmedProfileId);

        loadFollowRequests(confirmedProfileId);
        loadNotifications(confirmedProfileId);
        loadSharings(confirmedProfileId);
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <ExitPageBar handleExitPage={() => navigate(-1)}/>

            <main className={styles.notifications_page}>
                {message && <Message message={message.message} type={message.type}/>}

                <h1>Suas Notificações</h1>

                <hr/>

                <ul className={styles.notifications_type}>
                    <li 
                        onClick={() => {
                            setNotificationsToShowType("notifications");
                        }} 
                        className={notificationsToShowType === "notifications" ? styles.selected_notifications_type : null}
                    >
                        Notificações
                    </li>

                    <li 
                        onClick={() => {
                            setNotificationsToShowType("sharings");
                        }} 
                        className={notificationsToShowType === "sharings" ? styles.selected_notifications_type : null}
                    >
                        Compartilhamentos
                    </li>
                </ul>

                {notificationsToShowType === "notifications" ?
                    <>
                        <section className={styles.notifications}>
                            {notifications && notifications.map(notification => (
                                <Notification
                                    key={notification.id_notificacao}
                                    profileOriginId={notification.fk_perfil_id_perfil_origem}
                                    profileOriginPhotoPath={notification.origin_profile_photo}
                                    type={notification.tipo}
                                    message={notification.mensagem}
                                    postId={notification.fk_postagem_id_postagem}
                                    notificationDate={notification.lancamento}
                                    navigate={navigate}
                                    setMessage={setMessageWithReset}
                                />
                            ))}

                            {notificationsEnd ?
                                <span className={styles.see_more}>{notifications?.length !== 0 ? "Suas notificações acabaram." : "Você não tem notificações."}</span>
                            :
                                notifications && <span onClick={() => loadNotifications(profileId)} className={styles.see_more}>Ver mais notificações</span>       
                            }
                        </section>

                        {followRequests && followRequests?.length !== 0 && 
                            <section className={styles.notifications}>
                                <h2>Solicitações para te seguir</h2>

                                {followRequests && followRequests.map((followRequest, index) => (
                                    <Notification
                                        key={index}
                                        profileOriginId={followRequest.fk_perfil_id_seguidor}
                                        profileOriginPhotoPath={followRequest.follower_photo}
                                        message={`${followRequest.follower_name} quer te seguir.`}
                                        notificationDate={followRequest.envio}
                                        isFollowRequest
                                        handleAcceptFollowRequest={(profileOriginId) => acceptFollowRequest(profileId, profileOriginId)}
                                        navigate={navigate}
                                        setMessage={setMessageWithReset}
                                    />
                                ))}
                                
                                {followRequestsEnd ? 
                                    <span className={styles.see_more}>Você não tem mais solicitações.</span>    
                                : 
                                    <span onClick={() => loadFollowRequests(profileId)} className={styles.see_more}>Ver mais solicitações para te seguir.</span>
                                }
                            </section>
                        }
                    </>
                :
                    <section className={styles.sharings}>
                        {sharings && sharings.map(sharing => (
                            <SharingContainer
                                key={sharing.id_compartilhamento}
                                profileDestinyId={profileId}
                                profileOriginId={sharing.fk_perfil_id_perfil}
                                profileOriginName={sharing.profile_origin_name}
                                profileOriginPhotoPath={sharing.profile_origin_photo}
                                postAuthorId={sharing.post.author.id_perfil}
                                postAuthorName={sharing.post.author.nome}
                                postAuthorPhotoPath={sharing.post.author.media.caminho}
                                sharingCaption={sharing.legenda}
                                postId={sharing.fk_postagem_id_postagem}
                                sharingDate={sharing.data_compartilhamento}
                                thumbnailPath={sharing.post.medias[0].caminho}
                                thumbnailMediaType={sharing.post.medias[0].tipo}
                                shareds={sharing.shareds}
                                navigate={navigate}
                            />
                        ))}

                        {sharingsEnd ?
                            <span className={styles.see_more}>{sharings?.length !== 0 ? "Seus compartilhamentos acabaram." : "Você não tem compartilhamentos."}</span>
                        :
                            sharings && <span onClick={() => loadSharings(profileId)} className={styles.see_more}>Ver mais compartilhamentos</span>        
                        }
                    </section>
                }

                {(notificationsToShowType === "notifications" ? notificationsLoading && followRequestsLoading : sharingsLoading) && 
                    <img  className="loading" src={loading} alt="loading"/>
                }
            </main>
        </>
    );
}

export default NotificationsPage;