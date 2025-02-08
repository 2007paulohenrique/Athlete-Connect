import MainInput from "../../form/MainInput";
import Select from "../../form/Select";
import styles from "./Configs.module.css";

function NotificationConfig({ config, handleChange}) {
    return (
        <ul className={styles.config_items}>
            <li>
                <MainInput 
                    type="checkbox" 
                    name="notificacoes_dispositivos"  
                    labelText="Clique abaixo para que você receba notificações nos dispositivos que você fez login no Athlete Connect" 
                    handleChange={handleChange} 
                    value={config.notificacoes_dispositivos}
                    checked={config.notificacoes_dispositivos}
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

            <li>
                <Select 
                    name="maximo_notificacoes_diarias" 
                    labelText="Notificações máximas"
                    handleChange={handleChange}
                    values={[10, 25, 50, 75, 100, 150, 200]}
                    selectedValue={config.maximo_notificacoes_diarias}
                    description="Indica o número máximo de notificações que você pode receber em seu dispositivo e e-mail dentro de um dia."
                />
            </li>
        </ul>
    )
}

export default NotificationConfig;