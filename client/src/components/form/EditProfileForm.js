import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import userIcon from "../../img/icons/socialMedia/userIcon.png";
import bioIcon from "../../img/icons/socialMedia/bioIcon.png";
import styles from "./EditProfileForm.module.css"
import { useCallback, useEffect, useState } from "react";
import TextareaInput from "./TextareaInput";

function EditProfileForm({handleSubmit, profile, setProfile, setSubmitError}) {
    const [privateProfile, setPrivateProfile] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [haveError, setHaveError] = useState(false);

    function handleOnChange(e) {
        if (e.target.name === "confirmedNameSignUp") e.target.value = e.target.value.replace(/\s+/g, "");

        if (e.target.name === "bio") {    
            e.target.value = e.target.value.trimStart().replace(/\n+/g, "").replace(/\s+/g, " ")
        }

        setProfile({ ...profile, [e.target.name]: e.target.value.trim() });
    }

    function handleOnChangePrivate() {
        const newPrivateProfile = !privateProfile;
        setPrivateProfile(newPrivateProfile); 
        setProfile({ ...profile, private: newPrivateProfile });
    }

    function handleOnChangeAcceptTerms() {
        const newAcceptTerms = !acceptTerms;
        setAcceptTerms(newAcceptTerms);
        setProfile({...profile, acceptTerms: newAcceptTerms })
    }

    const validateName = useCallback(() => {
        console.log(profile["confirmedNameSignUp"])
        return profile["confirmedNameSignUp"] && /^[a-zA-Z0-9_@+&.]{4,30}$/.test(profile["confirmedNameSignUp"]);
    }, [profile]); 
    
    const validateBio = useCallback(() => {
        return (profile["bio"] && profile["bio"].length <= 150) || !profile["bio"];
    }, [profile]);

    useEffect(() => {
        setHaveError(!(validateName() && validateBio() && acceptTerms));

        setSubmitError(haveError);
    }, [acceptTerms, haveError, profile, setSubmitError, validateBio, validateName]);

    return (
        <form onSubmit={handleSubmit} className={`${styles.edit_profile_form}`}>
            <h2>Editar Perfil</h2>

            <p className={styles.empty_field_alert}>- Campos obrigatórios são marcados com "*"</p>

            <div className={styles.inputs_container}>
                <InputField 
                    type="text" 
                    name="confirmedNameSignUp" 
                    placeholder="Insira o nome de usuário" 
                    labelText="Nome de Usuário*" 
                    alertMessage='O nome de usuário deve ter entre 4 e 30 caracteres, sem espaços e símbolos diferentes de: "_", "@", "+","&" e ".".' 
                    inputIcon={userIcon}
                    inputIconAlt="User Icon"
                    handleChange={handleOnChange} 
                    showAlert={profile["confirmedNameSignUp"] && !validateName()}
                    value={profile["confirmedNameSignUp"]}
                />

                <TextareaInput 
                    name="bio" 
                    placeholder="Insira sua biografia" 
                    maxLength="150"
                    labelText="Biografia" 
                    alertMessage="A biografia não pode ter mais que 150 caracteres." 
                    inputIcon={bioIcon}
                    inputIconAlt="Bio Icon"
                    handleChange={handleOnChange} 
                    showAlert={profile["bio"] && !validateBio()}
                />

                <div className={styles.checkboxs}>
                    <InputField 
                        type="checkbox" 
                        name="private"  
                        labelText="Clique na caixa abaixo para tornar seu perfil privado" 
                        handleChange={handleOnChangePrivate} 
                    />

                    <InputField 
                        type="checkbox" 
                        name="acceptTerms"  
                        labelText={
                            <>
                                Clique na caixa abaixo para aceitar os <a href="termosECondicoes" target="_blank" rel="noopener noreferrer">termos e condições</a> do Athlete Connect e criar uma conta
                            </>
                        } 
                        handleChange={handleOnChangeAcceptTerms} 
                    />
                </div>
            </div>

            <div className={styles.buttons_container}>
                <SubmitButton text="Criar perfil" haveError={haveError}/>
            </div>
        </form>
    );
}

export default EditProfileForm;