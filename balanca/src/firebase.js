// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, get } from "firebase/database";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-eM7emJA9qAEaMCgSL1S77PnP8WWx1ms",
  authDomain: "tcc-e9e3f.firebaseapp.com",
  databaseURL: "https://tcc-e9e3f-default-rtdb.firebaseio.com",
  projectId: "tcc-e9e3f",
  storageBucket: "tcc-e9e3f.appspot.com",
  messagingSenderId: "540884993507",
  appId: "1:540884993507:web:5f034b08bc767407050cd6",
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Configurar persistência de autenticação
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Serviço de Autenticação
export const authService = {
  async signUp(email, password) {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCred.user;
    } catch (error) {
      throw this._formatError(error);
    }
  },

  async signIn(email, password) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      return userCred.user;
    } catch (error) {
      throw this._formatError(error);
    }
  },

  signOut: () => signOut(auth),

  onAuthChanged: (callback) => onAuthStateChanged(auth, callback),

  _formatError(error) {
    const errorMap = {
      "auth/invalid-email": "Email inválido",
      "auth/wrong-password": "Senha incorreta",
      "auth/user-not-found": "Usuário não encontrado",
      "auth/email-already-in-use": "Email já cadastrado",
    };
    return new Error(errorMap[error.code] || "Erro na autenticação");
  },
};

// Serviço das Balanças
export const scaleService = {
  // Monitora status de uma balança específica
  monitorStatus(balancaId, callback) {
    return onValue(ref(db, `balancas/${balancaId}/status`), callback);
  },

  // Monitora peso de uma balança específica
  monitorWeight(balancaId, callback) {
    return onValue(ref(db, `balancas/${balancaId}/peso`), callback);
  },

  // Envia comando para balança específica
  sendCommand(balancaId, command, value = true) {
    return set(ref(db, `balancas/${balancaId}/comando/${command}`), value);
  },

  // Obtém lista de balanças disponíveis
  async getAvailableScales() {
    const snapshot = await get(ref(db, "balancas"));
    return snapshot.val() ? Object.keys(snapshot.val()) : [];
  },
};

// Serviço de Lavagens
export const washService = {
  // Adiciona nova lavagem ao histórico
  addWash(washData) {
    return push(ref(db, "lavagens/historico"), washData);
  },

  // Obtém histórico de lavagens
  monitorHistory(callback) {
    return onValue(ref(db, "lavagens/historico"), callback);
  },

  // Obtém a última lavagem
  async getLastWash() {
    const snapshot = await get(ref(db, "lavagens/ultima"));
    return snapshot.val();
  },
};

// Exportações básicas para uso direto quando necessário
export { db, auth, ref, set };
