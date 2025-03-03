import styles from "./AppNavBar.module.css";
import homeIcon from "../../img/icons/socialMedia/homeIcon.png";
import newPostIcon from "../../img/icons/socialMedia/newPostIcon.png";
import { useLocation, useNavigate } from "react-router-dom";
import ProfilePhotoContainer from "./ProfilePhotoContainer";

function AppNavBar({ profilePhotoPath }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className={styles.app_nav_bar}>
            <ul>
                <li className={location.pathname === "/" ? styles.selected : undefined} onClick={() => navigate("/")}>
                    <img src={homeIcon} alt="Home"/>
                </li>

                <li onClick={() => navigate("/myProfile/newPost")}>
                    <img src={newPostIcon} alt="New"/>
                </li>
                
                <li 
                    className={location.pathname === "/places" ? styles.selected : undefined}
                    onClick={() => navigate("/places/myPlaces")}
                >
                    <svg 
                        version="1.0" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512.000000 512.000000"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <g 
                            transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                            fill="#e7e7e7" stroke="none"
                        >
                            <path d="M2335 5015 c-609 -99 -1081 -548 -1217 -1156 -30 -138 -33 -389 -5
                            -519 85 -395 379 -1028 848 -1826 65 -110 121 -207 124 -216 5 -11 -12 -18
                            -76 -32 -338 -73 -601 -230 -691 -413 -29 -60 -33 -77 -32 -148 0 -66 5 -90
                            28 -137 137 -285 641 -478 1246 -478 606 0 1107 192 1246 477 24 49 29 70 29
                            138 0 71 -4 88 -32 146 -91 184 -324 326 -673 409 -52 13 -97 24 -99 26 -2 2
                            53 99 122 216 474 808 769 1442 854 1838 28 130 25 381 -5 519 -130 582 -567
                            1018 -1144 1142 -125 27 -397 34 -523 14z m467 -171 c452 -86 834 -414 992
                            -852 47 -132 69 -263 69 -417 0 -129 -3 -151 -36 -275 -133 -502 -513 -1244
                            -1207 -2352 -30 -48 -57 -87 -60 -87 -13 0 -375 593 -565 924 -380 663 -606
                            1149 -702 1515 -33 124 -36 146 -36 275 1 654 503 1210 1161 1285 98 11 282 3
                            384 -16z m-483 -3916 c162 -254 186 -286 216 -298 58 -22 75 -4 267 299 67
                            106 128 195 134 198 18 7 238 -46 333 -79 323 -114 470 -286 373 -439 -101
                            -158 -379 -281 -757 -335 -164 -24 -487 -23 -650 0 -260 38 -458 101 -605 193
                            -276 174 -232 379 114 539 113 51 386 128 435 121 8 -1 71 -91 140 -199z"/>
                        
                            <path d="M2463 4359 c-61 -30 -85 -63 -169 -231 -51 -102 -81 -151 -97 -158
                            -12 -5 -91 -18 -176 -30 -162 -23 -207 -38 -253 -87 -59 -62 -76 -170 -38
                            -249 12 -24 72 -92 145 -163 69 -67 125 -130 125 -139 0 -10 -12 -83 -26 -162
                            -31 -176 -29 -241 9 -299 42 -64 97 -95 176 -99 67 -4 67 -4 223 77 86 45 166
                            81 178 81 12 0 93 -36 179 -81 155 -81 156 -81 222 -77 79 4 134 35 176 99 38
                            58 40 123 9 299 -14 79 -26 152 -26 161 0 9 56 72 125 140 71 70 134 140 145
                            164 38 78 21 186 -38 248 -46 49 -91 64 -253 87 -85 12 -164 25 -176 30 -16 7
                            -46 56 -97 158 -41 82 -86 162 -100 180 -60 70 -178 93 -263 51z m126 -148 c8
                            -5 53 -85 100 -177 110 -216 110 -216 338 -250 87 -13 168 -26 180 -29 28 -7
                            47 -40 39 -69 -3 -12 -59 -72 -125 -133 -176 -166 -182 -186 -135 -455 40
                            -230 29 -236 -209 -114 -221 115 -213 115 -434 0 -238 -122 -249 -116 -209
                            114 47 269 41 289 -135 455 -66 61 -122 122 -125 134 -8 28 11 61 39 68 12 3
                            93 16 180 29 228 34 228 34 338 250 84 165 99 186 129 186 8 0 21 -4 29 -9z"/>
                        </g>
                    </svg>
                </li>
                
                <li 
                    className={`${styles.profile_photo} ${location.pathname === "/myProfile" ? styles.selected : undefined}`} 
                    onClick={() => {
                        navigate("/myProfile");
                        window.location.reload();
                    }}
                >
                    <ProfilePhotoContainer size="short" profilePhotoPath={profilePhotoPath}/>
                </li>
            </ul>
        </nav>
    );
}

export default AppNavBar;