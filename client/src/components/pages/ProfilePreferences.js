import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SportCard from "../layout/SportCard";
import styles from "./ProfilePreferences.module.css";
import SubmitButton from "../form/SubmitButton";
import { useProfile } from '../../ProfileContext';
import axios from "axios"
import loading from "../../img/animations/loading.svg";

function ProfilePreferences() {
    const [sports, setSports] = useState([]);
    const [profilePreferences, setProfilePreferences] = useState([]);
    const [profile, setProfile] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setProfileId } = useProfile(); 

    const navigate = useNavigate();
    const location = useLocation();
    
    const fetchSports = useCallback(async () => {
        try {
            const resp = await axios.get("http://localhost:5000/sports");
            const data = resp.data;
            
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                setSports(data);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [navigate]);

    useEffect(() => {
        const profile = location?.state?.profileReady

        if (!profile) {
            navigate("/login");
        } else {
            setProfile(location.state.profileReady);

            fetchSports();
        }
    }, [fetchSports, location, navigate]);
    
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

        checkProfile();
    }

    const createProfile = async () => {
        try {
            const sportsIds = profilePreferences.map(sport => sport.id_esporte);
            profile.preferences = sportsIds;

            const formDataB = new FormData();

            formDataB.append("name", profile.confirmedNameSignUp);
            formDataB.append("email", profile.emailSignUp);
            formDataB.append("password", profile.passwordSignUp);
            formDataB.append("bio", profile.bio);
            formDataB.append("private", profile.private);
            sportsIds.forEach(sportId => formDataB.append("preferences", sportId));

            if (profile.photo && profile.photo.length > 0) formDataB.append("photo", profile.photo[0]);

            const resp = await axios.post("http://localhost:5000/profiles", formDataB, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                setIsSubmitting(false);

                navigate("/errorPage", {state: {error: data.error}})
            } else {
                setProfileId(data.profileId);
                localStorage.setItem('athleteConnectProfileId', data.profileId)
                
                navigate("/", {state: {message: "Perfil criado com sucesso! Aproveite o Athlete Connect.", type: "success"}});
            }
        } catch (err) {
            setIsSubmitting(false);
                    
            navigate("/errorPage", {state: {error: err.message}})

            console.error('Erro ao fazer a requisição:', err);
        }
    }

    const checkProfile = async () => {
        try {
            const formData = new FormData();
        
            formData.append("email", profile.emailSignUp);
            formData.append("name", profile.confirmedNameSignUpnameSignUp); 

            const resp = await axios.post(`http://localhost:5000/signup`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                setIsSubmitting(false);

                if (data.error === "signup") {
                    navigate("/login", {state: {message: "Ocorreu um erro ao criar seu perfil. Tente novamente.", type: "error"}});
                } else {
                    navigate("/errorPage", {state: {error: data.error}})
                }
            } else {
                createProfile();
            }
        } catch (err) {
            setIsSubmitting(false);

            navigate("/errorPage", {state: {error: err.message}})
            
            console.error("Erro ao fazer a requisição:", err);
        }
    }

    return (
        <main className={styles.profile_preferences_page}>
            <header className={styles.title_section}> 
                <h1>Suas Preferências</h1>

                <p>Selecione os esportes que te agradam para personalizarmos seu feed de acordo com seu gosto.</p>
            </header>

            <hr/>

            <div className={styles.sports_cards}>
                {(!sports || sports.length === 0) && (
                    <img className="loading" src={loading} alt="Loading"/>
                )}

                {sports.map((sport) => (
                    <SportCard 
                        key={sport.id_esporte}
                        iconPath={sport.iconPath} 
                        sportName={sport.nome} 
                        categories={sport.categories} 
                        handleClick={() => handleOnClick(sport)}
                        selected={profilePreferences.includes(sport)}
                        sportDescription={sport.descricao}
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
























