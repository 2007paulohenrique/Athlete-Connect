import styles from "./ProfileNavBar.module.css";
import settingsIcon from "../../img/icons/socialMedia/settingsIcon.png";
import searchIcon from "../../img/icons/socialMedia/searchIcon.png";
import notificationsIcon from "../../img/icons/socialMedia/notificationsIcon.png";
import sharingIcon from "../../img/icons/socialMedia/sharingIcon.png";
import logo from "../../img/logo/logoNBG.png";
import { useState } from "react";
import SearchInput from "./SearchInput";
import { useNavigate } from "react-router-dom";

function ProfileNavBar() {
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");

    const navigate = useNavigate();

    function handleOnChangeSearch(e) {
        e.target.value = e.target.value.trim();

        setSearchText(e.target.value);
    }

    function handleOnSubmitSearch(e) {
        e.preventDefault()

        navigate(`/search?text=${searchText}&type=all`);
    }

    function handleClickSearch() {
        setShowSearch(!showSearch);
        setSearchText("");
    }

    return (
        <nav className={styles.profile_nav_bar}>
            <ul>
                <div>
                    <li>
                        <img src={settingsIcon} alt="Settings"/>
                    </li>

                    <li className={styles.search}>
                        <img src={searchIcon} alt="Search" onClick={handleClickSearch}/>

                        {showSearch && (
                            <form onSubmit={handleOnSubmitSearch}>
                                <SearchInput 
                                    name="search" 
                                    placeholder="Insira o texto da pesquisa" 
                                    handleChange={handleOnChangeSearch}
                                    maxLength={50}
                                    haveSubmit
                                    value={searchText}
                                />
                            </form>
                        )}
                    </li>
                </div>
                
                <li onClick={() => navigate("/")}>
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