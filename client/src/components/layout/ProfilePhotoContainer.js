import styles from "./ProfilePhotoContainer.module.css";
import userIcon from "../../img/icons/socialMedia/userIcon.png";
import { useEffect, useState } from "react";

function ProfilePhotoContainer({ profilePhotoPath, size = "medium", isBlobUrl = false, handleClick = null }) {
    const [profilePhoto, setProfilePhoto] = useState();

    useEffect(() => {
        setProfilePhoto(profilePhotoPath || userIcon);
    }, [isBlobUrl, profilePhotoPath]);

    return (
        <div className={`${styles.profile_photo_container} ${styles[size]}`} onClick={handleClick ? handleClick : undefined}>
            <img src={profilePhoto} alt=""/>
        </div>
    );
}

export default ProfilePhotoContainer;