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
        <div className={styles.about_info}>
            <ul className={styles.about_themes}>
                <li className={aboutItem === "about" ? styles.selected_about_theme : undefined} onClick={() => setAboutItem("about")}>
                    O que é o Athlete Connect?
                </li>

                <li className={aboutItem === "features" ? styles.selected_about_theme : undefined} onClick={() => setAboutItem("features")}>
                    Quais recursos eu posso usar?
                </li>

                <li className={aboutItem === "security" ? styles.selected_about_theme : undefined} onClick={() => setAboutItem("security")}>
                    Minha segurança é garantida?
                </li>

                <li className={aboutItem === "questions" ? styles.selected_about_theme : undefined} onClick={() => setAboutItem("questions")}>
                    Como posso tirar dúvidas?
                </li>

                <li className={aboutItem === "complaints" ? styles.selected_about_theme : undefined} onClick={() => setAboutItem("complaints")}>
                    Como faço para enviar uma reclamação?
                </li>

                <li className={aboutItem === "collaborate" ? styles.selected_about_theme : undefined} onClick={() => setAboutItem("collaborate")}>
                    Como posso colaborar?
                </li>
            </ul>

            {aboutComponents[aboutItem]}
        </div>
    )
}

export default AboutInfo;