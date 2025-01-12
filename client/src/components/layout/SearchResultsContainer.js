import styles from "./SearchResultsContainer.module.css";
import loading from "../../img/animations/loading.svg"
import SportCard from "./SportCard";
import ProfileSmallerContainer from "./ProfileSmallerContainer";
import { useNavigate } from "react-router-dom";

function SearchResultsContainer({ results, resultType, notFoundText }) {
    const navigate = useNavigate();

    return (
        <>
            {!results && (
                <img className="loading" src={loading} alt="Loading"/>
            )}

            {results ? 
                <ul className={styles.results_list}>
                    {results.length !== 0 ? results.map((item, index) => (
                        <li key={index}>
                            {resultType === "profiles" ? (
                                <ProfileSmallerContainer 
                                    profilePhotoPath={item.caminho} 
                                    profileName={item.nome} 
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
                                    handleClick={() => undefined}
                                    sportDescription={item.descricao}
                                />
                            ) : null}
                        </li>
                    )) : <li>{notFoundText}</li>
                    }
                </ul>                            
            : null}
        </>
    );
}

export default SearchResultsContainer;