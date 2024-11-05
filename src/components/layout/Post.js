import { useEffect, useState } from "react";
import styles from "./Post.module.css";
import likeIcon from "../../img/likedIcon.png";
import commentIcon from "../../img/commentIcon.png";
import shareIcon from "../../img/sharedIcon.png";
import complaintIcon from "../../img/complaintedIcon.png";
import tagsIcon from "../../img/tagsIcon.png";
import hashtagsIcon from "../../img/hashtagsIcon.png";

function Post({authorUserName, authorPhotoPath, moment, mediasPath, caption}) {
    const [medias, setMedias] = useState([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    useEffect(() => {
        setMedias(mediasPath.map((mediaPath) => {
            const isImage = /\.(jpg|jpeg|png|webp)$/i.test(mediaPath);
            const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);

            return {
                type: isImage ? 'image' : isVideo ? 'video' : 'unknown',
                path: mediaPath,
                duration: isVideo ? null : undefined,
            };
        }));
    }, [mediasPath]);

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

    const turnActionOn = (e) => {
        // const action = e.target;
    };

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
                        <div className={styles.perfil_photo_container}>
                            <img src={authorPhotoPath} alt="Profile"/>
                        </div>
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
                            <li><img src={likeIcon} alt="Like" onClick={turnActionOn}/></li>
                            <li><img src={shareIcon} alt="Share" onClick={turnActionOn}/></li>
                            <li><img src={commentIcon} alt="Comment"/></li>
                        </div>

                        <div>
                            <li><img src={tagsIcon} alt="Tags"/></li>
                            <li><img src={hashtagsIcon} alt="Hashtags"/></li>
                        </div>

                        <li><img src={complaintIcon} alt="Complaint" onClick={turnActionOn}/></li>
                    </ul>
                </div>
            </div>
                
        </div>
    );
}

export default Post;
