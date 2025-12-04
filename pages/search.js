import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import Layout from "../components/Layout";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        searchProducts();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${query}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        console.error("Invalid search results:", data);
        setResults([]);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Voltar
          </Link>
          <h1 style={{ fontSize: "2rem", textAlign: "center", fontWeight: 700 }}>Buscar Produtos</h1>
        </div>
        
        <div style={{ position: "relative", marginBottom: "2rem" }}>
          <SearchIcon style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="input"
            placeholder="Digite o nome do produto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: "3rem", height: "3.5rem", fontSize: "1.125rem" }}
          />
        </div>

        <div className="grid grid-cols-1">
          {loading && <p className="text-center text-muted">Buscando...</p>}
          
          {!loading && results.length === 0 && query && (
            <p className="text-center text-muted">Nenhum produto encontrado.</p>
          )}

          {Array.isArray(results) && results.map((product) => (
            <div key={product.id} className="card">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold" style={{ fontSize: "1.125rem" }}>{product.name}</h3>
                  {product.barcode && <p className="text-sm text-muted">Código: {product.barcode}</p>}
                </div>
                {/* Future: Add button to see price history */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
