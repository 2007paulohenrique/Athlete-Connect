import styles from "./SearchInput.module.css";
import searchIcon from "../../img/icons/socialMedia/searchIcon.png"

function SearchInput({ name, handleChange, maxLength, placeholder, haveSubmit = false, value, sugestions = [] }) {
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

            <input list={sugestions.length !== 0 ? `${name}Sugestions` : ""} type="text" name={name} id={name} onChange={handleChange} maxLength={maxLength} placeholder={placeholder} value={value || ""}/>
            
            {sugestions.length !== 0 && 
                <datalist id={`${name}Sugestions`}>
                    {sugestions.map(text => 
                        <option value={text}/>
                    )}
                </datalist>
            }
        </div>
    );
}

export default SearchInput;