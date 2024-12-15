import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SportCard from "../layout/SportCard";
import styles from "./ProfilePreferences.module.css";
import SubmitButton from "../form/SubmitButton";
import { useProfile } from '../../ProfileContext';
import axios from "axios"

function ProfilePreferences() {
    const [sports, setSports] = useState([]);
    const [profilePreferences, setProfilePreferences] = useState([]);
    const [profile, setProfile] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setProfileId } = useProfile(); 

    const navigate = useNavigate()
    const location = useLocation();

    useEffect(() => {
        const profile = location.state?.profileReady

        if (!profile) {
            navigate("/login");
        } else {
            setProfile(location.state.profileReady);
        }
    }, [location, navigate]);

    useEffect(() => {
        axios.get("http://localhost:5000/sports")
        .then(resp => {
            setSports(resp.data);
        })
        .catch(err => {
            console.error('Erro ao fazer a requisição:', err);
        });
    }, []);

    function handleOnClick(sport) {
        setProfilePreferences(prevPreferences => {
            if (prevPreferences.includes(sport)) {
                return prevPreferences.filter(item => item !== sport);
            } else {
                return [...prevPreferences, sport];
            }
        });
    }

    function handleOnSubmit(e) {
        e.preventDefault();

        if (isSubmitting) return; 

        setIsSubmitting(true);

        const sportsIds = profilePreferences.map(sport => sport.id_esporte);
        profile['preferences'] = sportsIds;

        const formData = new FormData();

        formData.append("name", profile["confirmedNameSignUp"]);
        formData.append("email", profile["emailSignUp"]);
        formData.append("password", profile["passwordSignUp"]);
        formData.append("bio", profile["bio"]);
        formData.append("private", profile["private"]);
        if (profile["photo"] && profile["photo"].length > 0) {
            formData.append("photo", profile["photo"][0]);
        }
        sportsIds.forEach(sportId => formData.append("preferences", sportId));

        axios.post("http://localhost:5000/profiles", formData, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
            setProfileId(resp.data.profileId);
            localStorage.setItem('athleteConnectProfileId', resp.data.profileId)
            
            navigate("/");
        })
        .catch(err => {
            console.error('Erro ao fazer a requisição:', err);
            setIsSubmitting(false);
        });
    }

    return (
        <main className={styles.profile_preferences_page}>
            <header className={styles.title_section}> 
                <h1>Suas Preferências</h1>
                <p>Selecione os esportes que te agradam para personalizarmos seu feed de acordo com seu gosto.</p>
            </header>

            <hr/>

            <div className={styles.sports_cards}>
                {sports.map((sport) => (
                    <SportCard 
                        key={sport.id_esporte}
                        iconPath={sport.iconPath.caminho} 
                        sportName={sport.nome} 
                        categories={sport.categories} 
                        handleClick={() => handleOnClick(sport)}
                        selected={profilePreferences.includes(sport)}
                    />
                ))}
            </div>

            <form onSubmit={handleOnSubmit}>
                <SubmitButton text="Confirmar preferências"/>
            </form>
        </main>
    );
}

export default ProfilePreferences;
























