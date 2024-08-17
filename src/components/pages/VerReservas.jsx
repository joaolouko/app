import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './VerReservas.module.css'; // Supondo que você tenha um arquivo CSS para estilos
import Header from '../layout/Header'

function VerReservas() {
    const [reservas, setReservas] = useState([]);


    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/minhas-reservas', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setReservas(response.data);
            } catch (err) {
                setError('Erro ao buscar reservas');
                console.error(err.response ? err.response.data : err.message);
            }
        };

        fetchReservas();
    }, []);

    return (
        <>
            <Header/>
            <h1>Minhas Reservas</h1>
            <ul>
                {reservas.map((reserva, index) => (
                    <li key={index}>{reserva.nome}</li>
                ))}
            </ul>
        </>
    );
}

export default VerReservas;
