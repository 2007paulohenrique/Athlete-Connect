import { useCallback, useEffect, useState } from "react";
import styles from "./Places.module.css";
import Message from "../layout/Message";
import addFavPlaceIcon from "../../img/icons/socialMedia/addFavPlaceIcon.png";
import SearchInput from "../layout/SearchInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import loading from "../../img/animations/loading.svg";
import ProfileSmallerContainer from "../layout/ProfileSmallerContainer";
import axios from "axios";
import { useProfile } from "../../ProfileContext";

function Places() {
    const [searchParams, setSearchParams] = useSearchParams();
    const text = searchParams.get('text') || "";

    const [message, setMessage] = useState({});
    const [searchText, setSearchText] = useState("");
    const [placesResult, setPlacesResult] = useState();
    const [placesOffset, setPlacesOffset] = useState(0);
    const [placesLoading, setPlacesLoading] = useState(false);
    const [placesEnd, setPlacesEnd] = useState(false);
    const {profileId, setProfileId} = useProfile();

    const navigate = useNavigate();

    const LIMIT = 10;

    function setMessageWithReset(newMessage, type = null) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    useEffect(() => {
        setMessageWithReset("Bem-vindo ao Athlete Connect Places! Descubra e compartilhe locais para praticar esportes, marque seus favoritos e explore os lugares recomendados por outros usuários.")
    }, []);

    
    function handleOnChangeSearch(e) {
        e.target.value = e.target.value.trimStart().replace(/\s+/g, " ");

        setSearchText(e.target.value);
    }

    function handleOnSubmitSearch(e, text) {
        e.preventDefault(); 

        setPlacesResult();
        setPlacesOffset(0);
        setPlacesLoading(false);
        setPlacesEnd(false);

        if (searchText === "") {
            navigate("/places/myPlaces");
        } else {
            navigate(`/places?text=${text}`);
        }
    }

    const loadPlaces = useCallback(async (id = null) => {
        if (placesLoading || placesEnd) return;

        setPlacesLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/search/places?profileId=${id}&text=${searchText}&offset=${placesOffset}&limit=${LIMIT}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar os lugares marcados.", "error");

                throw new Error("Erro ao recuperar lugares marcados");
            } else {
                if (data.length < 10) {
                    setPlacesEnd(true);
                }

                const formattedPlaces = data.map(place => ({
                    ...place,
                    sports: place.sports.map(sport => ({
                        ...sport,
                        icon: require(`../../img/${sport.icone}`)
                    }))
                }));

                setPlacesResult(prevPlaces => [...(prevPlaces || []), ...formattedPlaces]);
                setPlacesOffset((prevOffset) => prevOffset + LIMIT);   
            }
        } catch (err) {
            setMessageWithReset(`Não foi possível recuperar ${text ? "os lugares pesquisados" : "seus lugares favoritados"}.`, "error");
            
            console.error('Erro ao fazer a requisição:', err);

            throw err;
        } finally {
            setPlacesLoading(false);
        }
    }, [placesLoading, placesEnd, searchText, placesOffset, text]);

    useEffect(() => {
        let timeoutId;

        const handleScroll = () => {
            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 450) {                    
                    loadPlaces(!text && profileId);
                }
            }, 200);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [profileId, loadPlaces, text]);

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
        setProfileId(confirmedProfileId);
    
        if (!confirmedProfileId) {
            console.error("Erro ao indentificar perfil");

            navigate("/login", {state: {message: "Não conseguimos identificar seu perfil. Tente fazer o login.", type: "error"}});
            
            return;
        }
    
        const fetchPlaces = async () => {
            try {
                await loadPlaces(confirmedProfileId);
            } catch (err) {
                navigate("/errorPage", {state: {error: err.message}});
            }
        }

        fetchPlaces()
    }, [loadPlaces, navigate, profileId, setProfileId]);

    return (
        <>
            <header className={styles.places_header}>
                <h1>
                    <svg 
                        version="1.0" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512.000000 512.000000"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <g 
                            transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                            fill="#000000" stroke="none"
                        >
                            <path d="M2335 5015 c-609 -99 -1081 -548 -1217 -1156 -30 -138 -33 -389 -5
                            -519 85 -395 379 -1028 848 -1826 65 -110 121 -207 124 -216 5 -11 -12 -18
                            -76 -32 -338 -73 -601 -230 -691 -413 -29 -60 -33 -77 -32 -148 0 -66 5 -90
                            28 -137 137 -285 641 -478 1246 -478 606 0 1107 192 1246 477 24 49 29 70 29
                            138 0 71 -4 88 -32 146 -91 184 -324 326 -673 409 -52 13 -97 24 -99 26 -2 2
                            53 99 122 216 474 808 769 1442 854 1838 28 130 25 381 -5 519 -130 582 -567
                            1018 -1144 1142 -125 27 -397 34 -523 14z m467 -171 c452 -86 834 -414 992
                            -852 47 -132 69 -263 69 -417 0 -129 -3 -151 -36 -275 -133 -502 -513 -1244
                            -1207 -2352 -30 -48 -57 -87 -60 -87 -13 0 -375 593 -565 924 -380 663 -606
                            1149 -702 1515 -33 124 -36 146 -36 275 1 654 503 1210 1161 1285 98 11 282 3
                            384 -16z m-483 -3916 c162 -254 186 -286 216 -298 58 -22 75 -4 267 299 67
                            106 128 195 134 198 18 7 238 -46 333 -79 323 -114 470 -286 373 -439 -101
                            -158 -379 -281 -757 -335 -164 -24 -487 -23 -650 0 -260 38 -458 101 -605 193
                            -276 174 -232 379 114 539 113 51 386 128 435 121 8 -1 71 -91 140 -199z"/>
                        
                            <path d="M2463 4359 c-61 -30 -85 -63 -169 -231 -51 -102 -81 -151 -97 -158
                            -12 -5 -91 -18 -176 -30 -162 -23 -207 -38 -253 -87 -59 -62 -76 -170 -38
                            -249 12 -24 72 -92 145 -163 69 -67 125 -130 125 -139 0 -10 -12 -83 -26 -162
                            -31 -176 -29 -241 9 -299 42 -64 97 -95 176 -99 67 -4 67 -4 223 77 86 45 166
                            81 178 81 12 0 93 -36 179 -81 155 -81 156 -81 222 -77 79 4 134 35 176 99 38
                            58 40 123 9 299 -14 79 -26 152 -26 161 0 9 56 72 125 140 71 70 134 140 145
                            164 38 78 21 186 -38 248 -46 49 -91 64 -253 87 -85 12 -164 25 -176 30 -16 7
                            -46 56 -97 158 -41 82 -86 162 -100 180 -60 70 -178 93 -263 51z m126 -148 c8
                            -5 53 -85 100 -177 110 -216 110 -216 338 -250 87 -13 168 -26 180 -29 28 -7
                            47 -40 39 -69 -3 -12 -59 -72 -125 -133 -176 -166 -182 -186 -135 -455 40
                            -230 29 -236 -209 -114 -221 115 -213 115 -434 0 -238 -122 -249 -116 -209
                            114 47 269 41 289 -135 455 -66 61 -122 122 -125 134 -8 28 11 61 39 68 12 3
                            93 16 180 29 228 34 228 34 338 250 84 165 99 186 129 186 8 0 21 -4 29 -9z"/>
                        </g>
                    </svg>  
                    
                    Places
                </h1>
            </header>

            <main className={styles.places_page}>
                {message && <Message message={message.message} type={message.type || undefined}/>}

                <div className={styles.places_actions}>
                    <div className={styles.new_place}>
                        <img src={addFavPlaceIcon} alt="Add Place" onClick={() => navigate("/places/new")}/>
                    </div>

                    <form onSubmit={(e) => handleOnSubmitSearch(e, searchText)}>
                        <SearchInput 
                            name="placesSearch"
                            handleChange={handleOnChangeSearch}
                            maxLength={100}
                            placeholder="Pesquise por esportes, perfis, bairros ou cidades"
                            haveSubmit
                            value={searchText}
                        />
                    </form>
                </div>

                <section className={styles.places}>
                    <h2>{!text ? "Meus Lugares" : <>Lugares para: <p>{text}</p></>}</h2>

                    <hr/>

                    {placesResult?.length !== 0 && placesResult?.map(place => 
                        <div key={place.id_endereco} className={styles.place_container}>
                            <ProfileSmallerContainer
                                profilePhotoPath={place.author.media.caminho}
                                profileName={place.author.nome}
                                handleClick={(e) => {
                                    navigate(`/places?text=${place.author.nome}`);
                                    setSearchText(place.author.nome);
                                    handleOnSubmitSearch(e, place.author.nome);
                                }}
                            />

                            <div className={styles.place}>
                                {place.caminho_midia &&
                                    <div className={styles.place_photo}>
                                        <img src={place.caminho_midia} alt="Place"/>
                                    </div>
                                }

                                <div className={styles.place_info}>
                                    <p>
                                        <span>Descrição: </span> 

                                        <br/>

                                        {place.descricao}
                                    </p>

                                    <p>
                                        <span>Endereço: </span>

                                        <br/>

                                        {place.logradouro}{place.numero && `, ${place.numero}`}{place.complemento && `, ${place.complemento}`} - {place.bairro && `${place.bairro}, `}{place.cidade} - {place.estado}{place.cep && `, ${place.cep}`}
                                    </p>

                                    {place.sports.length !== 0 && 
                                        <>
                                            <hr/>
            
                                            <ul className={styles.place_sports}>
                                                {place.sports.map(sport => (
                                                    <li 
                                                        key={sport.id_esporte} 
                                                        onClick={(e) => {
                                                            handleOnSubmitSearch(e, sport.nome);
                                                            setSearchText(sport.nome);
                                                        }}
                                                    >
                                                        <img src={sport.icon} alt={`${sport.nome} Icon`}/>

                                                        <span>{sport.nome}</span>
                                                    </li>
                                                ))}
                                            </ul>   
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {placesResult &&
                        (placesResult.length !== 0 ?
                            <p>
                                Não há mais lugares. 
                                Faça mais pesquisas para encontrar o que deseja.
                            </p>
                        :
                            <p>
                                {!text ? 'Adicione um lugar na sua lista de lugares favoritos clicando em "+".' : "Nenhum lugar encontrado."}
                            </p>
                        )
                    }
                </section>

                {placesLoading && 
                    <img className="loading" src={loading} alt="Loading"/>
                }
            </main>
        </>
    );
}

export default Places;