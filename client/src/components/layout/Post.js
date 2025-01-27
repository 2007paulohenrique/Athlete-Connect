import { forwardRef, useCallback, useEffect, useState } from "react";
import styles from "./Post.module.css";
import likedIcon from "../../img/icons/socialMedia/likedIcon.png";
import likeIcon from "../../img/icons/socialMedia/likeIcon.png";
import commentIcon from "../../img/icons/socialMedia/commentIcon.png";
import shareIcon from "../../img/icons/socialMedia/shareIcon.png";
import complaintIcon from "../../img/icons/socialMedia/complaintIcon.png";
import complaintedIcon from "../../img/icons/socialMedia/complaintedIcon.png";
import tagsIcon from "../../img/icons/socialMedia/tagsIcon.png";
import hashtagsIcon from "../../img/icons/socialMedia/hashtagsIcon.png";
import SearchInput from "../layout/SearchInput";
import SubmitButton from "../form/SubmitButton";
import MainInput from "../form/MainInput";
import ProfileSmallerContainer from "./ProfileSmallerContainer";
import formatNumber from "../../utils/NumberFormatter";
import PostItemsContainer from "./PostItemsContainer";
import { useNavigate } from "react-router-dom";

const Post = forwardRef(({ setMessage, canComment = true, author, hashtags = [], complaintReasons = [], moment, mediasPath = [], blobUrlsMedias = [], caption, isInCreating = false, setHashtagsInPost, postHashtags, setTagsInPost, postTags, sharingSubmit, complaintSubmit, isComplainted, comments, commentSubmit, likeSubmit, isLiked, post, searchTextTag, setSearchTextTag, filteredTags, searchTextSharing, setSearchTextSharing, filteredSharings, tagsLoading }, ref) => {
    const [medias, setMedias] = useState([]);
    const [showHashtags, setShowHashtags] = useState(false);  
    const [selectedHashtags, setSelectedHashtags] = useState([]);
    const [filteredHashtags, setFilteredHashtags] = useState([]);
    const [searchTextHashtag, setSearchTextHashtag] = useState("");
    const [showTags, setShowTags] = useState(false);  
    const [selectedTags, setSelectedTags] = useState([]);
    const [showSharing, setShowSharing] = useState(false); 
    const [selectedSharings, setSelectedSharings] = useState([]);
    const [sharingCaption, setSharingCaption] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showComplaintReasons, setShowComplaintReasons] = useState(false);  
    const [postComplaintReasons, setPostComplaintReasons] = useState([]);
    const [selectedComplaintReasons, setSelectedComplaintReasons] = useState([]);
    const [complaintDescription, setComplaintDescription] = useState("");
    const [sharings, setSharings] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (!blobUrlsMedias || blobUrlsMedias.length === 0) {
            const newMedias = mediasPath.map((mediaPath) => {
                const isImage = /\.(jpg|jpeg|png|webp)$/i.test(mediaPath);
                const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
        
                return {
                    type: isImage ? 'imagem' : isVideo ? 'video' : 'unknown',
                    path: require(`../../img/${mediaPath}`),
                    duration: isVideo ? null : undefined,
                };
            });
    
            if (JSON.stringify(newMedias) !== JSON.stringify(medias)) {
                setMedias(newMedias);
            }
        } else {
            if (JSON.stringify(blobUrlsMedias) !== JSON.stringify(medias)) {
                setMedias(blobUrlsMedias);
            }
        }
    }, [blobUrlsMedias, medias, mediasPath]);

    useEffect(() => {
        if (blobUrlsMedias && blobUrlsMedias.length !== 0) {
            setCurrentMediaIndex(0);
        }
    }, [blobUrlsMedias]);

    useEffect(() => {
        if (isInCreating) setFilteredHashtags(hashtags);      
    }, [hashtags, isInCreating]);

    const handleVideoLoad = (index, videoElement) => {
        if (videoElement) {
            const duration = videoElement.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const newDuration =  `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

            setMedias((prevMedias) => {
                const newMedias = [...prevMedias];
                newMedias[index].duration = newDuration;

                return newMedias;
            });
        }
    };

    useEffect(() => {
        if (isInCreating) {
            const filtered = hashtags.filter((hashtag) =>
                hashtag.nome.toLowerCase().includes(searchTextHashtag.toLowerCase())
            );
    
            setFilteredHashtags(filtered);
        }
    }, [searchTextHashtag, hashtags, isInCreating]);

    const handleSearchHashtagChange = (e) => {
        e.target.value = e.target.value.trim();

        setSearchTextHashtag(e.target.value);
    };

    const handleSearchTagChange = (e) => {
        e.target.value = e.target.value.trim();

        setSearchTextTag(e.target.value);
    };

    const handleSearchSharingChange = (e) => {
        e.target.value = e.target.value.trim();

        setSearchTextSharing(e.target.value);
    };

    const handleClickHashtag = (hashtag) => {
        setHashtagsInPost(prevHashtags => {
            if (prevHashtags.includes(hashtag)) {
                return prevHashtags.filter(item => item !== hashtag);
            } else {
                return [...prevHashtags, hashtag];
            }
        });

        setSelectedHashtags(prevSelected => {
            if (prevSelected.includes(hashtag)) {
                return prevSelected.filter(item => item !== hashtag);
            } else {
                return [...prevSelected, hashtag];
            }
        });
    };

    const handleClickTag = (tag) => {
        const isTagIncluded = (prevSelected, tag) => {
            return prevSelected.some(item => JSON.stringify(item) === JSON.stringify(tag));
        };

        setTagsInPost(prevTags => {
           if (isTagIncluded(prevTags, tag)) {
                return prevTags.filter(item => JSON.stringify(item) !== JSON.stringify(tag));
            } else {
                return [...prevTags, tag];
            }
        });

        setSelectedTags(prevSelected => {
            if (isTagIncluded(prevSelected, tag)) {
                return prevSelected.filter(item => JSON.stringify(item) !== JSON.stringify(tag));
            } else {
                return [...prevSelected, tag];
            }
        });
    };

    const handleClickSharing = (tag) => {
        const isTagIncluded = (prevSelected, tag) => {
            return prevSelected.some(item => JSON.stringify(item) === JSON.stringify(tag));
        };

        setSharings(prevSharings => {
            if (isTagIncluded(prevSharings, tag)) {
                return prevSharings.filter(item => JSON.stringify(item) !== JSON.stringify(tag));
            } else {
                return [...prevSharings, tag];
            }
        });

        setSelectedSharings(prevSelected => {
            if (isTagIncluded(prevSelected, tag)) {
                return prevSelected.filter(item => JSON.stringify(item) !== JSON.stringify(tag));
            } else {
                return [...prevSelected, tag];
            }
        });
    };

    const handleClickComplaintReason = (item) => {
        setPostComplaintReasons(prevs => {
            if (prevs.includes(item)) {
                return prevs.filter(prevItem => prevItem !== item);
            } else {
                return [...prevs, item];
            }
        });

        setSelectedComplaintReasons(prevSelected => {
            if (prevSelected.includes(item)) {
                return prevSelected.filter(prevItem => prevItem !== item);
            } else {
                return [...prevSelected, item];
            }
        });
    };

    function showOffAll(currentItems) {
        if (!(currentItems === "hashtags")) setShowHashtags(false); 

        if (!(currentItems === "tags")) setShowTags(false)
        
        if (!(currentItems === "sharings")) {
            setSelectedSharings([]);

            if (setSearchTextSharing) setSearchTextSharing("");

            setSharings([]);
            setSharingCaption("");
            setShowSharing(false); 
        }
        
        if (!(currentItems === "complaint")) {
            setSelectedComplaintReasons([]);
            setPostComplaintReasons([])
            setComplaintDescription("");
            setShowComplaintReasons(false);  
        }

        if (!(currentItems === "comments")) {
            setShowComments(false);
            setCommentText("");
        }
    }
    
    function viewHashtags() {
        showOffAll("hashtags");

        setShowHashtags(!showHashtags);  
    }

    function viewTags() {
        showOffAll("tags");

        setShowTags(!showTags);  
    }

    function viewSharing() {
        showOffAll("sharings");

        setSelectedSharings([]);
        setSearchTextSharing("");
        setSharings([]);
        setSharingCaption("");
        setShowSharing(!showSharing);  
    }

    function viewComplaint() {
        showOffAll("complaint");

        setSelectedComplaintReasons([]);
        setPostComplaintReasons([])
        setComplaintDescription("");
        setShowComplaintReasons(!showComplaintReasons);  
    }

    function viewComments() {
        if (canComment) {
            showOffAll("comments");
    
            setShowComments(!showComments);
            setCommentText("");
        } else {
            setMessage(`Você não tem permissão para comentar nas postagens de ${author.nome}.`, "error")
        }
    }

    const slideToLeft = () => {
        setCurrentMediaIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : medias.length - 1));
    };

    const slideToRight = () => {
        setCurrentMediaIndex((prevIndex) => (prevIndex < medias.length - 1 ? prevIndex + 1 : 0));
    };

    function handleOnChangeSharingCaption(e) {
        e.target.value = e.target.value.replace(/\s{2,}/g, ' ').trimStart();

        setSharingCaption(e.target.value);
    }

    function handleOnChangeComplaintDescription(e) {
        e.target.value = e.target.value.replace(/\s{2,}/g, ' ').trimStart();

        setComplaintDescription(e.target.value);
    }

    function handleOnChangeCommentText(e) {
        e.target.value = e.target.value.replace(/\s{2,}/g, ' ').trimStart();

        setCommentText(e.target.value);
    }

    function handleSharingSubmit(e) {
        e.preventDefault();

        if (!selectedSharings || selectedSharings.length === 0 || (sharingCaption && sharingCaption.length > 255)) return;
    
        sharingSubmit(sharings, sharingCaption);
    
        setSelectedSharings([]);
        setSearchTextSharing("");
        setSharings([]);
        setSharingCaption("");
        setShowSharing(!showSharing); 
    };

    function handleComplaintSubmit(e) {
        e.preventDefault();

        if ((!complaintDescription && (!selectedComplaintReasons || selectedComplaintReasons.length === 0)) || (complaintDescription && complaintDescription.length > 255)) return;
    
        complaintSubmit(postComplaintReasons, complaintDescription);
    
        setSelectedComplaintReasons([]);
        setPostComplaintReasons([]);
        setComplaintDescription("");
        setShowComplaintReasons(!showComplaintReasons);  
    };

    function handleCommentSubmit(e) {
        e.preventDefault();

        if (!commentText || commentText.length === 0 || (commentText && commentText.length > 255)) return;
    
        commentSubmit(commentText);
    
        setCommentText("");
    };

    const validateSharingCaption = useCallback(() => {
        return (sharingCaption && 
            sharingCaption.length <= 255) || 
            !sharingCaption;
    }, [sharingCaption]);

    const validateCommentText = useCallback(() => {
        return (commentText && 
            commentText.length <= 255) || 
            !commentText;
    }, [commentText]);

    const validateComplaintDescription = useCallback(() => {
        return (complaintDescription && 
            complaintDescription.length <= 255) || 
            !complaintDescription;
    }, [complaintDescription]);

    return (
        <div className={styles.post} ref={ref}>
            <div className={styles.first_post_container}>
                <ProfileSmallerContainer 
                    profilePhotoPath={author?.media?.caminho} 
                    profileName={author?.nome} 
                    handleClick={!isInCreating ? () => navigate(`/profile/${author.id_perfil}`) : undefined}
                />

                <div className={styles.medias}>
                    {medias.length > 0 && (
                        <>
                            <div className={styles.media_info}>
                                {medias.length !== 1 && <p>{`${currentMediaIndex + 1}/${medias.length}`}</p>}
                                {/* {medias[currentMediaIndex].duration && <p>{medias[currentMediaIndex].duration}</p>} */}
                            </div>

                            <div className={styles.slide_container}>
                                <div className={styles.slide_left} onClick={slideToLeft}></div>
                                <div className={styles.slide_right} onClick={slideToRight}></div>
                            </div>

                            {medias[currentMediaIndex].type === 'imagem' ? (
                                <img src={medias[currentMediaIndex].path} alt={`Media ${currentMediaIndex + 1}`} />
                            ) : medias[currentMediaIndex].type === 'video' ? (
                                <video 
                                    controls
                                    onLoadedMetadata={(e) => handleVideoLoad(currentMediaIndex, e.target)}
                                >
                                    <source src={medias[currentMediaIndex].path} type="video/mp4" />
                                    Seu navegador não suporta a tag de vídeo.
                                </video>
                            ) : null}
                        </>
                    )}
                </div>
            </div>

            <div className={styles.container_divisor}></div>

            <div className={styles.second_post_container}>    
                <span className={styles.date}>Publicado em: {moment}</span>
                
                <p className={styles.caption}><span>{author?.nome}:</span> {caption}</p>

                <ul className={styles.post_actions}>
                    <div>
                        <li>
                            <img src={isLiked ? likedIcon : likeIcon} alt="Like" onClick={!isInCreating ? likeSubmit : undefined}/>
                            <span>{!isInCreating ? formatNumber(post.total_curtidas) : 0}</span>
                        </li>

                        <li>
                            <img src={shareIcon} alt="Share" onClick={!isInCreating ? viewSharing : undefined}/>
                            <span>{!isInCreating ? formatNumber(post.total_compartilhamentos) : 0}</span>

                            {!isInCreating && showSharing && (
                                <div className={styles.actions_items}>
                                    <span onClick={viewSharing}>Voltar</span>

                                    <form onSubmit={handleSharingSubmit}>
                                        <SubmitButton text="Compartilhar"/>

                                        <MainInput 
                                            type="text" 
                                            name="sharingCaption" 
                                            placeholder="Escreva sua legenda aqui" 
                                            maxLength={255}
                                            alertMessage="A legenda não pode ter mais que 255 caracteres"
                                            handleChange={handleOnChangeSharingCaption}    
                                            showAlert={!validateSharingCaption()}
                                            value={sharingCaption}
                                        />
                                    </form>

                                    <SearchInput 
                                        type="text" 
                                        name="SharingSearch"
                                        placeholder="Pesquisar perfis..." 
                                        value={searchTextSharing}
                                        maxLength={30}
                                        handleChange={handleSearchSharingChange}
                                    />

                                    <PostItemsContainer
                                        searchText={searchTextSharing}
                                        filteredItems={filteredSharings}
                                        handleClick={handleClickSharing}
                                        selectedItems={selectedSharings}
                                        isSelectable
                                        haveProfile
                                        notFoundText="Perfil inexistente ou indisponível"
                                        tagsLoading={tagsLoading}
                                    />                                        
                                </div>
                            )}
                        </li>

                        <li>
                            <img src={commentIcon} alt="Comment" onClick={!isInCreating ? viewComments : undefined}/>
                            <span>{!isInCreating ? formatNumber(post.total_comentarios) : 0}</span>

                            {!isInCreating && showComments && (
                                <div className={styles.actions_items}>
                                    <span onClick={viewComments}>Voltar</span>

                                    <form onSubmit={handleCommentSubmit}>
                                        <SubmitButton text="Comentar"/>

                                        <MainInput 
                                            type="text" 
                                            name="commentText" 
                                            placeholder="Escreva seu comentário aqui"
                                            maxLength={255} 
                                            alertMessage="Um comentário não pode ter mais que 255 caracteres"
                                            handleChange={handleOnChangeCommentText}    
                                            showAlert={!validateCommentText()}
                                            value={commentText}
                                        />
                                    </form>

                                    <PostItemsContainer
                                        searchText={true}
                                        notFoundText="Faça o primeiro comentário"
                                        filteredItems={comments}
                                        isComment
                                    />
                                </div>
                            )}    
                        </li>
                    </div>

                    <div>
                        <li>
                            <img src={tagsIcon} alt="Tags" onClick={viewTags}/>

                            {isInCreating && showTags ? (
                                <div className={styles.actions_items}>
                                    <SearchInput 
                                        type="text" 
                                        name="tagsSearch"
                                        maxLength={30}
                                        placeholder="Pesquisar perfis..." 
                                        value={searchTextTag}
                                        handleChange={handleSearchTagChange}
                                    />

                                    <PostItemsContainer
                                        searchText={searchTextTag}
                                        filteredItems={filteredTags}
                                        handleClick={handleClickTag}
                                        isSelectable
                                        selectedItems={selectedTags}
                                        haveProfile
                                        notFoundText="Não existe um perfil com esse nome"
                                        tagsLoading={tagsLoading}
                                    />
                                </div>
                            ) : !isInCreating && showTags ? (
                                <div className={styles.actions_items}>
                                    <PostItemsContainer
                                        searchText={true}
                                        filteredItems={postTags}
                                        notFoundText="Sem marcações"
                                        isPostTags
                                    />
                                </div>
                            ) : null}
                        </li>

                        <li>
                            <img src={hashtagsIcon} alt="Hashtags" onClick={viewHashtags}/>

                            {isInCreating && showHashtags ? (
                                <div className={styles.actions_items}>
                                    <SearchInput 
                                        type="text" 
                                        name="hashtagsSearch"
                                        placeholder="Pesquisar hashtags..." 
                                        maxLength={50}
                                        value={searchTextHashtag}
                                        handleChange={handleSearchHashtagChange}
                                    />

                                    <PostItemsContainer
                                        searchText={searchTextHashtag}
                                        filteredItems={filteredHashtags}
                                        handleClick={handleClickHashtag}
                                        isSelectable
                                        selectedItems={selectedHashtags}
                                        notFoundText="Nenhuma hashtag encontrada"
                                        isHashtags
                                    />
                                </div>
                            ) : !isInCreating && showHashtags ? (
                                <div className={styles.actions_items}>
                                    <PostItemsContainer
                                        searchText={true}
                                        filteredItems={postHashtags}
                                        notFoundText="Sem hashtags"
                                        isPostHashtags
                                    />
                                </div>
                            ) : null}
                        </li>
                    </div>
                    
                    <div>
                        <li>
                            <img src={isComplainted ? complaintedIcon : complaintIcon} alt="Complaint" onClick={!isInCreating && !isComplainted ? viewComplaint : undefined}/>

                            {showComplaintReasons && (
                                <div className={styles.actions_items}>
                                    <span onClick={viewComplaint}>Voltar</span>

                                    <form onSubmit={handleComplaintSubmit}>
                                        <SubmitButton text="Denunciar"/>
                                        
                                        <MainInput 
                                            type="text" 
                                            name="complaintDescription" 
                                            placeholder="Descreva o motivo da sua denúncia" 
                                            maxLength={255}
                                            alertMessage="A descrição não pode ter mais que 255 caracteres"
                                            handleChange={handleOnChangeComplaintDescription}    
                                            showAlert={!validateComplaintDescription()}
                                            value={complaintDescription}
                                        />
                                    </form>

                                    <PostItemsContainer
                                        searchText={true}
                                        filteredItems={complaintReasons}
                                        handleClick={handleClickComplaintReason}
                                        isSelectable
                                        selectedItems={selectedComplaintReasons}
                                        isComplaintReasons
                                    />
                                </div>
                            )}
                        </li>
                    </div>
                </ul>
            </div>
        </div>
    );
})

export default Post;
