import { useEffect, useRef } from 'react';
import styles from "./MainInput.module.css";

function MainInput({ type, name, labelText, placeholder, maxLength, alertMessage, handleChange, showAlert = false, inputIcon, inputIconAlt, value }) {
    const alertRef = useRef(null);

    useEffect(() => {
        if (alertRef.current) {
            alertRef.current.style.visibility = showAlert ? "visible" : "hidden";
        }
    }, [showAlert]);

    return (
        <div className={type === "checkbox" ? styles.checkbox_field : styles.text_field}>
            <span>
                {inputIcon && <img src={inputIcon} alt={inputIconAlt}/>}
                <label htmlFor={name}>{labelText}</label>
            </span>

            <input type={type} name={name} id={name} placeholder={placeholder} maxLength={maxLength} onChange={handleChange} value={value || ""}/>

            <p className={styles.alert} ref={alertRef}>{alertMessage}</p>
        </div>
    );
}

export default MainInput;