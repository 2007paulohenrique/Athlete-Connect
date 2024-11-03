import styles from "./InputField.module.css";

function InputField({type, name, labelText, placeholder, alertMessage, handleChange, showAlert, inputIcon, inputIconAlt}) {

    return (
        <div className={styles.inputField}>
            <span>
                {inputIcon && <img src={inputIcon} alt={inputIconAlt}/>}
                <label htmlFor={name}>{labelText}</label>
            </span>
            <input type={type} name={name} id={name} placeholder={placeholder} onChange={handleChange}/>
            <p className={styles.alert} id={name + "Alert"}>{alertMessage}</p>
        </div>
    );
}

export default InputField;