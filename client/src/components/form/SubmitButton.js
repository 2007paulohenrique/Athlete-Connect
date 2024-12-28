import styles from "./SubmitButton.module.css";

function SubmitButton({ text }) {
    return (
        <button type="submit" className={styles.submit_button}>
            {text}
        </button>
    );
}

export default SubmitButton;