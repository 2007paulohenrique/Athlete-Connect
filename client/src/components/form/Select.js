import styles from "./Select.module.css";

function Select({ name, labelText, handleChange, values = [], selectedValue, description }) {
    return (
        <div className={styles.select}>
            <label htmlFor={name}>{labelText}</label>

            <select name={name} id={name} onChange={handleChange} value={selectedValue}>
                {!selectedValue &&
                    <option value="" disabled selected>Selecionar ˅</option>
                }

                {values?.length !== 0 && values.map((value, index) =>
                    <option key={index} value={typeof value === "string" ? value.toLowerCase() : value}>{value}</option>
                )}
            </select>

            <p className={styles.description}>
                {description}
            </p>
        </div>
    );
}

export default Select;