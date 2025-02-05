import axios from "axios";

export default async function createComplaint(profileId, post, postComplaintReasons, complaintDescription, navigate, setPosts, setMessage) {
    try {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        const formData = new FormData();
        
        formData.append("description", complaintDescription.trim());
        formData.append("authorId", confirmedProfileId);
        postComplaintReasons.forEach(reason => formData.append("complaintReasonsIds", reason.id_motivo_denuncia));

        const resp = await axios.post(`http://localhost:5000/posts/${post.id_postagem}/complaint`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        const data = resp.data;

        if (data.error) {
            navigate("/errorPage", {state: {error: data.error}});

            throw new Error("Erro ao denunciar postagem");
        } else {
            setPosts(prevPosts =>
                prevPosts.map(p => p.id_postagem === post.id_postagem ? { ...p, isComplainted: true } : p
                )
            );

            setMessage("Postagem denunciada! Aguarde para analisarmos a denúncia", "success");
        }
    } catch (err) {
        setMessage("Não foi possível denunciar a postagem", "error");

        console.error("Erro ao fazer a requisição:", err);
    }
}