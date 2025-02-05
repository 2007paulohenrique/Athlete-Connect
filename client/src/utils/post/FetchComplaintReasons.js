import axios from "axios";

export default async function fetchComplaintReasons(setComplaintReasons, navigate, setMessage) {
    try {
        const resp = await axios.get("http://localhost:5000/complaintReasons");
        const data = resp.data;

        if (data.error) {
            navigate("/errorPage", {state: {error: data.error}});

            throw new Error("Erro ao recuperar motivos de denúncia");
        } else {
            setComplaintReasons(data);
        }
    } catch (err) {
        setMessage("Não foi possível recuperar os motivos de denúncia.", "error");

        console.error('Erro ao fazer a requisição:', err);
    }
};