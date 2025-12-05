import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push("/api/auth/signin");
    } else {
      alert("Erro ao criar conta");
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "#f3f4f6" 
    }}>
      <div style={{ 
        background: "white", 
        padding: "2rem", 
        borderRadius: "8px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
        width: "100%", 
        maxWidth: "400px" 
      }}>
        <h1 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>Criar Conta</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db" }}
            />
          </div>
          <button type="submit" style={{ 
            width: "100%", 
            padding: "0.75rem", 
            background: "#2563eb", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            fontWeight: "bold", 
            cursor: "pointer" 
          }}>
            Cadastrar
          </button>
        </form>
        <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
          Já tem uma conta? <Link href="/api/auth/signin" style={{ color: "#2563eb" }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
