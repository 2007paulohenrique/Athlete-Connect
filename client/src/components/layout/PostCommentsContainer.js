import { memo, useState } from "react";
import styles from "./PostCommentsContainer.module.css";
import ProfileSmallerContainer from "./ProfileSmallerContainer";
import { useNavigate } from "react-router-dom";
import formatDate from "../../utils/DateFormatter";

function PostCommentsContainer({ respComment, setRespComment, comments = [] }) {
    const [showReplies, setShowReplies] = useState({});

    const toggleReplies = (commentId) => {
        setShowReplies(prevState => ({
            ...prevState,
            [commentId]: !prevState[commentId]
        }));
    };

    const Comment = ({ comment }) => {
        const navigate = useNavigate();

        return (
            <li className={styles.comment}>
                <div
                    className={`${styles.comment_main} ${respComment.id_comentario === comment.id_comentario ? styles.selected : ""}`}
                    onClick={() => {
                        setRespComment((prev) =>
                            prev.id_comentario === comment.id_comentario ? {} : {id_comentario: comment.id_comentario, nome: comment.nome}
                        );
                    }}
                >
                    <ProfileSmallerContainer 
                        profilePhotoPath={comment.caminho} 
                        profileName={comment.nome} 
                        handleClick={() => navigate(`/profile/${comment.id_perfil}`)}
                    />


                    <div className={styles.comment_content}>
                        <p className={styles.comment_date}>
                            {comment.fk_comentario_id_respondido && 
                                <span>Respondeu a {comment.nome_resp}</span>
                            }

                            <span>{formatDate(comment.data_comentario)}</span>
                        </p>
                        <p className={styles.comment_text}>{comment.texto}</p>
                    </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <span onClick={() => toggleReplies(comment.id_comentario)}>
                        {showReplies[comment.id_comentario] ? "Ocultar respostas ▲" : "Ver respostas ▼"}
                    </span>
                )}

                {showReplies[comment.id_comentario] && comment.replies.length > 0 && (
                    <ul className={styles.replies}>
                        {comment.replies.map(reply => (
                            <Comment key={reply.id_comentario} comment={reply} />
                        ))}
                    </ul>
                )}
            </li>
        );
    };
    
    return (
        <ul className={styles.comments}>
            {comments.map(comment => (
                <Comment key={comment.id_comentario} comment={comment} />
            ))}
        </ul>
    );
}

export default memo(PostCommentsContainer);
