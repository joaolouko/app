import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

function Header() {
  const navigate = useNavigate();
  const [nomeUsuario, setNomeUsuario] = useState("");

  // Busca o nome do usuário ao carregar o componente
  useEffect(() => {
    const nome = localStorage.getItem("nomeUsuario") || "Usuário";
    setNomeUsuario(nome);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nomeUsuario");
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/inicio">
            Início
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              {/* Nome do usuário */}
              <li className="nav-item me-3 text-light">
                Bem-vindo, {nomeUsuario}
              </li>
              {/* Botão de logout */}
              <li className="nav-item">
                <button className="btn btn-danger" onClick={handleLogout}>
                  Sair
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
