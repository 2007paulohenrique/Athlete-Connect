import { useEffect, useState } from "react";
import styles from "./Post.module.css";
import likeIcon from "../../img/likeIcon.png";
import commentIcon from "../../img/commentIcon.png";
import shareIcon from "../../img/shareIcon.png";
import complaintIcon from "../../img/complaintIcon.png";
import tagsIcon from "../../img/tagsIcon.png";
import hashtagsIcon from "../../img/hashtagsIcon.png";

function Post({authorUserName, authorPhotoPath, moment, mediasPath, caption}) {
    const [medias, setMedias] = useState([]);

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

    function turnActionOn(e) {
        const action = e.target;
        
    }

    return (
        <div className={styles.post}>
            <div className={styles.first_post_container}>
                <div className={styles.post_info}>
                    <span>
                        <div className={styles.perfil_photo_container}>
                            <img src={authorPhotoPath} alt="Profile"/>
                        </div>
                        {authorUserName}
                    </span>

                    <span>{moment}</span>
                </div>

                <div className={styles.medias}>
                    {medias.map((media, index) => (
                        <div id={`media${index}`}>
                            <p>{`${index + 1}/${medias.length}`}</p>

                            {media.type === 'image' ? (
                                <img key={index} src={media.path} alt={`Media ${index + 1}`} />
                            ) : media.type === 'video' ? (
                                <>
                                    <p key={index}>{media.duration}</p>

                                    <video 
                                        key={index} 
                                        controls
                                        onLoadedMetadata={(e) => handleVideoLoad(index, e.target)}
                                    >
                                        <source src={media.path} type="video/mp4" />
                                        Seu navegador não suporta a tag de vídeo.
                                    </video>
                                </>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.second_post_container}>    
                <div className={styles.post_actions}>
                    <ul>
                        <div>
                            <li><img src={likeIcon} alt="Like" onClick={turnActionOn}/></li>
                            <li><img src={commentIcon} alt="Comment"/></li>
                            <li><img src={shareIcon} alt="Share" onClick={turnActionOn}/></li>
                        </div>

                        <div>
                            <li><img src={tagsIcon} alt="Tags"/></li>
                            <li><img src={hashtagsIcon} alt="Hashtags"/></li>
                        </div>

                        <li><img src={complaintIcon} alt="Complaint" onClick={turnActionOn}/></li>
                    </ul>
                </div>

                <div className={styles.caption}>
                    <p><span>{authorUserName}:</span> {caption}</p>
                </div>
            </div>
                
        </div>
    );
}

export default Post;