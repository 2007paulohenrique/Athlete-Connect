import axios from "axios";

export default async function fetchSearchSugestions(navigate, setSearchSugestions, profileId) {
    try {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        const resp = await axios.get(`http://localhost:5000/profiles/${confirmedProfileId}/search/sugestions`);
        const data = resp.data;
        
        if (data.error) {
            navigate("/errorPage", {state: {error: data.error}});
        } else {
            setSearchSugestions(data);
        }
    } catch (err) {
        navigate("/errorPage", {state: {error: err.message}});

        console.error('Erro ao fazer a requisição:', err);
    }
}