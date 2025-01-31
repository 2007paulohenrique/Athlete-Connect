import PostsInSection from "../../layout/PostsInSection";
import styles from "./Configs.module.css";

function History({ posts = {}, postsToShowType, setPostsToShowType, likedPostsLoading = false, commentedPostsLoading = false, sharedPostsLoading = false, handlePostClick }) {
    return (
        <ul className={styles.config_items}>
            <li>
                <button onClick={() => setPostsToShowType("liked")}>
                    Postagens curtidas
                </button>

                <button onClick={() => setPostsToShowType("shared")}>
                    Postagens compartilhadas
                </button>

                <button onClick={() => setPostsToShowType("commented")}>
                    Postagens comentadas
                </button>

                <section>
                    <PostsInSection 
                        posts={posts[postsToShowType]} 
                        notFoundText={`Você ainda não ${postsToShowType === "liked" ? "curtiu" : postsToShowType === "commented" ? "comentou" : "compartilhou"} nenhuma postagem.`}
                        handlePostClick={(postId) => handlePostClick(postId)}
                        postsLoading={postsToShowType === "liked" ? likedPostsLoading : postsToShowType === "commented" ? commentedPostsLoading : sharedPostsLoading}
                    />
                </section>
            </li>
        </ul>
    )
}

export default History;