// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "./firebase"; // Agora está corretamente exportado
import Login from "./Pages/login";
import Home from "./Pages/home";
import Loading from "./components/loading";
import Register from "./Pages/register";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Agora a função está corretamente importada
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Home /> : <Login />} />
        <Route path="/register" element={user ? <Home /> : <Register />} />
        <Route path="/home" element={user ? <Home /> : <Login />} />
        <Route path="/" element={user ? <Home /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
