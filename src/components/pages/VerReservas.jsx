import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importar Bootstrap CSS
import Header from '../layout/Header';

function VerReservas() {
    const [reservas, setReservas] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/minhas-reservas', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReservas(response.data);
            } catch (err) {
                setError('Erro ao buscar reservas');
                console.error(err.response ? err.response.data : err.message);
            }
        };

        fetchReservas();
    }, []);

    const handleCancelarReserva = async (reservaId, salaId, aulaIndex, data) => {
        try {
            if (!salaId || salaId.length !== 24) {
                throw new Error('ID da sala inválido');
            }
    
            const token = localStorage.getItem('token');
    
            await axios.delete(
                `http://localhost:3001/cancelar-reserva/${salaId}`,
                {
                    data: {
                        aulaIndex,
                        date: data,
                    },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            setReservas(
                reservas.filter((reserva) => reserva._id !== reservaId) // Remover a reserva da lista ao cancelar
            );
    
            setSuccessMessage('Reserva cancelada com sucesso!');
        } catch (err) {
            setError(err.response ? err.response.data.message : err.message);
            console.error(err.response ? err.response.data : err.message);
        }
    };
    

    return (
        <>
            <Header />
            <div className="container mt-4 bg-dark text-light">
                <h1 className="mb-4">Minhas Reservas</h1>

                {error && <div className="alert alert-danger">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                <ul className="list-group">
                    {reservas.length > 0 ? (
                        reservas.map((reserva, index) => (
                            <li key={index} className="list-group-item bg-secondary text-light d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Sala:</strong> {reserva.salaNome} <br />
                                    <strong>Aula:</strong> {reserva.aula} <br />
                                    <strong>Data:</strong> {new Date(reserva.data).toLocaleDateString('pt-BR')}
                                </div>
                                <button
                                    className="btn btn-danger"
                                    onClick={() =>
                                        handleCancelarReserva(
                                            reserva._id,
                                            reserva.salaId,
                                            reserva.aulaIndex,
                                            reserva.data
                                        )
                                    }
                                >
                                    Cancelar Reserva
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item bg-secondary text-light">Você não possui reservas.</li>
                    )}
                </ul>
            </div>
        </>
    );
}

export default VerReservas;
