import { useEffect, useState, useCallback } from "react";
import { scaleService, washService } from "../../firebase";
import { logAction } from "../../services/logger/logger";
import { WashHistory } from "../../components/WashHistory";
import { WeightDisplay } from "../../components/WeightDisplay";
import { StatusCard } from "../../components/StatusCard";
import { Header } from "../../components/header";
import { LastWash } from "../../components/LastWash";
import "./Home.css";
import { useAuth } from "../../services/provedor/Authprovider";
import { ref, get, onValue } from "firebase/database";
import { db } from "../../firebase";

function Home() {
  const [activeScale, setActiveScale] = useState("principal");
  const [scales, setScales] = useState({
    principal: {
      peso: 0,
      status: { online: false, ultima_atividade: 0 },
      config: {},
    },
    sabao: {
      peso: 0,
      status: { online: false, ultima_atividade: 0 },
      config: {},
    },
    amaciante: {
      peso: 0,
      status: { online: false, ultima_atividade: 0 },
      config: {},
    },
  });
  const [error, setError] = useState(null);
  const [washes, setWashes] = useState([]);
  const [lastWash, setLastWash] = useState(null);
  const [connectionActive, setConnectionActive] = useState(false);
  const [unsubscribers, setUnsubscribers] = useState({
    weight: null,
    status: null,
  });
  const { isAuthenticated } = useAuth();

  // Teste de conexão e autenticação
  useEffect(() => {
    if (!isAuthenticated) return;

    const testConnection = async () => {
      try {
        // Teste de conexão
        const connectionRef = ref(db, ".info/connected");
        onValue(connectionRef, (snap) => {
          console.log("Status da conexão Firebase:", snap.val());
        });

        // Teste de autenticação - tenta ler um nó pequeno
        const testRef = ref(db, "balancas");
        const snapshot = await get(testRef);
        console.log("Teste de autenticação bem-sucedido:", snapshot.exists());

        // Se passou do teste, carrega os dados
        fetchScales();
        setupWashMonitor();
      } catch (error) {
        console.error("Falha no teste de conexão/autenticação:", {
          error: error.message,
          code: error.code,
        });
        setError(
          "Falha na conexão com o banco de dados. Verifique suas permissões."
        );
      }
    };

    // Carrega balanças disponíveis
    const fetchScales = async () => {
      try {
        const availableScales = await scaleService.getAvailableScales();
        console.log("Balanças disponíveis:", availableScales);

        // Atualiza o estado com as balanças encontradas
        setScales((prev) => {
          const updated = { ...prev };
          availableScales.forEach((scaleId) => {
            if (!updated[scaleId]) {
              updated[scaleId] = {
                peso: 0,
                status: { online: false, ultima_atividade: 0 },
                config: {},
              };
            }
          });
          return updated;
        });
      } catch (error) {
        console.error("Erro ao carregar balanças:", error);
        setError("Não foi possível carregar as balanças disponíveis.");
      }
    };

    // Monitora histórico de lavagens
    const setupWashMonitor = () => {
      const unsubscribeWashes = washService.monitorHistory((snapshot) => {
        const data = snapshot.val();
        const washesArray = data
          ? Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value,
            }))
          : [];
        setWashes(washesArray);
        setLastWash(washesArray[0] || null);
      });

      return unsubscribeWashes;
    };

    testConnection();

    return () => {
      // Limpeza ao desmontar o componente
      if (unsubscribers.weight) unsubscribers.weight();
      if (unsubscribers.status) unsubscribers.status();
    };
  }, [isAuthenticated]);

  const toggleConnection = useCallback(async () => {
    setError(null);
    try {
      if (connectionActive) {
        // Desativa a conexão
        if (unsubscribers.weight) unsubscribers.weight();
        if (unsubscribers.status) unsubscribers.status();

        setUnsubscribers({ weight: null, status: null });
        try {
          await scaleService.sendCommand(activeScale, "standby", true);
        } catch (error) {
          console.error("Erro ao desativar balança:", error);
        }
        setConnectionActive(false);
      } else {
        // Ativa a conexão
        try {
          await scaleService.sendCommand(activeScale, "standby", false);
        } catch (error) {
          console.error("Erro ao ativar balança:", error);
          throw error;
        }

        const weightUnsub = scaleService.monitorWeight(
          activeScale,
          (snapshot) => {
            setScales((prev) => ({
              ...prev,
              [activeScale]: {
                ...prev[activeScale],
                peso: snapshot.val() || 0,
              },
            }));
          }
        );

        const statusUnsub = scaleService.monitorStatus(
          activeScale,
          (snapshot) => {
            setScales((prev) => ({
              ...prev,
              [activeScale]: {
                ...prev[activeScale],
                status: snapshot.val() || { online: false },
              },
            }));
          }
        );

        setUnsubscribers({ weight: weightUnsub, status: statusUnsub });
        setConnectionActive(true);
      }
    } catch (error) {
      setError(
        "Não foi possível conectar à balança. Verifique as permissões e a conexão."
      );
      console.error("Erro na conexão com a balança:", error);
    }
  }, [activeScale, connectionActive, unsubscribers]);

  // Atualiza a conexão quando troca de balança
  useEffect(() => {
    if (connectionActive) {
      toggleConnection(); // Desliga a balança atual
      toggleConnection(); // Liga a nova balança
    }
  }, [activeScale]);

  const handleTare = async () => {
    try {
      await scaleService.sendCommand(activeScale, "tara");
      await logAction("tara_executada", {
        balanca: activeScale,
        pesoAtual: scales[activeScale].peso,
      });
    } catch (error) {
      await logAction("erro_tara", {
        balanca: activeScale,
        error: error.message,
      });
      setError("Erro ao executar tara. Tente novamente.");
    }
  };

  const handleCalibrate = () => {
    scaleService.sendCommand(activeScale, "calibrar");
  };

  const handleScaleChange = (scaleId) => {
    setActiveScale(scaleId);
  };

  return (
    <div className="home-container">
      <Header
        firmwareVersion={scales[activeScale].status?.versao_firmware}
        activeScale={activeScale}
        onScaleChange={handleScaleChange}
      />

      <main className="main-content">
        <StatusCard
          status={scales[activeScale].status}
          config={scales[activeScale].config}
          connectionActive={connectionActive}
          onToggleConnection={toggleConnection}
        />

        {connectionActive ? (
          <WeightDisplay
            weight={scales[activeScale].peso}
            isOnline={scales[activeScale].status?.online}
            onTare={handleTare}
            onCalibrate={handleCalibrate}
            scaleType={activeScale}
          />
        ) : (
          <div className="connection-message">
            <p>A conexão com a balança está desativada</p>
            <button onClick={toggleConnection} className="btn btn-primary">
              Ativar Balança
            </button>
          </div>
        )}

        {lastWash && <LastWash wash={lastWash} />}

        <WashHistory washes={washes} />
      </main>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Fechar</button>
        </div>
      )}
    </div>
  );
}

export default Home;
