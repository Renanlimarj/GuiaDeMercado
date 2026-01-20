import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Plus, Search, ShoppingCart, MapPin, Loader2, Camera, User } from "lucide-react";
import Layout from "../components/Layout";
import { useSupermarket } from "../context/SupermarketContext";
import { useGeolocation, calculateDistance } from "../hooks/useGeolocation";

export default function Home() {
  const { data: session, status } = useSession();
  const { selectedSupermarket, setSupermarket } = useSupermarket();
  const { location, loading: geoLoading } = useGeolocation();

  const [recentPrices, setRecentPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pricesRes = await fetch("/api/prices");
      const pricesData = await pricesRes.json();
      if (Array.isArray(pricesData)) setRecentPrices(pricesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Guia de Mercado
          </h1>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            Economize nas suas compras. Compare preços, monitore ofertas e encontre sempre o melhor supermercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => signIn()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/30 transition-all">
              Entrar Agora
            </button>
            <Link href="/auth/signup" className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl border border-slate-700 transition-all">
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <Layout>
      <div className="p-4 pt-8 pb-24">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Olá, {session.user.name?.split(' ')[0]}</h1>
                <p className="text-slate-400 text-sm">Pronto para economizar?</p>
            </div>
            {session.user.image ? (
                <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full border border-slate-700" />
            ) : (
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                    <User size={20} className="text-slate-400" />
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
            <Link href="/scan" className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg shadow-blue-900/20 flex flex-col items-center justify-center gap-2 aspect-[1.1]">
                <div className="bg-white/20 p-3 rounded-full">
                    <Camera size={24} className="text-white" />
                </div>
                <span className="font-bold text-white">Escanear Cupom</span>
            </Link>

            <Link href="/products" className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 aspect-[1.1] hover:bg-slate-750 transition-colors">
                <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
                    <Search size={24} />
                </div>
                <span className="font-semibold text-slate-200">Buscar Preços</span>
            </Link>

            <Link href="/lists" className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 aspect-[1.1] hover:bg-slate-750 transition-colors">
                <div className="bg-green-500/20 p-3 rounded-full text-green-400">
                    <ShoppingCart size={24} />
                </div>
                <span className="font-semibold text-slate-200">Minha Lista</span>
            </Link>

             <Link href="/supermarkets" className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 aspect-[1.1] hover:bg-slate-750 transition-colors">
                <div className="bg-orange-500/20 p-3 rounded-full text-orange-400">
                    <MapPin size={24} />
                </div>
                <span className="font-semibold text-slate-200">Mercados</span>
            </Link>
        </div>

        <h2 className="text-lg font-bold text-white mb-4">Últimas Ofertas</h2>
        <div className="space-y-3">
            {recentPrices.map((entry) => (
            <div key={entry.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-semibold text-white truncate">{entry.product?.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {entry.supermarket?.name}
                    </p>
                </div>
                <div className="flex flex-col items-end">
                     <span className="text-green-400 font-bold">R$ {entry.price.toFixed(2)}</span>
                     <span className="text-[10px] text-slate-600">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
            </div>
            ))}
            {!loading && recentPrices.length === 0 && (
            <div className="text-center py-8 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                Nenhum preço registrado ainda.
            </div>
            )}
            {loading && (
                 <div className="flex justify-center py-4">
                     <Loader2 className="animate-spin text-slate-500" />
                 </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
