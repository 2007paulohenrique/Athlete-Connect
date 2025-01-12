import styles from "./PostsInSection.module.css";
import loading from "../../img/animations/loading.svg";

function PostsInSection({ posts, thumbnails, notFoundText }) {
    return (
        <>
            {!posts && (
                <img className="loading" src={loading} alt="Loading"/>
            )}
            
            {posts ?
                posts.length !== 0 ? posts.map((post, index) => (
                    <div className={styles.post} key={index}>
                        <span>{post.medias.length > 1 ? `${post.medias.length - 1} +` : ""}</span>

                        <img 
                            src={thumbnails[index]} 
                            alt={`Post ${index}`} 
                        />
                    </div>
                )) : <p className={styles.not_found_text}>{notFoundText}</p>
            : null}
        </>
    );
}

export default PostsInSection;