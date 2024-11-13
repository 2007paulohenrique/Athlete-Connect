import { useState } from "react";
import LoginForm from "../form/LoginForm";
import styles from "./Login.module.css";

function Login() {
    const [isLogin, setIsLogin] = useState(false);
    const [perfis, setPerfis] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000//api/perfis", {method: "GET"})
        .then(resp => resp.json())
        .then(data => setPerfis(data))
        .catch(err => console.log(err))
    }, []);

    function changeForm() {
        setIsLogin(!isLogin)
    }

    return (
        <main className={styles.login_page}>
            <div className={styles.login_container}>
                <div className={styles.forms_container}>
                    <LoginForm 
                        isLoginForm={false} 
                        handleChangeForm={changeForm} 
                        isLogin={isLogin}
                    />
                    <LoginForm 
                        isLoginForm={true} 
                        handleChangeForm={changeForm} 
                        isLogin={isLogin}
                    />
                </div>
                <div className={`${styles.welcome_container} ${isLogin ? styles.welcome_login : styles.welcome_signup}`} id="welcome_container">
                    <h2>Athlete Connect</h2>

                    <div className={styles.welcome_text}>
                        <p>Bem-vindo ao Athlete Connect!</p>
                        <p>O lugar onde você pode compartilhar suas experiências e se divertir com o mundo dos esportes.</p>
                        <p>Crie ou entre em uma conta para navegar por esse mundo.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Login;