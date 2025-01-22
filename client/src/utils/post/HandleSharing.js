import axios from "axios";

export default async function createSharing(profileId, post, sharings, sharingCaption, navigate, setMessage, setPosts) {
    try {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        const formData = new FormData();

        formData.append("caption", sharingCaption.trim());
        formData.append("authorId", confirmedProfileId);
        sharings.forEach(sharing => formData.append("targetProfilesIds", sharing.id_perfil));

        const resp = await axios.post(`http://localhost:5000/posts/${post.id_postagem}/sharing`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        const data = resp.data;

        if (data.error) {
            navigate("/errorPage", {state: {error: data.error}})
        } else {
            setPosts(prevPosts =>
                prevPosts.map(p => p.id_postagem === post.id_postagem ? { 
                    ...p, 
                    total_compartilhamentos: p.total_compartilhamentos + 1
                } : p)
            );

            const setMessageWithReset = (newMessage, type) => {
                setMessage(null);
            
                setTimeout(() => {
                    setMessage({message: newMessage, type: type});
                }, 1);
            }
            
            setMessageWithReset("Postagem compartilhada com sucesso!", "success");
        }
    } catch (err) {
        navigate("/errorPage", {state: {error: err.message}})

        console.error("Erro ao fazer a requisição:", err);
    }
}