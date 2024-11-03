import LoginForm from "../form/LoginForm";
import styles from "./Login.module.css";

function Login() {
    return (
        <main className={styles.login_page}>
            <div className={styles.login_container}>
                <div className={styles.forms_container}>
                    <LoginForm isLogin={false}/>
                    <LoginForm isLogin={true}/>
                </div>
                <div className={styles.welcome_container}>
                    Bem-vindo ao Athlete Connect
                </div>
            </div>
        </main>
    );
}

export default Login;