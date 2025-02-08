import styles from "./Notification.module.css";
import ProfilePhotoContainer from "./ProfilePhotoContainer";
import icon from "../../img/icons/socialMedia/icon.png"
import likedIcon from "../../img/icons/socialMedia/likedIcon.png"
import commentIcon from "../../img/icons/socialMedia/commentIcon.png"
import tagIcon from "../../img/icons/socialMedia/tagIcon.png"
import complaintedIcon from "../../img/icons/socialMedia/complaintedIcon.png"
import alertIcon from "../../img/icons/socialMedia/errorIcon.png"
import SubmitButton from "../form/SubmitButton";
import { useProfile } from "../../ProfileContext";
import axios from "axios";

function Notification({ profileOriginId = null, profileOriginPhotoPath = null, type = null, message, postId = null, notificationDate, isFollowRequest = false, navigate, setMessage }) {
    const {profileId} = useProfile();
    
    const notificationIcons = {
        denuncia: complaintedIcon,
        curtida: likedIcon,
        comentario: commentIcon,
        generica: icon,
        alerta: alertIcon,
        marcacao: tagIcon,
    }
    
    const acceptFollowRequest = async () => {
        try {
            const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

            const formData = new FormData();
            
            formData.append("followerId", profileOriginId);
            
            const resp = await axios.post(`http://localhost:5000/profiles/${confirmedProfileId}/followRequest/accept`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;
        
            if (data.error) {
                setMessage(`Não foi possível aceitar a solicitação para seguí-lo.`, "error");

                throw new Error("Erro ao aceitar solicitação");
            }
        } catch (err) {
            setMessage(`Não foi possível aceitar a solicitação para seguí-lo.`, "error");
        
            console.error("Erro ao fazer a requisição:", err);
        }
    }

    return (
        <div className={styles.notification} onClick={postId ? navigate(`/post/${postId}`) : undefined}>
            <div className={styles.email_main_content}>
                {profileOriginId && profileOriginPhotoPath && 
                    <ProfilePhotoContainer
                        profilePhotoPath={profileOriginPhotoPath}
                        size="medium"
                        handleClick={() => navigate(`/profile/${profileOriginId}`)}
                    />
                }

                <p>{message}</p>

                {!isFollowRequest ?
                    <img src={notificationIcons[type] || icon} alt="Notification Icon"/>
                :
                    <form onSubmit={acceptFollowRequest}>
                        <SubmitButton text="Aceitar"/>
                    </form>
                }
            </div>

            <span>{notificationDate}</span>
        </div>
    );
}

export default Notification;