import styles from "./ProfilePhotoContainer.module.css";

function ProfilePhotoContainer({profilePhotoPath}) {
    return (
        <li className={styles.profile_photo_container}>
            <img src={profilePhotoPath} alt="Profile"/>
        </li>
    );
}

export default ProfilePhotoContainer;