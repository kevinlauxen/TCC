import { useState, useEffect, createContext, useContext } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Estado de autenticação alterado:", user);
      setAuthState({
        user: user
          ? {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
            }
          : null,
        loading: false,
        error: null,
      });
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setAuthState((prev) => ({ ...prev, error }));
    }
  };

  const value = {
    ...authState,
    isAuthenticated: !!authState.user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
