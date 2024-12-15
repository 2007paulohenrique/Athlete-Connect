import styles from "./PhotoInput.module.css";
import defaultPhoto from "../../img/icons/socialMedia/userIcon.png";

function PhotoInput({name, photoPath, handleChange, accepts}) {
    return (
        <div className={styles.photo_input}>
            <label htmlFor={name}></label>
            <input type="file" name={name} id={name} onChange={handleChange} accepts={accepts}/>
            <img src={photoPath ? photoPath : defaultPhoto} alt={name}/>
        </div>
    );
}

export default PhotoInput;