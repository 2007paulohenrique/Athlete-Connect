import { useCallback, useEffect, useState } from "react";
import Post from "../layout/Post";
import Textarea from "../form/Textarea";
import styles from "./NewPost.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SubmitButton from "../form/SubmitButton";
import FileInput from "../form/FileInput";
import mediasIcon from "../../img/icons/socialMedia/mediasIcon.png";
import captionIcon from "../../img/icons/socialMedia/captionIcon.png";
import { useProfile } from "../../ProfileContext";
import Message from "../layout/Message";
import ExitPageBar from "../layout/ExitPageBar";
import { EXPIRATION_TIME } from "../../App";

function NewPost() {
    const [profile, setProfile] = useState({});
    const [post, setPost] = useState({});
    const [currentMoment, setCurrentMoment] = useState("");
    const [medias, setMedias] = useState([]);
    const [files, setFiles] = useState([]);
    const [mediasLengthError, setMediasLengthError] = useState(false);
    const [hashtagsInPost, setHashtagsInPost] = useState([]);
    const [tagsInPost, setTagsInPost] = useState([]);
    const {profileId} = useProfile();
    const [tags, setTags] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    const [message, setMessage] = useState({});
    const [searchTextTag, setSearchTextTag] = useState("");
    const [tagsLoading, setTagsLoading] = useState(false);

    const navigate = useNavigate();

    const fetchHashtags = useCallback(async () => {
        const storageData = localStorage.getItem("athleteConnectHashtags");

        if (storageData) {
            try {
                const parsedData = JSON.parse(storageData);
                
                if (Date.now() - parsedData.updateDate < EXPIRATION_TIME) {
                    setHashtags(parsedData.hashtags);

                    return;
                }
            } catch (err) {
                console.error("Erro ao recuperar as hashtags do cache:", err);

                localStorage.removeItem("athleteConnectHashtags");
            }
        }

        try {
            const resp = await axios.get("http://localhost:5000/hashtags");
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar as hashtags.", "error");

                throw new Error("Erro ao recuperar hashtags");
            } else {
                setHashtags(data);
                localStorage.setItem("athleteConnectHashtags", JSON.stringify({hashtags: data, updateDate: Date.now()}));
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar as hashtags.", "error");
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, []);

    const fetchTags = useCallback(async () => {
        if (!searchTextTag) return;

        setTagsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/search/profiles/${searchTextTag}?profileId=${profile.id_perfil}`);
            const data = resp.data;
    
            if (data.error) {
                setMessageWithReset("Não foi possível recuperar as tags dos perfis.", "error");

                throw new Error("Erro ao recuperar tags");
            } else {
                const filteredData = data.filter(tag => String(tag.id_perfil) !== String(profile.id_perfil) && tag.permissao_marcacao);

                setTags(filteredData);
            }
        } catch (err) {
            setMessageWithReset("Não foi possível recuperar as tags dos perfis.", "error");
    
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setTagsLoading(false);
        }
    }, [profile.id_perfil, searchTextTag]);

    const fetchProfile = useCallback(async (id) => {
        const storageData = localStorage.getItem("athleteConnectProfile");

        if (storageData) {
            try {
                const parsedData = JSON.parse(storageData);
                
                if (Date.now() - parsedData.updateDate < EXPIRATION_TIME) {
                    setProfile(parsedData.profile);

                    return;
                }
            } catch (err) {
                console.error("Erro ao recuperar o perfil do cache:", err);

                localStorage.removeItem("athleteConnectProfile");
            }
        }

        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}?viewerId=${id}`);
            const data = resp.data;
            
            if (resp.status === 204) {
                navigate("/login", {state: {message: "Seu perfil foi desativado. Faça login e o ative para voltar a usá-lo.", type: "error"}});
                
                throw new Error("Perfil desativado");
            }

            if (data.error) {
                if (resp.status === 404) {
                    navigate("/login", {state: {message: data.error, type: "error"}});
                } else {
                    navigate("/errorPage", {state: {error: data.error}})
                }

                throw new Error("Erro ao buscar perfil");
            } else {
                setProfile(data);
                localStorage.setItem('athleteConnectProfile', JSON.stringify({profile: data, updateDate: Date.now()}));

                fetchHashtags();
            }
        } catch (err) {
            console.error('Erro ao fazer a requisição:', err);
    
            if (err.response.status !== 404) {
                throw new Error("Erro ao buscar perfil");
            }
            
            navigate("/login", {state: {message: "Não foi possível encontrar nenhum perfil com o id fornecido. Tente fazer o login.", type: "error"}});
        }
    }, [fetchHashtags, navigate]); 

    const createPost = async () => {
        try {
            const formData = new FormData();
    
            formData.append("caption", post.caption || "");
            hashtagsInPost.forEach(hashtag => formData.append("hashtags", hashtag.id_hashtag));
            tagsInPost.forEach(tag => formData.append("tags", tag.id_perfil));
    
            files.forEach(file => formData.append(`medias`, file));
    
            const resp = await axios.post(`http://localhost:5000/profiles/${profile.id_perfil}/posts`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, 
            })    
            const data = resp.data;

            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}})

                throw new Error("Erro ao criar postagem");
            } else {
                navigate("/", {state: {message: "Publicação feita com sucesso!", type: "success"}});
            }    
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);

            throw err;
        }
    }

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        if (!confirmedProfileId) {
            console.error("Erro ao indentificar perfil");

            navigate("/login", {state: {message: "Não conseguimos identificar seu perfil. Tente fazer o login.", type: "error"}});
        } else {
            fetchProfile(confirmedProfileId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags, searchTextTag]);

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

        setPost(prevPost => ({...prevPost, [e.target.name]: e.target.value }));
    }

    const validateCaption = useCallback(() => {
        return !post.caption || post.caption.length <= 500;
    }, [post]);

    function handleFileChange(e) {
        const files = Array.from(e.target.files);
    
        if (files.length === 0) return; 
    
        const newMedias = files.map(file => {
            const blobUrl = URL.createObjectURL(file); 
            
            return {
                type: file.type.startsWith('image/') ? 'imagem' : 'video',
                path: blobUrl,
                duration: file.type.startsWith('video/') ? null : undefined,
            };
        });
    
        if (newMedias.length <= 9) {
            setMedias(newMedias); 
            setFiles(files);
            setMediasLengthError(false);
        } else {
            setMedias([]);
            setFiles([]);
            setMediasLengthError(true);
        }
    }

    function handleOnSubmit(e) {
        e.preventDefault();

        if (!(validateCaption() && !mediasLengthError)) return;
        
        if (medias.length >= 1) {  
            setPost(prevPost => ({...prevPost, hashtags: hashtagsInPost, tags: tagsInPost}));

            createPost();
        } else {
            setMessageWithReset("Selecione pelo menos uma foto ou vídeo para publicar", "error");
        }
    }

    return (
        <main className={styles.new_post_page}>
            <ExitPageBar handleExitPage={() => navigate("/")}/>

            {message && <Message message={message.message} type={message.type}/>}

            <h1>Criar Postagem</h1>

            <form className={styles.edit_post} onSubmit={handleOnSubmit}>
                <div className={styles.inputs}>
                    <Textarea 
                        name="caption" 
                        labelText="Legenda" 
                        placeholder="Insira a legenda da sua publicação" 
                        maxLength="500" 
                        alertMessage="A legenda não pode ter mais que 500 caracteres"
                        handleChange={handleOnChange}    
                        showAlert={!validateCaption()}
                        inputIcon={captionIcon}
                        inputIconAlt="Caption"
                        value={post.caption}
                    />

                    <FileInput 
                        name="medias[]" 
                        labelText="Selecione suas fotos e vídeos"
                        handleChange={handleFileChange} 
                        alertMessage="Selecione até nove imagens e vídeos"
                        multiple={true}
                        showAlert={mediasLengthError}
                        inputIcon={mediasIcon}
                        inputIconAlt="Files"
                    />
                </div>
                
                <h2>Pré-visualização</h2>

                <Post 
                    author={profile}
                    moment={currentMoment} 
                    caption={post.caption} 
                    blobUrlsMedias={medias}
                    isInCreating={true}
                    hashtags={hashtags}
                    tags={tags}
                    setHashtagsInPost={setHashtagsInPost}
                    setTagsInPost={setTagsInPost}
                    searchTextTag={searchTextTag}
                    setSearchTextTag={setSearchTextTag}
                    filteredTags={tags}
                    tagsLoading={tagsLoading}
                    setMessage={setMessageWithReset}
                />

                <SubmitButton text="Publicar"/>
            </form>
        </main>
    );
}

export default NewPost;