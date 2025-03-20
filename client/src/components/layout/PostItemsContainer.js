import { useNavigate } from "react-router-dom";
import styles from "./PostItemsContainer.module.css";
import ProfileSmallerContainer from "./ProfileSmallerContainer";
import React from "react";
import loading from "../../img/animations/loading.svg";

function PostItemsContainer({ searchText, filteredItems = [], handleClick, isSelectable = false, selectedItems, haveProfile = false, notFoundText, isHashtags = false, isComplaintReasons = false, isPostTags = false, isPostHashtags = false, tagsLoading }) {
    const navigate = useNavigate();
    
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
                isPostHashtags || isPostTags ? (
                    <React.Fragment key={index}>
                        <li
                            onClick={
                                isPostHashtags ? () => navigate(`/search?text=${item.nome}&type=posts`) : undefined
                            }
                        >
                            {isPostHashtags && <># {item.nome}</>}

                            {isPostTags && 
                                <ProfileSmallerContainer 
                                    profilePhotoPath={item.caminho} 
                                    profileName={item.nome} 
                                    handleClick={() => navigate(`/profile/${item.id_perfil}`)}
                                />
                            }
                        </li>
                    </React.Fragment>
                ) : (
                    <li 
                        key={index} 
                        onClick={() => handleClick(item)}
                        className={isSelectable && selectedItems.some(selectedItem => JSON.stringify(item) === JSON.stringify(selectedItem)) ? styles.selectedItem : undefined}
                    >
                        {isComplaintReasons && <>{item.motivo}</>}

                        {isHashtags && <># {item.nome}</>}
                        
                        {haveProfile && <ProfileSmallerContainer profilePhotoPath={item.caminho} profileName={item.nome}/>}
                    </li>
                )
            )) : (
                searchText && notFoundText &&
                <li className={tagsLoading ? styles.loading_li : undefined}>
                    {tagsLoading ? 
                        <img className="loading" src={loading} alt="Loading"/>
                    :
                        notFoundText
                    }
                </li>
            )}
        </ul>
    );
}

export default PostItemsContainer;