import SubmitButton from "../form/SubmitButton";
import styles from "./ConfirmationBox.module.css";

function ConfirmationBox({ text, handleConfirmation, setShowConfirmation }) {
    return (
        <div className={styles.confirmation_box}>
            <span onClick={() => setShowConfirmation(false)}>
                cancelar
            </span>

            <p>{text}</p>

            <form onClick={handleConfirmation}>
                <SubmitButton text="Confirmar"/>
            </form>
        </div>
    );
}

export default ConfirmationBox;