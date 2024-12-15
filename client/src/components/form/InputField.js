import { useEffect, useRef } from 'react';
import styles from "./InputField.module.css";

function InputField({ type, name, labelText, placeholder, alertMessage, handleChange, showAlert, inputIcon, inputIconAlt, value }) {
    const alertRef = useRef(null);

    useEffect(() => {
        if (alertRef.current) {
            alertRef.current.style.visibility = showAlert ? "visible" : "hidden";
        }
    }, [showAlert]);

    return (
        <div className={type === "checkbox" ? styles.checkbox_input : styles.inputField}>
            <span>
                {inputIcon && <img src={inputIcon} alt={inputIconAlt}/>}
                <label htmlFor={name}>{labelText}</label>
            </span>
            <input type={type} name={name} id={name} placeholder={placeholder} onChange={handleChange} value={value}/>
            <p className={styles.alert} ref={alertRef}>{alertMessage}</p>
        </div>
    );
}

export default InputField;
