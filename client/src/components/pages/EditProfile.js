import EditProfileForm from "../form/EditProfileForm";
import styles from "./EditProfile.module.css";

function EditProfile() {
    return (
        <main className={styles.edit_profile_page}>
            <EditProfileForm/>
        </main>
    );
}

export default EditProfile;