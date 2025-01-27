import MainInput from "./MainInput";
import SubmitButton from "./SubmitButton";
import userIcon from "../../img/icons/socialMedia/userIcon.png";
import bioIcon from "../../img/icons/socialMedia/bioIcon.png";
import styles from "./EditProfileForm.module.css"
import { useCallback, useEffect } from "react";
import Textarea from "./Textarea";
import PhotoInput from "./PhotoInput";

function EditProfileForm({ handleSubmit, profile, setProfile, setSubmitError }) {
    function handleOnChange(e) {
        if (e.target.name === "confirmedNameSignUp") e.target.value = e.target.value.replace(/\s+/g, "");

        if (e.target.name === "bio") {    
            e.target.value = e.target.value.trimStart().replace(/\n+/g, "").replace(/\s+/g, " ")
        }

        setProfile({...profile, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value});
    }

    const validateName = useCallback(() => {
        return (profile.confirmedNameSignUp && 
            /^[a-zA-Z0-9_@+&.]{4,30}$/.test(profile.confirmedNameSignUp)) ||
            !profile.confirmedNameSignUp;
    }, [profile]); 
    
    const validateBio = useCallback(() => {
        return (profile.bio && profile.bio.length <= 150) || 
            !profile.bio;
    }, [profile]);

    useEffect(() => {
        if (!(profile.confirmedNameSignUp)) {
            setSubmitError(true);
            
            return;
        }

        setSubmitError(!(validateName() && validateBio() && profile.acceptTerms));
    }, [profile, setSubmitError, validateBio, validateName]);

    function handleFileChange(e) {
        const files = Array.from(e.target.files);
    
        if (files.length === 0) return; 
    
        const blobUrl = URL.createObjectURL(files[0]); 
    
        if (files.length === 1) {
            setProfile({...profile, blobUrl, photo: files});
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`${styles.edit_profile_form}`}>
            <PhotoInput name="profilePhoto" photoPath={profile.blobUrl} handleChange={handleFileChange} size="medium"/>

            <h2>Editar Perfil</h2>

            <p className={styles.empty_field_alert}>- Campos obrigatórios são marcados com "*"</p>

            <div className={styles.inputs_container}>
                <MainInput 
                    type="text" 
                    name="confirmedNameSignUp" 
                    placeholder="Insira o nome de usuário" 
                    labelText="Nome de Usuário*"
                    maxLength={30} 
                    alertMessage='O nome de usuário deve ter entre 4 e 30 caracteres, sem espaços e símbolos diferentes de: "_", "@", "+","&" e ".".' 
                    inputIcon={userIcon}
                    inputIconAlt="User Icon"
                    handleChange={handleOnChange} 
                    showAlert={!validateName()}
                    value={profile.confirmedNameSignUp}
                />

                <Textarea 
                    name="bio" 
                    placeholder="Insira sua biografia" 
                    maxLength={150}
                    labelText="Biografia" 
                    alertMessage="A biografia não pode ter mais que 150 caracteres." 
                    inputIcon={bioIcon}
                    inputIconAlt="Bio Icon"
                    handleChange={handleOnChange} 
                    showAlert={!validateBio()}
                    value={profile.bio}
                />

                <div className={styles.checkboxs}>
                    <MainInput 
                        type="checkbox" 
                        name="private"  
                        labelText="Clique abaixo para tornar seu perfil privado, com isso, somente seus seguidores terão acesso às suas publicações e flashes" 
                        handleChange={handleOnChange} 
                        value={profile.private}
                        checked={profile.private}
                    />

                    <MainInput 
                        type="checkbox" 
                        name="acceptTerms"  
                        labelText={
                            <>
                                Clique abaixo para aceitar os <a href="termosECondicoes" target="_blank" rel="noopener noreferrer">termos e condições</a> do Athlete Connect e sua conta
                            </>
                        } 
                        handleChange={handleOnChange} 
                        value={profile.acceptTerms}
                        checked={profile.acceptTerms}
                    />
                </div>
            </div>

            <div className={styles.buttons_container}>
                <SubmitButton text="Criar perfil"/>
            </div>
        </form>
    );
}

export default EditProfileForm;