import axios from "axios";

export default async function fetchSearchSugestions(navigate, setSearchSugestions, profileId, setMessage, permission = false) {
    if (!permission) return;

    try {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        const resp = await axios.get(`http://localhost:5000/profiles/${confirmedProfileId}/search/sugestions`);
        const data = resp.data;
        
        if (data.error) {
            navigate("/errorPage", {state: {error: data.error}});

            throw new Error("Erro ao recuperar sugestões de pesquisa");
        } else {
            setSearchSugestions(data);
        }
    } catch (err) {
        setMessage("Não foi possível recuperar as sugestões de pesquisa.", "error");

        console.error('Erro ao fazer a requisição:', err);
    }
}