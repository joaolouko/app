import { Link } from "react-router-dom"
import styles from "./Header.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars } from "@fortawesome/free-solid-svg-icons"



function Header() {
    return (
        <>

            <div className={styles.container}>
                <FontAwesomeIcon icon={faBars} size="2xl"/>
                <ul className={styles.list}>
                    <li><Link className={styles.link} to="/">Inicio</Link></li>
                </ul>
            </div>

        </>
    )
}

export default Header