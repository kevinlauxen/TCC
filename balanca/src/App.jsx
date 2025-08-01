import { useAuth } from "./services/provedor/Authprovider";
import Login from "./Pages/login";
import Home from "./Pages/home";
import Loading from "./components/loading";
import Register from "./Pages/register";
import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./services/provedor/ErrorBoundary";

function App() {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const publicPaths = ["/login", "/register"];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (!isAuthenticated && !isPublicPath) {
      navigate("/login", { replace: true });
    } else if (isAuthenticated && isPublicPath) {
      navigate("/", { replace: true });
    }
  }, [loading, isAuthenticated, navigate, location.pathname]);

  if (loading) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
