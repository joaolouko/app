import { useEffect, useState } from "react";
import Header from "../layout/Header"
import axios from 'axios'
import styles from './Inicio.module.css';
import { Link } from "react-router-dom";

function Inicio() {

    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/dados');
                setData(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };
        fetchData();
    }, []);
    console.log(data)
    return (

        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.box1}>
                    <div className={styles.reservar}>
                        <Link className={styles.link} to='/reservar'>Reservar sala</Link>
                    </div>
                    <div className={styles.verReserva}>
                        <Link className={styles.link}>Ver reservas</Link>
                    </div>
                </div>
                <div className={styles.box2}>

                    <div className={styles.minhaReserva}>
                        <h1>Minhas Reservas</h1>
                        <ul>
                            {data.map((item, index) => (
                                !item.occuped && <li key={index}>{item.nome}</li>
                            ))}
                    
                        </ul>
                    </div>

                    <div className={styles.salasReservadas}>
                        <h1>Salas reservadas</h1>
                        <ul>
                        <ul>
                            {data.map((item, index) => (
                                item.occuped && <li key={index}>{item.nome}</li>
                            ))}
                    
                        </ul>
                        </ul>
                    </div>

                    <div className={styles.meuPerfil}>
                        <h1>Meu perfil</h1>
                        <h2>foto de perfil</h2>
                        <select name="" id="">
                            <option defaultValue value="1">Aluno</option>
                            <option value="2">Servidor</option>
                        </select>
                    </div>


                </div>


            </div>
        </>
    )
}

export default Inicio