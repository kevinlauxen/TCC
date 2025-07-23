// Home.jsx
import { useEffect, useState } from "react";
import { db, ref, onValue, set } from "../../firebase";
import { logAction } from "../../services/logger/logger";
import WashHistory from "../../components/WashHistory"; // Importação padrão
import WeightDisplay from "../../components/WeightDisplay"; // Importação padrão
import StatusCard from "../../components/StatusCard"; // Importação padrão
import Header from "../../components/header/index"; // Adicionei essa importação que estava faltando
import LastWash from "../../components/LastWash"; // Adicionei essa importação que estava faltando
import "./Home.css";

// ... restante do código permanece igual

import "./Home.css";

function Home() {
  const [scale, setScale] = useState({
    peso: 0,
    status: { online: false, ultima_atividade: 0 },
    config: {},
  });

  const [washes, setWashes] = useState([]);
  const [lastWash, setLastWash] = useState(null);

  useEffect(() => {
    // Monitora conexão
    const connectionRef = ref(db, ".info/connected");
    const unsubscribeConnection = onValue(connectionRef, (snap) => {
      console.log("Status conexão:", snap.val() ? "Online" : "Offline");
    });

    // Monitora balança
    const scaleRef = ref(db, "balanca");
    const unsubscribeScale = onValue(scaleRef, (snapshot) => {
      const data = snapshot.val() || {};
      setScale((prev) => ({ ...prev, ...data }));
    });

    // Monitora lavagens
    const washesRef = ref(db, "lavagens/historico");
    const unsubscribeWashes = onValue(washesRef, (snapshot) => {
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
      unsubscribeConnection();
      unsubscribeScale();
      unsubscribeWashes();
    };
  }, []);

  const handleTare = async () => {
    try {
      await set(ref(db, "balanca/comando/tara"), true);
      await logAction("tara_executada", { pesoAtual: scale.peso });
    } catch (error) {
      await logAction("erro_tara", { error: error.message });
    }
  };

  const handleKeepOn = () => {
    set(ref(db, "balanca/comando/manter_ligado"), true);
  };

  const handleCalibrate = () => {
    set(ref(db, "balanca/comando/calibrar"), true);
  };

  return (
    <div className="home-container">
      <Header firmwareVersion={scale.status?.versao_firmware} />

      <main className="main-content">
        <StatusCard status={scale.status} config={scale.config} />

        <WeightDisplay
          weight={scale.peso}
          isOnline={scale.status?.online}
          onTare={handleTare}
          onKeepOn={handleKeepOn}
          onCalibrate={handleCalibrate}
        />

        {lastWash && <LastWash wash={lastWash} />}

        <WashHistory washes={washes} />
      </main>
    </div>
  );
}

export default Home;
