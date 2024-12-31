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

    const [newUserName, setNewUserName] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [userToEdit, setUserToEdit] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Fetch initial data
    const fetchSalas = async () => {
        try {
            const response = await axios.get('http://localhost:3001/dados', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
    
            // Filtra apenas as salas que não estão marcadas como excluídas
            const activeSalas = response.data.filter(sala => !sala.isDeleted);
            setSalas(activeSalas);
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

     // Criar usuário
     const handleCreateUser = async () => {
        if (newUserPassword !== confirmPassword) {
            setPasswordError('As senhas não coincidem!');
            return;
        }
        try {
            await axios.post(
                'http://localhost:3001/usuarios',
                { nome: newUserName, senha: newUserPassword },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
            setNewUserName('');
            setNewUserPassword('');
            setConfirmPassword('');
            setPasswordError('');
            fetchUsuarios();
            alert('Usuário criado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao criar usuário');
        }
    };

    // Editar senha do usuário
    const handleEditSenha = async () => {
        if (newPassword.trim() === '') {
            setPasswordError('A senha não pode estar vazia!');
            return;
        }
        try {
            await axios.put(
                `http://localhost:3001/usuarios/${userToEdit}/senha`,
                { senha: newPassword },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
            setUserToEdit(null);
            setNewPassword('');
            setPasswordError('');
            fetchUsuarios();
            alert('Senha atualizada com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar senha');
        }
    };

    // Deletar usuário
    const handleDeleteUser = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
        try {
            const response = await axios.put(
                `http://localhost:3001/usuarios/${id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            fetchUsuarios();
            alert(response.data.message);
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário');
        }
    };
    


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
    
            // Gerando horários para cada dia da semana
            const dias = Array(7) // Supondo uma semana como exemplo
                .fill(null)
                .map(() => ({
                    data: '', // Adicione a lógica de preenchimento de data, se necessário
                    aulas: generateAulas(), // Gerando os horários para 6 aulas por dia
                }));
    
            await axios.post(
                'http://localhost:3001/admin/criar-sala',
                { nome: newSalaName, dias },
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
    
    // Função para gerar os horários de aulas de 30 em 30 minutos (ajuste conforme necessário)
    const generateAulas = () => {
        const aulas = [];
        let startHour = 8; // Início às 08:00
        let endHour = 22;  // Fim às 22:00
    
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const hora = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                aulas.push({
                    occuped: false, // Inicialmente não ocupada
                    reservadoPor: '', // Inicialmente sem usuário
                    horario: hora, // Armazenando o horário
                });
            }
        }
    
        return aulas; // Retorna o array com os horários gerados
    };
    

    // Handle deleting a sala
    const handleDeleteSala = async (id) => {
        try {
            const response = await axios.put(
                `http://localhost:3001/admin/excluir-sala/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            console.log(response.data.message);
        } catch (error) {
            console.error('Erro ao excluir sala:', error);
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
            <ul className="list-group mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                 
            <h3 className="mb-4">Usuários</h3>

            {/* Lista de Usuários */}
            <ul className="list-group mb-4" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {usuario && usuario.length > 0 ? (
                    usuario
                    .filter((u) => u.nome !== "Admin")
                    .map((u) => (
                        <li
                            key={u._id}
                            className="list-group-item d-flex justify-content-between align-items-center bg-secondary text-light"
                        >
                            <span>{u.nome}</span>
                            <div>
                                <button
                                    onClick={() => setUserToEdit(u._id)}
                                    className="btn btn-warning btn-sm me-2"
                                >
                                    Editar Senha
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(u._id)}
                                    className="btn btn-danger btn-sm"
                                >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    ))
                ) : (
                    <p className="text-center">Nenhum usuário disponível</p>
                )}
            </ul>

            {/* Formulário para Criar Usuário */}
            <h5>Criar Novo Usuário</h5>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Nome do Usuário"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="form-control mb-2"
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="form-control mb-2"
                />
                <input
                    type="password"
                    placeholder="Confirmar Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control mb-2"
                />
                {passwordError && <p className="text-danger">{passwordError}</p>}
                <button onClick={handleCreateUser} className="btn btn-primary w-100">
                    Criar Usuário
                </button>
            </div>

            {/* Edição de Senha */}
            {userToEdit && (
                <div className="mb-4">
                    <h5>Editar Senha</h5>
                    <input
                        type="password"
                        placeholder="Nova Senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-control mb-2"
                    />
                    {passwordError && <p className="text-danger">{passwordError}</p>}
                    <button onClick={handleEditSenha} className="btn btn-success me-2">
                        Atualizar Senha
                    </button>
                    <button onClick={() => setUserToEdit(null)} className="btn btn-secondary">
                        Cancelar
                    </button>
                </div>
            )}

            
            {/* Botão de logout */}
            <button
                className="btn btn-danger w-100"
                onClick={handleLogout}
                disabled={isLoading}
            >
                Sair
            </button>
        </div>
    );
}

export default Admin;
