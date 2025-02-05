import axios from "axios";

export default async function toggleLike(profileId, post, navigate, setPosts, setMessage) {
    try {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        const formData = new FormData();

        formData.append("profileId", confirmedProfileId);

        const resp = await axios.post(`http://localhost:5000/posts/${post.id_postagem}/like`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        const data = resp.data;

        if (data.error) {
            navigate("/errorPage", {state: {error: data.error}});

            throw new Error("Erro ao curtir postagem");
        } else {
            setPosts(prevPosts =>
                prevPosts.map(p => p.id_postagem === post.id_postagem ? {
                    ...p, 
                    isLiked: !p.isLiked, 
                    total_curtidas:  p.isLiked ? p.total_curtidas - 1 : p.total_curtidas + 1
                } : p)
            );
        }
    } catch (err) {
        setMessage("Não foi possível curtir a postagem", "error");

        console.error("Erro ao fazer a requisição:", err);
    }
}