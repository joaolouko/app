import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Login.module.css';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Efeito para verificar se o usuário já está logado
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/inicio'); // Se o token estiver presente, redireciona para a página inicial
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Enviando:', { nome: username, senha: password }); // Adicione isto para depuração
        try {
            const response = await axios.post('http://localhost:3001/login', {
                nome: username,
                senha: password,
            });
            const token = response.data.token;
            const userId = response.data.userId;
            const role = response.data.role;

            localStorage.setItem('role', role);
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('nomeUsuario', username);

            if (username === 'Admin' && password === 'adm24') {
                navigate('/admin'); // Redirecionando para a página de admin
            } else {
                navigate('/inicio'); // Redireciona após o login bem-sucedido para a página de início
            }
        } catch (err) {
            setError('Credenciais inválidas');
            console.error(err.response ? err.response.data : err.message); // Adicione isto para depuração
        }
    };

    // Função para voltar à página anterior
    const handleBack = () => {
        navigate('/'); // Voltar para a página anterior
    };

    return (
        <div className={styles.container}>
            <div>
                <h1>Login do Usuário</h1>
                <form onSubmit={handleSubmit}>
                    <label>Usuário</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label>Senha</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit">Login</button>
                </form>
                <button onClick={handleBack}>Voltar</button>
            </div>
        </div>
    );
}

export default Login;
