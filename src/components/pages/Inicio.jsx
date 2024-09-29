import { useEffect, useState } from "react";
import Header from "../layout/Header";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function Inicio() {
    const [data, setData] = useState([]);
    const [nomeUsuario, setNomeUsuario] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const nome = localStorage.getItem('nomeUsuario');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token) {
            navigate('/'); // Redireciona para a página de login se o token não estiver presente
            return;
        }

        setNomeUsuario(nome);

        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/dados', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setData(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/'); // Redireciona para a página de login se o token for inválido
                }
            }
        };
        fetchData();
    }, [navigate]);

    // Função para formatar a data no padrão brasileiro
    const formatarDataBrasileira = (data) => {
        const dataObj = new Date(data + 'T00:00:00'); // Transforma em um objeto Date
        return dataObj.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo'
        }); 
    };

    return (
        <>
            <Header />
            <div className="container mt-4 bg-dark text-light p-4 rounded">
                <div className="row">
                    <div className="col-md-6">
                        <div className="d-grid gap-3">
                            <Link className="btn btn-primary" to='/reservar'>Reservar sala</Link>
                            <Link className="btn btn-secondary" to='/ver-reserva'>Ver minhas reservas</Link>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card bg-dark text-light">
                            <div className="card-body">
                                <h5 className="card-title">Salas reservadas</h5>
                                <ul className="list-group list-group-flush bg-dark text-light">
                                    {data.map((sala, salaIndex) => (
                                        sala.dias.map((dia, diaIndex) => (
                                            dia.aulas.map((aula, aulaIndex) => (
                                                aula.occuped && (
                                                    <li className="list-group-item bg-dark text-light" key={`${salaIndex}-${diaIndex}-${aulaIndex}`}>
                                                        {sala.nome} - {aula.aula} por {aula.reservadoPor} em {formatarDataBrasileira(dia.data)}
                                                    </li>
                                                )
                                            ))
                                        ))
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-md-12">
                        <div className="card bg-dark text-light">
                            <div className="card-body text-center">
                                <h5 className="card-title">Usuário atual: {nomeUsuario}</h5>
                                <h6 className="card-subtitle mb-2 text-muted">Foto de perfil</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Inicio;
