import MainInput from "../../form/MainInput";
import styles from "./Configs.module.css";

function NotificationConfig({ config, handleChange}) {
    return (
        <ul className={styles.config_items}>
            <li>
                <MainInput 
                    type="checkbox" 
                    name="notificacoes"  
                    labelText="Clique abaixo para que você receba notificações do Athlete Connect" 
                    handleChange={handleChange} 
                    value={config.notificacoes}
                    checked={config.notificacoes}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="notificacoes_email"  
                    labelText="Clique abaixo para que você receba notificações no E-mail do Athlete Connect" 
                    handleChange={handleChange} 
                    value={config.notificacoes_email}
                    checked={config.notificacoes_email}
                /> 
            </li>
        </ul>
    )
}

export default NotificationConfig;