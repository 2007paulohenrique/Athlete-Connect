import ProfilePhotoContainer from "./ProfilePhotoContainer";
import styles from "./ProfileBiggerContainer.module.css";
import formatNumber from "../../utils/NumberFormatter";

function ProfileBiggerContainer({ profilePhotoPath, profileName, followersNumber, handleClick }) {
    return (
        <div className={styles.profile_bigger_container} onClick={handleClick}>
            <ProfilePhotoContainer profilePhotoPath={profilePhotoPath} size="big"/>
            
            <div className={styles.profile_info}>
                <span>{profileName}</span>

                <span>{`${formatNumber(followersNumber)} ${followersNumber === 1 ? "seguidor" : "seguidores"}`}</span>
            </div>
        </div>
    );
}

export default ProfileBiggerContainer;