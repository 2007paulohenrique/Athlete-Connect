import { useCallback, useEffect, useState } from "react";
import styles from "./NewPlace.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Textarea from "../form/Textarea";
import fetchSports from "../../utils/fetch/FetchSports";
import SubmitButton from "../form/SubmitButton";
import { useProfile } from "../../ProfileContext";
import Message from "../layout/Message";
import MainInput from "../form/MainInput";
import placePhotoIcon from "../../img/icons/socialMedia/placePhotoIcon.png";

function NewPlace() {
    const [place, setPlace] = useState({
        street: "",
        number: "",
        neighborhood: "",
        postalCode: "",
        state: "",
        city: "",
        description: ""
    });
    const [sports, setSports] = useState([]);
    const [selectedSports, setSelectedSports] = useState([]);
    const [message, setMessage] = useState({});
    const [addressText, setAddressText] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [locationPermission, setLocationPermission] = useState(false);
    const {profileId, setProfileId} = useProfile();

    const navigate = useNavigate();

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(addressText);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [addressText]);

    const formatDisplayName = useCallback((place) => {
        return `${place.street}${place.number ? `, ${place.number}` : ''} - ${place.neighborhood ? `${place.neighborhood}, ` : ''}${place.city} - ${place.state}${place.postalCode ? `, ${place.postalCode}` : ''}`;
    }, []);

    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setSuggestions([]);
            
            return;
        }

        const fetchAddresses = async () => {
            try {
                const resp = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                    params: {
                        q: debouncedQuery,
                        format: "json",
                        addressdetails: 1,
                        limit: 5
                    }
                });
                const data = resp.data;
                
                setSuggestions(data.map(suggestion => ({
                    ...suggestion,
                    display_name: formatDisplayName({
                        street: suggestion.address.road || "",
                        number: suggestion.address.house_number || "",
                        neighborhood: suggestion.address.city_district || suggestion.address.suburb || suggestion.address.neighbourhood || "",
                        postalCode: suggestion.address.postcode || "",
                        state: suggestion.address.state || "",
                        city: suggestion.address.city || suggestion.address.town || suggestion.address.village || ""
                    }),
                })));
            } catch (err) {
                console.error("Erro ao buscar sugestões de endereço:", err);
            }
        };

        fetchAddresses();
    }, [debouncedQuery, formatDisplayName]);

    const fetchCurrentAddress = useCallback(async () => {
        if (!locationPermission) {
            setMessageWithReset("Não foi possível acessar sua localização. Confirme a permissão de acesso à localização nas configurações.");
            
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const {latitude, longitude} = position.coords;
    
                try {
                    const resp = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
                        params: {
                            lat: latitude,
                            lon: longitude,
                            format: "json",
                            addressdetails: 1
                        }
                    });
                    const data = resp.data;

                    const formattedAddress = {
                        ...data,
                        display_name: formatDisplayName({
                            street: data.address.road || "",
                            number: data.address.house_number || "",
                            neighborhood: data.address.city_district || data.address.suburb || data.address.neighbourhood || "",
                            postalCode: data.address.postcode || "",
                            state: data.address.state || "",
                            city: data.address.city || data.address.town || data.address.village || ""
                        }),
                    }
                    
                    setAddressText(formattedAddress.display_name);
                    setSuggestions([]);
            
                    setPlace(prevPlace => ({
                        ...prevPlace,
                        street: data.address.road || "",
                        number: data.address.house_number || prevPlace.number || "",
                        neighborhood: data.address.city_district || data.address.suburb || data.address.neighbourhood || "",
                        postalCode: data.address.postcode || "",
                        state: data.address.state || "",
                        city: data.address.city || data.address.town || data.address.village || ""
                    }));
                } catch (err) {
                    console.error("Erro ao buscar o endereço:", err);
                }
            }, (err) => {
                console.error("Erro ao obter localização:", err);
            });
        } else {
            console.error("Geolocalização não suportada pelo navegador.");

            setMessageWithReset("O navegador não suporta o serviço de geolocalização.", "error");
        }
    }, [formatDisplayName, locationPermission]);

    const fetchLocationPermission = useCallback(async (id) => {
        try {
            const resp = await axios.get(`https://localhost:5000/profiles/${id}/config`);
            const data = resp.data;

            if (data.error) {
                throw new Error(data.error);
            } else {
                setLocationPermission(data.permissao_localizacao);
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar sua configuração.","error");
            
            console.error('Erro ao fazer a requisição:', err);
        }
    }, []);

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
        setProfileId(profileId);
    
        if (!confirmedProfileId) {
            console.error("Erro ao indentificar perfil");

            navigate("/login", {state: {message: "Não conseguimos identificar seu perfil. Tente fazer o login.", type: "error"}});
            
            return;
        }

        const fetchData = async () => {
            try {
                await fetchSports(navigate, setSports);
                await fetchLocationPermission(confirmedProfileId);
            } catch (err) {
                console.error('Erro ao recuperar dados para favoritar um lugar:', err);
            }
        }

        fetchData();
    }, [fetchLocationPermission, navigate, profileId, setProfileId]);

    function handleOnChange(e) {
        e.target.value = String(e.target.value).trimStart().replace(/\n+/g, "").replace(/\s+/g, " ").replace(/-+/g, "");

        if (e.target.name === "number") {
            e.target.value = e.target.value.replace(/\D/g, "");
        }

        setPlace(prevPlace => ({...prevPlace, [e.target.name]: e.target.value}));
    }

    function handlePhotoChange(e) {
        const files = Array.from(e.target.files);
    
        if (files.length === 0) return; 
    
        const blobUrl = URL.createObjectURL(files[0]); 
        
        if (files.length === 1) {
            setPlace(prevPlace => ({...prevPlace, blobUrl, photo: files}));
        }
    }

    const handleSelectSuggestion = (address) => {
        setAddressText(address.display_name);
        setSuggestions([]);

        setPlace(prevPlace => ({
            ...prevPlace,
            street: address.address.road || "",
            number: address.address.house_number || prevPlace.number || "",
            neighborhood: address.address.city_district || address.address.suburb || address.address.neighbourhood || "",
            postalCode: address.address.postcode || "",
            state: address.address.state || "",
            city: address.address.city || address.address.town || address.address.village || ""
        }));
    };

    const handleClickSport = (item) => {
        setSelectedSports(prevs => {
            if (prevs.some(prev => prev.id_esporte === item.id_esporte)) {
                return prevs.filter(prevItem => prevItem.id_esporte !== item.id_esporte);
            } else {
                return [...prevs, item];
            }
        });
    };

    const handleAddressChange = useCallback((e) => {
        e.target.value = e.target.value.trimStart().replace(/\s+/g, " ");

        setPlace(prevPlace => ({
            ...prevPlace,
            street: "",
            number: prevPlace.number || "",
            neighborhood: "",
            postalCode: "",
            state: "",
            city: ""
        }));

        setAddressText(e.target.value);
    }, []);

    const validateDescription = useCallback(() => {
        return place.description.length > 50 && place.description?.length <= 255;
    }, [place.description]);

    const validateComplement = useCallback(() => {
        return (place.complement && place.complement.length <= 50) ||
            !place.complement;
    }, [place.complement]);

    const validateNumber = useCallback(() => {
        return (place.number && place.number.length <= 10) ||
            !place.number;
    }, [place.number]);

    const checkSubmit = useCallback(() => {
        return (
            validateDescription() &&
            validateComplement() &&
            place.street !== "" &&
            place.state !== "" &&
            place.city !== ""
        )
    }, [place.city, place.state, place.street, validateDescription, validateComplement]);

    const addFavoritePlace = async (id) => {
        try {
            const sportsIds = selectedSports.map(sport => sport.id_esporte);

            const formData = new FormData();

            formData.append("street", place.street);
            formData.append("number", place.number);
            formData.append("neighborhood", place.neighborhood);
            formData.append("postalCode", place.postalCode);
            formData.append("state", place.state);
            formData.append("city", place.city);
            formData.append("description", place.description);
            sportsIds.forEach(sportId => formData.append("placeSports", sportId));

            if (place.photo && place.photo.length > 0) formData.append("photo", place.photo[0]);

            const resp = await axios.post(`http://localhost:5000/profiles/${id}/places`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});

                throw new Error("Erro ao favoritar lugar");
            } else {
                navigate("/places", {state: {message: "Lugar marcado com sucesso!", type: "success"}});
            }
        } catch (err) {                    
            navigate("/errorPage", {state: {error: err.message}})

            console.error('Erro ao fazer a requisição:', err);

            throw err;
        }
    }

    function handleOnSubmit(e) {
        e.preventDefault()

        if (!checkSubmit()) {
            setMessageWithReset("Selecione um endereço e obedeça as regras da descrição para marcar um lugar.", "error");
            
            return;
        } 

        addFavoritePlace(profileId);
    }

    return (
        <main className={styles.new_place_page}>
            {message && <Message message={message.message} type={message.type}/>}

            <h1>Adicionar Novo Local</h1>

            <form onSubmit={handleOnSubmit}>
                <div 
                    onMouseEnter={() => setShowSuggestions(true)} 
                    onMouseLeave={() => setShowSuggestions(false)} 
                    className={styles.search_address}
                >
                    <MainInput 
                        type="text" 
                        name="address" 
                        placeholder="Insira um endereço" 
                        labelText="Endereço"
                        handleChange={handleAddressChange}
                        value={addressText}
                    />

                    <span onClick={fetchCurrentAddress}>Local atual</span>
                
                    {showSuggestions && (
                        <ul className={styles.suggestions_list}>
                            {suggestions.map((suggestion, index) => (
                                <li key={index} onClick={() => handleSelectSuggestion(suggestion)}>
                                    {suggestion.display_name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <MainInput 
                    type="text" 
                    name="number" 
                    placeholder="Insira o número" 
                    labelText="Número"
                    maxLength={10} 
                    alertMessage='Número inválido' 
                    handleChange={handleOnChange} 
                    showAlert={!validateNumber()}
                    value={place.number}
                />

                <MainInput 
                    type="text" 
                    name="complement" 
                    placeholder="Complemento se necessário: andar, apto., bloco..." 
                    labelText="Complemento"
                    maxLength={50} 
                    alertMessage='O complemento não deve possuir mais que 50 caracteres.' 
                    handleChange={handleOnChange} 
                    showAlert={!validateComplement()}
                    value={place.complement}
                />

                <Textarea 
                    name="description" 
                    placeholder="Insira uma descrição para o lugar" 
                    maxLength={255}
                    labelText="Descrição" 
                    alertMessage="A descrição precisa ter entre 50 e 255 caracteres." 
                    handleChange={handleOnChange} 
                    showAlert={place.description && !validateDescription()}
                    value={place.description}
                />

                <div className={styles.place_photo}>
                    <h3>Adicione uma foto</h3>

                    <label htmlFor="photo">
                        <img className={!place.blobUrl && styles.place_photo_icon} src={place.blobUrl || placePhotoIcon} alt="Place"/>
                    </label>

                    <input
                        type="file"
                        name="photo"
                        id="photo"
                        accepts=".jpg,.jpeg,.png,.webp"
                        onChange={handlePhotoChange}
                    />             
                </div>

                <hr/>

                <ul className={styles.place_sports}>
                    <h3>Indique esportes para praticar</h3>
                    
                    {sports.length !== 0 && sports.map(sport => (
                        <li 
                            key={sport.id_esporte} 
                            className={selectedSports.some(selectedSport => sport.id_esporte === selectedSport.id_esporte) && styles.selected} 
                            onClick={() => handleClickSport(sport)}
                        >
                            <img src={sport.icon} alt={`${sport.nome} Icon`}/>

                            <span>{sport.nome}</span>
                        </li>
                    ))}
                </ul>  

                <SubmitButton text="Salvar Local"/>
            </form>
        </main>
    );
}

export default NewPlace;