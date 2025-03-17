import styles from "./RecoverPassword.module.css";
import MainInput from "../form/MainInput";
import emailIcon from "../../img/icons/socialMedia/emailIcon.png";
import passwordIcon from "../../img/icons/socialMedia/passwordIcon.png";
import { useCallback, useState } from "react";
import SubmitButton from "../form/SubmitButton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CodeConfirmation from "./CodeConfirmation";
import Message from "../layout/Message";

function RecoverPassword() {
    const [account, setAccount] = useState({});
    const [code, setCode] = useState(["", "", "", ""]);
    const [showCodePage, setShowCodePage] = useState(false);
    const [message, setMessage] = useState({})

    const navigate = useNavigate();

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    function handleOnChange(e) {
        e.target.value = e.target.value.replace(/\s+/g, "");

        setAccount(prevAccount => ({...prevAccount, [e.target.name]: e.target.value}));
    }

    function handleOnSubmit(e) {
        e.preventDefault();

        if (!(account.email && account.password && validateEmail() && validatePassword())) {
            return;
        }
    
        generateCode(account.email);
        setShowCodePage(true);
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
    
    const changePassword = useCallback(async () => {
        try {
            const formData = new FormData();
            
            formData.append("email", account.email);
            formData.append("password", account.password);
            
            const resp = await axios.post(`http://localhost:5000/changePassword`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                if (resp.status === 404) {
                    setMessageWithReset("Uma conta com esse e-mail não foi encontrada. Confirme seu e-mail e tente novamente.", "error");
                } else {
                    throw new Error("Erro ao alterar a senha");
                }
            } else {
                navigate("/login", {state: {message: "Sua senha foi alterada! Faça login utilizando sua nova senha.", type: "success"}});
            }
        } catch (err) {
            if (err.response) {
                const status = err.response.status;
    
                if (status === 404) {
                    setMessageWithReset("Uma conta com esse e-mail não foi encontrada. Confirme seu e-mail e tente novamente.", "error");
                } else {
                    navigate("/errorPage", {state: {error: err.message}});
                }
            }
    
            console.error("Erro na requisição:", err);
        }
    }, [account.email, account.password, navigate])
    
    const handleOnSubmitCode = useCallback((e) => {
        e.preventDefault();
        
        const sendCode = async () => {
            try {
                const formData = new FormData();
            
                formData.append("email", account.email);
                formData.append("code", code.join(""));
                
                const resp = await axios.post(`http://localhost:5000/identityConfirmation`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }, 
                })
                const data = resp.data;
    
                if (data.error) {
                    if (resp.status === 410) {
                        setMessageWithReset("O código expirou. retorne a página de login e tente novamente.", "error");
                    } else if (resp.status === 400) {
                        setMessageWithReset("Código inválido.", "error");
                    } else {
                        throw new Error(data.error);
                    }
                } else {
                    changePassword();
                }
            } catch (err) {
                if (err.response) {
                    const status = err.response.status;
        
                    if (status === 410) {
                        setMessageWithReset("O código expirou. retorne a página de login e tente novamente.", "error");
                    } else if (status === 400) {
                        setMessageWithReset("Código inválido.", "error");
                    } else {
                        navigate("/errorPage", {state: {error: "Erro ao confirmar código."}});
                    }
        
                    console.error("Erro na requisição:", err);
                }
            }
        }

        sendCode();
    }, [account.email, changePassword, code, navigate])

    const validateEmail = useCallback(() => {
        return (account.email && 
            /^([a-zA-Z0-9._%+-]{1,64})@([a-zA-Z0-9.-]{1,255})\.([a-zA-Z]{2,})$/.test(account.email) &&
            account.email.length <= 255) ||
            !account.email;
    }, [account]); 
    
    const validatePassword = useCallback(() => {
        return (account.password && 
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(account.password)) ||
            !account.password;
    }, [account]); 

    return (
        <main className={styles.recover_password_page}>
            {message && <Message message={message.message} type={message.type}/>}

            {showCodePage && 
                <CodeConfirmation 
                    email={account.email} 
                    handleSubmit={handleOnSubmitCode}
                    code={code}
                    setCode={setCode}
                />
            }

            <div className={styles.recover_password_container}>
                <h1>Recuperação de Senha</h1>

                <p>
                    Insira o e-mail associado à sua conta e escolha uma nova senha para redefini-la.

                    <br/>
                    <br/>

                    Lembre-se de armazenar suas senhas com segurança, em um local acessível apenas por você.
                </p>

                <form onSubmit={handleOnSubmit}>
                    <MainInput
                        type="text"
                        name="email"
                        labelText="E-mail"
                        placeholder="insira o mesmo e-mail que utilizou ao criar sua conta"
                        maxLength={255}
                        alertMessage="E-mail inválido"
                        handleChange={handleOnChange}
                        showAlert={!validateEmail()}
                        inputIcon={emailIcon}
                        inputIconAlt="E-mail icon"
                        value={account.email}
                    />

                    
                    <MainInput 
                        type="password" 
                        name="password" 
                        placeholder="Insira sua nova senha" 
                        labelText="Nova Senha" 
                        maxLength={20}
                        alertMessage="A senha deve possuir entre 8 e 20 caracteres, no minímo uma letra, número e símbolo: @, $, !, %, *, ? ou &." 
                        inputIcon={passwordIcon}
                        inputIconAlt="Password icon"
                        handleChange={handleOnChange} 
                        showAlert={!validatePassword()}
                        value={account.password}
                    />

                    <SubmitButton text="Redefinir senha"/>
                </form>
            </div>
        </main>
    );
}

export default RecoverPassword;