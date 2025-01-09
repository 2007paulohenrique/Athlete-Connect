import ProfilePhotoContainer from "./ProfilePhotoContainer";
import styles from "./ProfileSmallerContainer.module.css";

function ProfileSmallerContainer({ profilePhotoPath, profileName, handleClick }) {
    return (
        <div className={styles.profile_smaller_container} onClick={handleClick}>
            <ProfilePhotoContainer profilePhotoPath={profilePhotoPath} size="short"/>
            {profileName}
        </div>
    );
}

export default ProfileSmallerContainer;