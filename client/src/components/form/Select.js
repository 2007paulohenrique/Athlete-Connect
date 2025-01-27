import styles from "./Select.module.css";

function Select({ name, labelText, handleChange, values = [], selectedValue, description }) {
    return (
        <div className={styles.select}>
            <label htmlFor={name}>{labelText}</label>

            <select name={name} id={name} onChange={handleChange}>
                {values?.length !== 0 && values.map((value) =>
                    <option value={value.toLowerCase()} selected={value === selectedValue}>{value}</option>
                )}
            </select>

            <p className={styles.description}>
                {description}
            </p>
        </div>
    );
}

export default Select;