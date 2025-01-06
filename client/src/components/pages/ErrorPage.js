import styles from "./ErrorPage.module.css";
import errorIcon from "../../img/icons/socialMedia/errorIcon.png";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import athleteConnectIcon from "../../img/icons/socialMedia/icon.ico";

function ErrorPage() {
    const [errorMessage, setErrorMessage] = useState("");
    
    const location = useLocation();

    useEffect(() => {
        const error = location?.state?.error;

        if (error) {
            setErrorMessage(error)
        } else {
            setErrorMessage("Erro não identificado.")
        }
    }, [location])

    return (
        <main className={styles.error_page}>
            <img src={athleteConnectIcon} alt="App Icon"/>
            <h1>Algum erro ocorreu</h1>

            <img src={errorIcon} alt="Error"/>

            <div className={styles.error_message}>
                <p>{errorMessage}</p>
            
                <p>Tente novamente mais tarde.</p>
            </div>
        </main>
    );
}

export default ErrorPage;