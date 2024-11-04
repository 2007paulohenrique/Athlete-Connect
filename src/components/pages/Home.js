import AppNavBar from "../layout/AppNavBar";
import FlashesSection from "../layout/FlashesSection";
import Post from "../layout/Post";
import ProfileNavBar from "../layout/ProfileNavBar";
import styles from "./Home.module.css";

function Home() {
    const medias = [];
    medias.push("https://www.estadao.com.br/recomenda/wp-content/uploads/2023/04/icE5DUtSaptb3bBC8eliggfQNKgqNH-metadHJhdmVsLW5vbWFkZXMtSk8xOUswSEREWEktdW5zcGxhc2guanBn-1-1.jpg.webp");
    medias.push("https://cdn-ilbeipn.nitrocdn.com/vqgboMkkGFxMDjaexoPqGITOSpawMnrt/assets/images/optimized/blog.lojaodosesportes.com.br/wp-content/uploads/2023/05/Qual-o-melhor-tipo-de-bola-de-futebol.png");
    medias.push("https://gazetadasemana.com.br/images/noticias/173000/31054549_image_8.png.png");
    medias.push("https://www.shutterstock.com/shutterstock/videos/3473744799/preview/stock-footage-winning-the-penalty-shootout-challenge-in-a-virtual-sport-simulator-game-winning-the-match-of-a.webm");

    return (
        <main className={styles.home_page}>
            <ProfileNavBar/>

            <FlashesSection/>

            <section className={styles.posts_section}> 
                <Post 
                    authorUserName="@pereirapaulo"
                    authorPhotoPath="https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm90byUyMGRvJTIwcGVyZmlsfGVufDB8fDB8fHww"
                    moment="10/12/2024 - 12:10"
                    mediasPath={medias}
                    caption="Olha minha jogada que legal!"
                />
            </section>
            <AppNavBar/>
        </main>
    );
}

export default Home;