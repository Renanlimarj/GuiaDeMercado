import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { ArrowLeft, MapPin, Loader2, Save, Star } from "lucide-react";
import Layout from "../../components/Layout";
import { useGeolocation } from "../../hooks/useGeolocation";

export default function NewSupermarket() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { location, loading: geoLoading, error: geoError } = useGeolocation();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      setLatitude(location.latitude);
      setLongitude(location.longitude);
    }
  }, [location]);

  if (status === "loading") return null;

  if (!session) {
    if (typeof window !== "undefined") router.push("/api/auth/signin");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/supermarkets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          rating: parseFloat(rating)
        }),
      });

      if (res.ok) {
        router.push("/supermarkets");
      } else {
        alert("Erro ao criar supermercado");
      }
    } catch (error) {
      console.error("Error creating supermarket:", error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 pt-8 pb-24">
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-white">Adicionar Supermercado</h1>
          <p className="text-slate-400 mt-1 text-sm">Cadastre um novo local para registrar preços.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300">Nome do Supermercado</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Ex: Supermercado Preço Bom"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300">Endereço (Opcional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Rua das Flores, 123 - Centro"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300">Avaliação Inicial</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3">
               <Star className="text-yellow-400" fill="currentColor" />
               <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
               />
               <span className="text-white font-bold w-8 text-right">{rating}</span>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" />
                Localização
              </label>
              {geoLoading && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> GPS...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs text-slate-500">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="-23.5505"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs text-slate-500">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="-46.6333"
                />
              </div>
            </div>

            {geoError && (
              <p className="text-xs text-red-400 mt-2">
                Não foi possível obter localização automática.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                Salvar Supermercado
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
