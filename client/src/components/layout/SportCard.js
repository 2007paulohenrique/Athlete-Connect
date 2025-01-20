import styles from "./SportCard.module.css";

function SportCard({ iconPath, sportName, categories = [], sportDescription, handleClick, selected = false }) {
    const icon = iconPath ? require(`../../img/${iconPath}`) : null;

    return (
        <div className={`${styles.sport_card} ${selected && styles.selected}`} onClick={handleClick ? handleClick : undefined}>
            <img src={icon} alt={`${sportName} Icon`}/>

            <div className={styles.sport_info}>
                <span>{sportName}</span>
                
                <div className={styles.categories}>
                    {categories.map((category, index) => (
                        <span key={index}>{category.nome}</span>
                    ))}
                </div>
            </div>

            <span className={styles.view_description}>!</span>

            <div className={styles.sport_description}>
                {sportDescription}
            </div>
        </div>
    );
}

export default SportCard;