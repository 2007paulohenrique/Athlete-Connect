import styles from "./FlashesSection.module.css";
import userIcon from "../../img/icons/socialMedia/userIcon.png";
import addFlashIcon from "../../img/icons/socialMedia/addFlashIcon.png"
import ProfilePhotoContainer from "./ProfilePhotoContainer";

function FlashesSection() {
    return (
        <section className={styles.flashes_section}>
            <ul>
                <li className={styles.add_flash}><img src={addFlashIcon} alt="New Flash"></img></li>
                
                <ProfilePhotoContainer profilePhotoPath="https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm90byUyMGRvJTIwcGVyZmlsfGVufDB8fDB8fHww"/>
                <ProfilePhotoContainer profilePhotoPath={userIcon}/>
                <ProfilePhotoContainer profilePhotoPath="https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm90byUyMGRvJTIwcGVyZmlsfGVufDB8fDB8fHww"/>
                <ProfilePhotoContainer profilePhotoPath="https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm90byUyMGRvJTIwcGVyZmlsfGVufDB8fDB8fHww"/>
                <ProfilePhotoContainer profilePhotoPath={userIcon}/>
                <ProfilePhotoContainer profilePhotoPath={userIcon}/>
                <ProfilePhotoContainer profilePhotoPath="https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm90byUyMGRvJTIwcGVyZmlsfGVufDB8fDB8fHww"/>
                <ProfilePhotoContainer profilePhotoPath={userIcon}/>
            </ul>
        </section>
    );
}

export default FlashesSection;