import styles from "./InputSearchField.module.css";
import searchIcon from "../../img/icons/socialMedia/searchIcon.png"

function InputSearchField({ name, handleChange, maxLength, placeholder }) {
    return (
        <div className={styles.input_search_field}>
            <label htmlFor={name}>
                <img src={searchIcon} alt="Search"/>
            </label>

            <input type="text" name={name} id={name} onChange={handleChange} maxLength={maxLength} placeholder={placeholder}/>
        </div>
    );
}

export default InputSearchField;