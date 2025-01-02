import styles from "./PostItemsContainer.module.css";
import ProfilePhotoContainer from "./ProfilePhotoContainer";
import ProfileSmallerContainer from "./ProfileSmallerContainer";

function PostItemsContainer({ searchText, filteredItems = [], handleClick, isSelectable = false, selectedItems, haveProfile = false, notFoundText, isComment = false, isHashtags = false, isComplaintReasons = false, isPostTags = false, isPostHashtags = false }) {
    function formatDate(date) {
        const notFormattedDate = new Date(date);

        const day = String(notFormattedDate.getDate()).padStart(2, '0');
        const month = String(notFormattedDate.getMonth() + 1).padStart(2, '0');
        const year = notFormattedDate.getFullYear();

        const hours = String(notFormattedDate.getHours()).padStart(2, '0');
        const minutes = String(notFormattedDate.getMinutes() + 1).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
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
                    <li key={index}>
                        {isPostHashtags && <># {item.nome}</>}

                        {isComment && (
                            <>
                                <ProfilePhotoContainer profilePhotoPath={item.caminho} size="short"/>
                                <p className={styles.comment_text}>{item.texto}</p>
                                <p className={styles.comment_date}>{formatDate(item.data_comentario)}</p>
                            </>
                        )}

                        {isPostTags && <><ProfileSmallerContainer profilePhotoPath={item.caminho} profileName={item.nome}/></>}
                    </li>
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