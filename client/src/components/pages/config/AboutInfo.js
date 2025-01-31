import { useState } from "react";
import About from "./about/About";
import Collaborate from "./about/Collaborate";
import Complaints from "./about/Complaints";
import Features from "./about/Features";
import Questions from "./about/Questions";
import Security from "./about/Security";
import styles from "./Configs.module.css";

function AboutInfo() {
    const [aboutItem, setAboutItem] = useState("about");
    
    const aboutComponents = {
        about: <About/>,
        features: <Features/>,
        security: <Security/>,
        questions: <Questions/>,
        complaints: <Complaints/>,
        collaborate: <Collaborate/>,
    };

    return (
        <ul className={styles.config_items}>
            <li>
                <button onClick={() => setAboutItem("about")}>
                    O que é o Athlete Connect?
                </button>

                <button onClick={() => setAboutItem("features")}>
                    Quais recursos eu posso usar?
                </button>

                <button onClick={() => setAboutItem("security")}>
                    Minha segurança é garantida?
                </button>

                <button onClick={() => setAboutItem("questions")}>
                    Como posso tirar dúvidas?
                </button>

                <button onClick={() => setAboutItem("complaints")}>
                    Como faço para enviar uma reclamação?
                </button>

                <button onClick={() => setAboutItem("collaborate")}>
                    Como posso colaborar?
                </button>

                {aboutComponents[aboutItem]}
            </li>
        </ul>
    )
}

export default AboutInfo;