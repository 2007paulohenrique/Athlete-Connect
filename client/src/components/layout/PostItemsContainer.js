import styles from "./PostItemsContainer.module.css";
import ProfilePhotoContainer from "./ProfilePhotoContainer";
import ProfileSmallerContainer from "./ProfileSmallerContainer";

function PostItemsContainer({ searchText, filteredItems = [], handleClick, isSelectable = false, selectedItems, haveProfile = false, notFoundText, isComment = false, isHashtags = false, isComplaintReasons = false, isPostTags = false, isPostHashtags = false }) {
    return (
        <ul className={styles.post_items_container}>
            {isComplaintReasons && (
                <>
                    <p>Motivos:</p>
                    <hr/>
                    <br/>  
                </>
            )}

            {searchText && filteredItems.length > 0 ? filteredItems.map((item, index) => (
                isComment || isPostHashtags || isPostTags ? (
                    <>
                        {isComment && <hr/>}

                        <li key={index} className={isComment && styles.comment}>
                            {isPostHashtags && <># {item.nome}</>}

                            {isComment && (
                                <>
                                    <ProfilePhotoContainer profilePhotoPath={item.caminho} size="tiny"/>

                                    <div className={styles.comment_content}>
                                        <p className={styles.comment_date}>{item.data_comentario}</p>
                                        <p className={styles.comment_text}>{item.texto}</p>
                                    </div>
                                </>
                            )}

                            {isPostTags && <><ProfileSmallerContainer profilePhotoPath={item.caminho} profileName={item.nome}/></>}
                        </li>
                    </>
                ) : (
                    <li 
                        key={index} 
                        onClick={() => handleClick(item)}
                        className={isSelectable && selectedItems.includes(item) ? styles.selectedItem : ""}
                    >
                        {isComplaintReasons && <>{item.motivo}</>}

                        {isHashtags && <># {item.nome}</>}
                        
                        {haveProfile && <ProfileSmallerContainer profilePhotoPath={item.caminho} profileName={item.nome}/>}
                    </li>
                )
            )) : (
                searchText && notFoundText && <li>{notFoundText}</li>
            )}
        </ul>
    );
}

export default PostItemsContainer;