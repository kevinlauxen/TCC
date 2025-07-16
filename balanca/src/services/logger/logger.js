import { getAuth } from "firebase/auth";
import { getDatabase, ref, push, set } from "firebase/database";

export const logAction = async (action, details = {}) => {
  try {
    const auth = getAuth();
    const db = getDatabase();
    const logRef = push(ref(db, "logs"));

    await set(logRef, {
      action,
      user: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      timestamp: Date.now(),
      ...details,
    });
  } catch (error) {
    console.error("Erro ao registrar ação:", error);
  }
};
