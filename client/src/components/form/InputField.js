import { useEffect, useRef } from 'react';
import styles from "./InputField.module.css";

function InputField({ type, name, labelText, placeholder, alertMessage, handleChange, showAlert, inputIcon, inputIconAlt }) {
    const alertRef = useRef(null);

    useEffect(() => {
        if (alertRef.current) {
            console.log(showAlert);
            alertRef.current.style.visibility = showAlert ? "visible" : "hidden";
        }
    }, [showAlert]);

    return (
        <div className={styles.inputField}>
            <span>
                {inputIcon && <img src={inputIcon} alt={inputIconAlt} />}
                <label htmlFor={name}>{labelText}</label>
            </span>
            <input type={type} name={name} id={name} placeholder={placeholder} onChange={handleChange} />
            <p className={styles.alert} ref={alertRef}>{alertMessage}</p>
        </div>
    );
}

export default InputField;
