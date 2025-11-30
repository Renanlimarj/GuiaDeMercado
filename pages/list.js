import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function ShoppingList() {
  const { data: session } = useSession();
  const [list, setList] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchList();
      fetch("/api/products").then((res) => res.json()).then(setProducts);
    }
  }, [session]);

  const fetchList = () => {
    fetch("/api/list").then((res) => res.json()).then(setList);
  };

  if (!session) {
    if (typeof window !== "undefined") router.push("/api/auth/signin");
    return null;
  }

  const addItem = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    await fetch("/api/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: selectedProduct }),
    });
    setSelectedProduct("");
    fetchList();
  };

  const toggleCheck = async (itemId, checked) => {
    await fetch("/api/list", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, checked }),
    });
    fetchList();
  };

  const deleteItem = async (itemId) => {
    await fetch(`/api/list?itemId=${itemId}`, { method: "DELETE" });
    fetchList();
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Minha Lista de Compras</h1>

      <form onSubmit={addItem} style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
        >
          <option value="">Adicionar produto à lista...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button type="submit" style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Adicionar
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {list?.items.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "#f9fafb", borderRadius: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => toggleCheck(item.id, e.target.checked)}
                style={{ width: "1.25rem", height: "1.25rem" }}
              />
              <span style={{ textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "#9ca3af" : "inherit" }}>
                {item.product.name}
              </span>
            </div>
            <button onClick={() => deleteItem(item.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
              Remover
            </button>
          </div>
        ))}
        {list?.items.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b7280" }}>Sua lista está vazia.</p>
        )}
      </div>
      
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Voltar para Home</Link>
      </div>
    </div>
  );
}
