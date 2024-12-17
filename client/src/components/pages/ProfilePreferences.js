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

        const formDataA = new FormData();
                
        formDataA.append("email", profile["emailSignUp"]);
        formDataA.append("name", profile["confirmedNameSignUp"]);

        axios.post(`http://localhost:5000/signup`, formDataA, {
            headers: { "Content-Type": "multipart/form-data" }, 
        })
        .then(resp => {
            const data = resp.data;

            if (data !== "signUpError") {
                const sportsIds = profilePreferences.map(sport => sport.id_esporte);
                profile['preferences'] = sportsIds;

                const formDataB = new FormData();

                formDataB.append("name", profile["confirmedNameSignUp"]);
                formDataB.append("email", profile["emailSignUp"]);
                formDataB.append("password", profile["passwordSignUp"]);
                formDataB.append("bio", profile["bio"]);
                formDataB.append("private", profile["private"]);
                if (profile["photo"] && profile["photo"].length > 0) {
                    formDataB.append("photo", profile["photo"][0]);
                }
                sportsIds.forEach(sportId => formDataB.append("preferences", sportId));

                axios.post("http://localhost:5000/profiles", formDataB, {
                    headers: { "Content-Type": "multipart/form-data" }, 
                })
                .then(resp => {
                    setProfileId(resp.data.profileId);
                    localStorage.setItem('athleteConnectProfileId', resp.data.profileId)
                    
                    navigate("/", {state: {message: "Perfil criado com sucesso! Aproveite o Athlete Connect.", type: "success"}});
                })
                .catch(err => {
                    console.error('Erro ao fazer a requisição:', err);
                    setIsSubmitting(false);
                });
            } else {
                setIsSubmitting(false);
                navigate("/login", {state: {message: "Ocorreu um erro ao criar seu perfil. Tente novamente.", type: "error"}});
            }
        })
        .catch(err => {
            setIsSubmitting(false);
            console.error("Erro ao fazer a requisição:", err);
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
























