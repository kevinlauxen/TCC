// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged, // Renomeamos para evitar conflito
  setPersistence,
  browserLocalPersistence,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Configuração de persistência ESSENCIAL
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("Persistência configurada com sucesso");
  } catch (error) {
    console.error("Erro ao configurar persistência:", error);
  }
})();

async function cadastrar(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

// Função de login
async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log(auth);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

// Função de logout
async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}

// Monitor de estado de autenticação
function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback);
}

// Monitoramento de status da balança (opcional)
function monitorarBalanca(callback) {
  const statusRef = ref(db, "balanca/status");
  return onValue(statusRef, (snapshot) => {
    callback(snapshot.val());
  });
}

// Funções de controle da balança
function manterLigado() {
  set(ref(db, "balanca/comando/manter_ligado"), true);
}

function tararBalanca() {
  set(ref(db, "balanca/comando/tara"), true);
}

// Exportações
export {
  db,
  auth,
  ref,
  onValue,
  set,
  push,
  login,
  logout,
  onAuthStateChanged, // Exportamos nossa função wrapper
  monitorarBalanca,
  manterLigado,
  tararBalanca,
  cadastrar,
};
