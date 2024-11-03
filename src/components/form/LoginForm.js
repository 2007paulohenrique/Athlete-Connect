// import { useState } from "react";
import styles from "./LoginForm.module.css";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import Icon from "../../img/icon.ico";
import userIcon from "../../img/userIcon.png"
import emailIcon from "../../img/emailIcon.png"
import passwordIcon from "../../img/passwordIcon.png"
import { useState } from "react";

function LoginForm({isLoginForm, handleSubmit, handleChangeForm, isLogin}) {
    // const [showNameAlert, setShowNameAlert] = useState(false);
    // const [user, setUser] = useState({});

    // function handleOnChange(e) {
    //     setUser({...user, [e.target.name]: e.target.value});
    // }



    return (
        <>
            {isLoginForm ? (
                <form onSubmit={handleSubmit} className={`${styles.loginForm} ${styles.login} ${isLogin ? styles.form_visible : styles.form_hidden}`}>
                    <div className={styles.title_container}>
                        <img src={Icon} alt="Athlete Connect Icon"/>
                        <h2>Login</h2>
                    </div>
        
                    <div className={styles.inputs_container}>
                        <InputField 
                            type="text" 
                            name="nameOrEmailLogin" 
                            placeholder="Insira seu e-mail ou nome de usuário" 
                            labelText="E-mail ou Nome de Usuário" 
                            alertMessage="Não foi encontrado nenhum perfil com esses dados." 
                            inputIcon={userIcon}
                            inputIconAlt="User icon"
                            // handleChange={handleOnChange} 
                            // showAlert={showNameAlert}
                        />
            
                        <InputField 
                            type="password" 
                            name="passwordLogin" 
                            placeholder="Insira sua senha" 
                            labelText="Senha" 
                            alertMessage="Senha incorreta." 
                            inputIcon={passwordIcon}
                            inputIconAlt="Password icon"
                            // handleChange={handleOnChange} 
                            // showAlert={showNameAlert}
                        />
                    </div>

                    <div className={styles.buttons_container}>
                        <SubmitButton text="Entrar na conta"/>
                        <p className={styles.change_form} onClick={handleChangeForm}>Criar conta</p>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmit} className={`${styles.loginForm} ${!isLogin ? styles.form_visible : styles.form_hidden}`}>
                    <div className={styles.title_container}>
                        <img src={Icon} alt="Athlete Connect Icon"/>
                        <h2>Registro</h2>
                    </div>

                    <div className={styles.inputs_container}>
                        <InputField 
                            type="text" 
                            name="nameSignUp" 
                            placeholder="Insira o nome de usuário" 
                            labelText="Nome de Usuário" 
                            alertMessage='O nome de usuário deve ter entre 4 e 30 caracteres, sem espaços e símbolos diferentes de: "_", "@", "+","&" e ".".' 
                            inputIcon={userIcon}
                            inputIconAlt="User Icon"
                            // handleChange={handleOnChange} 
                            // showAlert={showNameAlert}
                        />

                        <InputField 
                            type="email" 
                            name="emailSignUp" 
                            placeholder="Insira seu e-mail" 
                            labelText="E-mail" 
                            alertMessage="E-mail inválido." 
                            inputIcon={emailIcon}
                            inputIconAlt="E-mail icon"
                            // handleChange={handleOnChange} 
                            // showAlert={showNameAlert}
                        />

                        <InputField 
                            type="password" 
                            name="passwordSignUp" 
                            placeholder="Insira sua senha" 
                            labelText="Senha" 
                            alertMessage="A senha deve possuir entre 8 e 20 caracteres, no minímo uma letra, número e símbolo." 
                            inputIcon={passwordIcon}
                            inputIconAlt="Password icon"
                            // handleChange={handleOnChange} 
                            // showAlert={showNameAlert}
                        />
                    </div>

                    <div className={styles.buttons_container}>
                        <SubmitButton text="Criar conta"/>
                        <p className={styles.change_form} onClick={handleChangeForm}>Entrar</p>
                    </div>
                </form>
            )}
        </>
    );
}

export default LoginForm;