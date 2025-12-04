import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ArrowLeft, Save, Plus, X, Search, Sparkles } from "lucide-react";
import Layout from "../../components/Layout";
import ProductGrid from "../../components/ProductGrid";

export default function NewList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState("Minha Lista");
  const [recentProducts, setRecentProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("suggestions"); // 'suggestions' or 'search'

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated") {
      fetchRecentProducts();
      fetchAllProducts();
    }
  }, [status]);

  const fetchRecentProducts = async () => {
    try {
      const res = await fetch("/api/lists/recent");
      if (res.ok) {
        const data = await res.json();
        setRecentProducts(data);
      }
    } catch (error) {
      console.error("Error fetching recent products:", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const toggleProduct = (product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Nome da lista é obrigatório");
    
    setLoading(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          items: selectedProducts.map(p => ({ productId: p.id, quantity: 1 }))
        }),
      });

      if (res.ok) {
        router.push("/lists");
      } else {
        alert("Erro ao criar lista");
      }
    } catch (error) {
      console.error("Error creating list:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent text-2xl font-bold focus:outline-none border-b border-transparent focus:border-blue-500 placeholder-slate-500 w-full max-w-md"
              placeholder="Nome da Lista"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? "Salvando..." : "Salvar Lista"}
          </button>
        </div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left: Product Selection */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setView("suggestions")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  view === "suggestions" 
                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/5" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sparkles size={16} /> Sugestões Recentes
              </button>
              <button 
                onClick={() => setView("search")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  view === "search" 
                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/5" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Search size={16} /> Buscar Produtos
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {view === "suggestions" ? (
                recentProducts.length > 0 ? (
                  <ProductGrid 
                    products={recentProducts} 
                    onSelect={toggleProduct} 
                    selectedId={null} // We handle selection differently here (multi-select)
                  />
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Nenhuma sugestão recente encontrada.</p>
                    <button onClick={() => setView("search")} className="text-blue-400 hover:underline mt-2">
                      Buscar produtos
                    </button>
                  </div>
                )
              ) : (
                <ProductGrid 
                  products={allProducts} 
                  onSelect={toggleProduct} 
                  selectedId={null}
                />
              )}
            </div>
          </div>

          {/* Right: Selected Items */}
          <div className="w-80 bg-slate-800 rounded-2xl border border-white/5 flex flex-col shrink-0">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">
                  {selectedProducts.length}
                </div>
                Itens Selecionados
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Selecione produtos ao lado para adicionar à lista.
                </div>
              ) : (
                selectedProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg group">
                    <div className="w-10 h-10 rounded bg-slate-600 overflow-hidden shrink-0">
                      {product.image && <img src={product.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{product.name}</div>
                      <div className="text-xs text-slate-400">{product.category}</div>
                    </div>
                    <button 
                      onClick={() => toggleProduct(product)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
