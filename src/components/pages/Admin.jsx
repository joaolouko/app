import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router';
import 'bootstrap/dist/css/bootstrap.min.css'; // Certifique-se de importar o Bootstrap

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
            const [diaIndex, aulaIndex] = selectedReserva ? selectedReserva.split('-').map((val, index) => index === 1 ? Number(val) : val) : [null, null];
    
            if (selectedReserva != null) {
                await axios.put(`http://localhost:3001/admin/remover-ocupacao/${salaId}`, { diaIndex, aulaIndex }, {
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
            fetchSalas(); // Atualiza a lista após excluir a sala
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
        <div className="container mt-5 bg-dark text-light">
            <h1 className="mb-4">Página de Administração</h1>
            <ul className="list-group mb-4">
                {salas && salas.length > 0 ? salas.map((sala, salaIndex) => (
                    <li key={salaIndex} className="list-group-item d-flex justify-content-between align-items-center bg-secondary text-light">
                        <span>{sala.nome}</span>
                        {sala.dias && sala.dias.length > 0 ? (
                            <div className="d-flex flex-column">
                                <select 
                                    value={selectedReservas[sala._id] || ''} 
                                    onChange={(e) => handleSelectChange(sala._id, e.target.value)}
                                    className="form-select mb-1 bg-dark text-light "
                                >
                                    <option value="">Selecione uma reserva</option>
                                    {sala.dias.map((dia, diaIndex) => (
                                        dia.aulas.map((aula, aulaIndex) => (
                                            aula.occuped && ( // Exibe apenas aulas ocupadas
                                                <option 
                                                    key={`${diaIndex}-${aulaIndex}`} 
                                                    value={`${diaIndex}-${aulaIndex}`}
                                                >
                                                    {dia.data ? dia.data : 'Data não especificada'} - {aula.aula ? aula.aula : 'Aula não especificada'} - Ocupada
                                                </option>
                                            )
                                        ))
                                    ))}
                                </select>
                                <button 
                                    onClick={() => handleEditSala(sala._id)} 
                                    disabled={!selectedReservas[sala._id]}
                                    className="btn btn-danger mb-2"
                                >
                                    Remover Ocupação
                                </button>
                            </div>
                        ) : <p>Sem reservas</p>}
                        <button onClick={() => handleDeleteSala(sala._id)} className="btn btn-danger">
                            Excluir Sala
                        </button>
                    </li>
                )) : <p>Nenhuma sala disponível</p>}
            </ul>
            
            <form onSubmit={handleCreateSala} className="mb-4">
                <div className="input-group">
                    <input 
                        type="text" 
                        value={newSalaName}
                        onChange={(e) => setNewSalaName(e.target.value)}
                        placeholder="Nome da nova sala" 
                        className="form-control bg-dark text-light" 
                    />
                    <button type="submit" className="btn btn-primary">Criar Sala</button>
                </div>
            </form>
            <button className="btn btn-secondary" onClick={handleLogout}>Sair</button>
        </div>
    );
}

export default Admin;
