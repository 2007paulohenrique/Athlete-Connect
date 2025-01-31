import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SportCard from "../layout/SportCard";
import styles from "./ProfilePreferences.module.css";
import SubmitButton from "../form/SubmitButton";
import { useProfile } from '../../ProfileContext';
import axios from "axios"
import loading from "../../img/animations/loading.svg";
import ConfirmationBox from "../layout/ConfirmationBox";

function ProfilePreferences() {
    const [sports, setSports] = useState([]);
    const [profilePreferences, setProfilePreferences] = useState([]);
    const [profile, setProfile] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {setProfileId} = useProfile(); 
    const [isModifyPreferences, setIsModifyPreferences] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

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
        const profileReady = location?.state?.profileReady
        const modifyProfile = location?.state?.modifyProfile
        const prevPreferences = location?.state?.prevPreferences || []

        if (profileReady || (modifyProfile && prevPreferences)) {
            setProfile(profileReady || modifyProfile);
            setProfilePreferences(prevPreferences);
            setIsModifyPreferences(!profileReady);

            fetchSports();
        } else {
            navigate("/login");
        }
    }, [fetchSports, location, navigate]);
    
    function handleOnClick(sport) {
        setProfilePreferences(prevPreferences => {
            if (prevPreferences.some(prevSport => String(sport.id_esporte) === String(prevSport.id_esporte))) {
                return prevPreferences.filter(prevSport => String(sport.id_esporte) !== String(prevSport.id_esporte));
            } else {
                return [...prevPreferences, sport];
            }
        });
    }

    function handleOnSubmit(e) {
        e.preventDefault();

        if (isSubmitting) return; 
    
        setIsSubmitting(true);
        
        if (profilePreferences.length === 0) {
            setIsSubmitting(false);
            setShowConfirmation(true)
        } else {
            if (!isModifyPreferences) {
                checkProfile();
            } else {
                modifyPreferences();
            }
        }
    }

    const createProfile = async () => {
        try {
            const sportsIds = profilePreferences.map(sport => sport.id_esporte);

            const formData = new FormData();

            formData.append("name", profile.confirmedNameSignUp);
            formData.append("email", profile.emailSignUp);
            formData.append("password", profile.passwordSignUp);
            formData.append("bio", profile.bio);
            formData.append("private", profile.private);
            sportsIds.forEach(sportId => formData.append("preferences", sportId));

            if (profile.photo && profile.photo.length > 0) formData.append("photo", profile.photo[0]);

            const resp = await axios.post("http://localhost:5000/profiles", formData, {
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

    const modifyPreferences = async () => {
        try {
            const sportsIds = profilePreferences.map(sport => sport.id_esporte);

            const formData = new FormData();

            sportsIds.forEach(sportId => formData.append("preferences", sportId));

            const resp = await axios.put(`http://localhost:5000/profiles/${profile.id_perfil}/preferences`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                setIsSubmitting(false);

                navigate("/errorPage", {state: {error: data.error}})
            } else {                
                navigate("/myProfile", {state: {message: "Preferências modificadas com sucesso.", type: "success"}});
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
            {showConfirmation && 
                <ConfirmationBox 
                    text="As preferências são de grande importância para recomendarmos conteúdo para você. Deseja criar seu perfil sem ter nenhuma preferência?" 
                    handleConfirmation={!isModifyPreferences ? checkProfile : modifyPreferences} 
                    setShowConfirmation={setShowConfirmation}
                />
            }

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
                        selected={profilePreferences.some(prevSport => String(sport.id_esporte) === String(prevSport.id_esporte))}
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
























