import styles from "./PostsInSection.module.css";
import loading from "../../img/animations/loading.svg";
import { useEffect, useState } from "react";

function PostsInSection({ posts, notFoundText, postsLoading, handlePostClick }) {
    const [thumbnails, setThumbnails] = useState([]);
    
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
        if (posts) {
            const fetchThumbnails = async () => {
                const newThumbnails = await Promise.all(
                    posts.map(async (post) => {
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
    }, [posts]);

    return (
        <>
            {!posts && (
                <img className="loading" src={loading} alt="Loading"/>
            )}
            
            {posts ?
                posts.length !== 0 ? posts.map((post, index) => (
                    <div className={styles.post} key={post.id_postagem} onClick={() => handlePostClick(post.id_postagem)}>
                        <span>{post.medias.length > 1 ? `${post.medias.length - 1} +` : ""}</span>

                        <img 
                            src={thumbnails[index]} 
                            alt={`Post ${index}`} 
                        />
                    </div>
                )) : 
                    <p className={styles.not_found_text}>
                        {postsLoading ? 
                            <img className="loading" src={loading} alt="Loading"/>
                        :
                            notFoundText
                        }
                    </p>
            : null}
        </>
    );
}

export default PostsInSection;