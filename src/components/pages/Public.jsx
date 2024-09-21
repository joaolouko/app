import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom'; // Usando React Router para navegação

function Public() {
    const [salas, setSalas] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook para navegação

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const response = await axios.get('http://localhost:3001/public/reservas');
                setSalas(response.data);
            } catch (err) {
                setError('Erro ao buscar reservas');
                console.error(err);
            }
        };

        fetchReservas();
    }, []);

    // Função para formatar a data no formato DD/MM/YYYY
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Função para comparar datas e ordenar as salas por ordem de data
    const compareDates = (a, b) => {
        const dateA = new Date(a.data);
        const dateB = new Date(b.data);
        return dateA - dateB;
    };

    // Função para redirecionar para a página de login
    const handleLogin = () => {
        navigate('/login'); // Redirecionar para a página de login
    };

    // Ordenar as salas pela data do primeiro dia com reserva
    const sortedSalas = salas.map(sala => {
        // Filtrar dias com ao menos uma aula ocupada
        const diasComReservas = sala.dias.filter(dia =>
            dia.aulas.some(aula => aula.occuped)
        );

        // Ordenar os dias com reservas por data
        diasComReservas.sort(compareDates);

        return { ...sala, dias: diasComReservas };
    }).sort((a, b) => {
        if (a.dias.length === 0 || b.dias.length === 0) {
            return 0;
        }

        // Comparar a primeira data com reserva de cada sala
        return compareDates(a.dias[0], b.dias[0]);
    });

    return (
        <div className="container mt-5 bg-dark text-light p-4 rounded">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-center">Página Pública - Reservas de Salas</h1>
                <button className="btn btn-primary" onClick={handleLogin}>Login</button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {sortedSalas.length > 0 ? (
                sortedSalas.map((sala, index) => {
                    if (sala.dias.length === 0) {
                        return null; // Não exibir salas sem reservas
                    }

                    return (
                        <div key={index} className="card bg-secondary text-light mb-4">
                            <div className="card-header bg-dark">
                                <h2>{sala.nome}</h2>
                            </div>
                            <div className="card-body">
                                {sala.dias.map((dia, diaIndex) => (
                                    <div key={diaIndex} className="mb-3">
                                        <h4 className="mb-2">Data: {formatDate(dia.data)}</h4>
                                        <ul className="list-group">
                                            {dia.aulas
                                                .filter(aula => aula.occuped)
                                                .map((aula, aulaIndex) => (
                                                    <li
                                                        key={aulaIndex}
                                                        className={`list-group-item d-flex justify-content-between align-items-center list-group-item-danger`}
                                                    >
                                                        {aula.aula}
                                                        <span className="badge badge-pill text-danger">
                                                            {`Reservado por ${aula.reservadoPor}`}
                                                        </span>
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <p className="text-center">Não há reservas para exibir no momento.</p>
            )}
        </div>
    );
}

export default Public;
