import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Trash2, Check, Plus } from "lucide-react";
import Layout from "../components/Layout";

export default function ShoppingList() {
  const { data: session } = useSession();
  const [list, setList] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchList();
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            console.error("Invalid products data:", data);
            setProducts([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch products:", err);
          setProducts([]);
        });
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
    <Layout>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Voltar
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Minha Lista de Compras</h1>
        </div>

        <form onSubmit={addItem} className="flex gap-2 mb-4">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="input"
            style={{ flex: 1 }}
          >
            <option value="">Adicionar produto à lista...</option>
            {Array.isArray(products) && products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            <Plus size={20} />
          </button>
        </form>

        <div className="flex flex-col gap-2">
          {list?.items && Array.isArray(list.items) && list.items.map((item) => (
            <div key={item.id} className="card flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => toggleCheck(item.id, !item.checked)}
                  style={{ 
                    width: "24px", 
                    height: "24px", 
                    borderRadius: "50%", 
                    border: item.checked ? "none" : "2px solid #334155",
                    backgroundColor: item.checked ? "#22c55e" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {item.checked && <Check size={14} color="white" />}
                </div>
                <span style={{ 
                  textDecoration: item.checked ? "line-through" : "none", 
                  color: item.checked ? "#94a3b8" : "inherit",
                  fontSize: "1.1rem"
                }}>
                  {item.product.name}
                </span>
              </div>
              <button onClick={() => deleteItem(item.id)} className="btn btn-secondary" style={{ padding: "0.5rem", color: "#ef4444", borderColor: "#ef4444" }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {list?.items.length === 0 && (
            <p className="text-center text-muted py-8">Sua lista está vazia.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
