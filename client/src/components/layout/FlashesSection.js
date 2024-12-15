import styles from "./FlashesSection.module.css";
import addFlashIcon from "../../img/icons/socialMedia/addFlashIcon.png"
import ProfilePhotoContainer from "./ProfilePhotoContainer";

function FlashesSection() {
    return (
        <section className={styles.flashes_section}>
            <ul>
                <li className={styles.add_flash}><img src={addFlashIcon} alt="New Flash"></img></li>
                
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
                <ProfilePhotoContainer/>
            </ul>
        </section>
    );
}

export default FlashesSection;