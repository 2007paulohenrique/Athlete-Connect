import axios from "axios";

export default async function fetchSports(navigate, setSports) {
    try {
        const resp = await axios.get("http://localhost:5000/sports");
        const data = resp.data;
        
        if (data.error) {
            navigate("/errorPage", {state: {error: data.error}});

            throw new Error("Erro ao recuperar esportes");
        } else {
            setSports(data.map(sport => ({
                ...sport,
                icon: require(`../../img/${sport.iconPath}`)
            })));
        }
    } catch (err) {
        navigate("/errorPage", {state: {error: err.message}});

        console.error('Erro ao fazer a requisição:', err);

        throw err;
    }
}