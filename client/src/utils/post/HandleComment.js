import axios from "axios";
import formatDate from "../DateFormatter";

export default async function createComment(respCommentId, profileId, post, commentText, navigate, setPosts, setMessage) {
    try {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        const formData = new FormData();

        formData.append("text", commentText.trim());
        formData.append("authorId", confirmedProfileId);
        if (respCommentId) {
            formData.append("respCommentId", respCommentId);
        }

        const resp = await axios.post(`http://localhost:5000/posts/${post.id_postagem}/comment`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        const data = resp.data;

        if (data.error) {
            navigate("/errorPage", {state: {error: data.error}});

            throw new Error("Erro ao comentar");
        } else {
            const newComment = data.newComment;

            setPosts(prevPosts =>
                prevPosts.map(p => p.id_postagem === post.id_postagem ? { 
                    ...p, 
                    comments: [...p.comments, {...newComment, data_comentario: formatDate(newComment.data_comentario)}],
                    total_comentarios: p.total_comentarios + 1
                } : p)
            );
        }
    } catch (err) {
        setMessage("Não foi possível comentar na postagem.", "error");

        console.error("Erro ao fazer a requisição:", err);
    }
}