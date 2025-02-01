import { useCallback, useEffect } from "react";
import MainInput from "../../form/MainInput";
import PhotoInput from "../../form/PhotoInput";
import SubmitButton from "../../form/SubmitButton";
import Textarea from "../../form/Textarea";
import styles from "./Configs.module.css";
import userIcon from "../../../img/icons/socialMedia/userIcon.png";
import bioIcon from "../../../img/icons/socialMedia/bioIcon.png";
import { useNavigate } from "react-router-dom";

function ProfileConfig({ initialProfile, profile, setProfile, handleModifyProfile, handleDesactiveProfile, handleExitAccount, setSubmitError }) {
    const navigate = useNavigate();

    function handleOnChangeProfile(e) {
        if (e.target.name === "nome") e.target.value = e.target.value.replace(/\s+/g, "");

        if (e.target.name === "biografia") {    
            e.target.value = e.target.value.trimStart().replace(/\n+/g, "").replace(/\s+/g, " ")
        }

        setProfile(prevProfile => ({...prevProfile, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value}));
    }
    
    function handleOnChangeProfilePhoto(e) {
        const files = Array.from(e.target.files);
    
        if (files.length === 0) return; 
    
        const blobUrl = URL.createObjectURL(files[0]); 
    
        if (files.length === 1) {
            setProfile(prevProfile => ({...prevProfile, blobUrl, photo: files}));
        }
    }

    const validateName = useCallback(() => {
        return (profile?.nome && 
            /^[a-zA-Z0-9_@+&.]{4,30}$/.test(profile?.nome)) ||
            !profile?.nome;
    }, [profile]); 
    
    const validateBio = useCallback(() => {
        return (profile?.biografia && profile?.biografia.length <= 150) || 
            !profile?.biografia;
    }, [profile]); 

    useEffect(() => {
        if (!profile?.nome) {
            setSubmitError(true);
            
            return;
        }

        setSubmitError(!(validateName() && validateBio()));
    }, [profile, setSubmitError, validateBio, validateName]);

    return (
        <form className={styles.config_items} onSubmit={handleModifyProfile}>
            <PhotoInput 
                name="profilePhoto" 
                photoPath={profile?.blobUrl || profile?.media?.caminho} 
                handleChange={handleOnChangeProfilePhoto} 
                size="large"
                isBlobUrl={profile?.blobUrl}
            />

            <MainInput
                type="text"
                name="nome"
                placeholder="Insira o nome de usuário" 
                labelText="Nome de Usuário*"
                maxLength={30} 
                alertMessage='O nome de usuário deve ter entre 4 e 30 caracteres, sem espaços e símbolos diferentes de: "_", "@", "+","&" e ".".' 
                handleChange={handleOnChangeProfile} 
                inputIcon={userIcon}
                inputIconAlt="User Icon"
                showAlert={!validateName()}
                value={profile?.nome}
            />

            <Textarea 
                name="biografia" 
                placeholder="Insira sua biografia" 
                maxLength={150}
                labelText="Biografia" 
                alertMessage="A biografia não pode ter mais que 150 caracteres." 
                handleChange={handleOnChangeProfile} 
                showAlert={!validateBio()}
                inputIconAlt="Bio Icon"
                inputIcon={bioIcon}
                value={profile?.biografia}
            />     

            <MainInput 
                type="checkbox" 
                name="privado"  
                labelText="Clique abaixo para tornar seu perfil privado, com isso, somente seus seguidores terão acesso às suas publicações e flashes" 
                handleChange={handleOnChangeProfile} 
                value={profile?.privado}
                checked={profile?.privado}
            />                  


            <div className={styles.profile_account_actions}>
                {JSON.stringify(initialProfile) !== JSON.stringify(profile) && <SubmitButton text="Confirmar alterações"/>}

                <div className={styles.profile_edit_buttons}>
                    <button 
                        onClick={() => navigate("/profilePreferences", {state: {prevPreferences: profile.preferences, modifyProfile: profile}})}
                    >
                        Editar preferências
                    </button>

                    <button>
                        Adicionar formação
                    </button>
                </div>

                <div className={styles.profile_actions_buttons}>
                    <button 
                        type="button"
                        onClick={handleDesactiveProfile}
                    >
                        Desativar perfil
                    </button>

                    <button 
                        type="button"
                        onClick={handleExitAccount}
                    >
                        Sair da conta
                    </button>
                </div>
            </div>
        </form>
    )
}

export default ProfileConfig;