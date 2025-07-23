// WashHistory.jsx
import "./WashHistory.css";

export const WashHistory = ({ washes }) => {
  return (
    <div className="card">
      <h2 className="card-title">Histórico de Lavagens</h2>
      {washes.length > 0 ? (
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
              {washes.map((wash) => (
                <tr key={wash.id}>
                  <td>{new Date(wash.data).toLocaleDateString()}</td>
                  <td>{wash.ciclo || "Normal"}</td>
                  <td>{wash.peso_roupas?.toFixed(2)}</td>
                  <td>{wash.produtos?.sabao?.quantidade?.toFixed(2)}</td>
                  <td>{wash.produtos?.amaciante?.quantidade?.toFixed(2)}</td>
                  <td>{wash.produtos?.alvejante?.quantidade?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">Nenhuma lavagem registrada.</p>
      )}
    </div>
  );
};
