import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar se o usuário já está logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/inicio"); // Redireciona para a página inicial se já estiver logado
    }
  }, [navigate]);

  // Função para salvar os dados do usuário no localStorage
  const saveUserData = (data) => {
    localStorage.setItem("role", data.role);
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("nomeUsuario", username);
  };

  // Função de envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação simples
    if (!username || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    setError(""); // Limpa qualquer erro anterior

    try {
      const response = await axios.post("http://localhost:3001/login", {
        nome: username,
        senha: password,
      });

      saveUserData(response.data);

      // Redirecionar com base no tipo de usuário
      if (username === "Admin" && password === "adm24") {
        navigate("/admin");
      } else {
        navigate("/inicio");
      }
    } catch (err) {
      setError("Credenciais inválidas. Tente novamente.");
      console.error(err.response ? err.response.data : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para voltar à página anterior
  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Login do Usuário</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="username">
              Usuário
            </label>
            <input
              id="username"
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Login"}
          </button>
        </form>
        <button onClick={handleBack} className={`${styles.button} ${styles.backButton}`}>
          Voltar
        </button>
      </div>
    </div>
  );
}

export default Login;
