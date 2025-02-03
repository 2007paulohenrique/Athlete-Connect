import styles from "./AppNavBar.module.css";
import homeIcon from "../../img/icons/socialMedia/homeIcon.png";
import newPostIcon from "../../img/icons/socialMedia/newPostIcon.png";
import favPlacesIcon from "../../img/icons/socialMedia/favPlacesIcon.png";
import eventIcon from "../../img/icons/socialMedia/eventIcon.png";
import userIcon from "../../img/icons/socialMedia/userIcon.png";
import { useLocation, useNavigate } from "react-router-dom";

function AppNavBar({ profilePhotoPath }) {
    const navigate = useNavigate();
    const location = useLocation();
    
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
                <li className={location.pathname === "/" ? styles.selected : undefined} onClick={() => navigate("/")}>
                    <img src={homeIcon} alt="Home"/>
                </li>

                <li className={location.pathname === "/events" ? styles.selected : undefined}>
                    <img src={eventIcon} alt="Events"/>
                </li>

                <li onClick={() => navigate("/newPost")}>
                    <img src={newPostIcon} alt="New"/>
                </li>
                
                <li className={location.pathname === "/favoritePlaces" ? styles.selected : undefined}>
                    <img src={favPlacesIcon} alt="Favorite Places"/>
                </li>
                
                <li 
                    className={`${profilePhoto && styles.profile_photo} ${location.pathname === "/myProfile" ? styles.selected : undefined}`} 
                    onClick={() => {
                        navigate("/myProfile");
                        window.location.reload();
                    }}
                >
                    <img src={profilePhoto} alt="Profile"/>
                </li>
            </ul>
        </nav>
    );
}

export default AppNavBar;