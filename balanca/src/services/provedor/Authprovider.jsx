import { useState, useEffect, createContext, useContext } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Loading from "../../components/loading";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        setLoading(true);
        setError(null);

        if (authUser) {
          const token = await authUser.getIdTokenResult(true);

          if (!token.claims.valid) {
            console.warn("Token inválido, fazendo logout...");
            await signOut(auth);
            return;
          }

          setUser({
            uid: authUser.uid,
            email: authUser.email,
            emailVerified: authUser.emailVerified,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
        setError(error);
        await signOut(auth);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    error,
    logout: async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        setError(error);
      }
    },
  };

  if (loading) {
    return <Loading />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
