import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Plus, Search, ShoppingCart, MapPin, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import SupermarketCard from "../components/SupermarketCard";
import { useSupermarket } from "../context/SupermarketContext";
import { useGeolocation, calculateDistance } from "../hooks/useGeolocation";

export default function Home() {
  const { data: session, status } = useSession();
  const { selectedSupermarket, setSupermarket } = useSupermarket();
  const { location, loading: geoLoading } = useGeolocation();
  
  const [recentPrices, setRecentPrices] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pricesRes, supermarketsRes] = await Promise.all([
        fetch("/api/prices"),
        fetch("/api/supermarkets")
      ]);
      
      const pricesData = await pricesRes.json();
      const supermarketsData = await supermarketsRes.json();

      if (Array.isArray(pricesData)) setRecentPrices(pricesData);
      if (Array.isArray(supermarketsData)) setSupermarkets(supermarketsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedSupermarkets = () => {
    if (!location) return supermarkets;
    
    return [...supermarkets].sort((a, b) => {
      const distA = calculateDistance(location.latitude, location.longitude, a.latitude, a.longitude);
      const distB = calculateDistance(location.latitude, location.longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ 
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        background: '#0f172a', color: 'white', padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))' }}></div>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '42rem' }}>
          <h1 style={{ 
            fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', 
            background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
          }}>
            Guia de Supermercados
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '2rem' }}>
            Compare preços, encontre as melhores ofertas e economize nas suas compras de supermercado com a ajuda da comunidade.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => signIn()} className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '0.75rem 2rem' }}>
              Entrar Agora
            </button>
            <Link href="/auth/signup" className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '0.75rem 2rem' }}>
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Supermarket Selection Screen
  if (!selectedSupermarket) {
    const sortedSupermarkets = getSortedSupermarkets();

    return (
      <Layout>
        <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '2rem 0' }}>
          <div className="text-center mb-4">
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
              padding: '0.75rem', borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.1)', 
              color: '#60a5fa', marginBottom: '1rem' 
            }}>
              <MapPin size={32} />
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Onde você está?</h1>
            <p style={{ color: '#94a3b8' }}>Selecione o supermercado para ver ofertas e registrar preços.</p>
          </div>

          {geoLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <Loader2 className="animate-spin" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
              Obtendo localização...
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {sortedSupermarkets.map((supermarket) => (
                <SupermarketCard 
                  key={supermarket.id} 
                  supermarket={supermarket}
                  distance={location ? calculateDistance(location.latitude, location.longitude, supermarket.latitude, supermarket.longitude) : undefined}
                  onSelect={setSupermarket}
                />
              ))}
              
              {sortedSupermarkets.length === 0 && (
                <div style={{ 
                  textAlign: 'center', padding: '2rem', color: '#64748b', 
                  background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.05)' 
                }}>
                  Nenhum supermercado encontrado.
                  <br />
                  <Link href="/supermarkets/new" style={{ color: '#60a5fa', textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}>
                    Cadastrar novo supermercado
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Dashboard Screen
  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Painel Principal</h1>
        <p style={{ color: '#94a3b8' }}>Bem-vindo de volta, {session.user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '2rem' }}>
        <Link href="/prices/new" className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ marginBottom: '0.75rem', padding: '0.75rem', borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Plus size={24} />
          </div>
          <span style={{ fontWeight: 700 }}>Registrar Preço</span>
        </Link>
        <Link href="/search" className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ marginBottom: '0.75rem', padding: '0.75rem', borderRadius: '9999px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <Search size={24} />
          </div>
          <span style={{ fontWeight: 700 }}>Buscar Produtos</span>
        </Link>
        <Link href="/list" className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ marginBottom: '0.75rem', padding: '0.75rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <ShoppingCart size={24} />
          </div>
          <span style={{ fontWeight: 700 }}>Minha Lista</span>
        </Link>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Últimas Atualizações</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentPrices.map((entry) => (
          <div key={entry.id} className="card" style={{ background: 'rgba(30, 41, 59, 0.5)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{entry.product.name}</h3>
              <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontWeight: 700, fontSize: '0.875rem' }}>
                R$ {entry.price.toFixed(2)}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{entry.supermarket.name}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span>Por {entry.user.name}</span>
              <span>{new Date(entry.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {recentPrices.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '0.75rem', border: '1px dashed rgba(255, 255, 255, 0.05)' }}>
            Nenhum preço registrado ainda.
          </div>
        )}
      </div>
    </Layout>
  );
}
