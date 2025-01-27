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
import formatDate from "../../utils/DateFormatter";
import Message from "../layout/Message";

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
        try {
            const resp = await axios.get("http://localhost:5000/hashtags");
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                setHashtags(data);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        }
    }, [navigate]);

    const fetchTags = useCallback(async () => {
        if (!searchTextTag) return;

        setTagsLoading(true);

        try {
            const resp = await axios.get(`http://localhost:5000/search/profiles/${searchTextTag}`);
            const data = resp.data;
    
            if (data.error) {
                navigate("/errorPage", {state: {error: data.error}});
            } else {
                const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");
                const filteredData = data.filter(tag => String(tag.id_perfil) !== String(confirmedProfileId) && tag.permissao_marcacao);

                setTags(filteredData);
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
        } finally {
            setTagsLoading(false);
        }
    }, [navigate, profileId, searchTextTag]);

    const fetchProfile = useCallback(async (id) => {
        try {
            const resp = await axios.get(`http://localhost:5000/profiles/${id}`);
            const data = resp.data;
            
            if (data.error) {
                if (resp.status === 404 || resp.status === 204) {
                    navigate("/login", {state: {message: data.error, type: "error"}});
                } else {
                    navigate("/errorPage", {state: {error: data.error}})
                }
            } else {
                setProfile(data);

                fetchHashtags();
            }
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}});
    
            console.error('Erro ao fazer a requisição:', err);
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
            } else {
                navigate("/", {state: {message: "Publicação feita com sucesso!", type: "success"}});
            }    
        } catch (err) {
            navigate("/errorPage", {state: {error: err.message}})

            console.error("Erro ao fazer a requisição:", err);
        }
    }

    useEffect(() => {
        const confirmedProfileId = profileId || localStorage.getItem("athleteConnectProfileId");

        if (!confirmedProfileId) {
            navigate("/login");
        } else {
            fetchProfile(confirmedProfileId);
        }
    }, [fetchProfile, navigate, profileId]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags, searchTextTag]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMoment(formatDate(new Date()));
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

        setPost({ ...post, [e.target.name]: e.target.value });
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
            setPost({...post, hashtags: hashtagsInPost, tags: tagsInPost});

            createPost();
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
                />

                <SubmitButton text="Publicar"/>
            </form>
        </main>
    );
}

export default NewPost;