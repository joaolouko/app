import { useEffect, useState } from "react";
import Header from "../layout/Header";
import axios from 'axios';
import styles from './Inicio.module.css';
import { Link, useNavigate } from "react-router-dom";

function Inicio() {
    const [data, setData] = useState([]);
    const [nomeUsuario, setNomeUsuario] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const nome = localStorage.getItem('nomeUsuario');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token) {
            navigate('/'); // Redireciona para a página de login se o token não estiver presente
            return;
        }

        setNomeUsuario(nome);

        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/dados', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setData(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/'); // Redireciona para a página de login se o token for inválido
                }
            }
        };
        fetchData();
    }, [navigate]);

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.box1}>
                    <div className={styles.reservar}>
                        <Link className={styles.link} to='/reservar'>Reservar sala</Link>
                    </div>
                    <div className={styles.verReserva}>
                        <Link className={styles.link} to='/ver-reserva'>Ver reservas</Link>
                    </div>
                </div>
                <div className={styles.box2}>
                    
                    <div className={styles.salasReservadas}>
                        <h1>Salas reservadas</h1>
                        <ul>
                            {data.map((sala, salaIndex) => (
                                sala.dias.map((dia, diaIndex) => (
                                    dia.aulas.map((aula, aulaIndex) => (
                                        aula.occuped && (
                                            <li key={`${salaIndex}-${diaIndex}-${aulaIndex}`}>
                                                {sala.nome} - {aula.aula} por {aula.reservadoPor} em {dia.data}
                                            </li>
                                        )
                                    ))
                                ))
                            ))}
                        </ul>
                    </div>

                    <div className={styles.meuPerfil}>
                        <h1>{nomeUsuario}</h1>
                        <h2>foto de perfil</h2>
                        <select name="" id="">
                            <option defaultValue value="1">Aluno</option>
                            <option value="2">Servidor</option>
                        </select>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Inicio;
