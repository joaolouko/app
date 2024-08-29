import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import styles from './Admin.module.css';
import { useNavigate } from 'react-router';

const socket = io('http://localhost:3001');

function Admin() {
    const navigate = useNavigate();
    const [salas, setSalas] = useState([]);
    const [newSalaName, setNewSalaName] = useState('');
    const [selectedReservas, setSelectedReservas] = useState({});

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
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (!role) {
            navigate('/inicio');
        }
    
        fetchSalas();
    
        socket.on('updateSalas', () => {
            fetchSalas();  // Atualiza a lista de salas quando receber o evento
        });
    
        return () => {
            socket.off('updateSalas');
        };
    }, [navigate]);
    

    const handleEditSala = async (salaId) => {
        try {
            const selectedReserva = selectedReservas[salaId];
            const [date, aulaIndex] = selectedReserva ? selectedReserva.split('-').map((val, index) => index === 1 ? Number(val) : val) : [null, null];
    
            if (selectedReserva !== null) {
                await axios.put(`http://localhost:3001/admin/remover-ocupacao/${salaId}`, { date, aulaIndex }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setSelectedReservas(prevState => ({ ...prevState, [salaId]: '' }));
            }
        } catch (error) {
            console.error('Erro ao remover ocupação da sala:', error);
        }
    };
    

    const handleCreateSala = async (e) => {
        e.preventDefault();
        if (newSalaName.trim() === '') return;
    
        const diasIniciais = [{
            data: '',
            aulas: []
        }];
    
        try {
            await axios.post('http://localhost:3001/admin/criar-sala', { 
                nome: newSalaName, 
                dias: diasIniciais 
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            setNewSalaName('');
            fetchSalas();  // Chama a função para atualizar a lista de salas
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

    const handleSelectChange = (salaId, value) => {
        setSelectedReservas(prevState => ({ ...prevState, [salaId]: value }));
    };

    return (
        <>
            <div className={styles.container}>
                <h1>Página de Administração</h1>
                <ul>
                    {salas && salas.length > 0 ? salas.map((sala, salaIndex) => (
                        <li key={salaIndex} className={styles.salaItem}>
                            <span>{sala.nome}</span>
                            {sala.dias && sala.dias.length > 0 ? (
                                <div>
                                    <select 
                                        value={selectedReservas[sala._id] || ''} 
                                        onChange={(e) => handleSelectChange(sala._id, e.target.value)}
                                    >
                                        <option value="">Selecione uma reserva</option>
                                        {sala.dias.map((dia, diaIndex) => (
                                            dia.aulas.map((aula, aulaIndex) => (
                                                <option 
                                                    key={`${diaIndex}-${aulaIndex}`} 
                                                    value={`${diaIndex}-${aulaIndex}`} 
                                                    disabled={!aula.occuped}
                                                >
                                                    {dia.data ? dia.data : 'Data não especificada'} - {aula.aula ? aula.aula : 'Aula não especificada'} - {aula.occuped ? 'Ocupada' : 'Disponível'}
                                                </option>
                                            ))
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => handleEditSala(sala._id)} 
                                        disabled={!selectedReservas[sala._id]}
                                    >
                                        Remover Ocupação
                                    </button>
                                </div>
                            ) : <p>Sem reservas</p>}
                            <button onClick={() => handleDeleteSala(sala._id)} className={styles.deleteBtn}>
                                Excluir Sala
                            </button>
                        </li>
                    )) : <p>Nenhuma sala disponível</p>}
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
