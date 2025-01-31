import { useCallback, useEffect, useState } from "react";
import LoginForm from "../form/LoginForm";
import styles from "./Login.module.css";
import Message from "../layout/Message";
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../../ProfileContext";
import ConfirmationBox from "../layout/ConfirmationBox";

function Login() {
    const [isLogin, setIsLogin] = useState(false);
    const [signUpSubmitError, setSignUpSubmitError] = useState(false);
    const [loginSubmitError, setLoginSubmitError] = useState(false);
    const [profile, setProfile] = useState({});
    const [message, setMessage] = useState({});
    const {profileId, setProfileId} = useProfile();
    const [showConfirmation, setShowConfirmation] = useState(false); 

    const navigate = useNavigate();
    const location = useLocation();

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    useEffect(() => {
        const msg = location?.state

        if (msg) setMessageWithReset(msg.message, msg.type)
    }, [location])

    const checkProfile = async () => {
        try {
            const formData = new FormData();
        
            formData.append("email", profile.emailSignUp);
            formData.append("name", profile.nameSignUp); 

            const resp = await axios.post(`http://localhost:5000/signup`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                if (data.error === "signup") {
                    setMessageWithReset("Já existe um perfil com o mesmo nome ou e-mail.", "error");
                } else {
                    navigate("/errorPage", {state: {error: data.error}});
                }
            } else {
                const updatedProfile = {...profile, confirmedNameSignUp: profile.nameSignUp};
            
                setProfile(updatedProfile);

                navigate("/editProfile", {state: {profile: updatedProfile}});
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})
            
            console.error("Erro ao fazer a requisição:", err);
        }
    }

    const activeAccountCallback = useCallback(async (id) => {
        try {
            const resp = await axios.put(`http://localhost:5000/profiles/${id}/active/${true}`);
            const data = resp.data;
            
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setLoginSubmitError(false);
                setProfileId(data.profileId);
                localStorage.setItem('athleteConnectProfileId', data.profileId);

                navigate("/", {state: {message: "Bem-vindo de volta!", type: "success"}});
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [navigate, setProfileId]);  

    function activeAccount() {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        activeAccountCallback(confirmedProfileId);
    }

    const checkLogin = async () => {
        try {
            const formData = new FormData();
        
            formData.append("nameOrEmail", profile.nameOrEmailLogin);
            formData.append("password", profile.passwordLogin);
            
            const resp = await axios.post(`http://localhost:5000/login`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                if (data.error === "login") {
                    setLoginSubmitError(true);
                } else {
                    navigate("/errorPage", {state: {error: data.error}});
                }
            } else {
                if (data.isActived === false) {
                    setShowConfirmation(true);
                } else {
                    setLoginSubmitError(false);
                    setProfileId(data.profileId);
                    localStorage.setItem('athleteConnectProfileId', data.profileId);
                    
                    navigate("/", {state: {message: "Bem-vindo de volta!", type: "success"}});
                }
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})
            
            console.error("Erro ao fazer a requisição:", err);
        }
    }
    
    function loginSubmit(e) {  
        e.preventDefault();
        
        setLoginSubmitError(false);
        
        if (!(profile.nameOrEmailLogin && profile.passwordLogin)) {
            setLoginSubmitError(true);
            
            return;
        }
        
        checkLogin();
    }

    function signUpSubmit(e) {
        e.preventDefault();

        if (signUpSubmitError) return;

        checkProfile();
    }
    
    return (
        <main className={styles.login_page}>
            {message && <Message message={message.message} type={message.type}/>}

            {showConfirmation && 
                <ConfirmationBox 
                    text='Seu perfil foi desativado. Caso clique em "confirmar" seu perfil vai ser ativado e você poderá usá-lo novamente.' 
                    handleConfirmation={activeAccount}
                    setShowConfirmation={setShowConfirmation}
                />
            }
            
            <div className={styles.login_container}>
                <div className={styles.forms_container}>
                    <LoginForm 
                        isLoginForm={false} 
                        handleChangeForm={() => setIsLogin(!isLogin)} 
                        handleSubmit={signUpSubmit}
                        profile={profile}
                        setProfile={setProfile}
                        setSignUpSubmitError={setSignUpSubmitError}
                        resetErrors={() => setLoginSubmitError(false)}
                        isLogin={isLogin}
                    />

                    <LoginForm 
                        isLoginForm={true} 
                        handleChangeForm={() => setIsLogin(!isLogin)} 
                        handleSubmit={loginSubmit}
                        profile={profile}
                        setProfile={setProfile}
                        isLogin={isLogin}
                        loginSubmitError={loginSubmitError}
                        resetErrors={() => setLoginSubmitError(false)}
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