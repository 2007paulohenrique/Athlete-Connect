import styles from "./SharingContainer.module.css";
import ProfileSmallerConatiner from "../layout/ProfileSmallerContainer";
import { useEffect, useState } from "react";
import generateVideoThumbnail from "../../utils/post/GenerateVideoThumbnail";

function SharingContainer({ profileDestinyId, profileOriginId, profileOriginName, profileOriginPhotoPath, postAuthorId, postAuthorName, postAuthorPhotoPath, sharingCaption, postId, sharingDate, thumbnailPath, thumbnailMediaType, navigate, shareds = [] }) {    
    const [thumbnail, setThumbnail] = useState();

    useEffect(() => {
        const fetchThumbnail = async () => {
            let newThumbnail;
    
            if (thumbnailMediaType === "video") {
                newThumbnail = await generateVideoThumbnail(thumbnailPath);
            } else {
                newThumbnail = thumbnailPath;
            }
    
            setThumbnail(newThumbnail);
        };

        fetchThumbnail();
    }, [thumbnailMediaType, thumbnailPath]);
    
    return (
        <div className={`${styles.sharing_container} ${String(profileDestinyId) === String(profileOriginId) ? styles.self_sharing : undefined}`}>
            <div className={styles.profile_origin}>
                <span>
                    {String(profileDestinyId) === String(profileOriginId) ?
                        "Você "
                    :
                        <ProfileSmallerConatiner
                            profilePhotoPath={profileOriginPhotoPath}
                            profileName={profileOriginName}
                            handleClick={() => navigate(`/profile/${profileOriginId}`)}
                        />
                    }

                    compartilhou{String(profileDestinyId) === String(profileOriginId) && " com"}:
                </span>

                {String(profileDestinyId) === String(profileOriginId) &&
                    <div className={styles.shareds}>
                        {shareds && shareds.map((shared, index) => (
                            <ProfileSmallerConatiner
                                key={index}
                                profilePhotoPath={shared.photo}
                                profileName={shared.name}
                                handleClick={() => navigate(`/profile/${shared.fk_perfil_id_perfil}`)}
                            />
                        ))}
                    </div>
                }
            </div>

            <div className={styles.sharing_post}>
                <ProfileSmallerConatiner
                    profilePhotoPath={postAuthorPhotoPath}
                    profileName={postAuthorName}
                    handleClick={() => navigate(`/profile/${postAuthorId}`)}
                />

                <div className={styles.thumbnail} onClick={() => navigate(`/post/${postId}`)}>
                    <img src={thumbnail} alt="Sharing post"/>
                </div>

                {sharingCaption && <p>{sharingCaption}</p>}
            </div>

            <span>compartilhado em: {sharingDate}</span>
        </div>
    );
}

export default SharingContainer;