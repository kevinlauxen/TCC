import { useEffect, useState } from "react";
import { db, ref, onValue, set, logout } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [balanca, setBalanca] = useState({});
  const [lavagens, setLavagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const balancaRef = ref(db, "balanca/peso");
    const unsubscribeBalanca = onValue(balancaRef, (snapshot) => {
      setBalanca(snapshot.val());
      console.log(balanca);
      console.log(unsubscribeBalanca);
      setLoading(false);
    });

    const lavagensRef = ref(db, "lavagens/historico");
    const unsubscribeLavagens = onValue(lavagensRef, (snapshot) => {
      const data = snapshot.val();
      setLavagens(data ? Object.values(data) : []);
    });

    return () => {
      unsubscribeBalanca();
      unsubscribeLavagens();
    };
  }, []);

  const handleTara = () => {
    set(ref(db, "balanca/comando/tara"), true);
  };

  const handleManterLigado = () => {
    set(ref(db, "balanca/comando/manter_ligado"), true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="header">
        <h1 className="title">Painel de Controle</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <main className="main-content">
        <div className="card">
          <h2 className="card-title">Status da Balança</h2>
          <div className="card-grid">
            <div>
              <p className="label">Status</p>
              <p
                className={`status ${
                  balanca.status?.online ? "online" : "offline"
                }`}
              >
                {balanca.status?.online ? "Online" : "Offline"}
              </p>
            </div>
            <div>
              <p className="label">Última Atividade</p>
              <p>
                {balanca.status?.ultima_atividade
                  ? new Date(balanca.status.ultima_atividade).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Peso Atual</h2>
          <div className="card-flex">
            <div>
              <p className="peso">
                {balanca?.peso ? balanca?.peso.toFixed() : "0.00"} kg
              </p>
              <p className="label">
                {balanca.peso?.estavel ? "Estável" : "Instável"}
              </p>
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleTara}>
                Zerar Balança
              </button>
              <button className="btn btn-success" onClick={handleManterLigado}>
                Manter Ligada
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Últimas Lavagens</h2>
          {lavagens.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Sabão (L)</th>
                    <th>Amaciante (L)</th>
                    <th>Alvejante (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {lavagens.map((lavagem, index) => (
                    <tr key={index}>
                      <td>{new Date(lavagem.data).toLocaleDateString()}</td>
                      <td>{lavagem.qtdsabao?.toFixed(2)}</td>
                      <td>{lavagem.qtdamaciante?.toFixed(2)}</td>
                      <td>{lavagem.qtdalvejante?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="label">Nenhuma lavagem registrada.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
