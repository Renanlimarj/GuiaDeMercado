import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ArrowLeft, Trash2, Check, Square, CheckSquare } from "lucide-react";
import Layout from "../../components/Layout";

export default function ListDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && id) {
      fetchList();
    }
  }, [status, id]);

  const fetchList = async () => {
    try {
      const res = await fetch(`/api/lists/${id}`);
      if (res.ok) {
        const data = await res.json();
        setList(data);
      } else {
        router.push("/lists");
      }
    } catch (error) {
      console.error("Error fetching list:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId, currentStatus) => {
    // Optimistic update
    setList(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, checked: !currentStatus } : item
      )
    }));

    try {
      await fetch(`/api/lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", itemId }),
      });
    } catch (error) {
      console.error("Error toggling item:", error);
      fetchList(); // Revert on error
    }
  };

  const deleteList = async () => {
    if (!confirm("Tem certeza que deseja excluir esta lista?")) return;

    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/lists");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  if (loading) return null;
  if (!list) return null;

  const uncheckedItems = list.items.filter(i => !i.checked);
  const checkedItems = list.items.filter(i => i.checked);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/lists")} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{list.name}</h1>
              <p className="text-sm text-slate-400">
                {list.items.length} itens • {checkedItems.length} concluídos
              </p>
            </div>
          </div>
          <button 
            onClick={deleteList}
            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Excluir lista"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* List Items */}
        <div className="space-y-6">
          {/* Unchecked */}
          <div className="space-y-2">
            {uncheckedItems.map(item => (
              <div 
                key={item.id}
                onClick={() => toggleItem(item.id, item.checked)}
                className="flex items-center gap-4 p-3 bg-slate-800/50 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors group"
              >
                <div className="text-slate-400 group-hover:text-blue-400 transition-colors">
                  <Square size={24} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{item.product?.name}</div>
                  <div className="text-xs text-slate-400">{item.product?.category}</div>
                </div>
                {item.quantity > 1 && (
                  <div className="px-2 py-1 bg-slate-700 rounded text-xs font-bold">
                    {item.quantity}x
                  </div>
                )}
              </div>
            ))}
            {uncheckedItems.length === 0 && checkedItems.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Lista vazia.
              </div>
            )}
          </div>

          {/* Checked */}
          {checkedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                Concluídos ({checkedItems.length})
              </h3>
              <div className="space-y-2 opacity-60">
                {checkedItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleItem(item.id, item.checked)}
                    className="flex items-center gap-4 p-3 bg-slate-800/30 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="text-green-500">
                      <CheckSquare size={24} />
                    </div>
                    <div className="flex-1 line-through text-slate-400">
                      {item.product?.name}
                    </div>
                    {item.quantity > 1 && (
                      <div className="px-2 py-1 bg-slate-700/50 rounded text-xs font-bold text-slate-500">
                        {item.quantity}x
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
