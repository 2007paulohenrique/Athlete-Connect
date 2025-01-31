import styles from "./ExitPageBar.module.css";

function ExitPageBar({ handleExitPage }) {
    return (
        <div className={styles.exit_page_bar} onClick={(handleExitPage)}>
            Voltar
        </div>
    );
}

export default ExitPageBar;