import AppNavBar from "../layout/AppNavBar";
import FlashesSection from "../layout/FlashesSection";
import Post from "../layout/Post";
import ProfileNavBar from "../layout/ProfileNavBar";
import styles from "./Home.module.css";
import arrowIcon from "../../img/icons/socialMedia/arrowIcon.png";
import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
    const [feed, setFeed] = useState([]);
    const [profileId, setProfileId] = useState();

    useEffect(() => {
        const storedProfileId = sessionStorage.getItem("profileId");
        setProfileId(storedProfileId);
    }, []);

    useEffect(() => {
        if (profileId) {
            axios.get(`http://localhost:5000/feeds/${profileId}`)
            .then(resp => {
                setFeed(resp.data);
            })
            .catch(err => {
                console.error('Erro ao fazer a requisição:', err);
            });
        }
    }, [profileId]);
    // const medias = [];
    // medias.push("https://www.shutterstock.com/shutterstock/videos/3473744799/preview/stock-footage-winning-the-penalty-shootout-challenge-in-a-virtual-sport-simulator-game-winning-the-match-of-a.webm");
    // medias.push("https://www.estadao.com.br/recomenda/wp-content/uploads/2023/04/icE5DUtSaptb3bBC8eliggfQNKgqNH-metadHJhdmVsLW5vbWFkZXMtSk8xOUswSEREWEktdW5zcGxhc2guanBn-1-1.jpg.webp");
    // medias.push("https://cdn-ilbeipn.nitrocdn.com/vqgboMkkGFxMDjaexoPqGITOSpawMnrt/assets/images/optimized/blog.lojaodosesportes.com.br/wp-content/uploads/2023/05/Qual-o-melhor-tipo-de-bola-de-futebol.png");
    // medias.push("https://gazetadasemana.com.br/images/noticias/173000/31054549_image_8.png.png");

    // const authorPhoto = "https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm90byUyMGRvJTIwcGVyZmlsfGVufDB8fDB8fHww";
    // const captionText = "Olha minha jogada que legal! Demorei bastante para conseguir fazer ela, mas tudo com muito treino e dedicação pode ser alcançado. Fiquei horas praticando, errando, ajustando cada detalhe, até que, finalmente, tudo saiu exatamente como eu queria. É incrível ver como o esforço traz resultados — mesmo quando parece que nada está dando certo, cada tentativa está te levando um passo mais perto do seu objetivo.";

    function goToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    return (
        <main className={styles.home_page}>
            <ProfileNavBar/>

            <FlashesSection/>

            <section className={styles.posts_section}> 
                {feed.map(post => (
                    <Post 
                        authorUserName={post.author.nome}
                        authorPhotoPath={post.author.fk_midia_id_midia}
                        moment="10/12/2024 12:10"
                        mediasPath={post.medias}
                        caption={post.legenda}
                    />
                ))}

                <div className={styles.posts_ending}>
                    Você chegou ao fim das atividades. :´(
                    <br/>
                    Continue descendo para encontrar algo que te interesse! : )
                </div>

                <button type="button" onClick={goToTop} className={styles.go_to_top}>
                    <img src={arrowIcon} alt="Go to top"/>
                </button>
            </section>

            <AppNavBar/>
        </main>
    );
}

export default Home;