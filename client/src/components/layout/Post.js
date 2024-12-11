import { useEffect, useState } from "react";
import styles from "./Post.module.css";
import likeIcon from "../../img/icons/socialMedia/likedIcon.png";
import commentIcon from "../../img/icons/socialMedia/commentIcon.png";
import shareIcon from "../../img/icons/socialMedia/sharedIcon.png";
import complaintIcon from "../../img/icons/socialMedia/complaintedIcon.png";
import tagsIcon from "../../img/icons/socialMedia/tagsIcon.png";
import hashtagsIcon from "../../img/icons/socialMedia/hashtagsIcon.png";
import ProfilePhotoContainer from "./ProfilePhotoContainer";

function Post({authorUserName, authorPhotoPath, moment, mediasPath, blobUrlsMedias, caption}) {
    const [medias, setMedias] = useState([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    useEffect(() => {
        if (!blobUrlsMedias) {
            const newMedias = mediasPath.map((mediaPath) => {
                const isImage = /\.(jpg|jpeg|png|webp)$/i.test(mediaPath);
                const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
        
                return {
                    type: isImage ? 'image' : isVideo ? 'video' : 'unknown',
                    path: mediaPath,
                    duration: isVideo ? null : undefined,
                };
            });
    
            setMedias(newMedias);
        } else {
            setMedias(blobUrlsMedias);
        }
    }, [blobUrlsMedias, mediasPath]);

    useEffect(() => {
        setCurrentMediaIndex(0);
    }, [blobUrlsMedias]);

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

    function likeAction() {
        
    }

    function shareAction() {
        
    }

    function commentAction() {
        
    }

    function viewTags() {
        
    }

    function viewHashtags() {
        
    }

    function complaintAction() {
        
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
                                <p>{`${currentMediaIndex + 1}/${medias.length}`}</p>
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
                <span className={styles.date}>{moment}</span>

                <div className={styles.caption}>
                    <p><span>{authorUserName}:</span> {caption}</p>
                </div>

                <div className={styles.post_actions}>
                    <ul>
                        <div>
                            <li><img src={likeIcon} alt="Like" onClick={likeAction}/></li>
                            <li><img src={shareIcon} alt="Share" onClick={shareAction}/></li>
                            <li><img src={commentIcon} alt="Comment" onClick={commentAction}/></li>
                        </div>

                        <div>
                            <li><img src={tagsIcon} alt="Tags" onClick={viewTags}/></li>
                            <li><img src={hashtagsIcon} alt="Hashtags" onClick={viewHashtags}/></li>
                        </div>

                        <li><img src={complaintIcon} alt="Complaint" onClick={complaintAction}/></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Post;
