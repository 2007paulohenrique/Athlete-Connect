import styles from "./AppNavBar.module.css";
import homeIcon from "../../img/icons/socialMedia/homeIcon.png";
import newPostIcon from "../../img/icons/socialMedia/newPostIcon.png";
import favPlacesIcon from "../../img/icons/socialMedia/favPlacesIcon.png";
import eventIcon from "../../img/icons/socialMedia/eventIcon.png";
import userIcon from "../../img/icons/socialMedia/userIcon.png";
import { useNavigate } from "react-router-dom";

function AppNavBar({ profilePhotoPath }) {
    const navigate = useNavigate();
    
    const profilePhoto = (() => {
        try {
            return require(`../../img/${profilePhotoPath}`);
        } catch {
            return userIcon;
        }
    })();

    return (
        <nav className={styles.app_nav_bar}>
            <ul>
                <li>
                    <img src={homeIcon} alt="Home"/>
                </li>

                <li>
                    <img src={eventIcon} alt="Events"/>
                </li>

                <li onClick={() => navigate("/newPost")}>
                    <img src={newPostIcon} alt="New"/>
                </li>
                
                <li>
                    <img src={favPlacesIcon} alt="Favorite Places"/>
                </li>
                
                <li className={profilePhoto && styles.profile_photo} onClick={() => navigate("/myProfile")}>
                    <img src={profilePhoto} alt="Profile"/>
                </li>
            </ul>
        </nav>
    );
}

export default AppNavBar;