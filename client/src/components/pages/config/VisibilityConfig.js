import MainInput from "../../form/MainInput";
import styles from "./Configs.module.css";

function VisibilityConfig({ config, handleChange}) {
    return (
        <ul className={styles.config_items}>
            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_curtidas"  
                    labelText="Clique abaixo para que o número de curtidas apareça em suas postagens" 
                    handleChange={handleChange} 
                    value={config.visibilidade_curtidas}
                    checked={config.visibilidade_curtidas}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_compartilhamentos"  
                    labelText="Clique abaixo para que o número de compartilhamentos apareça em suas postagens" 
                    handleChange={handleChange} 
                    value={config.visibilidade_compartilhamentos}
                    checked={config.visibilidade_compartilhamentos}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_comentarios"  
                    labelText="Clique abaixo para que o número de comentários apareça em suas postagens" 
                    handleChange={handleChange} 
                    value={config.visibilidade_comentarios}
                    checked={config.visibilidade_comentarios}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_seguindo"  
                    labelText="Clique abaixo para que outros perfis possam ver quem você segue" 
                    handleChange={handleChange} 
                    value={config.visibilidade_seguindo}
                    checked={config.visibilidade_seguindo}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="visibilidade_seguidores"  
                    labelText="Clique abaixo para que outros perfis possam ver quem te segue" 
                    handleChange={handleChange} 
                    value={config.visibilidade_seguidores}
                    checked={config.visibilidade_seguidores}
                /> 
            </li>
        </ul>
    )
}

export default VisibilityConfig;