import styles from "./ProfileNavBar.module.css";
import settingsIcon from "../../img/icons/socialMedia/settingsIcon.png";
import searchIcon from "../../img/icons/socialMedia/searchIcon.png";
import notificationsIcon from "../../img/icons/socialMedia/notificationsIcon.png";
import sharingIcon from "../../img/icons/socialMedia/sharingIcon.png";
import logo from "../../img/logo/logoNBG.png";
import { useCallback, useEffect, useState } from "react";
import SearchInput from "./SearchInput";
import { useNavigate } from "react-router-dom";
import { useProfile } from '../../ProfileContext';
import axios from "axios";

function ProfileNavBar() {
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

    const fetchSearchSugestions = useCallback(async (id) => {
        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/search/sugestions`);
            const data = resp.data;
            
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                setSearchSugestions(data);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [navigate]);

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
        
        fetchSearchSugestions(confirmedProfileId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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