import { useRef } from "react";
import styles from "./CodeConfirmation.module.css";
import SubmitButton from "../form/SubmitButton";

// Essa página vai ser usada antes de ações com informações sensíveis serem executadas. 
// Não possui uma rota própria. 

function CodeConfirmation({ email, handleSubmit, code, setCode }) {
    const inputsRef = useRef([]);

    const handleOnChange = (e, index) => {
        const value = e.target.value;

        if (!/^[a-zA-Z0-9]?$/.test(value)) return;
        
        const newCode = [...code];
        newCode[index] = value.toUpperCase();

        setCode(newCode);
    
        if (value) {
            if (index < inputsRef.current.length - 1) {
                inputsRef.current[index + 1].focus();
            } else {
                inputsRef.current[index].blur();
            }
        }
    };
    
    const handleOnKeyDown = (e, index) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handleOnClick = (index) => {
        if (index > 0 && !code[index - 1]) {
            let newIndex = index - 1;

            while (newIndex > 0 && !code[newIndex - 1]) {
                newIndex--;
            }

            inputsRef.current[newIndex].focus();
        } else if (index < code.length - 1 && code[index + 1]) {
            let newIndex = index + 1;

            while (newIndex < code.length - 1 && code[newIndex + 1]) {
                newIndex++;
            }

            inputsRef.current[newIndex].focus();
        } else {
            inputsRef.current[index].focus();
        }
    };
    
    return (
        <main className={styles.code_page}>
            <div className={styles.code_container}>
                <h1>Confirmação de Identidade</h1>

                <p>
                    Enviamos um código para <span>{email}</span>. 
                    Acesse o e-mail e insira o código enviado abaixo em até dois minutos
                    para confirmar sua identidade.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.code_inputs}>
                        {code.map((num, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={num}
                                onChange={(e) => handleOnChange(e, index)}
                                onKeyDown={(e) => handleOnKeyDown(e, index)}
                                onClick={() => handleOnClick(index)}
                                ref={(el) => (inputsRef.current[index] = el)}
                            />
                        ))}
                    </div>

                    <SubmitButton text="Confirmar"/>
                </form>
            </div>
        </main>
    );
}

export default CodeConfirmation;