import axios from "axios";

export default async function fetchComplaintReasons(setComplaintReasons, navigate) {
    try {
        const resp = await axios.get("http://localhost:5000/complaintReasons");
        const data = resp.data;

        if (data.error) {
            navigate("/errorPage", {state: {error: data.error}});
        } else {
            setComplaintReasons(data);
        }
    } catch (err) {
        navigate("/errorPage", {state: {error: err.message}});

        console.error('Erro ao fazer a requisição:', err);
    }
};