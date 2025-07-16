import { useEffect, useState } from "react";
import { db, ref, onValue, set, logout } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { logAction } from "../../services/logger/logger";

function Home() {
  const [balanca, setBalanca] = useState({
    peso: 0,
    status: { online: false, ultima_atividade: 0 },
    config: {},
  });

  const [lavagens, setLavagens] = useState([]);
  const [ultimaLavagem, setUltimaLavagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica conexão
    const connectionRef = ref(db, ".info/connected");
    const unsubscribeConnection = onValue(connectionRef, (snap) => {
      console.log("Status conexão:", snap.val() ? "Online" : "Offline");
      if (!snap.val()) {
        // Lógica para estado offline
      }
    });

    // Monitora balança com tratamento de erro
    const balancaRef = ref(db, "balanca");
    const unsubscribeBalanca = onValue(
      balancaRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        setBalanca((prev) => ({ ...prev, ...data }));
      },
      (error) => {
        console.error("Erro ao ler balança:", error);
        setBalanca((prev) => ({
          ...prev,
          status: { ...prev.status, online: false },
        }));
      }
    );

    // Monitora lavagens com cache local
    const lavagensRef = ref(db, "lavagens/historico");
    const unsubscribeLavagens = onValue(
      lavagensRef,
      (snapshot) => {
        const data = snapshot.val();
        const lavagensArray = data
          ? Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value,
            }))
          : [];
        setLavagens(lavagensArray);
        localStorage.setItem("lavagensCache", JSON.stringify(lavagensArray));
      },
      (error) => {
        console.error("Erro ao ler lavagens:", error);
        const cache = localStorage.getItem("lavagensCache");
        if (cache) setLavagens(JSON.parse(cache));
      }
    );

    return () => {
      unsubscribeConnection();
      unsubscribeBalanca();
      unsubscribeLavagens();
    };
  }, []);

  const handleTara = async () => {
    try {
      await set(ref(db, "balanca/comando/tara"), true);
      await logAction("tara_executada", { pesoAtual: balanca.peso });
    } catch (error) {
      await logAction("erro_tara", { error: error.message });
    }
  };

  const handleManterLigado = () => {
    set(ref(db, "balanca/comando/manter_ligado"), true);
  };

  const handleCalibrar = () => {
    set(ref(db, "balanca/comando/calibrar"), true);
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
        <div className="header-actions">
          <span className="firmware-version">
            {balanca.status?.versao_firmware || "1.0.0"}
          </span>
          <button className="btn btn-danger" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Seção Status da Balança */}
        <div className="card">
          <h2 className="card-title">Status da Balança</h2>
          <div className="card-grid">
            <div className="status-item">
              <p className="label">Status</p>
              <p
                className={`status ${
                  balanca.status?.online ? "online" : "offline"
                }`}
              >
                {balanca.status?.online ? "Online" : "Offline"}
              </p>
            </div>
            <div className="status-item">
              <p className="label">Última Atividade</p>
              <p className="timestamp">
                {balanca.status?.ultima_atividade
                  ? new Date(balanca.status.ultima_atividade).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="status-item">
              <p className="label">Intervalo Leitura</p>
              <p>{balanca.config?.intervalo_leitura || 2000} ms</p>
            </div>
            <div className="status-item">
              <p className="label">Fator Calibração</p>
              <p>{balanca.config?.fator_calibracao || 0}</p>
            </div>
          </div>
        </div>

        {/* Seção Peso Atual */}
        <div className="card">
          <h2 className="card-title">Peso Atual</h2>
          <div className="card-flex">
            <div className="weight-display">
              <p className="peso">{balanca.peso?.toFixed(2) || "0.00"} kg</p>
              <p className="label">
                {balanca.status?.online ? "Conectado" : "Desconectado"}
              </p>
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleTara}>
                Zerar Balança
              </button>
              <button className="btn btn-success" onClick={handleManterLigado}>
                Manter Ligada
              </button>
              <button className="btn btn-warning" onClick={handleCalibrar}>
                Calibrar
              </button>
            </div>
          </div>
        </div>

        {/* Seção Última Lavagem */}
        {ultimaLavagem && (
          <div className="card">
            <h2 className="card-title">Última Lavagem</h2>
            <div className="last-wash">
              <div className="wash-info">
                <p className="label">Data</p>
                <p>{new Date(ultimaLavagem.data).toLocaleString()}</p>
              </div>
              <div className="wash-info">
                <p className="label">Ciclo</p>
                <p>{ultimaLavagem.ciclo || "Normal"}</p>
              </div>
              <div className="wash-info">
                <p className="label">Peso das Roupas</p>
                <p>{ultimaLavagem.peso_roupas?.toFixed(2)} kg</p>
              </div>
              <div className="wash-products">
                <h3>Produtos Utilizados:</h3>
                <ul>
                  <li>
                    <strong>Sabão:</strong>{" "}
                    {ultimaLavagem.produtos?.sabao?.quantidade?.toFixed(2)}{" "}
                    {ultimaLavagem.produtos?.sabao?.unidade}
                  </li>
                  <li>
                    <strong>Amaciante:</strong>{" "}
                    {ultimaLavagem.produtos?.amaciante?.quantidade?.toFixed(2)}{" "}
                    {ultimaLavagem.produtos?.amaciante?.unidade}
                  </li>
                  <li>
                    <strong>Alvejante:</strong>{" "}
                    {ultimaLavagem.produtos?.alvejante?.quantidade?.toFixed(2)}{" "}
                    {ultimaLavagem.produtos?.alvejante?.unidade}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Seção Histórico de Lavagens */}
        <div className="card">
          <h2 className="card-title">Histórico de Lavagens</h2>
          {lavagens.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Ciclo</th>
                    <th>Peso (kg)</th>
                    <th>Sabão (L)</th>
                    <th>Amaciante (L)</th>
                    <th>Alvejante (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {lavagens.map((lavagem) => (
                    <tr key={lavagem.id}>
                      <td>{new Date(lavagem.data).toLocaleDateString()}</td>
                      <td>{lavagem.ciclo || "Normal"}</td>
                      <td>{lavagem.peso_roupas?.toFixed(2)}</td>
                      <td>{lavagem.produtos?.sabao?.quantidade?.toFixed(2)}</td>
                      <td>
                        {lavagem.produtos?.amaciante?.quantidade?.toFixed(2)}
                      </td>
                      <td>
                        {lavagem.produtos?.alvejante?.quantidade?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">Nenhuma lavagem registrada.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
