import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function NewSupermarket() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const router = useRouter();

  if (!session) {
    if (typeof window !== "undefined") router.push("/api/auth/signin");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/supermarkets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address }),
    });

    if (res.ok) {
      router.back();
    } else {
      alert("Erro ao criar supermercado");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Adicionar Supermercado</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Endereço (Opcional)</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>
        <button type="submit" style={{ padding: "0.75rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Salvar
        </button>
      </form>
    </div>
  );
}
