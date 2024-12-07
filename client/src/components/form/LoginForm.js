import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./LoginForm.module.css";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import Icon from "../../img/icons/socialMedia/icon.ico";
import userIcon from "../../img/icons/socialMedia/userIcon.png";
import emailIcon from "../../img/icons/socialMedia/emailIcon.png";
import passwordIcon from "../../img/icons/socialMedia/passwordIcon.png";

function LoginForm({ isLoginForm, handleSubmit, handleChangeForm, isLogin, profile, setProfile, validateLogin, validatePasswordLogin, resetErrors}) {
    const [haveError, setHaveError] = useState(false);
    
    const loginFormRef = useRef(null);
    const signupFormRef = useRef(null);

    function handleOnChange(e) {
        e.target.value = e.target.value.replace(/\s+/g, "");

        setProfile({ ...profile, [e.target.name]: e.target.value });
    }

    function handleOnChangeLogin(e) {
        e.target.value = e.target.value.replace(/\s+/g, "");

        setProfile({ ...profile, [e.target.name]: e.target.value });
        resetErrors();
    }

    function handleOnChangeForm() {
        if (loginFormRef.current) {
            loginFormRef.current.reset();
        }
        if (signupFormRef.current) {
            signupFormRef.current.reset();
        }

        handleChangeForm();
        setProfile({});
    }

    const validateName = useCallback(() => {
        return profile["nameSignUp"] && /^[a-zA-Z0-9_@+&.]{4,30}$/.test(profile["nameSignUp"]);
    }, [profile]);
    
    const validateEmail = useCallback(() => {
        return profile["emailSignUp"] && 
               /^([a-zA-Z0-9._%+-]{1,64})@([a-zA-Z0-9.-]{1,255})\.([a-zA-Z]{2,})$/.test(profile["emailSignUp"]) &&
               profile["emailSignUp"].length <= 320;
    }, [profile]); 
    
    const validatePassword = useCallback(() => {
        return profile["passwordSignUp"] && 
               /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(profile["passwordSignUp"]);
    }, [profile]); 
    
    useEffect(() => {
        setHaveError(!(validateName() && validateEmail() && validatePassword()));
    }, [profile, validateName, validateEmail, validatePassword]);

    return (
        <>
            {isLoginForm ? (
                <form ref={loginFormRef} onSubmit={handleSubmit} className={`${styles.loginForm} ${styles.login} ${isLogin ? styles.form_visible : styles.form_hidden}`}>
                    <div className={styles.title_container}>
                        <img src={Icon} alt="Athlete Connect Icon"/>
                        <h2>Login</h2>
                    </div>

                    <p className={styles.empty_field_alert}>- Preencha todos os campos</p>

                    <div className={styles.inputs_container}>
                        <InputField 
                            type="text" 
                            name="nameOrEmailLogin" 
                            placeholder="Insira seu e-mail ou nome de usuário" 
                            labelText="E-mail ou Nome de Usuário" 
                            alertMessage="Não foi encontrado nenhum perfil com esses dados." 
                            inputIcon={userIcon}
                            inputIconAlt="User icon"
                            handleChange={handleOnChangeLogin} 
                            showAlert={validateLogin && profile["nameOrEmailLogin"]}
                        />
            
                        <InputField 
                            type="password" 
                            name="passwordLogin" 
                            placeholder="Insira sua senha" 
                            labelText="Senha" 
                            alertMessage="Senha incorreta." 
                            inputIcon={passwordIcon}
                            inputIconAlt="Password icon"
                            handleChange={handleOnChangeLogin} 
                            showAlert={validatePasswordLogin && profile["passwordLogin"]}
                        />
                    </div>

                    <div className={styles.buttons_container}>
                        <SubmitButton text="Entrar na conta" haveError={validateLogin && validatePasswordLogin}/>
                        <p className={styles.change_form} onClick={handleOnChangeForm}>Criar perfil</p>
                    </div>
                    <p className={styles.forget_password}>Esqueci minha senha</p>
                </form>
            ) : (
                <form ref={signupFormRef} onSubmit={handleSubmit} className={`${styles.loginForm} ${!isLogin ? styles.form_visible : styles.form_hidden}`}>
                    <div className={styles.title_container}>
                        <img src={Icon} alt="Athlete Connect Icon"/>
                        <h2>Registro</h2>
                    </div>

                    <p className={styles.empty_field_alert}>- Preencha todos os campos</p>

                    <div className={styles.inputs_container}>
                        <InputField 
                            type="text" 
                            name="nameSignUp" 
                            placeholder="Insira o nome de usuário" 
                            labelText="Nome de Usuário" 
                            alertMessage='O nome de usuário deve ter entre 4 e 30 caracteres, sem espaços e símbolos diferentes de: "_", "@", "+","&" e ".".' 
                            inputIcon={userIcon}
                            inputIconAlt="User Icon"
                            handleChange={handleOnChange} 
                            showAlert={profile["nameSignUp"] && !validateName()}
                        />

                        <InputField 
                            type="text" 
                            name="emailSignUp" 
                            placeholder="Insira seu e-mail" 
                            labelText="E-mail" 
                            alertMessage="E-mail inválido." 
                            inputIcon={emailIcon}
                            inputIconAlt="E-mail icon"
                            handleChange={handleOnChange} 
                            showAlert={profile["emailSignUp"] && !validateEmail()}
                        />

                        <InputField 
                            type="password" 
                            name="passwordSignUp" 
                            placeholder="Insira sua senha" 
                            labelText="Senha" 
                            alertMessage="A senha deve possuir entre 8 e 20 caracteres, no minímo uma letra, número e símbolo: @, $, !, %, *, ? ou &." 
                            inputIcon={passwordIcon}
                            inputIconAlt="Password icon"
                            handleChange={handleOnChange} 
                            showAlert={profile["passwordSignUp"] && !validatePassword()}
                        />
                    </div>

                    <div className={styles.buttons_container}>
                        <SubmitButton text="Criar conta" haveError={haveError}/>
                        <p className={styles.change_form} onClick={handleOnChangeForm}>Entrar</p>
                    </div>
                </form>
            )}
        </>
    );
}

export default LoginForm;
