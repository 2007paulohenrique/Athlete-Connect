import styles from "./ProfilePhotoContainer.module.css";
import userIcon from "../../img/icons/socialMedia/userIcon.png";

function ProfilePhotoContainer({profilePhotoPath}) {
    return (
        <li className={styles.profile_photo_container}>
            <img src={profilePhotoPath ? profilePhotoPath : userIcon} alt="Profile"/>
        </li>
    );
}

export default ProfilePhotoContainer;