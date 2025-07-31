import { useEffect, useState, useCallback } from "react";
import { scaleService, washService } from "../../firebase";
import { logAction } from "../../services/logger/logger";
import { WashHistory } from "../../components/WashHistory";
import { WeightDisplay } from "../../components/WeightDisplay";
import { StatusCard } from "../../components/StatusCard";
import { Header } from "../../components/header";
import { LastWash } from "../../components/LastWash";
import "./Home.css";

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
          throw error; // Propaga o erro para ser tratado pelo UI
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
        "Não foi possível alterar o estado da balança. Verifique as permissões."
      );
      console.error("Erro ao alternar conexão:", error);
      // Adicione aqui a lógica para mostrar o erro ao usuário
    }
  }, [activeScale, connectionActive, unsubscribers]);

  useEffect(() => {
    // Monitora balanças disponíveis (só executa uma vez)
    const fetchScales = async () => {
      const availableScales = await scaleService.getAvailableScales();
      console.log("Balanças disponíveis:", availableScales);
    };
    fetchScales();

    // Monitora lavagens (independente da conexão com balança)
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

    return () => {
      if (unsubscribers.weight) unsubscribers.weight();
      if (unsubscribers.status) unsubscribers.status();
      unsubscribeWashes();
    };
  }, [activeScale]);

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
