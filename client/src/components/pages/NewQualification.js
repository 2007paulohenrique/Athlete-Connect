import styles from "./NewQualification.module.css";
import qualificationIcon from "../../img/icons/socialMedia/qualificationIcon.png";
import { useCallback, useEffect, useRef, useState } from "react";
import Select from "../form/Select";
import SubmitButton from "../form/SubmitButton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../ProfileContext";
import Message from "../layout/Message";

function NewQualification() {
    const [profileQualifications, setProfileQualifications] = useState();
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [degrees, setDegrees] = useState([]);
    const [newQualification, setNewQualification] = useState({});
    const [selectedStateId, setSelectedStateId] = useState();
    const [selectedCitieId, setSelectedCitieId] = useState();
    const [selectedInstitutionId, setSelectedInstitutionId] = useState();
    const {profileId, setProfileId} = useProfile();
    const [message, setMessage] = useState({});

    const navigate = useNavigate();
    const welcomeRef = useRef();
    const addQualificationRef = useRef();
    
    function handleOnChangeQualification(e) {
        const { name, value } = e.target;
        const idMapping = {
            course: "id_curso_instituicao",
            degree: "id_grau_formacao",
        };
        
        let updatedValue = value;
        
        if (idMapping[name]) {
            const findId = (list) => list.find(item => (name === "course" ? item.nome : item.grau).toLowerCase() === value)?.[idMapping[name]] || null;

            updatedValue = findId(
                name === "course" ? courses :
                name === "degree" ? degrees :
                []
            );
        }
        
        setNewQualification(prev => ({
            ...prev,
            [idMapping[name] || name]: updatedValue
        }));
    }

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    const fetchProfileQualifications = useCallback(async (id) => {    
        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}/qualifications`);
            const data = resp.data;
            
            if (resp.status === 204) {
                navigate("/login", {state: {message: "Seu perfil foi desativado. Faça login e o ative para voltar a usá-lo.", type: "error"}});
                
                throw new Error("Perfil desativado");
            }

            if (data.error) {
                if (resp.status === 404) {
                    navigate("/login", {state: {message: data.error, type: "error"}});
                } else {
                    setMessageWithReset("Não foi possível recuperar as suas formações.", "error")
                }

                throw new Error("Erro ao buscar formações do perfil")
            } else {
                setProfileQualifications(data);  
            }
        } catch (err) {    
            console.error('Erro ao fazer a requisição:', err);
            
            if (err.response.status === 404) {
                navigate("/login", {state: {message: "Não foi possível encontrar nenhum perfil com o id fornecido. Tente fazer o login.", type: "error"}});
                
                throw err
            } else {
                setMessageWithReset("Não foi possível recuperar as suas formações.", "error")
            }
        }
    }, [navigate]);

    const addQualification = useCallback(async (id) => {    
        try {
            if (!(newQualification.id_curso_instituicao && newQualification.id_grau_formacao)) {
                setMessageWithReset("Selecione o curso e o grau de formação para adicionar sua formação.", "error");

                return;
            }

            const formData = new FormData();

            formData.append("courseId", newQualification.id_curso_instituicao);
            formData.append("degreeId", newQualification.id_grau_formacao);

            const resp = await axios.post(`http://localhost:5000/profiles/${id}/qualifications`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            });
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})

                throw new Error("Erro ao adicionar formação")
            } else {
                navigate("/", {state: {message: "Formação adicionada com sucesso.", type: "success"}});
            }
        } catch (err) {    
            console.error('Erro ao fazer a requisição:', err);
                      
            navigate("/errorPage", {state: {error: err.message}})

            throw err
        }

    }, [navigate, newQualification]);

    function handleOnSubmit(e) {
        e.preventDefault();

        addQualification(profileId);
    }

    const fetchStates = useCallback(async () => {    
        try {
            const resp = await axios.get(`http://localhost:5000/states`);
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})

                throw new Error("Erro ao buscar estados");
            } else {
                setStates(data);  
            }
        } catch (err) {    
            console.error('Erro ao fazer a requisição:', err);

            navigate("/errorPage", {state: {error: err.message}});
                            
            throw err
        }
    }, [navigate]);

    const fetchStateCities = useCallback(async (id) => {    
        try {
            const resp = await axios.get(`http://localhost:5000/states/${id}/cities`);
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})

                throw new Error("Erro ao buscar cidades do estado");
            } else {
                setCities(data);  
            }
        } catch (err) {    
            console.error('Erro ao fazer a requisição:', err);

            navigate("/errorPage", {state: {error: err.message}});
                            
            throw err
        }
    }, [navigate]);

    const fetchCityInstitutions = useCallback(async (id) => {    
        try {
            const resp = await axios.get(`http://localhost:5000/cities/${id}/institutions`);
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})

                throw new Error("Erro ao buscar instituições da cidade");
            } else {
                setInstitutions(data);  
            }
        } catch (err) {    
            console.error('Erro ao fazer a requisição:', err);

            navigate("/errorPage", {state: {error: err.message}});
                            
            throw err
        }
    }, [navigate]);

    const fetchInstitutionCourses = useCallback(async (id) => {    
        try {
            const resp = await axios.get(`http://localhost:5000/institutions/${id}/courses`);
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})

                throw new Error("Erro ao buscar cidades do estado");
            } else {
                setCourses(data);  
            }
        } catch (err) {    
            console.error('Erro ao fazer a requisição:', err);

            navigate("/errorPage", {state: {error: err.message}});
                            
            throw err
        }
    }, [navigate]);

    const fetchDegrees = useCallback(async () => {    
        try {
            const resp = await axios.get(`http://localhost:5000/degrees`);
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})

                throw new Error("Erro ao buscar graus de formação");
            } else {
                setDegrees(data);  
            }
        } catch (err) {    
            console.error('Erro ao fazer a requisição:', err);

            navigate("/errorPage", {state: {error: err.message}});
                            
            throw err
        }
    }, [navigate]);

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
    
        if (!confirmedProfileId) {
            console.error("Erro ao indentificar perfil");

            navigate("/login", {state: {message: "Não conseguimos identificar seu perfil. Tente fazer o login.", type: "error"}});
            
            return;
        }

        setProfileId(confirmedProfileId)

        const fetchData = async () => {
            try {
                await fetchProfileQualifications(confirmedProfileId);
                
                await fetchStates();

                await fetchDegrees();
            } catch (err) {
                console.error("Erro ao recuperar dados para adicionar uma nova formação:", err);

                throw err;
            }
        };
    
        fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedStateId) return;

        fetchStateCities(selectedStateId);
    }, [fetchStateCities, selectedStateId]);

    useEffect(() => {
        if (!selectedCitieId) return;

        fetchCityInstitutions(selectedCitieId);
    }, [fetchCityInstitutions, selectedCitieId]);

    useEffect(() => {
        if (!selectedInstitutionId) return;

        fetchInstitutionCourses(selectedInstitutionId);
    }, [fetchInstitutionCourses, selectedInstitutionId]);

    function moveToAddQualification() {
        welcomeRef.current.style.transform = "translateX(-100dvw)";
        addQualificationRef.current.style.transform = "translateX(-100dvw)";
    }

    return (
        <main className={styles.new_qualification_page}>
            {message && <Message message={message.message} type={message.type}/>}

            {profileQualifications && profileQualifications.length === 0 && 
                <div className={styles.welcome_screen} ref={welcomeRef}>
                    <div className={styles.welcome}>
                        <h2>
                            Mostre sua Credibilidade!

                            <img src={qualificationIcon} alt="Qualification"/>
                        </h2>

                        <div className={styles.welcome_text}>
                            <p>
                                Na AthleteConnect, acreditamos que a formação e a experiência são fundamentais para construir 
                                uma comunidade forte e respeitável. Ao adicionar suas qualificações, você não apenas compartilha 
                                seu conhecimento, mas também demonstra seu compromisso com o aprendizado contínuo no mundo dos esportes.
                            </p>

                            <p>
                                Tem alguma formação para compartilhar? Adicione suas qualificações acadêmicas e certificações 
                                para que outros usuários possam reconhecer seu esforço e dedicação. Sua participação é essencial 
                                para enriquecer a experiência de todos e promover um ambiente colaborativo onde todos possam crescer juntos.
                            </p>

                            <p>
                                Ao apresentar suas formações em seu perfil, você não apenas aumenta sua credibilidade, mas também 
                                se posiciona como uma fonte de inspiração para outros. Mostre aos visitantes que sua trajetória 
                                é fundamentada em estudos e experiências valiosas, incentivando-os a buscar conhecimento 
                                e aprimoramento em suas próprias jornadas esportivas.
                            </p>
                        </div>

                        <span onClick={moveToAddQualification}>Adicionar Formação</span>
                    </div>
                </div>
            }

            <div className={styles.add_qualification} ref={addQualificationRef}>
                {profileQualifications && profileQualifications.length !== 0 && 
                    <>
                        <h2>Suas Qualificações</h2>
                    
                        <ul className={styles.profile_qualifications}>
                            {profileQualifications.map(qualification => (
                                <li key={qualification.id_formacao}>
                                    <span>{`${qualification.grau} em ${qualification.curso}`}</span>

                                    <span>{`${qualification.instituicao} - ${qualification.estado} - ${qualification.cidade}`}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                }

                {states?.length !== 0 && degrees?.length !== 0 &&
                    <>
                        <h2>Adicionar Formação</h2>

                        <form onSubmit={handleOnSubmit}>
                            <Select 
                                name="state"
                                labelText="Estado"
                                handleChange={(e) => setSelectedStateId(states.find(state => state.sigla.toLowerCase() === e.target.value)?.id_estado)}
                                values={states.map(state => state.sigla)}
                                description="O estado em que você realizou o curso."
                            />

                            {selectedStateId &&
                                <Select 
                                    name="city"
                                    labelText="Cidade"
                                    handleChange={(e) => setSelectedCitieId(cities.find(city => city.nome.toLowerCase() === e.target.value)?.id_cidade)}
                                    values={cities.map(city => city.nome)}
                                    description="A cidade em que você realizou o curso."
                                />
                            }

                            {selectedCitieId &&
                                <Select 
                                    name="institution"
                                    labelText="Instituição"
                                    handleChange={(e) => setSelectedInstitutionId(institutions.find(institution => institution.nome.toLowerCase() === e.target.value)?.id_instituicao)}
                                    values={institutions.map(institution => institution.nome)}
                                    description="A instituição de ensino em que você realizou o curso."
                                />
                            }

                            {selectedInstitutionId &&
                                <Select 
                                    name="course"
                                    labelText="Curso"
                                    handleChange={handleOnChangeQualification}
                                    values={courses.map(course => course.nome)}
                                    description="O curso que você fez."
                                />
                            }

                            <Select 
                                name="degree"
                                labelText="Grau de formação"
                                handleChange={handleOnChangeQualification}
                                values={degrees.map(degree => degree.grau)}
                                description="O grau da sua formação."
                            />

                            <SubmitButton text="Adicionar formação"/>
                        </form>
                    </>
                }
            </div>
        </main>
    );
}

export default NewQualification;