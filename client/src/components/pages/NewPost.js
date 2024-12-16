import { useCallback, useEffect, useState } from "react";
import Post from "../layout/Post";
import TextareaInput from "../form/TextareaInput";
import styles from "./NewPost.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SubmitButton from "../form/SubmitButton";
import FileInput from "../form/FileInput";
import mediasIcon from "../../img/icons/socialMedia/mediasIcon.png";
import captionIcon from "../../img/icons/socialMedia/captionIcon.png";
import { useProfile } from "../../ProfileContext";
import Message from "../layout/Message";

function NewPost() {
    const [profile, setProfile] = useState({});
    const [post, setPost] = useState({});
    const [haveError, setHaveError] = useState({});
    const [currentMoment, setCurrentMoment] = useState("");
    const [medias, setMedias] = useState([]);
    const [files, setFiles] = useState([]);
    const [mediasLengthError, setMediasLengthError] = useState(false);
    const [hashtagsInPost, setHashtagsInPost] = useState([]);
    const [tagsInPost, setTagsInPost] = useState([]);
    const {profileId} = useProfile();
    const [message, setMessage] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        if (!confirmedProfileId) {
            navigate("/login");
        } else {
            axios.get(`http://localhost:5000/profiles/${confirmedProfileId}`)
            .then(resp => {
                if (resp.data) {
                    setProfile(resp.data);
                } else {
                    navigate("/login"); 
                }
            })
            .catch(err => {
                console.error('Erro ao fazer a requisição:', err);
            });
        }
    }, [navigate, profileId]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMoment(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    function setMessageWithReset(newMessage, type) {
        setMessage(null);

        setTimeout(() => {
            setMessage({message: newMessage, type: type});
        }, 1);
    }

    function handleOnChange(e) {
        e.target.value = e.target.value.replace(/(\n\s*){3,}/g, '\n\n').trimStart();

        setPost({ ...post, [e.target.name]: e.target.value.trim() });
    }

    const validateCaption = useCallback(() => {
        return !post["caption"] || post["caption"].length <= 500;
    }, [post]);

    useEffect(() => {
        setHaveError(!(validateCaption() && !mediasLengthError));
    }, [mediasLengthError, validateCaption]);

    function handleFileChange(e) {
        const files = Array.from(e.target.files);
    
        if (files.length === 0) return; 
    
        const newMedias = files.map(file => {
            const blobUrl = URL.createObjectURL(file); 
            
            return {
                type: file.type.startsWith('image/') ? 'image' : 'video',
                path: blobUrl,
                duration: file.type.startsWith('video/') ? null : undefined,
            };
        });
    
        if (newMedias.length <= 9) {
            setMedias(newMedias); 
            setFiles(files);
            setMediasLengthError(false);
        } else {
            setMediasLengthError(true);
        }
    }

    function handleOnSubmit(e) {
        e.preventDefault();
        
        if (medias.length >= 1) {  
            setPost({...post, hashtags: hashtagsInPost, tags: tagsInPost});

            const formData = new FormData();

            formData.append("caption", post["caption"] || "");
            hashtagsInPost.forEach(hashtag => formData.append("hashtags", hashtag["id_hashtag"]));
            tagsInPost.forEach(tag => formData.append("tags", tag["id_perfil"]));

            files.forEach(file => formData.append(`medias`, file));

            axios.post(`http://localhost:5000/profiles/${profile['id_perfil']}/posts`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })
            .then(resp => {
                navigate("/", {state: {message: "Publicação feita com sucesso!", type: "success"}});
            })
            .catch(err => {
                console.error("Erro ao fazer a requisição:", err);
            });
        } else {
            setMessageWithReset("Selecione pelo menos uma foto ou vídeo para publicar", "error");
        }
    }

    return (
        <main className={styles.new_post_page}>
            {message && <Message message={message.message} type={message.type}/>}

            <h1>Criar Postagem</h1>

            <form className={styles.edit_post} onSubmit={handleOnSubmit}>
                <div className={styles.inputs}>
                    <TextareaInput 
                        name="caption" 
                        labelText="Legenda" 
                        placeholder="Insira a legenda da sua publicação" 
                        maxLength="500" 
                        alertMessage="A legenda não pode ter mais que 500 caracteres"
                        handleChange={handleOnChange}    
                        showAlert={post["caption"] && !validateCaption()}
                        inputIcon={captionIcon}
                        inputIconAlt="Caption"
                    />

                    <FileInput 
                        name="medias[]" 
                        labelText="Selecione suas fotos e vídeos"
                        handleChange={handleFileChange} 
                        alertMessage="Selecione até nove imagens e vídeos"
                        accepts=".jpg,.jpeg,.png,.webp,.mp4,.webm,.ogg"
                        multiple={true}
                        showAlert={mediasLengthError}
                        inputIcon={mediasIcon}
                        inputIconAlt="Files"
                    />
                </div>
                
                <h2>Pré-visualização</h2>

                <div className={styles.post}>
                    <Post 
                        authorUserName={profile["nome"]} 
                        authorPhotoPath={profile["media"] && profile["media"]["caminho"]}
                        moment={currentMoment} 
                        caption={post["caption"]} 
                        blobUrlsMedias={medias}
                        isInCreating={true}
                        setHashtagsInPost={setHashtagsInPost}
                        setTagsInPost={setTagsInPost}
                    />
                </div>

                <SubmitButton text="Publicar" haveError={haveError}/>
            </form>
        </main>
    );
}

export default NewPost;