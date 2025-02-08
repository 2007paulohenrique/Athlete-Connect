import { useCallback, useEffect, useState } from "react";
import styles from "./NotificationsPage.module.css";
import formatDate from "../../utils/DateFormatter";
import { useProfile } from "../../ProfileContext";
import axios from "axios";
import Message from "../layout/Message";
import ExitPageBar from "../layout/ExitPageBar";
import { useNavigate } from "react-router-dom";
import loading from "../../img/animations/loading.svg";
import Notification from "../layout/Notification";

function NotificationsPage() {
    const [notifications, setNotifications] = useState();
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsOffset, setNotificationsOffset] = useState(0);
    const [notificationsEnd, setNotificationsEnd] = useState(false);
    const [followRequests, setFollowRequests] = useState();
    const [followRequestsLoading, setFollowRequestsLoading] = useState(false);
    const [followRequestsOffset, setFollowRequestsOffset] = useState(0);
    const [followRequestsEnd, setFollowRequestsEnd] = useState(false);
    const [message, setMessage] = useState({});
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

                const formattedNotifications = data.map(notification => ({
                    ...notification, 
                    lancamento: formatDate(notification.lancamento)
                }));

                setNotifications(prevNotifications => [...(prevNotifications || []), formattedNotifications]); 

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

                const formattedFollowRequests = data.map(followRequest => ({
                    ...followRequest, 
                    envio: formatDate(followRequest.envio)
                }));

                setFollowRequests(prevFollowRequests => [...(prevFollowRequests || []), formattedFollowRequests]); 

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

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
        setProfileId(confirmedProfileId);

        loadFollowRequests(confirmedProfileId);
        loadNotifications(confirmedProfileId);
    })

    return (
        <>
            <ExitPageBar handleExitPage={() => navigate(-1)}/>

            <main className={styles.notifications_page}>
                {message && <Message message={message.message} type={message.type}/>}

                <h1>Suas Notificações</h1>

                <section className={styles.notifications}>
                    {notifications && notifications.map(notification => (
                        <Notification
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
                        <span>{notifications?.length !== 0 ? "Suas notificações acabaram" : "Você não tem notificações"}</span>
                    :
                        <span onClick={() => loadNotifications(profileId)} className={styles.see_more}>Ver mais notificações</span>        
                    }
                </section>

                {followRequests?.length !== 0 && 
                    <section className={styles.follow_requests}>
                        <h2>Solicitações para te seguir</h2>

                        {followRequests && followRequests.map(followRequest => (
                            <Notification
                                profileOriginId={followRequest.fk_perfil_id_seguidor}
                                profileOriginPhotoPath={followRequest.follower_photo}
                                message={`${followRequest.follower_name || ""} quer te seguir.`}
                                notificationDate={followRequest.envio}
                                isFollowRequest
                                navigate={navigate}
                                setMessage={setMessageWithReset}
                            />
                        ))}
                        
                        {followRequestsEnd ? 
                            <span>Você não tem mais solicitações</span>    
                        : 
                            <span onClick={() => loadFollowRequests(profileId)} className={styles.see_more}>Ver mais solicitações para te seguir</span>
                        }
                    </section>
                }
                
                {notificationsLoading && followRequestsLoading && 
                    <img  className="loading" src={loading} alt="loading"/>
                }
            </main>
        </>
    );
}

export default NotificationsPage;