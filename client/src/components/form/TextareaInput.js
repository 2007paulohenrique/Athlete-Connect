import { useEffect, useRef } from "react";
import styles from "./TextareaInput.module.css";

function TextareaInput({ name, labelText, placeholder, maxLength, alertMessage, handleChange, showAlert, inputIcon, inputIconAlt, value }) {
    const alertRef = useRef(null);
    const textareaRef = useRef();

    useEffect(() => {
        if (alertRef.current) {
            alertRef.current.style.visibility = showAlert ? "visible" : "hidden";
        }
    }, [showAlert]);

    return (
        <div className={styles.textarea_field}>
            <span>
                {inputIcon && <img src={inputIcon} alt={inputIconAlt} />}
                <label htmlFor={name}>{labelText}</label>
            </span>
            <textarea ref={textareaRef} name={name} id={name} placeholder={placeholder} maxLength={maxLength} onChange={handleChange} value={value}/>
            <p className={styles.alert} ref={alertRef}>{alertMessage}</p>
        </div>
    );
}

export default TextareaInput;