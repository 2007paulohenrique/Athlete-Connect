import { useEffect, useState } from "react";
import styles from "./Message.module.css";
import errorIcon from "../../img/icons/socialMedia/errorIcon.png";
import successIcon from "../../img/icons/socialMedia/successIcon.png";
import icon from "../../img/icons/socialMedia/icon.png";

function Message({ type = "default", message }) {
    const [visibility, setVisibility] = useState(false);

    useEffect(() => {
        if (!message) {
            setVisibility(false);
            return;
        }

        setVisibility(true);

        const timer = setTimeout(() => {
            setVisibility(false);
        }, (type === "default" ? 10000 : 6000));

        return () => clearTimeout(timer);
    }, [message, type])

    const iconToShow = type === "error" ? errorIcon : type === "success" ? successIcon : type === "default" ? icon : null;

    return (
        <>
            {visibility && (
                <div className={`${styles.message} ${styles[type]}`}>
                    {iconToShow && <img src={iconToShow} alt="Message Icon"/>}

                    <span>{message}</span>
                </div>
            )}
        </>
    );
}

export default Message;