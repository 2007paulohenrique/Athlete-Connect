import styles from "./SearchInput.module.css";
import searchIcon from "../../img/icons/socialMedia/searchIcon.png"

function SearchInput({ name, handleChange, maxLength, placeholder, haveSubmit = false, value }) {
    return (
        <div className={styles.search_input}>
            {haveSubmit ? (
                <button type="submit">
                    <img src={searchIcon} alt="Search"/>
                </button>
            ) : (
                <label htmlFor={name}>
                    <img src={searchIcon} alt="Search"/>
                </label>
            )}

            <input type="text" name={name} id={name} onChange={handleChange} maxLength={maxLength} placeholder={placeholder} value={value || ""}/>
        </div>
    );
}

export default SearchInput;