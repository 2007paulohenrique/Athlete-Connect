import styles from "./Notification.module.css";
import ProfilePhotoContainer from "./ProfilePhotoContainer";
import icon from "../../img/icons/socialMedia/icon.png"
import likedIcon from "../../img/icons/socialMedia/likedIcon.png"
import commentIcon from "../../img/icons/socialMedia/commentIcon.png"
import tagIcon from "../../img/icons/socialMedia/tagsIcon.png"
import complaintedIcon from "../../img/icons/socialMedia/complaintedIcon.png"
import alertIcon from "../../img/icons/socialMedia/errorIcon.png"
import SubmitButton from "../form/SubmitButton";

function Notification({ profileOriginId = null, profileOriginPhotoPath = null, type = null, message, postId = null, notificationDate, isFollowRequest = false, handleAcceptFollowRequest = null, navigate }) {    
    const notificationIcons = {
        denuncia: complaintedIcon,
        curtida: likedIcon,
        comentario: commentIcon,
        generica: icon,
        alerta: alertIcon,
        marcacao: tagIcon,
    }

    function handleAccept(e) {
        e.preventDefault();

        handleAcceptFollowRequest(profileOriginId);
    }

    return (
        <div className={styles.notification} onClick={postId ? navigate(`/post/${postId}`) : undefined}>
            <div className={styles.main_content}>
                {profileOriginId && 
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
                    <form onSubmit={(e) => handleAccept(e)}>
                        <SubmitButton text="Aceitar"/>
                    </form>
                }
            </div>

            <span>{notificationDate}</span>
        </div>
    );
}

export default Notification;