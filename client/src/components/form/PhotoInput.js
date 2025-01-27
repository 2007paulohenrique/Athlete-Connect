import styles from "./PhotoInput.module.css";
import ProfilePhotoContainer from "../layout/ProfilePhotoContainer"

function PhotoInput({ name, photoPath, handleChange, size }) {
    return (
        <div className={styles.photo_input}>
            <label htmlFor={name}>
                <ProfilePhotoContainer profilePhotoPath={photoPath} isBlobUrl size={size}/>
            </label>

            <input type="file" name={name} id={name} onChange={handleChange} accepts=".jpg,.jpeg,.png,.webp"/>            
        </div>
    );
}

export default PhotoInput;