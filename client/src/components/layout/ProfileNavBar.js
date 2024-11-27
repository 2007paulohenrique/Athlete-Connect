import styles from "./ProfileNavBar.module.css";
import settingsIcon from "../../img/settingsIcon.png";
import searchIcon from "../../img/searchIcon.png";
import notificationsIcon from "../../img/notificationsIcon.png";
import sharingIcon from "../../img/sharingIcon.png";
import logo from "../../img/logoNBG.png";

function ProfileNavBar() {
    return (
        <nav className={styles.profile_nav_bar}>
            <ul>
                <div className={styles.profile_nav_bar_sub_container}>
                    <li><img src={settingsIcon} alt="Settings"/></li>
                    <li><img src={searchIcon} alt="Search"/></li>
                </div>
                
                <li><img src={logo} alt="Home"/></li>

                <div className={styles.profile_nav_bar_sub_container}>
                    <li><img src={notificationsIcon} alt="Notifications"/></li>
                    <li><img src={sharingIcon} alt="Sharing"/></li>
                </div>
            </ul>
        </nav>
    );
}

export default ProfileNavBar;