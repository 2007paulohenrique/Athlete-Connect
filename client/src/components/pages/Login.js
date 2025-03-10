import { useCallback, useEffect, useState } from "react";
import LoginForm from "../form/LoginForm";
import styles from "./Login.module.css";
import Message from "../layout/Message";
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../../ProfileContext";
import ConfirmationBox from "../layout/ConfirmationBox";
import CodeConfirmation from "./CodeConfirmation";

function Login() {
    const [isLogin, setIsLogin] = useState(false);
    const [signUpSubmitError, setSignUpSubmitError] = useState(false);
    const [loginSubmitError, setLoginSubmitError] = useState(false);
    const [profile, setProfile] = useState({});
    const [message, setMessage] = useState({});
    const {profileId, setProfileId} = useProfile();
    const [showConfirmation, setShowConfirmation] = useState(false); 
    const [showCodePage, setShowCodePage] = useState(false);
    const [storagedProfile, setStoragedProfile] = useState({});
    const [code, setCode] = useState(["", "", "", ""]);
    const [handleSuccess, setHandleSuccess] = useState(() => undefined);

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

                throw new Error("Erro ao criar perfil");
            } else {
                setStoragedProfile({email: profile.emailSignUp});
                setShowCodePage(true);
                generateCode(profile.emailSignUp);
                
                const signupSuccess = () => {
                    const updatedProfile = {...profile, confirmedNameSignUp: profile.nameSignUp};
                    
                    setProfile(updatedProfile);
                    
                    navigate("/editProfile", {state: {profile: updatedProfile}});
                }

                setHandleSuccess(() => signupSuccess);
            }
        } catch (err) {
            if (err.response.status === 409) {
                navigate("/login", {state: {message: "Já existe um perfil com esse nome ou email.", type: "error"}});
            } else {
                navigate("/errorPage", {state: {error: err.message}})
    
                console.error("Erro ao fazer a requisição:", err);
             
                throw err;
            }
        }
    }

    const activeAccountCallback = useCallback(async (id) => {
        try {
            const resp = await axios.put(`http://localhost:5000/profiles/${id}/active/${true}`);
            const data = resp.data;
            
            if (data.error) {
                setMessageWithReset("Não foi possível ativar seu perfil.", "error");

                throw new Error("Erro ao ativar perfil");
            } else {
                setLoginSubmitError(false);

                navigate("/", {state: {message: "Bem-vindo de volta!", type: "success"}});
            }
        } catch (err) {
            setMessageWithReset("Não foi possível ativar seu perfil.", "error");
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [navigate]);  

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

                throw new Error("Erro ao fazer login");
            } else {
                setStoragedProfile(data);
                setShowCodePage(true);
                generateCode(data.email);

                const loginSuccess = () => {
                    if (data.ativo === false) {
                        setShowConfirmation(true);
                    } else {
                        setLoginSubmitError(false);
                        
                        navigate("/", {state: {message: "Bem-vindo de volta!", type: "success"}});
                    }

                    delete data.email;
    
                    setProfileId(data.id_perfil);
                    localStorage.setItem('athleteConnectProfileId', data.id_perfil);
                    localStorage.setItem('athleteConnectProfile', JSON.stringify({profile: data, updateDate: Date.now()}));
                }

                setHandleSuccess(() => loginSuccess);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setLoginSubmitError(true);
            } else {
                navigate("/errorPage", {state: {error: err.message}})
    
                console.error("Erro ao fazer a requisição:", err);
             
                throw err;
            }
        }
    }

    const generateCode = useCallback(async (email) => {
        try {
            const formData = new FormData();
        
            formData.append("email", email);
            
            const resp = await axios.post(`http://localhost:5000/identityConfirmation`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                throw new Error("Erro ao enviar código para o e-mail");         
            } else {
               
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);            
        }
    }, [navigate])

    const handleSubmitCode = useCallback((e) => {
        e.preventDefault();

        const sendCode = async (handleOnSuccess) => {
            try {
                const formData = new FormData();
            
                formData.append("email", storagedProfile.email);
                formData.append("code", code.join(""));
                
                const resp = await axios.post(`http://localhost:5000/identityConfirmation`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }, 
                })
                const data = resp.data;
    
                if (data.error) {
                    if (resp.status === 410) {
                        setMessageWithReset("O código expirou. Tente fazer login novamente.", "error");
                    } else if (resp.status === 400) {
                        setMessageWithReset("Código inválido.", "error");
                    } else {
                        throw new Error(data.error);
                    }
                } else {
                    handleOnSuccess();
                }
            } catch (err) {
                if (err.response) {
                    const status = err.response.status;
        
                    if (status === 410) {
                        setMessageWithReset("O código expirou. Tente fazer login novamente.", "error");
                    } else if (status === 400) {
                        setMessageWithReset("Código inválido.", "error");
                    } else {
                        navigate("/errorPage", {state: {error: "Erro ao confirmar código."}});
                    }
        
                    console.error("Erro na requisição:", err);
                }
            }
        }

        sendCode(handleSuccess);
    }, [code, handleSuccess, navigate, storagedProfile.email])
    
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

            {showCodePage && 
                <CodeConfirmation 
                    email={storagedProfile.email} 
                    handleOnSubmit={handleSubmitCode}
                    code={code}
                    setCode={setCode}
                />
            }

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