// src/components/Home.jsx
import { useEffect, useState } from "react";
import { db, ref, onValue, set, logout } from "../../firebase";
import { useNavigate } from "react-router-dom";

function home() {
  const [balanca, setBalanca] = useState({});
  const [lavagens, setLavagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Monitorar status da balança
    const balancaRef = ref(db, "balanca");
    const unsubscribeBalanca = onValue(balancaRef, (snapshot) => {
      setBalanca(snapshot.val());
      setLoading(false);
    });

    // Monitorar histórico de lavagens
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Painel de Controle
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Card Status Balança */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Status da Balança</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p
                  className={`text-lg font-semibold ${
                    balanca.status?.online ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {balanca.status?.online ? "Online" : "Offline"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última Atividade</p>
                <p className="text-lg">
                  {balanca.status?.ultima_atividade
                    ? new Date(balanca.status.ultima_atividade).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Card Peso Atual */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Peso Atual</h2>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">
                  {balanca.peso?.valor ? balanca.peso.valor.toFixed(2) : "0.00"}{" "}
                  kg
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {balanca.peso?.estavel ? "Estável" : "Instável"}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={handleTara}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Zerar Balança
                </button>
                <button
                  onClick={handleManterLigado}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Manter Ligada
                </button>
              </div>
            </div>
          </div>

          {/* Card Histórico de Lavagens */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Últimas Lavagens</h2>
            {lavagens.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sabão (L)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amaciante (L)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alvejante (L)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lavagens.map((lavagem, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(lavagem.data).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lavagem.qtdsabao?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lavagem.qtdamaciante?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lavagem.qtdalvejante?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma lavagem registrada.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default home;
