import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Barcode, TrendingUp, MapPin } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from "../../components/Layout";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
            if (data.id) setProduct(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Layout><div className="flex justify-center items-center h-screen text-white">Carregando...</div></Layout>;
  if (!product) return <Layout><div className="flex justify-center items-center h-screen text-white">Produto não encontrado</div></Layout>;

  // Format data for chart
  const chartData = product.priceEntries?.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('pt-BR'),
    price: entry.price,
    supermarket: entry.supermarket?.name
  })) || [];

  return (
    <Layout>
      <div className="p-4 pt-8 pb-24">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
               {product.image ? (
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl" />
               ) : (
                   <Barcode size={32} className="text-slate-500" />
               )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{product.name}</h1>
              <span className="inline-block bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-800">
                {product.category || 'Geral'}
              </span>
              {product.barcode && (
                <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                  <Barcode size={12} /> {product.barcode}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
           <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <TrendingUp className="text-green-400" size={20} />
             Histórico de Preços
           </h2>

           <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-[300px]">
             {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                   <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tick={{fill: '#94a3b8'}} />
                   <YAxis stroke="#94a3b8" fontSize={12} tick={{fill: '#94a3b8'}} unit="R$" />
                   <Tooltip
                     contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                     itemStyle={{ color: '#f8fafc' }}
                   />
                   <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-500">
                 <p>Nenhum preço registrado ainda.</p>
               </div>
             )}
           </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4">Últimos Registros</h2>
          <div className="space-y-3">
             {product.priceEntries?.slice(0).reverse().map(entry => (
               <div key={entry.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                 <div>
                   <p className="font-semibold text-white flex items-center gap-2">
                     <MapPin size={14} className="text-slate-400" />
                     {entry.supermarket?.name}
                   </p>
                   <p className="text-xs text-slate-500 mt-1">
                     {new Date(entry.date).toLocaleDateString('pt-BR')}
                   </p>
                 </div>
                 <div className="text-xl font-bold text-green-400">
                   R$ {entry.price.toFixed(2)}
                 </div>
               </div>
             ))}
             {(!product.priceEntries || product.priceEntries.length === 0) && (
               <p className="text-slate-500 text-sm text-center">Nenhum registro encontrado.</p>
             )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
