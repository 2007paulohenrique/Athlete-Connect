import styles from "./SportCard.module.css";

function SportCard({icon, sportName, categories = [], handleClick, selected = false}) {
    return (
        <div className={`${styles.sport_card} ${selected && styles.selected}`} onClick={handleClick}>
            <img src={icon} alt={`${sportName} Icon`}/>

            <div className={styles.info}>
                <span className={styles.sport_name}>{sportName}</span>
                
                <div className={styles.categories}>
                    {categories.map((category, index) => (
                        <span key={index} className={styles.category}>{category.nome}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SportCard;