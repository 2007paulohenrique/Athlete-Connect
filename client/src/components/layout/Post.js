import { useEffect, useState } from "react";
import styles from "./Post.module.css";
import likedIcon from "../../img/icons/socialMedia/likedIcon.png";
import likeIcon from "../../img/icons/socialMedia/likeIcon.png";
import commentIcon from "../../img/icons/socialMedia/commentIcon.png";
import shareIcon from "../../img/icons/socialMedia/shareIcon.png";
import complaintIcon from "../../img/icons/socialMedia/complaintedIcon.png";
import tagsIcon from "../../img/icons/socialMedia/tagsIcon.png";
import hashtagsIcon from "../../img/icons/socialMedia/hashtagsIcon.png";
import axios from "axios"
import InputSearchField from "../layout/InputSearchField";
import ProfileSmallerContainer from "./ProfileSmallerContainer";

function Post({authorUserName, authorPhotoPath, moment, mediasPath=[], blobUrlsMedias=[], caption, isInCreating, setHashtagsInPost, setTagsInPost, postHashtags, postTags, likeAction, commentAction, shareAction, complaintAction, isLiked}) {
    const [medias, setMedias] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    const [showHashtags, setShowHashtags] = useState(false);  
    const [selectedHashtags, setSelectedHashtags] = useState([]);
    const [filteredHashtags, setFilteredHashtags] = useState([]);
    const [searchTextHashtag, setSearchTextHashtag] = useState("");
    const [tags, setTags] = useState([]);
    const [showTags, setShowTags] = useState(false);  
    const [selectedTags, setSelectedTags] = useState([]);
    const [filteredTags, setFilteredTags] = useState([]);
    const [searchTextTag, setSearchTextTag] = useState("");
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [formattedMoment, setFormattedMoment] = useState();

    useEffect(() => {
        if (!blobUrlsMedias || blobUrlsMedias.length === 0) {
            const newMedias = mediasPath.map((mediaPath) => {
                const isImage = /\.(jpg|jpeg|png|webp)$/i.test(mediaPath);
                const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
        
                return {
                    type: isImage ? 'image' : isVideo ? 'video' : 'unknown',
                    path: require(`../../img/${mediaPath}`),
                    duration: isVideo ? null : undefined,
                };
            });
    
            if (JSON.stringify(newMedias) !== JSON.stringify(medias)) {
                setMedias(newMedias);
            }
        } else {
            if (JSON.stringify(blobUrlsMedias) !== JSON.stringify(medias)) {
                setMedias(blobUrlsMedias);
            }
        }
    }, [blobUrlsMedias, medias, mediasPath]);

    useEffect(() => {
        if (blobUrlsMedias && blobUrlsMedias.length !== 0) {
            setCurrentMediaIndex(0);
        }
    }, [blobUrlsMedias]);

    useEffect(() => {
        axios.get("http://localhost:5000/hashtags")
        .then(resp => {
            setHashtags(resp.data);
            setFilteredHashtags(resp.data);
        })
        .catch(err => {
            console.error('Erro ao fazer a requisição:', err);
        });
    }, []);

    useEffect(() => {
        axios.get("http://localhost:5000/tags")
        .then(resp => {
            setTags(resp.data);
            setFilteredTags(resp.data);
            console.log(resp.data)
        })
        .catch(err => {
            console.error('Erro ao fazer a requisição:', err);
        });
    }, []);

    const handleVideoLoad = (index, videoElement) => {
        if (videoElement) {
            const duration = videoElement.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const newDuration =  `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

            setMedias((prevMedias) => {
                const newMedias = [...prevMedias];
                newMedias[index].duration = newDuration;
                return newMedias;
            });
        }
    };

    useEffect(() => {
        const filtered = hashtags.filter((hashtag) =>
            hashtag.nome.toLowerCase().includes(searchTextHashtag.toLowerCase())
        );
        setFilteredHashtags(filtered);
    }, [searchTextHashtag, hashtags]);
    
    useEffect(() => {
        const filtered = tags.filter((tag) =>
            tag.nome.toLowerCase().includes(searchTextTag.toLowerCase())
        );
        setFilteredTags(filtered);
        console.log("ff",filtered)
    }, [searchTextTag, tags]);
    
    useEffect(() => {
        const date = new Date(moment);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        setFormattedMoment(`${day}/${month}/${year} ${hours}:${minutes}`);
    }, [moment]);

    const handleSearchHashtagChange = (e) => {
        setSearchTextHashtag(e.target.value);
    };

    const handleSearchTagChange = (e) => {
        setSearchTextTag(e.target.value);
    };

    const handleClickHashtag = (hashtag) => {
        setHashtagsInPost(prevHashtags => {
            if (prevHashtags.includes(hashtag)) {
                return prevHashtags.filter(item => item !== hashtag);
            } else {
                return [...prevHashtags, hashtag];
            }
        });

        setSelectedHashtags(prevSelected => {
            if (prevSelected.includes(hashtag)) {
                return prevSelected.filter(item => item !== hashtag);
            } else {
                return [...prevSelected, hashtag];
            }
        });
    };

    const handleClickTag = (tag) => {
        setTagsInPost(prevTags => {
            if (prevTags.includes(tag)) {
                return prevTags.filter(item => item !== tag);
            } else {
                return [...prevTags, tag];
            }
        });

        setSelectedTags(prevSelected => {
            if (prevSelected.includes(tag)) {
                return prevSelected.filter(item => item !== tag);
            } else {
                return [...prevSelected, tag];
            }
        });
    };

    function viewHashtags() {
        setShowHashtags(!showHashtags);  
    }

    function viewTags() {
        setShowTags(!showTags);  
    }

    const slideToLeft = () => {
        setCurrentMediaIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : medias.length - 1));
    };

    const slideToRight = () => {
        setCurrentMediaIndex((prevIndex) => (prevIndex < medias.length - 1 ? prevIndex + 1 : 0));
    };

    return (
        <div className={styles.post}>
            <div className={styles.first_post_container}>
                <div className={styles.post_author_container}>
                    <ProfileSmallerContainer profilePhotoPath={authorPhotoPath} profileName={authorUserName}/>
                </div>

                <div className={styles.medias} id="medias">
                    {medias.length > 0 && (
                        <div id={`media${currentMediaIndex}`}>
                            <div className={styles.media_controls}>
                                {medias.length !== 1 && <p>{`${currentMediaIndex + 1}/${medias.length}`}</p>}
                                {medias[currentMediaIndex].duration && <p>{medias[currentMediaIndex].duration}</p>}
                            </div>

                            <div className={styles.slide_container}>
                                <div className={styles.slide_left} onClick={slideToLeft}></div>
                                <div className={styles.slide_right} onClick={slideToRight}></div>
                            </div>

                            {medias[currentMediaIndex].type === 'image' ? (
                                <img src={medias[currentMediaIndex].path} alt={`Media ${currentMediaIndex + 1}`} />
                            ) : medias[currentMediaIndex].type === 'video' ? (
                                <video 
                                    controls
                                    onLoadedMetadata={(e) => handleVideoLoad(currentMediaIndex, e.target)}
                                >
                                    <source src={medias[currentMediaIndex].path} type="video/mp4" />
                                    Seu navegador não suporta a tag de vídeo.
                                </video>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.container_divisor}></div>

            <div className={styles.second_post_container}>    
                <span className={styles.date}>{formattedMoment}</span>

                <div className={styles.caption}>
                    <p><span>{authorUserName}:</span> {caption}</p>
                </div>

                <div className={styles.post_actions}>
                    <ul>
                        <div>
                            <li><img src={isLiked ? likedIcon : likeIcon} alt="Like" onClick={!isInCreating ? likeAction : undefined}/></li>
                            <li><img src={shareIcon} alt="Share" onClick={!isInCreating ? shareAction : undefined}/></li>
                            <li><img src={commentIcon} alt="Comment" onClick={!isInCreating ? commentAction : undefined}/></li>
                        </div>

                        <div>
                            <li>
                                <img src={tagsIcon} alt="Tags" onClick={viewTags}/>
                                {isInCreating && showTags ? (
                                    <div className={styles.actions_itens}>
                                        <InputSearchField 
                                            type="text" 
                                            name="tagsSearch"
                                            placeholder="Pesquisar perfis..." 
                                            value={searchTextTag}
                                            handleChange={handleSearchTagChange}
                                        />
                                        <ul>
                                            {filteredTags.map((tag, index) => (
                                                <li 
                                                    key={index} 
                                                    onClick={() => handleClickTag(tag)}
                                                    className={selectedTags.includes(tag) ? styles.selectedHashtag : ""}
                                                >
                                                    <ProfileSmallerContainer profilePhotoPath={tag["caminho"]} profileName={tag["nome"]}/>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : !isInCreating && showTags ? (
                                    <div className={styles.actions_itens}>
                                        <ul>
                                            {postTags.length !== 0 ? postTags.map((tag, index) => (
                                                <li key={index}><ProfileSmallerContainer profilePhotoPath={tag["caminho"]} profileName={tag["nome"]}/></li>
                                            )) : (
                                                <p>Sem marcações</p>
                                            )}
                                        </ul>
                                    </div>
                                ) : null}
                            </li>

                            <li>
                                <img src={hashtagsIcon} alt="Hashtags" onClick={viewHashtags}/>
                                {isInCreating && showHashtags ? (
                                    <div className={styles.actions_itens}>
                                        <InputSearchField 
                                            type="text" 
                                            name="hashtagsSearch"
                                            placeholder="Pesquisar hashtags..." 
                                            value={searchTextHashtag}
                                            handleChange={handleSearchHashtagChange}
                                        />
                                        <ul>
                                            {filteredHashtags.map((hashtag, index) => (
                                                <li 
                                                    key={index} 
                                                    onClick={() => handleClickHashtag(hashtag)}
                                                    className={selectedHashtags.includes(hashtag) ? styles.selectedHashtag : ""}
                                                >
                                                    # {hashtag['nome']}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : !isInCreating && showHashtags ? (
                                    <div className={styles.actions_itens}>
                                        <ul>
                                            {postHashtags.length !== 0 ? postHashtags.map((hashtag, index) => (
                                                <li key={index}># {hashtag['nome']}</li>
                                            )) : (
                                                <p>Sem hashtags</p>
                                            )}
                                        </ul>
                                    </div>
                                ) : null}
                            </li>
                        </div>
                        
                        <div>
                            <li><img src={complaintIcon} alt="Complaint" onClick={!isInCreating ? complaintAction : undefined}/></li>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Post;
