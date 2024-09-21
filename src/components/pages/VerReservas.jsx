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
                console.log(response.data);
            } catch (err) {
                setError('Erro ao buscar reservas');
                console.error(err.response ? err.response.data : err.message);
            }
        };

        fetchReservas();
    }, []);

    const handleCancelarReserva = async (salaId, aulaIndex, data) => {
        try {
            if (!salaId || salaId.length !== 24) {
                throw new Error('ID da sala inválido');
            }
    
            const token = localStorage.getItem('token');
    
            // Passar aulaIndex e data como query params
            await axios.delete(
                `http://localhost:3001/cancelar-reserva/${salaId}?aulaIndex=${aulaIndex}&date=${data}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            // Atualizar o estado removendo a reserva cancelada
            const updatedReservas = reservas.map((reserva) => {
                if (reserva._id === salaId) {
                    const updatedDias = reserva.dias.filter((dia, index) => index !== aulaIndex);
                    return { ...reserva, dias: updatedDias };
                }
                return reserva;
            }).filter(reserva => reserva.dias.length > 0); // Remover reserva se todos os dias forem removidos
    
            setReservas(updatedReservas);
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
                    {reservas.length > 0 ? reservas.map((reserva, index) => (
                        <li key={index} className="list-group-item bg-secondary text-light d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Sala:</strong> {reserva.nome} <br />
                                <strong>Aula:</strong> {reserva.dias && reserva.dias.length > 0 && reserva.dias[0].aulas ? reserva.dias[0].aulas.aula : 'Informações de aula não disponíveis'} <br />
                                <strong>Data:</strong> {reserva.dias && reserva.dias.length > 0 && reserva.dias[0].data ? new Date(reserva.dias[0].data).toLocaleDateString('pt-BR') : 'Informações de data não disponíveis'}
                            </div>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleCancelarReserva(reserva._id, index, reserva.dias[0].data)}
                            >
                                Cancelar Reserva
                            </button>
                        </li>
                    )) : (
                        <li className="list-group-item bg-secondary text-light">Você não possui reservas.</li>
                    )}
                </ul>
            </div>
        </>
    );
}

export default VerReservas;
