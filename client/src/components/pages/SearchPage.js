import { useNavigate, useSearchParams } from "react-router-dom";
import SearchNavBar from "../layout/SearchNavBar";
import SearchInput from "../layout/SearchInput";
import styles from "./SearchPage.module.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ProfileNavBar from "../layout/ProfileNavBar";
import AppNavBar from "../layout/AppNavBar";

function SearchPage() {
    const [searchParams] = useSearchParams();
    const text = searchParams.get('text') || "";
    const type = searchParams.get('type') || "all";

    const [postsResult, setPostsResult] = useState([]);
    const [profilesResult, setProfilesResult] = useState([]);
    const [hashtagsResult, setHashtagsResult] = useState([]);
    const [sportsResult, setSportsResult] = useState([]);
    const [noResult, setNoResult] = useState();
    const [searchText, setSearchText] = useState(text);

    const navigate = useNavigate();
    
    const fetchSearchResult = useCallback(async () => {
        setNoResult(false);

        try {
            const resp = await axios.get(`http://localhost:5000/search/${text}`);
            const data = resp.data;
            
            if (data.error) {
                if (resp.status === 404) {
                    setNoResult(true);
                } else {
                    // navigate("/errorPage", {state: {error: data.error}});
                }
            } else {
                setHashtagsResult(data.hashtags);
                setProfilesResult(data.profiles);
                setSportsResult(data.sports);
                setPostsResult(data.posts);
            }
        } catch (err) {
            // navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [text])

    useEffect(() => {
        fetchSearchResult();
    }, [fetchSearchResult])

    function handleOnChangeSearch(e) {
        e.target.value = e.target.value.trim();

        setSearchText(e.target.value);
    }

    function handleSubmitSearch(e) {
        e.preventDefault(); 

        navigate(`/search?text=${searchText}&type=${type}`);
    }

    return (
        <>
            <ProfileNavBar/>
            <main className={styles.search_page}>

                <form onSubmit={handleSubmitSearch}>
                    <SearchInput 
                        name="search" 
                        handleChange={handleOnChangeSearch} 
                        maxLength={50} 
                        placeholder="Insira o texto da pesquisa" 
                        haveSubmit={true}
                        value={searchText}
                    />
                </form>

                <span className={styles.search_text}>
                    Você pesquisou por:
                    <span> {text}</span>
                </span>

                <hr/>

                <SearchNavBar selectedType={type}/>

            </main>
            <AppNavBar/>
        </>
    );
}

export default SearchPage;