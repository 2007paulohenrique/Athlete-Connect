import MainInput from "../../form/MainInput";
import Select from "../../form/Select";
import styles from "./Configs.module.css";

function PermissionConfig({ config, handleChange }) {
    return (
        <ul className={styles.config_items}>
            <h3>Permissões do Aplicativo</h3>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="permissao_camera"  
                    labelText="Clique abaixo para permitir que o Athlete Connect acesse a câmera do seu dispositivo" 
                    handleChange={handleChange} 
                    value={config.permissao_camera}
                    checked={config.permissao_camera}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="permissao_microfone"  
                    labelText="Clique abaixo para permitir que o Athlete Connect acesse o microfone do seu dispositivo" 
                    handleChange={handleChange} 
                    value={config.permissao_microfone}
                    checked={config.permissao_microfone}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="permissao_fotos_videos"  
                    labelText="Clique abaixo para permitir que o Athlete Connect acesse o armazenamento do seu dispositivo" 
                    handleChange={handleChange} 
                    value={config.permissao_fotos_videos}
                    checked={config.permissao_fotos_videos}
                /> 
            </li>

            <li>
                <MainInput 
                    type="checkbox" 
                    name="permissao_localizacao"  
                    labelText="Clique abaixo para permitir que o Athlete Connect acesse a sua localização" 
                    handleChange={handleChange} 
                    value={config.permissao_localizacao}
                    checked={config.permissao_localizacao}
                /> 
            </li>

            <hr/>

            <h3>Permissões do perfil</h3>

            <li>
                <Select 
                    name="permissao_marcacao" 
                    labelText="Marcações"
                    handleChange={handleChange}
                    values={["Todos", "Seguidores", "Seguidos", "Ninguém"]}
                    selectedValue={config.permissao_marcacao}
                    description="Indica quem pode te marcar em publicações."
                />
            </li>

            <li>
                <Select 
                    name="permissao_compartilhamento" 
                    labelText="Compartilhamentos"
                    handleChange={handleChange}
                    values={["Todos", "Seguidores", "Seguidos", "Ninguém"]}
                    selectedValue={config.permissao_compartilhamento}
                    description="Indica quem pode compartilhar algo para você."
                />
            </li>

            <li>
                <Select 
                    name="permissao_comentario" 
                    labelText="Comentários"
                    handleChange={handleChange}
                    values={["Todos", "Seguidores", "Seguidos", "Ninguém"]}
                    selectedValue={config.permissao_comentario}
                    description="Indica quem pode comentar em suas publicações."
                />
            </li>
        </ul>
    )
}

export default PermissionConfig;