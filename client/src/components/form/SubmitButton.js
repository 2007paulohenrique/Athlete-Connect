import styles from "./SubmitButton.module.css";

function SubmitButton({text, haveError}) {
    return (
        <button type={haveError ? "button" : "submit"} className={styles.submitButton}>
            {text}
        </button>
    );
}

export default SubmitButton;