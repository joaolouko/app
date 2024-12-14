import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import VerReservas from './VerReservas';
import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import io from 'socket.io-client';

function ReservarSala() {
    const [data, setData] = useState([]);
    const [selectedAula, setSelectedAula] = useState('');
    const [selectedSala, setSelectedSala] = useState(null);
    const [date, setDate] = useState(new Date());
    const [message, setMessage] = useState('');
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [userId, setUserId] = useState(null); // ID do usuário
    const navigate = useNavigate();

    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/dados', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setData(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };
        fetchData();

        const socket = io('http://localhost:3001'); // Substitua pela URL do servidor
        socket.on('atualizarReservas', () => {
            console.log('Atualização recebida via Socket.IO');
            fetchData(); // Recarrega os dados automaticamente
        });
        
        // Cleanup do socket ao desmontar o componente
        return () => {
            socket.disconnect();
        };
    }, [navigate, shouldUpdate]);

    const handleReservarSala = async () => {
        if (!selectedAula || !selectedSala) {
            setMessage('Por favor, selecione uma aula e uma sala.');
            setTimeout(() => setMessage(''), 1000);
            return;
        }

        const aulaIndex = parseInt(selectedAula.split(' ')[1]) - 1;
        const formattedDate = date.toISOString().split('T')[0];
        const token = localStorage.getItem('token');

        try {
            await axios.put(
                `http://localhost:3001/reservar-sala/${selectedSala._id}`,
                { aulaIndex, date: formattedDate, userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage('Sala reservada com sucesso!');
            setTimeout(() => setMessage(''), 1500);

            setSelectedAula('');
            setSelectedSala(null);
            setShouldUpdate(!shouldUpdate); // Atualiza os dados
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Erro ao reservar sala:', error);
            setMessage('Erro ao reservar a sala.');
            setTimeout(() => setMessage(''), 1000);
        }
    };

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setSelectedAula('');
        setSelectedSala(null);
    };

    addLocale('pt-BR', {
        firstDayOfWeek: 1,
        dayNames: ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"],
        dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
        dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
        monthNames: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
        monthNamesShort: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
        today: "Hoje",
        clear: "Limpar",
        dateFormat: 'dd/mm/yy',
        weekHeader: 'Sm',
    });

    return (
        <>
            <Header />
            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-6 mb-4">
                        <div className="card bg-dark text-light shadow p-4">
                            <VerReservas shouldUpdate={shouldUpdate} />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card bg-dark text-light shadow p-4 mb-4">
                            <h3 className="text-center">Selecione a Data</h3>
                            <Calendar
                                value={date}
                                onChange={(e) => handleDateChange(e.value)}
                                locale="pt-BR"
                                dateFormat="dd/mm/yy"
                                showIcon
                                minDate={new Date()}
                                className="w-100 mt-3"
                            />
                        </div>
                        <div className="card bg-dark text-light shadow p-4">
                            <h3 className="text-center">Salas Disponíveis</h3>
                            {message && (
                                <div className="alert alert-info text-center" role="alert">
                                    {message}
                                </div>
                            )}
                            <div className="form-group mb-3">
                                <label htmlFor="aula-select">Selecione a Aula:</label>
                                <select
                                    id="aula-select"
                                    className="form-select bg-dark text-light"
                                    value={selectedAula}
                                    onChange={(e) => setSelectedAula(e.target.value)}
                                >
                                    <option value="">-- Selecione uma Aula --</option>
                                    {[...Array(10).keys()].map((aula) => (
                                        <option key={aula + 1} value={`Aula ${aula + 1}`}>
                                            Aula {aula + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <ul className="list-group"  style={{ maxHeight: '215px', overflowY: 'auto' }}>
                                {data.map((item) => {
                                    const formattedDate = date.toISOString().split('T')[0];
                                    const dia = item.dias.find(dia => dia.data === formattedDate);
                                    const aulaIndex = parseInt(selectedAula.split(' ')[1]) - 1;

                                    return (
                                        <li
                                            key={item._id}
                                            onClick={() =>
                                                !dia?.aulas[aulaIndex]?.occuped && setSelectedSala(item)
                                            }
                                            className={`list-group-item bg-dark text-light ${
                                                selectedSala?._id === item._id ? 'active' : ''
                                            }`}
                                            style={{
                                                cursor: dia?.aulas[aulaIndex]?.occuped
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                                opacity: dia?.aulas[aulaIndex]?.occuped ? 0.5 : 1,
                                            }}
                                        >
                                            {item.nome} {isReservado && '(reservado)'}
                                        </li>
                                    );
                                })}
                            </ul>

                            <button
                                onClick={handleReservarSala}
                                disabled={!selectedAula || !selectedSala}
                                className="btn btn-primary w-100 mt-3 shadow"
                            >
                                Reservar Sala
                            </button>
                        </div>
                    </div>
                </div>
                <Link to="/inicio" className="btn btn-secondary mt-4 shadow">
                    Voltar
                </Link>
            </div>
        </>
    );
}

export default ReservarSala;
