import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, Barcode } from "lucide-react";
import Layout from "../../components/Layout";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Debounce could be added here
    const timer = setTimeout(() => {
        fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 pt-8 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <Link href="/products/new" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg">
            <Plus size={24} />
          </Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="grid gap-3">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-800 transition-colors">
                 <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                    {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                        <Barcode size={24} />
                    )}
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{product.name}</h3>
                    <p className="text-sm text-slate-400">{product.category || 'Sem categoria'}</p>
                 </div>
              </div>
            </Link>
          ))}

          {!loading && products.length === 0 && (
             <div className="text-center text-slate-500 mt-8">
               Nenhum produto encontrado.
             </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
