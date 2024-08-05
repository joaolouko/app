import { Link } from "react-router-dom"
import Header from "../layout/Header"
import axios from "axios";
import { useEffect, useState } from "react";
import styles from './ReservarSala.module.css'

function ReservarSala() {

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
                <div className={styles.box}>
                    <h1>salas disponiveis</h1>
                    <ul>
                        {data.map((item, index) => (
                            !item.occuped && <li key={index}>{item.nome}</li>
                        ))}
                    </ul>
                </div>

                <Link to='/inicio'>Voltar</Link>
            </div>

        </>
    )
}

export default ReservarSala