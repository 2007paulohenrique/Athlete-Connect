import SubmitButton from "../form/SubmitButton";
import styles from "./ConfirmationBox.module.css";

function ConfirmationBox({ text, handleConfirmation, setShowConfirmation }) {
    function handleOnConfirmation(e) {
        e.preventDefault();

        handleConfirmation();

        setShowConfirmation(false);
    }

    return (
        <div className={styles.confirmation_box}>
            <span onClick={() => setShowConfirmation(false)}>
                cancelar
            </span>

            <p>{text}</p>

            <form onSubmit={handleOnConfirmation}>
                <SubmitButton text="Confirmar"/>
            </form>
        </div>
    );
}

export default ConfirmationBox;