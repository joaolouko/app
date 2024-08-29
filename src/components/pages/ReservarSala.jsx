import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ReservarSala.module.css';
import Header from '../layout/Header';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function ReservarSala() {
    const [data, setData] = useState([]);
    const [selectedAula, setSelectedAula] = useState(''); 
    const [selectedSala, setSelectedSala] = useState(null); // Estado para a sala selecionada
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
                // Se o dia já existir, atualize a aula correspondente
                diaExistente.aulas[aulaIndex] = { ...diaExistente.aulas[aulaIndex], occuped: true };
            } else {
                // Se o dia não existir, adicione um novo dia com a reserva
                sala.dias.push({
                    data: formattedDate,
                    aulas: [...Array(10).keys()].map((_, index) => ({
                        aula: `Aula ${index + 1}`,
                        occuped: index === aulaIndex, // Marca a aula selecionada como ocupada
                        userId: index === aulaIndex ? localStorage.getItem('userId') : null,
                    })),
                });
            }

            // Atualize o backend
            await axios.put(`http://localhost:3001/reservar-sala/${selectedSala._id}`, {
                aulaIndex,
                date: formattedDate 
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('Sala reservada com sucesso!');

            // Atualize o estado local
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

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.calendarBox}>
                    <h2>Selecione a data</h2>
                    <Calendar
                        onChange={handleDateChange}
                        value={date}
                        className={styles.reactCalendar}
                    />
                </div>
                <div className={styles.box}>
                    <h1>Salas disponíveis</h1>
                    <div>
                        <label htmlFor="aula-select">Selecione a aula:</label>
                        <select
                            id="aula-select"
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
                    <ul>
                        {data.map((item) => {
                            const formattedDate = date.toISOString().split('T')[0];
                            const dia = item.dias.find(dia => dia.data === formattedDate);
                            const aulaIndex = parseInt(selectedAula.split(' ')[1]) - 1;

                            return (
                                <li 
                                    key={item._id} 
                                    onClick={() => setSelectedSala(item)}
                                    style={{ 
                                        cursor: 'pointer',
                                        backgroundColor: selectedSala?._id === item._id ? '#e0e0e0' : 'transparent'
                                    }}
                                >
                                    <div>{item.nome}</div>
                                    {dia && selectedAula && (
                                        <ul>
                                            {dia.aulas[aulaIndex] && (
                                                <li 
                                                    style={{ 
                                                        textDecoration: dia.aulas[aulaIndex].occuped ? 'line-through' : 'none', 
                                                        cursor: dia.aulas[aulaIndex].occuped ? 'not-allowed' : 'pointer' 
                                                    }}
                                                >
                                                    {dia.aulas[aulaIndex].aula} {dia.aulas[aulaIndex].occuped ? '(Ocupada)' : '(Disponível)'}
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
                        className={styles.reserveButton}
                    >
                        Reservar Sala
                    </button>
                </div>
                <Link to='/inicio'>Voltar</Link>
            </div>
        </>
    );
}

export default ReservarSala;
