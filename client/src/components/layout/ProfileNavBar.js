import styles from "./ProfileNavBar.module.css";
import settingsIcon from "../../img/icons/socialMedia/settingsIcon.png";
import searchIcon from "../../img/icons/socialMedia/searchIcon.png";
import notificationsIcon from "../../img/icons/socialMedia/notificationsIcon.png";
import sharingIcon from "../../img/icons/socialMedia/sharingIcon.png";
import logo from "../../img/logo/logoNBG.png";

function ProfileNavBar() {
    return (
        <nav className={styles.profile_nav_bar}>
            <ul>
                <div>
                    <li>
                        <img src={settingsIcon} alt="Settings"/>
                    </li>

                    <li>
                        <img src={searchIcon} alt="Search"/>
                    </li>
                </div>
                
                <li>
                    <img src={logo} alt="Home"/>
                </li>

                <div>
                    <li>
                        <img src={notificationsIcon} alt="Notifications"/>
                    </li>
                    
                    <li>
                        <img src={sharingIcon} alt="Sharing"/>
                    </li>
                </div>
            </ul>
        </nav>
    );
}

export default ProfileNavBar;