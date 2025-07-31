import "./StatusCard.css";

export const StatusCard = ({
  status,
  config,
  connectionActive,
  onToggleConnection,
}) => {
  return (
    <div className="card">
      <h2 className="card-title">Status da Balança</h2>
      <div className="card-grid">
        <div className="status-item">
          <p className="label">Conexão</p>
          <button
            onClick={onToggleConnection}
            className={`connection-btn ${connectionActive ? "active" : ""}`}
          >
            {connectionActive ? "Desligar" : "Ligar"}
          </button>
        </div>
        <div className="status-item">
          <p className="label">Status</p>
          <p className={`status ${status?.online ? "online" : "offline"}`}>
            {status?.online ? "Online" : "Offline"}
          </p>
        </div>
        <div className="status-item">
          <p className="label">Última Atividade</p>
          <p className="timestamp">
            {status?.ultima_atividade
              ? new Date(status.ultima_atividade).toLocaleString()
              : "N/A"}
          </p>
        </div>
        <div className="status-item">
          <p className="label">Intervalo Leitura</p>
          <p>{config?.intervalo_leitura || 2000} ms</p>
        </div>
        <div className="status-item">
          <p className="label">Fator Calibração</p>
          <p>{config?.fator_calibracao || 0}</p>
        </div>
      </div>
    </div>
  );
};
