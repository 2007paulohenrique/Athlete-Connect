import ProfilePhotoContainer from "./ProfilePhotoContainer";
import styles from "./ProfileSmallerContainer.module.css";

function ProfileSmallerContainer({ profilePhotoPath, profileName }) {
    return (
        <div className={styles.profile_smaller_container}>
            <ProfilePhotoContainer profilePhotoPath={profilePhotoPath} size="short"/>
            {profileName}
        </div>
    );
}

export default ProfileSmallerContainer;