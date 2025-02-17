import styles from "./PostsInSection.module.css";
import loading from "../../img/animations/loading.svg";
import { useEffect, useState } from "react";
import generateVideoThumbnail from "../../utils/post/GenerateVideoThumbnail";

function PostsInSection({ posts, notFoundText, postsLoading, handlePostClick }) {
    const [thumbnails, setThumbnails] = useState([]);

    useEffect(() => {
        if (posts) {
            const fetchThumbnails = async () => {
                const newThumbnails = await Promise.all(
                    posts.map(async (post) => {
                        if (post.medias[0].tipo === "video") {
                            return await generateVideoThumbnail(post.medias[0].caminho);
                        } else {
                            return post.medias[0].caminho
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
                    <div className={`${styles.post} ${post.isComplainted ? styles.complainted_post : undefined}`} key={post.id_postagem} onClick={() => handlePostClick(post.id_postagem)}>
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