<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Plus, Search, List, LogOut, ShoppingCart } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [recentPrices, setRecentPrices] = useState([]);

  useEffect(() => {
    fetch("/api/prices").then((res) => res.json()).then(setRecentPrices);
  }, []);

  if (!session) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
        color: "white",
        padding: "2rem",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "1rem", background: "linear-gradient(to right, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          GuiaDeMercado
        </h1>
        <p style={{ fontSize: "1.25rem", color: "#94a3b8", marginBottom: "2rem", maxWidth: "500px" }}>
          Compare preços, colabore com a comunidade e economize nas suas compras de supermercado.
        </p>
        <div className="flex gap-2">
          <button onClick={() => signIn()} className="btn btn-primary" style={{ fontSize: "1.125rem", padding: "0.75rem 2rem" }}>
            Entrar
          </button>
          <Link href="/auth/signup" className="btn btn-secondary" style={{ fontSize: "1.125rem", padding: "0.75rem 2rem" }}>
            Criar Conta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="nav">
        <div className="nav-logo">GuiaDeMercado</div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted hidden md:block">Olá, {session.user.name}</span>
          <button onClick={() => signOut()} className="btn btn-secondary" style={{ padding: "0.5rem" }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <Link href="/prices/new" className="card flex flex-col items-center justify-center p-6 hover:border-primary transition-colors group">
          <div className="mb-2 p-3 rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Plus size={24} />
          </div>
          <span className="font-bold">Registrar Preço</span>
        </Link>
        <Link href="/search" className="card flex flex-col items-center justify-center p-6 hover:border-primary transition-colors group">
          <div className="mb-2 p-3 rounded-full bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <Search size={24} />
          </div>
          <span className="font-bold">Buscar Produtos</span>
        </Link>
        <Link href="/list" className="card flex flex-col items-center justify-center p-6 hover:border-primary transition-colors group">
          <div className="mb-2 p-3 rounded-full bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
            <ShoppingCart size={24} />
          </div>
          <span className="font-bold">Minha Lista</span>
        </Link>
      </div>

      <h2 className="mb-4" style={{ fontSize: "1.5rem" }}>Últimas Atualizações</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {recentPrices.map((entry) => (
          <div key={entry.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{entry.product.name}</h3>
              <span className="badge bg-green-500/10 text-green-500">R$ {entry.price.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted mb-2">{entry.supermarket.name}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
              <span>Por {entry.user.name}</span>
              <span>{new Date(entry.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {recentPrices.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted">
            Nenhum preço registrado ainda. Seja o primeiro!
          </div>
        )}
      </div>
    </div>
  );
}
=======
// pages/index.js
export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",      // centraliza verticalmente
        justifyContent: "center",  // centraliza horizontalmente
        minHeight: "100vh",        // altura full viewport
        textAlign: "center",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Em construção 🚧</h1>
    </div>
  );
}
>>>>>>> c44de25cf5e5ebea1fa474807441abfe955ea312
