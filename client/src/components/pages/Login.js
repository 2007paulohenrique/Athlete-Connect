import { useEffect, useState } from "react";
import LoginForm from "../form/LoginForm";
import styles from "./Login.module.css";
import Message from "../layout/Message";
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../../ProfileContext";

function Login() {
    const [isLogin, setIsLogin] = useState(false);
    const [loginError, setLoginError] = useState(false);
    const [loginPasswordError, setLoginPasswordError] = useState(false);
    const [profile, setProfile] = useState({});
    const [message, setMessage] = useState({});
    const { setProfileId } = useProfile(); 

    const navigate = useNavigate();
    const location = useLocation();

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    useEffect(() => {
        if (location.state) {
            setMessageWithReset(location.state.message, location.state.type)
        }
    })

    function changeForm() {
        setIsLogin(!isLogin)
    }

    function signUpSubmit(e) {
        e.preventDefault();

        const formData = new FormData();

        formData.append("email", profile["emailSignUp"]);
        formData.append("name", profile["nameSignUp"]);

        axios.post(`http://localhost:5000/signup`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
            const data = resp.data;

            if (data !== "signUpError") {
                const updatedProfile = { ...profile, confirmedNameSignUp: profile['nameSignUp'] };
            
                setProfile(updatedProfile);
                navigate("/editProfile", {state: {profile: updatedProfile}});
            } else {
                setMessageWithReset("Já existe um perfil com o mesmo nome ou e-mail.", "error");
            }
        })
        .catch(err => {
            console.error("Erro ao fazer a requisição:", err);
        }); 
    }

    function loginSubmit(e) {  
        e.preventDefault();

        const formData = new FormData();

        formData.append("nameOrEmail", profile["nameOrEmailLogin"]);
        formData.append("password", profile["passwordLogin"]);

        axios.post(`http://localhost:5000/login`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
            const data = resp.data;

            if (data === "loginError") {
                setLoginError(true)
                return;
            } 

            if (data === "passwordError") {
                setLoginPasswordError(true);
                return;
            }
            
            setLoginPasswordError(false);
            setLoginError(false);
            setProfileId(data.profileId);
            localStorage.setItem('athleteConnectProfileId', data.profileId);
            navigate("/");
        })
        .catch(err => {
            console.error("Erro ao fazer a requisição:", err);
        }); 
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