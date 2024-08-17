import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import styles from './Admin.module.css';
import { useNavigate } from 'react-router';

const socket = io('http://localhost:3001')

function Admin() {
    const navigate = useNavigate();
    const [salas, setSalas] = useState([]);
    const [newSalaName, setNewSalaName] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (!role) {
            navigate('/inicio');
        }

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

        socket.on('updateSalas', () => {
            fetchSalas();
        });

        return () => {
            socket.off('updateSalas');
        }
    }, [navigate]);

    const handleEditSala = async (id) => {
        try {
            await axios.put(`http://localhost:3001/admin/editar-sala/${id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Erro ao editar sala:', error);
        }
    };

    const handleCreateSala = async (e) => {
        e.preventDefault();
        if (newSalaName.trim() === '') return;
        
        try {
            const response = await axios.post('http://localhost:3001/admin/criar-sala', { nome: newSalaName }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setNewSalaName(''); // Limpa o campo de texto após criar a sala
        } catch (error) {
            console.error('Erro ao criar sala:', error);
        }
    };

    const handleDeleteSala = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/admin/excluir-sala/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Erro ao excluir sala:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <>
            <div className={styles.container}>
                <h1>Página de Administração</h1>

                <ul>
                    {salas.map((sala, index) => (
                        <li key={index} className={styles.salaItem}>
                            <span>{sala.nome}</span>
                            <span>{sala.occuped ? 'Ocupada' : 'Disponível'}</span>
                            <button onClick={() => handleEditSala(sala._id)} disabled={!sala.occuped}>
                                Remover Ocupação
                            </button>
                            <button onClick={() => handleDeleteSala(sala._id)} className={styles.deleteBtn}>
                                Excluir Sala
                            </button>
                        </li>
                    ))}
                </ul>
                
                <form onSubmit={handleCreateSala}>
                    <input 
                        type="text" 
                        value={newSalaName}
                        onChange={(e) => setNewSalaName(e.target.value)}
                        placeholder="Nome da nova sala" 
                        className={styles.input} 
                    />
                    <button type="submit" className={styles.btn}>Criar Sala</button>
                </form>

                
            </div>
            <button className={styles.btn} onClick={handleLogout}>Sair</button>
        </>
    );
}

export default Admin;
