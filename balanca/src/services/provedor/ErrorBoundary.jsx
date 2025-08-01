import { useState } from "react";

export function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="error-boundary">
        <h2>Ocorreu um erro</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Recarregar</button>
      </div>
    );
  }

  return children;
}
