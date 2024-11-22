import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io('http://localhost:3001');

function Admin() {
    const navigate = useNavigate();
    const [salas, setSalas] = useState([]);
    const [usuario, setUsuario ] = useState([]);
    const [newSalaName, setNewSalaName] = useState('');
    const [selectedReservas, setSelectedReservas] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Fetch initial data
    const fetchSalas = async () => {
        try {
            const response = await axios.get('http://localhost:3001/dados', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setSalas(response.data);
        } catch (error) {
            console.error('Erro ao buscar salas:', error);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:3001/usuarios', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setUsuario(response.data);
        } catch (error) {
            console.error('Erro ao buscar usuarios:', error);
        }
    };

    // Effect to validate user role and fetch salas
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (!role) {
            navigate('/inicio');
        }

        fetchSalas();
        fetchUsuarios();

        socket.on('updateSalas', fetchSalas);

        return () => {
            socket.off('updateSalas');
        };
    }, [navigate]);

    // Handle removing a reservation
    const handleEditSala = async (salaId) => {
        const selectedReserva = selectedReservas[salaId];
        if (!selectedReserva) return;

        const [diaIndex, aulaIndex] = selectedReserva.split('-').map((val, index) =>
            index === 1 ? Number(val) : val
        );

        try {
            setIsLoading(true);
            await axios.put(
                `http://localhost:3001/admin/remover-ocupacao/${salaId}`,
                { diaIndex, aulaIndex },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setSelectedReservas((prev) => ({ ...prev, [salaId]: '' }));
            fetchSalas();
        } catch (error) {
            console.error('Erro ao remover ocupação da sala:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle creating a new sala
    const handleCreateSala = async (e) => {
        e.preventDefault();
        if (newSalaName.trim() === '') return;

        try {
            setIsLoading(true);
            await axios.post(
                'http://localhost:3001/admin/criar-sala',
                { nome: newSalaName, dias: [{ data: '', aulas: [] }] },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setNewSalaName('');
            fetchSalas();
        } catch (error) {
            console.error('Erro ao criar sala:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle deleting a sala
    const handleDeleteSala = async (id) => {
        try {
            setIsLoading(true);
            await axios.delete(`http://localhost:3001/admin/excluir-sala/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            fetchSalas();
        } catch (error) {
            console.error('Erro ao excluir sala:', error);
        } finally {
            setIsLoading(false);
        }
    };

    
    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Handle select change for reservations
    const handleSelectChange = (salaId, value) => {
        setSelectedReservas((prev) => ({ ...prev, [salaId]: value }));
    };


    const handleUpdatePassword = async (userId) => {
        if (newPassword !== confirmPassword) {
            setPasswordError('As senhas não coincidem!');
            return;
        }

        try {
            setIsLoading(true);
            await axios.put(
                `http://localhost:3001/usuarios/${userId}/senha`,
                { senha: newPassword },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setUserToEdit(null); // Close the edit form
            setNewPassword('');
            setConfirmPassword('');
            fetchUsuarios();
        } catch (error) {
            console.error('Erro ao atualizar a senha:', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="container mt-5 bg-dark text-light p-4 rounded">
            <h1 className="mb-4 text-center">Administração de Salas</h1>

            {/* Lista de salas */}
            <ul className="list-group mb-4">
                {salas && salas.length > 0 ? (
                    salas.map((sala, salaIndex) => (
                        <li
                            key={salaIndex}
                            className="list-group-item d-flex justify-content-between align-items-center bg-secondary text-light"
                        >
                            <span>{sala.nome}</span>
                            <div className="d-flex flex-column">
                                {sala.dias && sala.dias.length > 0 ? (
                                    <>
                                        <select
                                            value={selectedReservas[sala._id] || ''}
                                            onChange={(e) =>
                                                handleSelectChange(sala._id, e.target.value)
                                            }
                                            className="form-select mb-1 bg-dark text-light"
                                        >
                                            <option value="">Selecione uma reserva</option>
                                            {sala.dias.map((dia, diaIndex) =>
                                                dia.aulas.map(
                                                    (aula, aulaIndex) =>
                                                        aula.occuped && (
                                                            <option
                                                                key={`${diaIndex}-${aulaIndex}`}
                                                                value={`${diaIndex}-${aulaIndex}`}
                                                            >
                                                                {dia.data || 'Sem data'} -{' '}
                                                                {aula.aula || 'Aula não especificada'} - Ocupada
                                                            </option>
                                                        )
                                                )
                                            )}
                                        </select>
                                        <button
                                            onClick={() => handleEditSala(sala._id)}
                                            disabled={!selectedReservas[sala._id] || isLoading}
                                            className="btn btn-danger mb-2"
                                        >
                                            Remover Ocupação
                                        </button>
                                    </>
                                ) : (
                                    <p>Sem reservas</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDeleteSala(sala._id)}
                                className="btn btn-danger"
                                disabled={isLoading}
                            >
                                Excluir Sala
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-center">Nenhuma sala disponível</p>
                )}
            </ul>

            {/* Formulário de criação de sala */}
            <form onSubmit={handleCreateSala} className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        value={newSalaName}
                        onChange={(e) => setNewSalaName(e.target.value)}
                        placeholder="Nome da nova sala"
                        className="form-control bg-dark text-light"
                    />
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Criando...' : 'Criar Sala'}
                    </button>
                </div>
            </form>
            
            <h3>Usuários</h3>
            <ul className="list-group mb-4">
                {usuario && usuario.length > 0 ? (
                    usuario.map((usuario) => (
                        <li
                            key={usuario._id}
                            className="list-group-item d-flex justify-content-between align-items-center bg-secondary text-light"
                        >
                            <span>{usuario.nome}</span>
                            <button
                                onClick={() => setUserToEdit(usuario._id)}
                                className="btn btn-warning"
                            >
                                Editar Senha
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-center">Nenhum usuário disponível</p>
                )}
            </ul>

            
            {/* Botão de logout */}
            <button
                className="btn btn-secondary w-100"
                onClick={handleLogout}
                disabled={isLoading}
            >
                Sair
            </button>
        </div>
    );
}

export default Admin;
