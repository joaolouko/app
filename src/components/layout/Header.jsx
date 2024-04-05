import { Link } from "react-router-dom"
import styles from "./Header.module.css"

function Header() {
    return (
        <>
            <div className={styles.container}>
                <ul className={styles.list}>
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/reservas">Reservas</Link></li>
                </ul>
            </div>

        </>
    )
}

export default Header