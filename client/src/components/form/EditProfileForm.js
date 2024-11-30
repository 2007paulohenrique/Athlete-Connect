import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import styles from "./EditProfileForm.module.css"
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function EditProfileForm() {
    const [profile, setProfile] = useState({});
    const [privateProfile, setPrivateProfile] = useState(false);
    const [haveError, setHaveError] = useState(false);

    const navigate = useNavigate()
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.profile) {
            setProfile(location.state.profile);
        }
    }, [location.state]);

    function handleOnChange(e) {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    }

    function handleOnChangeCheckBox() {
        setPrivateProfile(!privateProfile);
    }

    const validateName = () => profile["nameSignUp"] && /^[a-zA-Z0-9_@+&.]{4,30}$/.test(profile["nameSignUp"]);
    const validateBio = () => (profile["bio"] && profile["bio"].length <= 150) || !profile["bio"];


    useEffect(() => {
        setHaveError(!(validateName() && validateBio()));
    }, [profile]);

    function handleSubmit(e) {
        e.preventDefault();

        const updatedProfile = { ...profile, private: privateProfile };

        if (!updatedProfile["bio"]) updatedProfile["bio"] = "";

        console.log(updatedProfile);
        axios.post("http://localhost:5000/profiles", updatedProfile)
        .then(resp => sessionStorage.setItem("profileId", resp.data.profileId))
        .catch(err => {
            console.error('Erro ao fazer a requisição:', err);
        });

        navigate("/home");
    }

    return (
        <form onSubmit={handleSubmit} className={`${styles.edit_profile_form}`}>
            <h2>Editar Perfil</h2>

            <p className={styles.empty_field_alert}>- Campos obrigatórios são marcados com "*"</p>

            <div className={styles.inputs_container}>
                <InputField 
                    type="text" 
                    name="nameSignUp" 
                    placeholder="Insira o nome de usuário" 
                    labelText="Nome de Usuário*" 
                    alertMessage='O nome de usuário deve ter entre 4 e 30 caracteres, sem espaços e símbolos diferentes de: "_", "@", "+","&" e ".".' 
                    handleChange={handleOnChange} 
                    showAlert={profile["nameSignUp"] && !validateName()}
                    value={profile["nameSignUp"]}
                />

                <InputField 
                    type="text" 
                    name="bio" 
                    placeholder="Insira sua biografia" 
                    labelText="Biografia" 
                    alertMessage="A biografia não pode ter mais que 150 caracteres." 
                    handleChange={handleOnChange} 
                    showAlert={profile["bio"] && !validateBio()}
                />

                <InputField 
                    type="checkbox" 
                    name="private"  
                    labelText="Clique na caixa abaixo para tornar seu perfil privado" 
                    handleChange={handleOnChangeCheckBox} 
                />
            </div>

            <div className={styles.buttons_container}>
                <SubmitButton text="Criar perfil" haveError={haveError}/>
            </div>
        </form>
    );
}

export default EditProfileForm;