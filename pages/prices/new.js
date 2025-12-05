import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, MapPin, Loader2, Scan } from "lucide-react";
import Layout from "../../components/Layout";
import ProductGrid from "../../components/ProductGrid";
import BarcodeScanner from "../../components/BarcodeScanner";
import { useSupermarket } from "../../context/SupermarketContext";

export default function NewPrice() {
  const { data: session, status } = useSession();
  const { selectedSupermarket } = useSupermarket();
  const router = useRouter();

  const [supermarkets, setSupermarkets] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Initialize with context if available
  const [selectedSupermarketId, setSelectedSupermarketId] = useState(selectedSupermarket?.id || "");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    // Update local state if context changes
    if (selectedSupermarket) {
      setSelectedSupermarketId(selectedSupermarket.id);
    }
  }, [selectedSupermarket]);

  useEffect(() => {
    fetch("/api/supermarkets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSupermarkets(data);
        } else {
          console.error("Invalid supermarkets data:", data);
          setSupermarkets([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch supermarkets:", err);
        setSupermarkets([]);
      });

    fetchProducts();
  }, []);

  const fetchProducts = () => {
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
  };

  if (status === "loading") return null;

  if (!session) {
    if (typeof window !== "undefined") router.push("/api/auth/signin");
    return null;
  }

  const handleScan = async (code) => {
    setShowScanner(false);
    // Find product by barcode
    const found = products.find(p => p.barcode === code);
    if (found) {
      setSelectedProduct(found);
    } else {
      // If not found, check API specifically for this barcode (in case it wasn't loaded)
      try {
        const res = await fetch(`/api/products?barcode=${code}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(prev => [...prev, data[0]]);
          setSelectedProduct(data[0]);
        } else {
          if (confirm(`Produto com código ${code} não encontrado. Deseja cadastrá-lo?`)) {
            router.push(`/products/new?barcode=${code}`);
          }
        }
      } catch (e) {
        console.error("Error searching barcode:", e);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert("Selecione um produto");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supermarketId: selectedSupermarketId,
          productId: selectedProduct.id,
          price,
        }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        alert("Erro ao registrar preço");
      }
    } catch (error) {
      console.error("Error submitting price:", error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Voltar
          </Link>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Registrar Preço</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Supermarket Selection */}
          <div>
            <label className="block mb-2 text-sm font-bold" style={{ color: '#cbd5e1' }}>Supermercado</label>
            {selectedSupermarket ? (
              <div style={{ 
                padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}>
                <MapPin size={20} color="#3b82f6" />
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{selectedSupermarket.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{selectedSupermarket.address || 'Endereço não informado'}</div>
                </div>
                <input type="hidden" value={selectedSupermarket.id} />
              </div>
            ) : (
              <>
                <select
                  value={selectedSupermarketId}
                  onChange={(e) => setSelectedSupermarketId(e.target.value)}
                  required
                  className="input"
                >
                  <option value="">Selecione um supermercado</option>
                  {Array.isArray(supermarkets) && supermarkets.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="mt-2 text-sm text-muted">
                  Não encontrou? <Link href="/supermarkets/new" style={{ color: "var(--primary)" }}>Adicionar novo</Link>
                </div>
              </>
            )}
          </div>

          {/* Product Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold" style={{ color: '#cbd5e1' }}>Produto</label>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="text-sm text-blue-400 flex items-center gap-1 hover:text-blue-300"
              >
                <Scan size={16} /> Escanear Código
              </button>
            </div>
            
            {selectedProduct ? (
              <div className="p-4 bg-slate-800 rounded-xl border border-blue-500/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden">
                    {selectedProduct.image && <img src={selectedProduct.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <div className="font-bold">{selectedProduct.name}</div>
                    <div className="text-xs text-slate-400">{selectedProduct.category}</div>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedProduct(null)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Alterar
                </button>
              </div>
            ) : (
              <>
                <ProductGrid 
                  products={products} 
                  onSelect={setSelectedProduct} 
                  selectedId={selectedProduct?.id} 
                />
                <div className="mt-4 text-center">
                  <span className="text-sm text-muted">Não encontrou? </span>
                  <Link href="/products/new" className="text-sm text-blue-400 hover:underline">
                    Cadastrar novo produto
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Price Input */}
          <div>
            <label className="block mb-2 text-sm font-bold" style={{ color: '#cbd5e1' }}>Preço (R$)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>R$</span>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="input"
                style={{ paddingLeft: '2.5rem', fontSize: '1.25rem', fontWeight: 600 }}
                placeholder="0.00"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            style={{ width: "100%", padding: "1rem", fontSize: '1.125rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} style={{ marginRight: '0.5rem' }} />
                Salvando...
              </>
            ) : (
              "Salvar Preço"
            )}
          </button>
        </form>

        {showScanner && (
          <BarcodeScanner 
            onScan={handleScan} 
            onClose={() => setShowScanner(false)} 
          />
        )}
      </div>
    </Layout>
  );
}
