import { useEffect, useState } from "react";
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

  const [washes, setWashes] = useState([]);
  const [lastWash, setLastWash] = useState(null);

  useEffect(() => {
    // Monitora balanças disponíveis
    const fetchScales = async () => {
      const availableScales = await scaleService.getAvailableScales();
      console.log("Balanças disponíveis:", availableScales);
    };
    fetchScales();

    // Monitora balança ativa
    const unsubscribeActiveScale = scaleService.monitorWeight(
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

    // Monitora status da balança ativa
    const unsubscribeStatus = scaleService.monitorStatus(
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

    // Monitora lavagens
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
      unsubscribeActiveScale();
      unsubscribeStatus();
      unsubscribeWashes();
    };
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

  const handleKeepOn = () => {
    scaleService.sendCommand(activeScale, "manter_ligado");
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
        />

        <WeightDisplay
          weight={scales[activeScale].peso}
          isOnline={scales[activeScale].status?.online}
          onTare={handleTare}
          onKeepOn={handleKeepOn}
          onCalibrate={handleCalibrate}
          scaleType={activeScale}
        />

        {lastWash && <LastWash wash={lastWash} />}

        <WashHistory washes={washes} />
      </main>
    </div>
  );
}

export default Home;
