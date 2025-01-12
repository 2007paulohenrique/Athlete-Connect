import { useNavigate, useSearchParams } from "react-router-dom";
import SearchNavBar from "../layout/SearchNavBar";
import SearchInput from "../layout/SearchInput";
import styles from "./SearchPage.module.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ProfileNavBar from "../layout/ProfileNavBar";
import AppNavBar from "../layout/AppNavBar";
import { useProfile } from "../../ProfileContext";
import PostsInSection from "../layout/PostsInSection";
import SearchResultsContainer from "../layout/SearchResultsContainer";

function SearchPage() {
    const [searchParams] = useSearchParams();
    const text = searchParams.get('text') || "";
    const type = searchParams.get('type') || "all";

    const [thumbnails, setThumbnails] = useState([]);
    const [postsResult, setPostsResult] = useState();
    const [profilesResult, setProfilesResult] = useState();
    const [hashtagsResult, setHashtagsResult] = useState();
    const [sportsResult, setSportsResult] = useState();
    const [searchText, setSearchText] = useState(text);
    const { profileId }  = useProfile();

    const navigate = useNavigate();
    
    const fetchSearchResult = useCallback(async () => {
        try {
            const resp = await axios.get(`http://localhost:5000/search/${text}`);
            const data = resp.data;
            
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

                setHashtagsResult(data.hashtags);
                setProfilesResult(data.profiles.filter(profile => profile.id_perfil !== Number(confirmedProfileId)));
                setSportsResult(data.sports);
                setPostsResult(data.posts.filter(post => post.fk_perfil_id_perfil !== Number(confirmedProfileId)));
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [navigate, profileId, text])

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

    const generateVideoThumbnail = (videoPath) => {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            video.src = videoPath;

            video.addEventListener("loadeddata", () => {
                const canvas = document.createElement("canvas");

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const context = canvas.getContext("2d");

                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const thumbnailURL = canvas.toDataURL("image/png");

                resolve(thumbnailURL);
            });
        });
    };

    useEffect(() => {
        if (postsResult) {
            const fetchThumbnails = async () => {
                const newThumbnails = await Promise.all(
                    postsResult.map(async (post) => {
                        if (post.medias[0].tipo === "video") {
                            return await generateVideoThumbnail(post.medias[0].caminho);
                        } else {
                            return require(`../../img/${post.medias[0].caminho}`)
                        }    
                    })
                );
    
                setThumbnails(newThumbnails);
            };
    
            fetchThumbnails();
        }
    }, [postsResult]);

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
                    {type === "hashtags" ? (
                        <SearchResultsContainer 
                            results={hashtagsResult} 
                            resultType="hashtags" 
                            notFoundText="Nenhuma hashtag encontrada."
                        />
                    ) :  type === "profiles" ? (
                        <SearchResultsContainer 
                            results={profilesResult} 
                            resultType="profiles"
                            notFoundText="Nenhum perfil encontrado."
                        />
                    ) : type === "sports" ? (
                        <SearchResultsContainer
                            results={sportsResult}
                            resultType="sports"
                            notFoundText="Nenhum esporte encontrado."
                        />
                    ) : type === "posts" ? (
                        <PostsInSection 
                            posts={postsResult} 
                            thumbnails={thumbnails} 
                            notFoundText="Nenhuma postagem encontrada."
                        />
                    ) : type === "all" ? (
                        <>
                            <div>
                                <SearchResultsContainer 
                                    results={hashtagsResult} 
                                    resultType="hashtags" 
                                />
                            </div>

                            <div>
                                <PostsInSection 
                                    posts={postsResult} 
                                    thumbnails={thumbnails} 
                                />
                            </div>

                            <div>
                                <SearchResultsContainer 
                                    results={profilesResult} 
                                    resultType="profiles"
                                />
                            </div>

                            <div>
                                <SearchResultsContainer
                                    results={sportsResult}
                                    resultType="sports"
                                />
                            </div>
                        </>
                    ) : null}
                </section>
            </main>

            <AppNavBar/>
        </>
    );
}

export default SearchPage;