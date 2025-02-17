import { useEffect, useState } from "react";
import styles from "./Message.module.css";
import errorIcon from "../../img/icons/socialMedia/errorIcon.png";
import successIcon from "../../img/icons/socialMedia/successIcon.png";

function Message({ type, message }) {
    const [visibility, setVisibility] = useState(false);

    useEffect(() => {
        if (!message) {
            setVisibility(false);
            return;
        }

        setVisibility(true);

        const timer = setTimeout(() => {
            setVisibility(false);
        }, 6000);

        return () => clearTimeout(timer);
    }, [message, type])

    const icon = type === "error" ? errorIcon : type === "success" ? successIcon : null;

    return (
        <>
            {visibility && (
                <div className={`${styles.message} ${styles[type]}`}>
                    <img src={icon} alt="Message Icon"/>
                    <span>{message}</span>
                </div>
            )}
        </>
    );
}

export default Message;