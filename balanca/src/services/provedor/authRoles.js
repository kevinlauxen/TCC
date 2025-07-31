import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

export const assignUserRoles = {
  // Tornar admin
  makeAdmin: async (targetUid) => {
    const auth = getAuth();
    const functions = getFunctions();

    if (!auth.currentUser) throw new Error("Usuário não autenticado");

    const token = await auth.currentUser.getIdTokenResult();
    if (!token.claims.admin) throw new Error("Permissão negada");

    const makeAdminCall = httpsCallable(functions, "makeAdmin");
    return makeAdminCall({ uid: targetUid });
  },

  // Tornar operador
  makeOperator: async (targetUid) => {
    const auth = getAuth();
    const functions = getFunctions();

    if (!auth.currentUser) throw new Error("Usuário não autenticado");

    const token = await auth.currentUser.getIdTokenResult();
    if (!token.claims.admin) throw new Error("Permissão negada");

    const makeOperatorCall = httpsCallable(functions, "makeOperator");
    return makeOperatorCall({ uid: targetUid });
  },

  // Verificar roles
  checkUserRole: async (requiredRole = "operador") => {
    const auth = getAuth();
    if (!auth.currentUser) return false;

    const token = await auth.currentUser.getIdTokenResult();
    return token.claims[requiredRole] === true;
  },
};
