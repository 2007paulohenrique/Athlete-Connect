import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
import PostsFullScreen from "../layout/PostsFullScreen";
import formatDate from "../../utils/DateFormatter";
import { useProfile } from "../../ProfileContext";
import Message from "../layout/Message";
import fetchSearchSugestions from "../../utils/profile/FetchSearchSugestions";

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const text = searchParams.get('text') || "";
    const type = searchParams.get('type') || "all";

    const [result, setResult] = useState({});
    const [postsResult, setPostsResult] = useState();
    const {profileId} = useProfile(); 
    const [resultToShow, setResultToShow] = useState({results: [], notFoundText: ""});
    const [searchText, setSearchText] = useState("");
    const [profilesOffset, setProfilesOffset] = useState(0);
    const [postsOffset, setPostsOffset] = useState(0);
    const [postsLoading, setPostsLoading] = useState(false);
    const [profilesLoading, setProfilesLoading] = useState(false);
    const [postsEnd, setPostsEnd] = useState();
    const [postsFullScreen, setPostsFullScreen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [message, setMessage] = useState({});
    const [searchSugestions, setSearchSugestions] = useState([]);

    const postsLimit = useRef(24);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const msg = location?.state

        if (msg) setMessageWithReset(msg.message, msg.type)
    }, [location]);

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    };

    const loadPosts = useCallback(async () => {
        if (postsLoading || postsEnd) return;

        setPostsLoading(true);

        try {
            const viwerId = profileId || localStorage.getItem("athleteConnectProfileId");

            const resp = await axios.get(`http://localhost:5000/search/posts/${text}?offset=${postsOffset}&limit=${postsLimit.current}&profileId=${viwerId}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset(`Não foi possível carregar as postagens da pesquisa.`, "error");

                throw new Error("Erro ao recuperar postagens da pesquisa");
            } else {
                if (data.length < postsLimit.current) {
                    setPostsEnd(true);
                }

                const formattedPosts = data.map(post => ({
                    ...post,
                    data_publicacao: formatDate(post.data_publicacao),
                    comments: post.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                }));

                setPostsResult(prevPosts => [...prevPosts, ...formattedPosts]);
                setPostsOffset(prevOffset => postsFullScreen ? prevOffset + 6 : prevOffset + 24);   
            }   
        } catch (err) {
            setMessageWithReset(`Não foi possível carregar as postagens da pesquisa.`, "error");
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setPostsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, postsLoading, postsOffset]);

    const loadProfiles = useCallback(async () => {
        if (profilesLoading || (result?.profiles && result?.profiles?.length % 10 !== 0)) return;

        setProfilesLoading(true);

        try {
            const viwerId = profileId || localStorage.getItem("athleteConnectProfileId");

            const resp = await axios.get(`http://localhost:5000/search/profiles/${text}?offset=${profilesOffset}&profileId=${viwerId}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset(`Não foi possível carregar os perfis da pesquisa.`, "error");

                throw new Error("Erro ao recuperar perfis da pesquisa");
            } else {
                setResult(prevResult => ({...prevResult, profiles: {...prevResult.profiles, results: [...prevResult.profiles.results, ...data]}}));

                setProfilesOffset(prevOffset => prevOffset + 10);   
            }
        } catch (err) {
            setMessageWithReset(`Não foi possível carregar os perfis da pesquisa.`, "error");
            
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setProfilesLoading(false);
        }
    }, [profileId, profilesLoading, profilesOffset, result?.profiles, text]);
    
    const fetchSearchResult = useCallback(async () => {
        if (!text) {
            setResult({
                hashtags: {results: [], notFoundText: "Nenhuma hashtag encontrada."},
                profiles: {results: [], notFoundText: "Nenhum perfil encontrado."},
                sports: {results: [], notFoundText: "Nenhum esporte encontrado."},
                posts: {notFoundText: "Nenhuma postagem encontrada."},
            });
            setPostsResult([]);
            setPostsOffset(0);
            setProfilesOffset(0);

            return;
        }
        
        try {
            const viwerId = profileId || localStorage.getItem("athleteConnectProfileId");

            const resp = await axios.get(`http://localhost:5000/search/${text}?profileId=${viwerId}`);
            const data = resp.data;
            
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});

                throw new Error("Erro ao recuperar resultados da pesquisa");
            } else {
                setResult(prevResult => ({
                    ...prevResult,
                    hashtags: {results: data.hashtags, notFoundText: "Nenhuma hashtag encontrada."},
                    profiles: {results: data.profiles, notFoundText: "Nenhum perfil encontrado."},
                    sports: {results: data.sports, notFoundText: "Nenhum esporte encontrado."},
                    posts: {notFoundText: "Nenhuma postagem encontrada."},
                }));

                const formattedPosts = data.posts.map(post => ({
                    ...post,
                    data_publicacao: formatDate(post.data_publicacao),
                    comments: post.comments.map(comment => ({
                        ...comment,
                        data_comentario: formatDate(comment.data_comentario)
                    }))
                }));

                fetchSearchSugestions(navigate, setSearchSugestions, profileId);
                
                setPostsResult(formattedPosts);
                setPostsOffset(24);
                setProfilesOffset(10);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);

            throw err;
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

    function handlePostClick(postId) {
        setSelectedPostId(postId)
        setPostsFullScreen(true);
        postsLimit.current = 6;
    }

    function exitFullscreen() {
        setPostsFullScreen(false);
        setSelectedPostId(null)
        postsLimit.current = 24;
    }

    useEffect(() => {
        setPostsFullScreen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname])

    useEffect(() => {        
        fetchSearchSugestions(navigate, setSearchSugestions, profileId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {!postsFullScreen ?
                <>
                    <ProfileNavBar/>

                    <main className={styles.search_page}>
                        {message && <Message message={message.message} type={message.type}/>}

                        <form onSubmit={handleSubmitSearch}>
                            <SearchInput 
                                name="search" 
                                handleChange={handleOnChangeSearch} 
                                maxLength={50} 
                                placeholder="Insira o texto da pesquisa" 
                                haveSubmit={true}
                                value={searchText}
                                sugestions={searchSugestions}
                            />
                        </form>

                        <span className={styles.search_text}>
                            Você pesquisou por:
                            <span> {text}</span>
                        </span>

                        <hr/>

                        <SearchNavBar selectedType={type}/>

                        <section className={styles.result}>
                            {((type !== "posts" && (resultToShow?.results && resultToShow?.results?.length !== 0)) || (type === "posts" && (postsResult && postsResult?.length !== 0))) &&
                                <p className={styles.results_number}>{`${formatNumber(type === "posts" ? postsResult?.length : resultToShow?.results?.length)} resultado${(type === "posts" ? postsResult?.length : resultToShow?.results?.length) === 1 ? "" : "s"}:`}</p>
                            } 
                        
                            {type === "posts" ? (
                                <div className={styles.posts}>
                                    <PostsInSection 
                                        posts={postsResult} 
                                        notFoundText={result.posts?.notFoundText}
                                        postsLoading={postsLoading}
                                        handlePostClick={(postId) => handlePostClick(postId)}
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
            :
                <PostsFullScreen 
                    posts={postsResult} 
                    setPosts={setPostsResult} 
                    postsLoading={postsLoading} 
                    initialPostToShow={selectedPostId} 
                    handleExitFullscreen={exitFullscreen}
                />
            }
        </>
    );
}

export default SearchPage;