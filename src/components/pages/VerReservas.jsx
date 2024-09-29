import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../layout/Header';
import { Link, useNavigate } from 'react-router-dom';

function VerReservas() {
    const [salas, setSalas] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/minhas-reservas', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log('Dados recebidos:', response.data); // Log dos dados recebidos

                const reservasFormatadas = response.data.map(reserva => ({
                    ...reserva,
                    dias: reserva.dias.map(dia => ({
                        ...dia,
                        aulas: Array.isArray(dia.aulas) ? dia.aulas : [] // Garantir que aulas sejam um array
                    }))
                }));

                setSalas(reservasFormatadas);
            } catch (err) {
                setError('Erro ao buscar reservas');
                console.error(err.response ? err.response.data : err.message);
            }
        };

        fetchReservas();
    }, []);

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleCancelarReserva = async (salaId, aulaIndex, data) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:3001/cancelar-reserva/${salaId}?aulaIndex=${aulaIndex}&date=${data}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const updatedSalas = salas.map((reserva) => {
                if (reserva._id === salaId) {
                    const updatedDias = reserva.dias.map(dia => ({
                        ...dia,
                        aulas: dia.aulas.filter((_, index) => index !== aulaIndex) // Filtrar a aula cancelada
                    })).filter(dia => dia.aulas.length > 0); // Remove dias sem aulas

                    return { ...reserva, dias: updatedDias };
                }
                return reserva;
            }).filter(reserva => reserva.dias.length > 0); // Remove salas sem reservas

            setSalas(updatedSalas);
            setSuccessMessage('Reserva cancelada com sucesso!');
        } catch (err) {
            setError(err.response ? err.response.data.message : err.message);
            console.error(err.response ? err.response.data : err.message);
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-4 bg-dark text-light p-4 rounded">
                <h1 className="mb-4">Minhas Reservas</h1>
    
                {error && <div className="alert alert-danger">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
    
                {salas.length > 0 ? (
                    salas.map((sala, index) => (
                        <div key={index} className="card bg-secondary text-light mb-4">
                            <div className="card-header bg-dark">
                                <h2>{sala.nome}</h2>
                            </div>
                            <div className="card-body">
                                {sala.dias.map((dia, diaIndex) => (
                                    <div key={diaIndex} className="mb-3">
                                        <h4 className="mb-2">Data: {formatDate(dia.data)}</h4>
                                        <ul className="list-group">
                                            {dia.aulas // Aqui você deve verificar se as aulas estão presentes
                                                .filter(aula => aula.occuped) // Filtragem aqui
                                                .map((aula, aulaIndex) => (
                                                    <li
                                                        key={aulaIndex}
                                                        className={`list-group-item d-flex justify-content-between align-items-center list-group-item-danger`}
                                                    >
                                                        {aula.aula}
                                                        <span className="badge badge-pill text-danger">
                                                            {`Reservado por ${aula.reservadoPor}`}
                                                        </span>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleCancelarReserva(sala._id, aulaIndex, dia.data)}
                                                        >
                                                            Cancelar Reserva
                                                        </button>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center">Você não possui reservas no momento.</p>
                )}
                <Link to='/inicio' className="btn btn-secondary mt-4">Voltar</Link>
            </div>
            
        </>
    );
}

export default VerReservas;
