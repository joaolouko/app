import { Link, useNavigate } from "react-router-dom"
import styles from "./Header.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars } from "@fortawesome/free-solid-svg-icons"



function Header() {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <>

            <div className={styles.container}>
                <FontAwesomeIcon icon={faBars} size="2xl"/>
                <ul className={styles.list}>
                    <li><Link className={styles.link} to="/inicio">Inicio</Link></li>
                    <li><button className={styles.btn} onClick={handleLogout}>Sair</button></li>
                </ul>
            </div>

        </>
    )
}

export default Header