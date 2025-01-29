import styles from "./SearchResultsContainer.module.css";
import loading from "../../img/animations/loading.svg"
import SportCard from "./SportCard";
import ProfileBiggerContainer from "./ProfileBiggerContainer";
import { useNavigate } from "react-router-dom";
import formatNumber from "../../utils/NumberFormatter";
import { useEffect } from "react";

function SearchResultsContainer({ results, resultType, notFoundText, tagsLoading = false }) {
    const navigate = useNavigate();

    useEffect(() => {
        console.log(results)
    }, [results])

    return (
        <>
            {!results && (
                <img className="loading" src={loading} alt="Loading"/>
            )}

            {results ? 
                <ul className={`${styles.results_list} ${results.length !== 0 && styles[`${resultType}_result`]}`}>
                    {results.length !== 0 ? results.map((item, index) => (
                        <li 
                            key={index} 
                            onClick={(resultType === "sports" || resultType === "hashtags") ? () => navigate(`/search?text=${item.nome.replace(/\s/g, "")}&type=posts`) : undefined}
                        >
                            {resultType === "profiles" ? (
                                <ProfileBiggerContainer 
                                    profilePhotoPath={item.caminho} 
                                    profileName={item.nome} 
                                    followersNumber={formatNumber(item.numero_seguidores)}
                                    handleClick={() => navigate(`/profile/${item.id_perfil}`)}
                                />
                            ) : resultType === "hashtags" ? (
                                <>
                                    #{item.nome}
                                </>
                            ) : resultType === "sports" ? (
                                <SportCard 
                                    iconPath={item.iconPath} 
                                    sportName={item.nome} 
                                    categories={item.categories} 
                                    sportDescription={item.descricao}
                                />
                            ) : null}
                        </li>
                    )) : 
                        <li>
                            {resultType === "profiles" && tagsLoading ? 
                                <img className="loading" src={loading} alt="Loading"/>
                            :
                                notFoundText
                            }
                        </li>
                    }
                </ul>                            
            : null}
        </>
    );
}

export default SearchResultsContainer;