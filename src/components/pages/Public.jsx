import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function Public() {
  const [salas, setSalas] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Função para buscar as reservas da API
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const response = await axios.get('http://localhost:3001/public/reservas');
        setSalas(response.data);
      } catch (err) {
        setError('Erro ao buscar reservas. Tente novamente mais tarde.');
        console.error(err);
      }
    };
    fetchReservas();
  }, []);

  // Função para formatar datas no padrão DD/MM/YYYY
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Ordena as salas com base na primeira data disponível com reservas
  const getSortedSalas = () => {
    return salas
      .map((sala) => {
        const diasComReservas = sala.dias
          .filter((dia) => dia.aulas.some((aula) => aula.occuped))
          .sort((a, b) => new Date(a.data) - new Date(b.data));
        return { ...sala, dias: diasComReservas };
      })
      .sort((a, b) => {
        if (!a.dias.length || !b.dias.length) return 0;
        return new Date(a.dias[0].data) - new Date(b.dias[0].data);
      });
  };

  // Função para redirecionar para a página de login
  const handleLogin = () => navigate('/login');

  // Salas ordenadas para exibição
  const sortedSalas = getSortedSalas();

  return (
    <div className="container mt-5 bg-dark text-light p-4 rounded">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-center">Página Pública - Reservas de Salas</h1>
        <button className="btn btn-primary" onClick={handleLogin}>
          Login
        </button>
      </div>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {sortedSalas.length > 0 ? (
        sortedSalas.map((sala, index) => (
          <SalaCard key={index} sala={sala} formatDate={formatDate} />
        ))
      ) : (
        <p className="text-center">Não há reservas para exibir no momento.</p>
      )}
    </div>
  );
}

// Componente para exibir uma sala e suas reservas
const SalaCard = ({ sala, formatDate }) => {
  if (sala.dias.length === 0) return null;

  return (
    <div className="card bg-secondary text-light mb-4">
      <div className="card-header bg-dark">
        <h2>{sala.nome}</h2>
      </div>
      <div className="card-body">
        {sala.dias.map((dia, diaIndex) => (
          <DiaReservas key={diaIndex} dia={dia} formatDate={formatDate} />
        ))}
      </div>
    </div>
  );
};

// Componente para exibir reservas de um dia específico
// Função para calcular o horário de término
const calcularHorarioFinal = (horarioInicial) => {
  const [horas, minutos] = horarioInicial.split(':').map(Number);
  const data = new Date();
  data.setHours(horas);
  data.setMinutes(minutos + 30); // Adiciona 30 minutos

  // Formata o horário final no formato HH:MM
  const horasFinais = String(data.getHours()).padStart(2, '0');
  const minutosFinais = String(data.getMinutes()).padStart(2, '0');

  return `${horasFinais}:${minutosFinais}`;
};

const DiaReservas = ({ dia, formatDate }) => (
  <div className="mb-3">
    <h4 className="mb-2">Data: {formatDate(dia.data)}</h4>
    <ul className="list-group">
      {dia.aulas
        .filter((aula) => aula.occuped)
        .map((aula, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center list-group-item-danger"
          >
            {aula.horario || 'Horário não especificado'} até {calcularHorarioFinal(aula.horario)}
            <span className="badge bg-danger">
              Reservado por {aula.reservadoPor || 'Não informado'}
            </span>
          </li>
        ))}
    </ul>
  </div>
);


export default Public;
