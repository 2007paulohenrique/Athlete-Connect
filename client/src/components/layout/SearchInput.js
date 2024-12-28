import styles from "./SearchInput.module.css";
import searchIcon from "../../img/icons/socialMedia/searchIcon.png"

function SearchInput({ name, handleChange, maxLength, placeholder }) {
    return (
        <div className={styles.search_input}>
            <label htmlFor={name}>
                <img src={searchIcon} alt="Search"/>
            </label>

            <input type="text" name={name} id={name} onChange={handleChange} maxLength={maxLength} placeholder={placeholder}/>
        </div>
    );
}

export default SearchInput;