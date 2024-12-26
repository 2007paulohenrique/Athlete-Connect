import styles from "./ProfilePhotoContainer.module.css";
import userIcon from "../../img/icons/socialMedia/userIcon.png";

function ProfilePhotoContainer({ profilePhotoPath, size = "medium"}) {
    const profilePhoto = profilePhotoPath ? require(`../../img/${profilePhotoPath}`) : userIcon;

    return (
        <div className={`${styles.profile_photo_container} ${styles[size]}`}>
            <img src={profilePhoto ? profilePhoto : userIcon} alt="Profile"/>
        </div>
    );
}

export default ProfilePhotoContainer;