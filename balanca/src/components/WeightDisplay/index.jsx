// WeightDisplay.jsx
import "./WeightDisplay.css";

export const WeightDisplay = ({
  weight,
  isOnline,
  onTare,
  onKeepOn,
  onCalibrate,
}) => {
  return (
    <div className="card">
      <h2 className="card-title">Peso Atual</h2>
      <div className="card-flex">
        <div className="weight-display">
          <p className="peso">{weight?.toFixed(2) || "0.00"} kg</p>
          <p className="label">{isOnline ? "Conectado" : "Desconectado"}</p>
        </div>
        <div className="btn-group">
          <button className="btn btn-primary" onClick={onTare}>
            Zerar Balança
          </button>
          <button className="btn btn-success" onClick={onKeepOn}>
            Manter Ligada
          </button>
          <button className="btn btn-warning" onClick={onCalibrate}>
            Calibrar
          </button>
        </div>
      </div>
    </div>
  );
};
