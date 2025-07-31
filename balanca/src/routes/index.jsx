import { Routes, Route, Navigate } from "react-router-dom";
import { authService } from "..firebase";
import { Home } from "../Pages/home/index";
import { Login } from "../Pages/login/index";
import { AdminPanel } from "../Pages/AdminPanel";
import { OperatorPanel } from "../Pages/OperatorPanel";
import { Unauthorized } from "../Pages/Unathorized";

// Componente de rota protegida
const ProtectedRoute = ({ children, requiredRole }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authService.checkRole(requiredRole);
      setHasPermission(isAuthenticated);
      setAuthChecked(true);
      if (!isAuthenticated) {
        navigate("/unauthorized");
      }
    };

    checkAuth();
  }, [requiredRole, navigate]);

  if (!authChecked) return <Loading />;
  return hasPermission ? children : null;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="operador">
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operador"
        element={
          <ProtectedRoute requiredRole="operador">
            <OperatorPanel />
          </ProtectedRoute>
        }
      />

      {/* Redirecionamentos */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
