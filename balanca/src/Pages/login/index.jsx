// src/components/Login.jsx
import { useState } from "react";
import { login } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError("Credenciais inválidas. Por favor, tente novamente.");
      console.error("Erro de login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Controle de Lavanderia</h1>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Usuário</label>
          <input
            id="email"
            type="text"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Carregando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
