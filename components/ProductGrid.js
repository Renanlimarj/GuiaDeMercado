import { useState } from 'react';
import { Search, Package } from 'lucide-react';

export default function ProductGrid({ products, onSelect, selectedId }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  // Extract unique categories
  const categories = ["Todos", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === "Todos" || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => onSelect(product)}
            className={`
              relative flex flex-col items-center p-3 rounded-xl border cursor-pointer transition-all
              ${selectedId === product.id 
                ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500' 
                : 'bg-slate-800/50 border-white/5 hover:bg-slate-800 hover:border-white/10'}
            `}
          >
            <div className="w-16 h-16 mb-3 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Package size={24} className="text-slate-500" />
              )}
            </div>
            <span className="text-sm font-medium text-center text-slate-200 line-clamp-2">
              {product.name}
            </span>
            {product.category && (
              <span className="mt-1 text-[10px] text-slate-500 uppercase tracking-wider">
                {product.category}
              </span>
            )}
          </div>
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-8 text-slate-500">
            Nenhum produto encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
