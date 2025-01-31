import styles from "./ProfilePhotoContainer.module.css";
import userIcon from "../../img/icons/socialMedia/userIcon.png";
import { useEffect, useState } from "react";

function ProfilePhotoContainer({ profilePhotoPath, size = "medium", isBlobUrl = false }) {
    const [profilePhoto, setProfilePhoto] = useState();

    useEffect(() => {
        if (!isBlobUrl) {
            setProfilePhoto(profilePhotoPath ? require(`../../img/${profilePhotoPath}`) : userIcon);
        } else {
            setProfilePhoto(profilePhotoPath || userIcon)
        }
    }, [isBlobUrl, profilePhotoPath])

    return (
        <div className={`${styles.profile_photo_container} ${styles[size]}`}>
            <img src={profilePhoto} alt=""/>
        </div>
    );
}

export default ProfilePhotoContainer;