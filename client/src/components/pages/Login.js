import { useEffect, useState } from "react";
import LoginForm from "../form/LoginForm";
import styles from "./Login.module.css";
import Message from "../layout/Message";
import axios from "axios"
import { useNavigate } from "react-router-dom";

function Login() {
    const [isLogin, setIsLogin] = useState(false);
    const [loginError, setLoginError] = useState(false);
    const [loginPasswordError, setLoginPasswordError] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [profile, setProfile] = useState({});
    const [message, setMessage] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:5000/profiles")
        .then(resp => {
            setProfiles(resp.data);
        })
        .catch(err => {
            console.error('Erro ao fazer a requisição:', err);
        });
    }, []);

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    function changeForm() {
        setIsLogin(!isLogin)
    }

    function validateLogin() {
        const profileLogin = profiles.find(p => 
            ((p["email"] === profile["nameOrEmailLogin"] || p["nome"] === profile["nameOrEmailLogin"]))
        )

        return profileLogin
    }

    function validatePasswordLogin() {
        const profileLogin = validateLogin();

        if (profileLogin) {
            return profileLogin["senha"] === profile["passwordLogin"] ? profileLogin : null;
        }
    }

    function profileMatch() {
        return profiles.some(p => (p["email"] === profile["emailSignUp"] || p["nome"] === profile["nameSignUp"]))
    }

    function signUpSubmit(e) {
        e.preventDefault();

        if (!profileMatch()) {
            const updatedProfile = { ...profile, confirmedNameSignUp: profile['nameSignUp'] };
            
            setProfile(updatedProfile);
            navigate("/editProfile", { state: { profile: updatedProfile, profiles: profiles } });
        } else {
            setMessageWithReset("Já existe um perfil com o mesmo nome ou e-mail.", "error");
        }
    }

    function loginSubmit(e) {  
        e.preventDefault();

        if (validateLogin()) {
            setLoginError(false);

            if (!validatePasswordLogin()) {
                setLoginPasswordError(true);
                return;
            }

            setLoginPasswordError(false);
            const loggedInProfile = validatePasswordLogin();
            sessionStorage.setItem("profileId", loggedInProfile["id_perfil"]);

            navigate("/");
        } else {
            setLoginError(true);
        }   
    }

    function resetErrors() {
        setLoginError(false);
        setLoginPasswordError(false);
    }

    return (
        <main className={styles.login_page}>
            {message && <Message message={message.message} type={message.type}/>}
            <div className={styles.login_container}>
                <div className={styles.forms_container}>
                    <LoginForm 
                        isLoginForm={false} 
                        handleChangeForm={changeForm} 
                        handleSubmit={signUpSubmit}
                        profile={profile}
                        setProfile={setProfile}
                        isLogin={isLogin}
                    />
                    <LoginForm 
                        isLoginForm={true} 
                        handleChangeForm={changeForm} 
                        handleSubmit={loginSubmit}
                        profile={profile}
                        setProfile={setProfile}
                        isLogin={isLogin}
                        validateLogin={loginError}
                        validatePasswordLogin={loginPasswordError}
                        resetErrors={resetErrors}
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