import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../layout/Header';

function VerReservas() {
    const [salas, setSalas] = useState([]);
    const [message, setMessage] = useState(''); // Estado para armazenar a mensagem
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId'); // Assumindo que você salva o ID do usuário no localStorage

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const response = await axios.get('http://localhost:3001/dados', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setSalas(response.data);
            } catch (error) {
                console.error('Erro ao buscar reservas:', error);
            }
        };

        fetchReservas();
    }, []);

    const formatarDataBrasileira = (data) => {
        const dataObj = new Date(data + 'T00:00:00');
        return dataObj.toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        });
      };

    const handleCancelReservation = async (salaId, diaIndex, aulaIndex) => {
        try {
            // Envia a requisição PUT para o backend, cancelando a reserva
            await axios.put(`http://localhost:3001/usuario/cancelar-reserva/${salaId}`, 
                { 
                    diaIndex, 
                    aulaIndex 
                }, 
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

            // Define a mensagem de sucesso
            setMessage('Reserva cancelada com sucesso!');

            // Remove a reserva da lista local apenas visualmente
            setSalas((prevSalas) => {
                return prevSalas.map(sala => ({
                    ...sala,
                    dias: sala.dias.map((dia, dIndex) => ({
                        ...dia,
                        aulas: dia.aulas.map((aula, aIndex) => {
                            // Verifica se a aula corresponde ao índice correto
                            if (dIndex === diaIndex && aIndex === aulaIndex) {
                                return { ...aula, occuped: false }; // Marca a reserva como não ocupada
                            }
                            return aula;
                        })
                    }))
                }));
            });

            // Limpa a mensagem após 1.5 segundos
            setTimeout(() => {
                setMessage('');
            }, 1500);
        } catch (error) {
            console.error('Erro ao cancelar reserva:', error);
            setMessage('Erro ao cancelar reserva.');
        }
    };

    return (
        <>
        <div className="container mt-5 bg-dark text-light p-4">
            <h2>Minhas reservas</h2>

            {/* Exibe a mensagem de sucesso ou erro acima das reservas */}
            {message && (
                <div className="alert alert-info" role="alert">
                    {message}
                </div>
            )}

            {salas.length > 0 ? (
                <div className="reservas-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <ul className="list-group mt-3">
                        {salas.map((sala) => (
                            sala.dias.map((dia, diaIndex) => (
                                dia.aulas.map((aula, aulaIndex) => (
                                    aula.occuped && aula.userId === userId && (
                                        <li key={`${sala._id}-${diaIndex}-${aulaIndex}`} className="list-group-item bg-secondary text-light">
                                            <p><strong>Sala:</strong> {sala.nome}</p>
                                            <p><strong>Data:</strong> {formatarDataBrasileira(dia.data) || 'Data não especificada'}</p>
                                            <p><strong>Aula:</strong> {aula.aula || 'Aula não especificada'}</p>
                                            <button 
                                                className="btn btn-danger"
                                                onClick={() => handleCancelReservation(sala._id, diaIndex, aulaIndex)}
                                            >
                                                Cancelar Reserva
                                            </button>
                                        </li>
                                    )
                                ))
                            ))
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Nenhuma reserva encontrada</p>
            )}
        </div>
        </>
    );
}

export default VerReservas;
