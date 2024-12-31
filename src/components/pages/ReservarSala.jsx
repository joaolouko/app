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

function ReservarSala() {
    const [data, setData] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedSala, setSelectedSala] = useState(null);
    const [date, setDate] = useState(new Date());
    const [message, setMessage] = useState('');
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [userId, setUserId] = useState(null); // ID do usuário
    const [cache, setCache] = useState({}); // Cache para horários
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || token === null) {
            navigate('/');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        setUserId(user?.id || null);

        // Fetch inicial para carregar as salas disponíveis
        const fetchSalas = async () => {
            try {
                const response = await axios.get('http://localhost:3001/dados', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setData(response.data); // Atualiza o estado com as salas
            } catch (error) {
                console.error('Erro ao buscar salas:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchSalas();
    }, [navigate]);

    const fetchHorarios = async (salaId, formattedDate) => {
        const cacheKey = `${salaId}_${formattedDate}`;
        const token = localStorage.getItem('token');

        // Verifica se já existem dados no cache
        if (cache[cacheKey]) {
            setSelectedSala((prevSala) => ({
                ...prevSala,
                horariosDisponiveis: cache[cacheKey],
            }));
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:3001/reservas/${salaId}/${formattedDate}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const horariosDisponiveis = response.data;

            // Atualiza o cache e os horários
            setCache((prevCache) => ({
                ...prevCache,
                [cacheKey]: horariosDisponiveis,
            }));
            setSelectedSala((prevSala) => ({
                ...prevSala,
                horariosDisponiveis,
            }));
        } catch (error) {
            console.error('Erro ao buscar horários:', error);
        }
    };

    const handleReservarSala = async () => {
        if (!selectedTime || !selectedSala) {
            setMessage('Por favor, selecione um horário e uma sala.');
            setTimeout(() => setMessage(''), 1000);
            return;
        }

        const formattedDate = date.toISOString().split('T')[0];
        const token = localStorage.getItem('token');

        try {
            await axios.put(
                `http://localhost:3001/reservar-sala/${selectedSala._id}`,
                { hora: selectedTime, date: formattedDate, userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage('Sala reservada com sucesso!');
            setTimeout(() => {
                setMessage('');
                window.location.reload();
            }, 1500); // Atualiza a página após 1,5 segundos

            setSelectedTime('');
            setSelectedSala(null);
            setShouldUpdate(!shouldUpdate); // Atualiza os dados
        } catch (error) {
            console.error('Erro ao reservar sala:', error);
            setMessage('Erro ao reservar a sala.');
            setTimeout(() => setMessage(''), 1000);
        }
    };

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setSelectedTime('');
        setSelectedSala(null);
    };

    const handleSalaSelect = (sala) => {
        setSelectedSala(sala);
        setSelectedTime(''); // Limpa o horário selecionado
        const formattedDate = date.toISOString().split('T')[0];
        fetchHorarios(sala._id, formattedDate); // Busca os horários para a sala e data selecionadas
    };

    const getAllTimes = () => {
        if (!selectedSala) return [];

        const formattedDate = date.toISOString().split('T')[0];
        const dia = selectedSala.dias?.find(d => d.data === formattedDate);

        if (!dia || !dia.aulas || !Array.isArray(dia.aulas)) {
            return [];
        }

        return dia.aulas.map((aula) => ({
            horario: aula.horario,
            isOccupied: aula.occuped,
        }));
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
                            <label htmlFor="time-select">Selecione a sala:</label>
                            <ul className="list-group">
                                {data.map((item) => (
                                    <li
                                        key={item._id}
                                        onClick={() => handleSalaSelect(item)}
                                        className={`list-group-item bg-dark text-light ${selectedSala?._id === item._id ? 'active' : ''}`}
                                    >
                                        {item.nome}
                                    </li>
                                ))}
                            </ul>

                            <div className="form-group mb-3">
                                <label htmlFor="time-select">Selecione o Horário:</label>
                                <select
                                    id="time-select"
                                    className="form-select bg-dark text-light"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                >
                                    <option value="">-- Selecione um Horário --</option>
                                    {getAllTimes().length > 0 ? (
                                        getAllTimes().map(({ horario, isOccupied }) => (
                                            <option
                                                key={horario}
                                                value={horario}
                                                disabled={isOccupied}
                                                className={isOccupied ? 'occupied-option' : ''}
                                            >
                                                {horario} {isOccupied && '(Ocupado)'}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>
                                            Nenhum horário disponível
                                        </option>
                                    )}
                                </select>
                            </div>



                            <button
                                onClick={handleReservarSala}
                                disabled={!selectedTime || !selectedSala}
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
