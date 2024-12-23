import styles from "./FlashesSection.module.css";
import addFlashIcon from "../../img/icons/socialMedia/addFlashIcon.png"
import ProfilePhotoContainer from "./ProfilePhotoContainer";

function FlashesSection() {
    return (
        <section className={styles.flashes_section}>
            <ul>
                <li>
                    <img src={addFlashIcon} alt="New Flash"/>
                </li>

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