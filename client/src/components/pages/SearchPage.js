import { useNavigate, useSearchParams } from "react-router-dom";
import SearchNavBar from "../layout/SearchNavBar";
import SearchInput from "../layout/SearchInput";
import styles from "./SearchPage.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import ProfileNavBar from "../layout/ProfileNavBar";
import AppNavBar from "../layout/AppNavBar";
import PostsInSection from "../layout/PostsInSection";
import SearchResultsContainer from "../layout/SearchResultsContainer";
import formatNumber from "../../utils/NumberFormatter";

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const text = searchParams.get('text') || "";
    const type = searchParams.get('type') || "all";

    const [result, setResult] = useState({});
    const [resultToShow, setResultToShow] = useState({results: [], notFoundText: ""});
    const [searchText, setSearchText] = useState("");
    const [profilesOffset, setProfilesOffset] = useState(0);
    const [postsOffset, setPostsOffset] = useState(0);
    const [postsLoading, setPostsLoading] = useState(false);
    const [profilesLoading, setProfilesLoading] = useState(false);

    const navigate = useNavigate();

    const loadPosts = useCallback(async () => {
        if (postsLoading || (result?.posts && result?.posts?.length % 25 !== 0)) return;

        setPostsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/search/posts/${text}?offset=${postsOffset}`);
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                setResult({...result, posts: {...result.posts, results: [...(result.posts.results || []), ...data]}});

                setPostsOffset((prevOffset) => prevOffset + 25);   
            }   
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setPostsLoading(false);
        }
    }, [navigate, postsLoading, postsOffset, result, text]);

    const loadProfiles = useCallback(async () => {
        if (profilesLoading || (result?.profiles && result?.profiles?.length % 10 !== 0)) return;

        setProfilesLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/search/profiles/${text}?offset=${profilesOffset}&limit=${10}`);
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                setResult({...result, profiles: {...result.profiles, results: [...result.profiles.results, ...data]}});

                setProfilesOffset((prevOffset) => prevOffset + 10);   
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setProfilesLoading(false);
        }
    }, [navigate, profilesLoading, profilesOffset, result, text]);
    
    const fetchSearchResult = useCallback(async () => {
        try {
            const resp = await axios.get(`http://localhost:5000/search/${text}`);
            const data = resp.data;
            
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                setResult({
                    ...result,
                    hashtags: {results: data.hashtags, notFoundText: "Nenhuma hashtag encontrada."},
                    profiles: {results: data.profiles, notFoundText: "Nenhum perfil encontrado."},
                    sports: {results: data.sports, notFoundText: "Nenhum esporte encontrado."},
                    posts: {results: data.posts, notFoundText: "Nenhuma postagem encontrada."},
                });

                setPostsOffset(prevOffset => prevOffset + 25);
                setProfilesOffset(prevOffset => prevOffset + 10);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, text]);

    useEffect(() => {
        setSearchText(text);
    }, [text]);

    useEffect(() => {
        setResultToShow(result[type]);
    }, [result, type]);

    useEffect(() => {
        fetchSearchResult();
    }, [fetchSearchResult])

    function handleOnChangeSearch(e) {
        e.target.value = e.target.value.replace(/\s/g, "");

        setSearchText(e.target.value);
    }

    function handleSubmitSearch(e) {
        e.preventDefault(); 

        setSearchParams({text: searchText || "", type: type || "all"});
    }

    const timeoutIdRef = useRef(null);

    const handleScroll = useCallback((loadFunction) => {
        if (timeoutIdRef.current) return;

        timeoutIdRef.current = setTimeout(() => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
                loadFunction();
            }

            timeoutIdRef.current = null;
        }, 1000);
    }, []);

    useEffect(() => {
        if (type === "posts") {
            const handleScrollPosts = () => handleScroll(loadPosts);

            window.addEventListener("scroll", handleScrollPosts);
            
            return () => window.removeEventListener("scroll", handleScrollPosts);
        }
    }, [type, loadPosts, handleScroll]);

    useEffect(() => {
        if (type === "profiles") {
            const handleScrollProfiles = () => handleScroll(loadProfiles);

            window.addEventListener("scroll", handleScrollProfiles);
            
            return () => window.removeEventListener("scroll", handleScrollProfiles);
        }
    }, [type, loadProfiles, handleScroll]);

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
                    {resultToShow?.results?.length &&
                        <p className={styles.results_number}>{`${formatNumber(resultToShow?.results?.length)} resultado${resultToShow?.results?.length === 1 ? "" : "s"}:`}</p>
                    }
                
                    {type === "posts" ? (
                        <div className={styles.posts}>
                            <PostsInSection 
                                posts={result.posts?.results} 
                                notFoundText={result.posts?.notFoundText}
                                postsLoading={postsLoading}
                            />
                        </div>
                    ) : type === "hashtags" || type === "sports" || type === "profiles" ? (
                        <SearchResultsContainer 
                            results={resultToShow?.results} 
                            resultType={type} 
                            notFoundText={resultToShow?.notFoundText} 
                            tagsLoading={profilesLoading}
                        />
                    ) : null}
                </section>
            </main>

            <AppNavBar/>
        </>
    );
}

export default SearchPage;