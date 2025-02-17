import styles from "./AppNavBar.module.css";
import homeIcon from "../../img/icons/socialMedia/homeIcon.png";
import newPostIcon from "../../img/icons/socialMedia/newPostIcon.png";
import favPlacesIcon from "../../img/icons/socialMedia/favPlacesIcon.png";
import { useLocation, useNavigate } from "react-router-dom";
import ProfilePhotoContainer from "./ProfilePhotoContainer";

function AppNavBar({ profilePhotoPath }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className={styles.app_nav_bar}>
            <ul>
                <li className={location.pathname === "/" ? styles.selected : undefined} onClick={() => navigate("/")}>
                    <img src={homeIcon} alt="Home"/>
                </li>

                <li onClick={() => navigate("/myProfile/newPost")}>
                    <img src={newPostIcon} alt="New"/>
                </li>
                
                <li className={location.pathname === "/favoritePlaces" ? styles.selected : undefined}>
                    <img src={favPlacesIcon} alt="Favorite Places"/>
                </li>
                
                <li 
                    className={`${styles.profile_photo} ${location.pathname === "/myProfile" ? styles.selected : undefined}`} 
                    onClick={() => {
                        navigate("/myProfile");
                        window.location.reload();
                    }}
                >
                    <ProfilePhotoContainer size="short" profilePhotoPath={profilePhotoPath}/>
                </li>
            </ul>
        </nav>
    );
}

export default AppNavBar;