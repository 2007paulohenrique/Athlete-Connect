import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./SearchNavBar.module.css";

function SearchNavBar({ selectedType }) {
    const [searchParams] = useSearchParams();
    const text = searchParams.get('text');
    
    const navigate = useNavigate();

    return (
        <nav className={styles.search_nav_bar}>
            <ul>
                <li 
                    className={selectedType === "posts" ? styles.selected_type : undefined} 
                    onClick={() => navigate(`/search?text=${text}&type=posts`)}
                >
                    Postagens
                </li>

                <li 
                    className={selectedType === "profiles" ? styles.selected_type : undefined} 
                    onClick={() => navigate(`/search?text=${text}&type=profiles`)}
                >
                    Perfis
                </li>

                <li 
                    className={selectedType === "hashtags" ? styles.selected_type : undefined} 
                    onClick={() => navigate(`/search?text=${text}&type=hashtags`)}
                >
                    Hashtags
                </li>

                <li 
                    className={selectedType === "sports" ? styles.selected_type : undefined} 
                    onClick={() => navigate(`/search?text=${text}&type=sports`)}
                >
                    Esportes
                </li>
            </ul>
        </nav>
    );
}

export default SearchNavBar;