import { useEffect, useState } from "react";
import EditProfileForm from "../form/EditProfileForm";
import styles from "./EditProfile.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function EditProfile() {
    const [profile, setProfile] = useState({});
    const [submitError, setSubmitError] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const profile = location?.state?.profile

        if (!profile) {
            navigate("/login");
        } else {
            setProfile(profile);
        }
    }, [location, navigate]);

    const checkProfile = async () => {
        try {
            const formData = new FormData();
        
            formData.append("email", profile.emailSignUp);
            formData.append("name", profile.confirmedNameSignUp);    

            const resp = await axios.post(`http://localhost:5000/signup`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                if (data.error === "signup") {
                    navigate("/login", {state: {message: "Ocorreu um erro ao criar seu perfil. Tente novamente.", type: "error"}});
                } else {
                    navigate("/errorPage", {state: {error: data.error}})
                }
            } else {
                if (!profile.bio) profile.bio = "";
                if (profile.private === undefined) profile.private = false;      

                navigate("/profilePreferences", {state: {profileReady: profile}});
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        }
    }

    function handleOnSubmit(e) {
        e.preventDefault();

        if (submitError) return;

        checkProfile();
    }

    return (
        <main className={styles.edit_profile_page}>
            <EditProfileForm 
                handleSubmit={handleOnSubmit} 
                profile={profile} 
                setProfile={setProfile} 
                setSubmitError={setSubmitError}
            />
        </main>
    );
}

export default EditProfile;