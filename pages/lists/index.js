import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Plus, ShoppingCart, ChevronRight, Calendar } from "lucide-react";
import Layout from "../../components/Layout";

export default function ListsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLists();
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status]);

  const fetchLists = async () => {
    try {
      const res = await fetch("/api/lists");
      if (res.ok) {
        const data = await res.json();
        setLists(data);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Minhas Listas</h1>
          <Link 
            href="/lists/new" 
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Nova Lista
          </Link>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-white/5">
            <ShoppingCart size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma lista encontrada</h3>
            <p className="text-slate-400 mb-6">Crie sua primeira lista de compras para começar.</p>
            <Link 
              href="/lists/new" 
              className="btn btn-secondary"
            >
              Criar Lista
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => (
              <Link 
                key={list.id} 
                href={`/lists/${list.id}`}
                className="block bg-slate-800/50 border border-white/5 rounded-xl p-4 hover:bg-slate-800 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {list.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <ShoppingCart size={14} />
                        {list._count?.items || 0} itens
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(list.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
