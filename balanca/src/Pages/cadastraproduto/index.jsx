// src/pages/CadastroProduto.jsx
import React, { useState } from "react";
import { db, ref, push } from "../../firebase";

export default function CadastroProduto() {
  const [nome, setNome] = useState("");
  const [densidade, setDensidade] = useState("");
  const [ciclo, setCiclo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const novoProduto = {
      nome,
      densidade: parseFloat(densidade),
      ciclo,
    };

    push(ref(db, "produtos"), novoProduto)
      .then(() => {
        alert("✅ Produto cadastrado com sucesso!");
        setNome("");
        setDensidade("");
        setCiclo("");
      })
      .catch((err) => alert("Erro: " + err.message));
  };

  return (
    <div className="container">
      <h2>📦 Cadastro de Produtos</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome do Produto:</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label>Densidade (g/ml):</label>
        <input
          type="number"
          step="0.01"
          value={densidade}
          onChange={(e) => setDensidade(e.target.value)}
          required
        />

        <label>Ciclo:</label>
        <select
          value={ciclo}
          onChange={(e) => setCiclo(e.target.value)}
          required
        >
          <option value="">--Selecione--</option>
          <option value="sabao">Sabão</option>
          <option value="amaciante">Amaciante</option>
          <option value="alvejante">Alvejante</option>
        </select>

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
