import { useEffect, useState } from "react";
import styles from "./Post.module.css";
import likedIcon from "../../img/icons/socialMedia/likedIcon.png";
import likeIcon from "../../img/icons/socialMedia/likeIcon.png";
import commentIcon from "../../img/icons/socialMedia/commentIcon.png";
import shareIcon from "../../img/icons/socialMedia/shareIcon.png";
import complaintIcon from "../../img/icons/socialMedia/complaintedIcon.png";
import tagsIcon from "../../img/icons/socialMedia/tagsIcon.png";
import hashtagsIcon from "../../img/icons/socialMedia/hashtagsIcon.png";
import ProfilePhotoContainer from "./ProfilePhotoContainer";
import axios from "axios"
import InputSearchField from "../layout/InputSearchField";

function Post({authorUserName, authorPhotoPath, moment, mediasPath=[], blobUrlsMedias=[], caption, isInCreating, setHashtagsInPost, hastagsInPost, likeAction, commentAction, shareAction, complaintAction, isLiked}) {
    const [medias, setMedias] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showHashtags, setShowHashtags] = useState(false);  
    const [selectedHashtags, setSelectedHashtags] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filteredHashtags, setFilteredHashtags] = useState([]);
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
            hashtag.nome.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredHashtags(filtered);
    }, [searchText, hashtags]);

    useEffect(() => {
        const date = new Date(moment);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        setFormattedMoment(`${day}/${month}/${year} ${hours}:${minutes}`);
    }, [moment]);

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    function viewHashtags() {
        setShowHashtags(!showHashtags);  
    }

    function viewTags() {
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
                    <span>
                        <ul>
                            <ProfilePhotoContainer profilePhotoPath={authorPhotoPath}/>
                        </ul>
                        {authorUserName}
                    </span>
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
                            <li><img src={isLiked ? likedIcon : likeIcon} alt="Like" onClick={!isInCreating && likeAction}/></li>
                            <li><img src={shareIcon} alt="Share" onClick={!isInCreating && shareAction}/></li>
                            <li><img src={commentIcon} alt="Comment" onClick={!isInCreating && commentAction}/></li>
                        </div>

                        <div>
                            <li>
                                <img src={tagsIcon} alt="Tags" onClick={viewTags}/>
                            </li>

                            <li>
                                <img src={hashtagsIcon} alt="Hashtags" onClick={viewHashtags}/>
                                {isInCreating && showHashtags ? (
                                    <div className={styles.actions_itens}>
                                        <InputSearchField 
                                            type="text" 
                                            name="hashtagsSearch"
                                            placeholder="Pesquisar hashtags..." 
                                            value={searchText}
                                            handleChange={handleSearchChange}
                                        />
                                        <ul>
                                            {filteredHashtags.map((hashtag, index) => (
                                                <li 
                                                    key={index} 
                                                    onClick={() => {
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
                                                    }}
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
                                            {hastagsInPost.map((hashtag, index) => (
                                                <li key={index}># {hashtag['nome']}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </li>
                        </div>
                        
                        <div>
                            <li><img src={complaintIcon} alt="Complaint" onClick={!isInCreating && complaintAction}/></li>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Post;
