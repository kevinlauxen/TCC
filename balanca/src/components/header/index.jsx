// Header.jsx
import { useNavigate } from "react-router-dom";
import { authService } from "../../firebase";
import "./Header.css";

export const Header = ({ firmwareVersion }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="header">
      <h1 className="title">Painel de Controle</h1>
      <div className="header-actions">
        <span className="firmware-version">{firmwareVersion || "1.0.0"}</span>
        <button className="btn btn-danger" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
};
