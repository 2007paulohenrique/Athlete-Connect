import { useNavigate, useSearchParams } from "react-router-dom";
import SearchNavBar from "../layout/SearchNavBar";
import SearchInput from "../layout/SearchInput";
import styles from "./SearchPage.module.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ProfileNavBar from "../layout/ProfileNavBar";
import AppNavBar from "../layout/AppNavBar";
import PostsInSection from "../layout/PostsInSection";
import SearchResultsContainer from "../layout/SearchResultsContainer";

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const text = searchParams.get('text') || "";
    const type = searchParams.get('type') || "all";

    const [postsResult, setPostsResult] = useState();
    const [profilesResult, setProfilesResult] = useState();
    const [hashtagsResult, setHashtagsResult] = useState();
    const [sportsResult, setSportsResult] = useState();
    const [searchText, setSearchText] = useState("");

    const navigate = useNavigate();
    
    const fetchSearchResult = useCallback(async () => {
        try {
            const resp = await axios.get(`http://localhost:5000/search/${text}`);
            const data = resp.data;
            
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                setHashtagsResult(data.hashtags);
                setProfilesResult(data.profiles);
                setSportsResult(data.sports);
                setPostsResult(data.posts);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [navigate, text])

    useEffect(() => {
        setSearchText(text);
    }, [text]);

    useEffect(() => {
        fetchSearchResult();
    }, [fetchSearchResult])

    function handleOnChangeSearch(e) {
        e.target.value = e.target.value.replace(/\s/g, "");

        setSearchText(e.target.value);
    }

    function handleSubmitSearch(e) {
        e.preventDefault(); 

        setSearchParams({text: searchText, type: type})
    }

    const resultsMap = {
        hashtags: {results: hashtagsResult, notFoundText: "Nenhuma hashtag encontrada."},
        profiles: {results: profilesResult, notFoundText: "Nenhum perfil encontrado."},
        sports: {results: sportsResult, notFoundText: "Nenhum esporte encontrado."},
        posts: {results: postsResult, notFoundText: "Nenhuma postagem encontrada."},
    };
    
    const { results, notFoundText } = resultsMap[type] || {results: [], notFoundText: ""};
    const resultCount = type === "all" ? 
        resultsMap.hashtags.results?.length + 
        resultsMap.profiles.results?.length + 
        resultsMap.sports.results?.length + 
        resultsMap.posts.results?.length : 
        results.length;

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

                <section className={styles.result}>
                    {resultCount > 0 && <p className={styles.results_number}>{`${resultCount} resultado${resultCount === 1 ? "" : "s"}:`}</p>}
                    
                    {type === "all" ? (
                        <>
                            {(hashtagsResult?.length === 0 && postsResult.length === 0 && profilesResult.length === 0 && sportsResult.length === 0) && (
                                <p>Nada foi encontrado.</p>
                            )}

                            {hashtagsResult?.length !== 0 && (
                                <>
                                    <div className={styles.hashtags}>
                                        <SearchResultsContainer 
                                            results={hashtagsResult} 
                                            resultType="hashtags" 
                                        />
                                    </div>

                                    {hashtagsResult && postsResult.length !== 0 && <hr/>}
                                </>
                            )}

                            {postsResult?.length !== 0 && (
                                <>
                                    <div className={styles.posts}>
                                        <PostsInSection 
                                            posts={postsResult} 
                                        />
                                    </div>

                                    {postsResult && profilesResult.length !== 0 && <hr/>}
                                </>
                            )}

                            {profilesResult?.length !== 0 && (
                                <>
                                    <div className={styles.profiles}>
                                        <SearchResultsContainer 
                                            results={profilesResult} 
                                            resultType="profiles"
                                        />
                                    </div>

                                    {profilesResult && sportsResult.length !== 0 && <hr/>}
                                </>
                            )}

                            {sportsResult?.length !== 0 && (
                                <div className={styles.sports}>
                                    <SearchResultsContainer
                                        results={sportsResult}
                                        resultType="sports"
                                    />
                                </div>
                            )}
                        </>
                    ) : type === "posts" ? (
                        <div className={styles.posts}>
                            <PostsInSection 
                                posts={results} 
                                notFoundText={notFoundText}
                            />
                        </div>
                    ) : type === "hashtags" || type === "sports" || type === "profiles" ? (
                        <SearchResultsContainer 
                            results={results} 
                            resultType={type} 
                            notFoundText={notFoundText} 
                        />
                    ) : null}
                </section>
            </main>

            <AppNavBar/>
        </>
    );
}

export default SearchPage;