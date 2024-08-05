import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.css';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Enviando:', { nome: username, senha: password }); // Adicione isto para depuração
        try {
            const response = await axios.post('http://localhost:3001/login', {
                nome: username,
                senha: password,
            });
            const token = response.data.token;
            localStorage.setItem('token', token);
            alert('Login bem-sucedido!');
            navigate('/inicio'); // Redireciona após o login bem-sucedido
        } catch (err) {
            setError('Credenciais inválidas');
            console.error(err.response ? err.response.data : err.message); // Adicione isto para depuração
        }
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
            </div>
        </div>
    );
}

export default Login;
