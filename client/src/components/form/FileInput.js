import { useEffect, useRef } from "react";
import styles from "./FileInput.module.css";

function FileInput({name, labelText, handleChange, alertMessage, accepts, multiple, showAlert, inputIcon, inputIconAlt}) {
    const alertRef = useRef(null);

    useEffect(() => {
        if (alertRef.current) {
            alertRef.current.style.visibility = showAlert ? "visible" : "hidden";
        }
    }, [showAlert]);

    return (
        <div className={styles.file_input}>
            <label htmlFor={name}>
                {inputIcon && <img src={inputIcon} alt={inputIconAlt}/>}
                {labelText}
            </label>
            <input type="file" name={name} id={name} onChange={handleChange} accepts={accepts} multiple={multiple}/>
            <p className={styles.alert} ref={alertRef}>{alertMessage}</p>
        </div>
    );
}

export default FileInput;