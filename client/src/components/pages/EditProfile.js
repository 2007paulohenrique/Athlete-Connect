import { useEffect, useState } from "react";
import EditProfileForm from "../form/EditProfileForm";
import styles from "./EditProfile.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import Message from "../layout/Message";
import axios from "axios";

function EditProfile() {
    const [profile, setProfile] = useState({});
    const [message, setMessage] = useState({});
    const [submitError, setSubmitError] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const profile = location.state?.profile

        if (!profile) {
            navigate("/login");
        } else {
            setProfile(location.state.profile);
        }
    }, [location, navigate]);

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    function handleOnSubmit(e) {
        e.preventDefault();

        const formData = new FormData();
        
        formData.append("email", profile["emailSignUp"]);
        formData.append("name", profile["confirmedNameSignUp"]);

        axios.post(`http://localhost:5000/signup`, formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
            const data = resp.data;

            if (data !== "signUpError") {
                if (!profile["bio"]) profile["bio"] = "";
                if (profile["private"] === undefined) profile["private"] = false;      
    
                navigate("/profilePreferences", {state: {profileReady: profile}});
            } else {
                setMessageWithReset("Já existe um perfil com o mesmo nome.", "error");
            }
        })
        .catch(err => {
            console.error("Erro ao fazer a requisição:", err);
        }); 
    }

    return (
        <main className={styles.edit_profile_page}>
            {message && <Message message={message.message} type={message.type}/>}

            <EditProfileForm 
                handleSubmit={handleOnSubmit} 
                profile={profile} 
                setProfile={setProfile} 
                submitError={submitError} 
                setSubmitError={setSubmitError}
            />
        </main>
    );
}

export default EditProfile;