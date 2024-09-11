import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';  // Tema escuro para o calendário do PrimeReact
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.min.css';  // Importar o Bootstrap

function ReservarSala() {
    const [data, setData] = useState([]);
    const [selectedAula, setSelectedAula] = useState('');
    const [selectedSala, setSelectedSala] = useState(null);
    const [date, setDate] = useState(new Date());
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
    }, [navigate]);

    const handleReservarSala = async () => {
        if (!selectedAula || !selectedSala) {
            alert('Por favor, selecione uma aula e uma sala antes de reservar.');
            return;
        }

        const aulaIndex = parseInt(selectedAula.split(' ')[1]) - 1;
        const formattedDate = date.toISOString().split('T')[0];
        const token = localStorage.getItem('token');

        try {
            const sala = data.find(sala => sala._id === selectedSala._id);
            const diaExistente = sala.dias.find(dia => dia.data === formattedDate);

            if (diaExistente) {
                diaExistente.aulas[aulaIndex] = { ...diaExistente.aulas[aulaIndex], occuped: true };
            } else {
                sala.dias.push({
                    data: formattedDate,
                    aulas: [...Array(10).keys()].map((_, index) => ({
                        aula: `Aula ${index + 1}`,
                        occuped: index === aulaIndex,
                        userId: index === aulaIndex ? localStorage.getItem('userId') : null,
                    })),
                });
            }

            await axios.put(`http://localhost:3001/reservar-sala/${selectedSala._id}`, {
                aulaIndex,
                date: formattedDate
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('Sala reservada com sucesso!');

            setData(data.map(sala =>
                sala._id === selectedSala._id ? {
                    ...sala,
                    dias: sala.dias
                } : sala
            ));

            setSelectedAula('');
            setSelectedSala(null);
        } catch (error) {
            console.error('Erro ao reservar sala:', error);
        }
    };

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setSelectedAula('');
        setSelectedSala(null);
    };

    const ptBR = {
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
        chooseDate: 'Escolha uma data' // chave necessária conforme o erro
    };



    return (
        <>
            <Header />
            <div className="container mt-4">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card bg-dark text-light p-3 mb-4 shadow">
                            <h2 className="text-center">Selecione a data</h2>
                            <Calendar
                                value={date}
                                onChange={(e) => handleDateChange(e.value)}

                                dateFormat='dd/mm/yy'
                                showIcon
                                className="w-100 bg-dark text-light"  // Tema escuro no calendário

                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card bg-dark text-light p-3 mb-4 shadow">
                            <h1 className="text-center">Salas disponíveis</h1>
                            <div className="mb-3">
                                <label htmlFor="aula-select" className="form-label">Selecione a aula:</label>
                                <select
                                    id="aula-select"
                                    className="form-select bg-dark text-light"
                                    value={selectedAula}
                                    onChange={(e) => setSelectedAula(e.target.value)}
                                >
                                    <option value="">--Selecione uma aula--</option>
                                    {[...Array(10).keys()].map((aula) => (
                                        <option key={aula + 1} value={`Aula ${aula + 1}`}>
                                            Aula {aula + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <ul className="list-group bg-dark text-light">
                                {data.map((item) => {
                                    const formattedDate = date.toISOString().split('T')[0];
                                    const dia = item.dias.find(dia => dia.data === formattedDate);
                                    const aulaIndex = parseInt(selectedAula.split(' ')[1]) - 1;

                                    return (
                                        <li
                                            key={item._id}
                                            onClick={() => !dia?.aulas[aulaIndex]?.occuped && setSelectedSala(item)} // Permite clique apenas em salas disponíveis
                                            className={`list-group-item bg-dark text-light ${selectedSala?._id === item._id ? 'active' : ''}`}
                                            style={{
                                                cursor: dia?.aulas[aulaIndex]?.occuped ? 'not-allowed' : 'pointer',  // Desabilita o clique nas salas ocupadas
                                                opacity: dia?.aulas[aulaIndex]?.occuped ? 0.5 : 1  // Aplica opacidade nos itens ocupados
                                            }}
                                        >
                                            <div>{item.nome}</div>
                                            {dia && selectedAula && (
                                                <ul className="list-group bg-dark text-light">
                                                    {dia.aulas[aulaIndex] && (
                                                        <li
                                                            className="list-group-item bg-dark text-light"
                                                            style={{
                                                                textDecoration: dia.aulas[aulaIndex].occuped ? 'line-through' : 'none', // Opcional: tachar as aulas ocupadas
                                                                opacity: dia.aulas[aulaIndex].occuped ? 0.5 : 1, // Opacidade menor para aulas ocupadas
                                                                cursor: dia.aulas[aulaIndex].occuped ? 'not-allowed' : 'pointer' // Cursor desativado nas aulas ocupadas
                                                            }}
                                                        >
                                                            {dia.aulas[aulaIndex].aula}
                                                        </li>
                                                    )}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>



                            <button
                                onClick={handleReservarSala}
                                disabled={!selectedAula || !selectedSala}
                                className="btn btn-primary mt-3 w-100"
                            >
                                Reservar Sala
                            </button>
                        </div>
                    </div>
                </div>
                <Link to='/inicio' className="btn btn-secondary mt-4">Voltar</Link>
            </div>
        </>
    );
}

export default ReservarSala;
