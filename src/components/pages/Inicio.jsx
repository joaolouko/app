import { useEffect, useState, useCallback } from 'react';
import Header from '../layout/Header';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Inicio() {
  const [data, setData] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Função para buscar dados da API
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/dados', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Falha ao carregar os dados. Por favor, tente novamente.');
      if (error.response && error.response.status === 401) {
        navigate('/');
      }
    }
  }, [navigate]);

  // useEffect para carregar dados e nome do usuário
  useEffect(() => {
    const nome = localStorage.getItem('nomeUsuario');
    setNomeUsuario(nome || 'Usuário Anônimo');
    fetchData();
  }, [fetchData]);

  // Função para formatar a data no padrão brasileiro
  const formatarDataBrasileira = (data) => {
    const dataObj = new Date(data + 'T00:00:00');
    return dataObj.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });
  };

  // Renderiza cada reserva
  const renderizarReservas = () => {
    if (data.length === 0) {
      return <p className="text-warning">Nenhuma reserva encontrada.</p>;
    }

    return data.map((sala, salaIndex) =>
      sala.dias.map((dia, diaIndex) =>
        dia.aulas.map(
          (aula, aulaIndex) =>
            aula.occuped && (
              <li
                className="list-group-item d-flex justify-content-between align-items-center bg-dark text-light"
                key={`${salaIndex}-${diaIndex}-${aulaIndex}`}
              >
                <span>
                  {sala.nome} - {aula.aula}
                </span>
                <span className="text-muted">
                  Reservado por {aula.reservadoPor} em {formatarDataBrasileira(dia.data)}
                </span>
              </li>
            )
        )
      )
    );
  };

  return (
    <>
      <Header />
      <div className="container mt-4 bg-dark text-light p-4 rounded">
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="d-grid gap-3">
              <Link className="btn btn-primary" to="/reservar">
                Reservar Sala
              </Link>
              <Link className="btn btn-secondary" to="/ver-reserva">
                Ver Minhas Reservas
              </Link>
            </div>
          </div>

          {/* Exibir reservas */}
          <div className="col-md-6">
            <div className="card bg-dark text-light">
              <div className="card-body">
                <h5 className="card-title">Salas Reservadas</h5>
                <ul className="list-group list-group-flush">{renderizarReservas()}</ul>
                {error && <p className="text-danger mt-3">{error}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Exibir informações do usuário */}
        <div className="row">
          <div className="col-12">
            <div className="card bg-dark text-light text-center">
              <div className="card-body">
                <h5 className="card-title">Usuário Atual: {nomeUsuario}</h5>
                <h6 className="card-subtitle mb-2 text-muted">Foto de Perfil</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Inicio;
