import styles from "./ProfilePhotoContainer.module.css";
import userIcon from "../../img/icons/socialMedia/userIcon.png";

function ProfilePhotoContainer({profilePhotoPath}) {
    let profilePhoto = "";

    if (profilePhotoPath) {
        profilePhoto = require(`../../img/${profilePhotoPath}`);
    }

    return (
        <li className={styles.profile_photo_container}>
            <img src={profilePhoto ? profilePhoto : userIcon} alt="Profile"/>
        </li>
    );
}

export default ProfilePhotoContainer;