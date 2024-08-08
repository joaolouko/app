import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ReservarSala.module.css';
import Header from '../layout/Header';

function ReservarSala() {
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/'); // Redireciona para a página de login se o token não estiver presente
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/dados', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setData(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login'); // Redireciona para a página de login se o token for inválido
                }
            }
        };
        fetchData();
    }, [navigate]);

    const handleReservarSala = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:3001/reservar-sala/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Sala reservada com sucesso!');
            setData(data.map(sala => sala._id === id ? { ...sala, occuped: true } : sala));
        } catch (error) {
            console.error('Erro ao reservar sala:', error);
        }
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.box}>
                    <h1>Salas disponíveis</h1>
                    <ul>
                        {data.map((item) => (
                            !item.occuped && 
                            <li key={item._id} onClick={() => handleReservarSala(item._id)}>
                                {item.nome}
                            </li>
                        ))}
                    </ul>
                </div>
                <Link to='/inicio'>Voltar</Link>
            </div>
        </>
    );
}

export default ReservarSala;
