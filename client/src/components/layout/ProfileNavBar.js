import styles from "./ProfileNavBar.module.css";
import settingsIcon from "../../img/icons/socialMedia/settingsIcon.png";
import searchIcon from "../../img/icons/socialMedia/searchIcon.png";
import notificationsIcon from "../../img/icons/socialMedia/notificationsIcon.png";
import sharingIcon from "../../img/icons/socialMedia/sharingIcon.png";
import logo from "../../img/logo/logoNBG.png";
import { useEffect, useState } from "react";
import SearchInput from "./SearchInput";
import { useNavigate } from "react-router-dom";
import { useProfile } from '../../ProfileContext';
import fetchSearchSugestions from "../../utils/profile/FetchSearchSugestions";

function ProfileNavBar({ setMessage, permission = false }) {
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchSugestions, setSearchSugestions] = useState([]);
    const {profileId} = useProfile();

    const navigate = useNavigate();

    function handleOnChangeSearch(e) {
        e.target.value = e.target.value.trim();

        setSearchText(e.target.value);
    }

    function handleOnSubmitSearch(e) {
        e.preventDefault()

        navigate(`/search?text=${searchText}&type=posts`);
    }

    function handleClickSearch() {
        setShowSearch(!showSearch);
        setSearchText("");
    }

    useEffect(() => {        
        fetchSearchSugestions(navigate, setSearchSugestions, profileId, setMessage, permission);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permission]);

    return (
        <nav className={styles.profile_nav_bar}>
            <ul>
                <div>
                    <li onClick={() => navigate("/myProfile/config")}>
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
                                    sugestions={searchSugestions}
                                />
                            </form>
                        )}
                    </li>
                </div>
                
                <li onClick={() => navigate("/")}>
                    <img src={logo} alt="Home"/>
                </li>

                <div>
                    <li onClick={() => navigate("/myProfile/notifications")}>
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