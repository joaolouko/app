import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Admin.module.css';
import { useNavigate } from 'react-router';

function Admin() {
    const [salas, setSalas] = useState([]);

    useEffect(() => {
        const fetchSalas = async () => {
            try {
                const response = await axios.get('http://localhost:3001/dados', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setSalas(response.data);
            } catch (error) {
                console.error('Erro ao buscar salas:', error);
            }
        };
        fetchSalas();
    }, []);

    const handleEditSala = async (id) => {
        try {
            await axios.put(`http://localhost:3001/admin/editar-sala/${id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSalas(salas.map(sala => sala._id === id ? { ...sala, occuped: false, userId: null } : sala));
        } catch (error) {
            console.error('Erro ao editar sala:', error);
        }
    };

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <>
            <div className={styles.container}>
                <h1>Página de Administração</h1>
                <ul>
                    {salas.map((sala) => (
                        <li key={sala._id} className={styles.salaItem}>
                            <span>{sala.nome}</span>
                            <span>{sala.occuped ? 'Ocupada' : 'Disponível'}</span>
                            <button onClick={() => handleEditSala(sala._id)} disabled={!sala.occuped}>
                                Remover Ocupação
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <button className={styles.btn} onClick={handleLogout}>Sair</button>
        </>
    );
}

export default Admin;
