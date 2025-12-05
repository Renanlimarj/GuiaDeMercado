import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { ArrowLeft, MapPin, Loader2, Save } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  // Auto-fill coordinates when location is available
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
          longitude: longitude ? parseFloat(longitude) : null
        }),
      });

      if (res.ok) {
        router.push("/");
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
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <button onClick={() => router.back()} className="btn btn-secondary flex items-center gap-2 mb-4">
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 className="text-3xl font-bold text-white">Adicionar Supermercado</h1>
          <p className="text-slate-400 mt-2">Cadastre um novo local para registrar preços.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-bold text-slate-300">Nome do Supermercado</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
              placeholder="Ex: Supermercado Preço Bom"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block mb-2 text-sm font-bold text-slate-300">Endereço (Opcional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input"
              placeholder="Rua das Flores, 123 - Centro"
            />
          </div>

          {/* Location */}
          <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" />
                Localização
              </label>
              {geoLoading && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Obtendo GPS...
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
                  className="input text-sm"
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
                  className="input text-sm"
                  placeholder="-46.6333"
                />
              </div>
            </div>
            
            {geoError && (
              <p className="text-xs text-red-400 mt-2">
                Não foi possível obter sua localização automática. Digite manualmente se souber.
              </p>
            )}
            
            {!latitude && !geoLoading && !geoError && (
              <p className="text-xs text-slate-500 mt-2">
                Aguardando permissão de localização do navegador...
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Salvando...
              </>
            ) : (
              <>
                <Save size={24} />
                Salvar Supermercado
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
