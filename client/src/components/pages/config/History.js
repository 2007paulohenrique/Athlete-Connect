import PostsInSection from "../../layout/PostsInSection";
import styles from "./Configs.module.css";

function History({ posts = {}, postsToShowType, setPostsToShowType, likedPostsLoading = false, commentedPostsLoading = false, sharedPostsLoading = false, handlePostClick }) {
    return (
        <div className={styles.config_items}>
            <ul className={styles.about_themes}>
                <li className={postsToShowType === "liked" ? styles.selected_about_theme : undefined} onClick={() => setPostsToShowType("liked")}>
                    Postagens curtidas
                </li>

                <li className={postsToShowType === "shared" ? styles.selected_about_theme : undefined} onClick={() => setPostsToShowType("shared")}>
                    Postagens compartilhadas
                </li>

                <li className={postsToShowType === "commented" ? styles.selected_about_theme : undefined} onClick={() => setPostsToShowType("commented")}>
                    Postagens comentadas
                </li>
            </ul>

            <h3>  
                {`Postagens ${postsToShowType === "liked" ? "curtidas" : postsToShowType === "shared" ? "compartilhadas" : "comentadas"}`}
            </h3>

            <section className={styles.posts_history}>
                <PostsInSection 
                    posts={posts[postsToShowType]} 
                    notFoundText={`Você ainda não ${postsToShowType === "liked" ? "curtiu" : postsToShowType === "commented" ? "comentou" : "compartilhou"} nenhuma postagem.`}
                    handlePostClick={(postId) => handlePostClick(postId)}
                    postsLoading={postsToShowType === "liked" ? likedPostsLoading : postsToShowType === "commented" ? commentedPostsLoading : sharedPostsLoading}
                />
            </section>
        </div>
    )
}

export default History;