import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./services/provedor/Authprovider";
import Login from "./Pages/login";
import Home from "./Pages/home";
import Loading from "./components/loading";
import Register from "./Pages/register";
import { useEffect } from "react";

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true });
      } else if (window.location.pathname === "/login") {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
