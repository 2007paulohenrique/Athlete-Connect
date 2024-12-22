import styles from "./ProfilePhotoContainer.module.css";
import userIcon from "../../img/icons/socialMedia/userIcon.png";

function ProfilePhotoContainer({ profilePhotoPath }) {
    const profilePhoto = profilePhotoPath ? require(`../../img/${profilePhotoPath}`) : userIcon;

    return (
        <div className={styles.profile_photo_container}>
            <img src={profilePhoto ? profilePhoto : userIcon} alt="Profile"/>
        </div>
    );
}

export default ProfilePhotoContainer;