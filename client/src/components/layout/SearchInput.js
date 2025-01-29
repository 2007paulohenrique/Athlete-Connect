import styles from "./SearchInput.module.css";
import searchIcon from "../../img/icons/socialMedia/searchIcon.png"

function SearchInput({ name, handleChange, maxLength, placeholder, haveSubmit = false, value, sugestions = [] }) {
    function handleOnChangeSearch(e) {
        if (e.target.value.includes("-")) e.target.value = "";

        handleChange(e);
    }

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

            <input list={sugestions.length !== 0 ? `${name}Sugestions` : ""} type="text" name={name} id={name} onChange={handleOnChangeSearch} maxLength={maxLength} placeholder={placeholder} value={value || ""}/>
            
            {sugestions.length !== 0 && 
                <datalist id={`${name}Sugestions`}>
                    <option className={styles.sugestion_type} value="---- Mais pesquisados ----"/>

                    {sugestions.slice(0, 3).map((search, index) => 
                        <option key={index} value={search.texto}/>
                    )}

                    <option className={styles.sugestion_type} value="----   Suas pesquisas   ----"/>

                    {sugestions.slice(3, 8).map((search, index) => 
                        <option key={index} value={search.texto}/>
                    )}
                </datalist>
            }
        </div>
    );
}

export default SearchInput;