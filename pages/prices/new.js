import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function NewPrice() {
  const { data: session } = useSession();
  const [supermarkets, setSupermarkets] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [price, setPrice] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/supermarkets").then((res) => res.json()).then(setSupermarkets);
    fetch("/api/products").then((res) => res.json()).then(setProducts);
  }, []);

  if (!session) {
    if (typeof window !== "undefined") router.push("/api/auth/signin");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supermarketId: selectedSupermarket,
        productId: selectedProduct,
        price,
      }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      alert("Erro ao registrar preço");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Registrar Preço</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Supermercado</label>
          <select
            value={selectedSupermarket}
            onChange={(e) => setSelectedSupermarket(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="">Selecione um supermercado</option>
            {supermarkets.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
            Não encontrou? <Link href="/supermarkets/new" style={{ color: "#2563eb" }}>Adicionar novo</Link>
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Produto</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="">Selecione um produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
            Não encontrou? <Link href="/products/new" style={{ color: "#2563eb" }}>Adicionar novo</Link>
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <button type="submit" style={{ padding: "0.75rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Salvar Preço
        </button>
      </form>
    </div>
  );
}
