// LastWash.jsx
import "./LastWash.css";

export const LastWash = ({ wash }) => {
  if (!wash) return null;

  return (
    <div className="card">
      <h2 className="card-title">Última Lavagem</h2>
      <div className="last-wash">
        <div className="wash-info">
          <p className="label">Data</p>
          <p>{new Date(wash.data).toLocaleString()}</p>
        </div>
        <div className="wash-info">
          <p className="label">Ciclo</p>
          <p>{wash.ciclo || "Normal"}</p>
        </div>
        <div className="wash-info">
          <p className="label">Peso das Roupas</p>
          <p>{wash.peso_roupas?.toFixed(2)} kg</p>
        </div>
        <div className="wash-products">
          <h3>Produtos Utilizados:</h3>
          <ul>
            <li>
              <strong>Sabão:</strong>{" "}
              {wash.produtos?.sabao?.quantidade?.toFixed(2)}{" "}
              {wash.produtos?.sabao?.unidade}
            </li>
            <li>
              <strong>Amaciante:</strong>{" "}
              {wash.produtos?.amaciante?.quantidade?.toFixed(2)}{" "}
              {wash.produtos?.amaciante?.unidade}
            </li>
            <li>
              <strong>Alvejante:</strong>{" "}
              {wash.produtos?.alvejante?.quantidade?.toFixed(2)}{" "}
              {wash.produtos?.alvejante?.unidade}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
