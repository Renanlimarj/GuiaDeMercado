import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { ArrowLeft, Scan, Loader2 } from "lucide-react";
import Layout from "../../components/Layout";
import BarcodeScanner from "../../components/BarcodeScanner";

export default function NewProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { barcode: initialBarcode } = router.query;

  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (initialBarcode) {
      setBarcode(initialBarcode);
    }
  }, [initialBarcode]);

  if (status === "loading") return null;

  if (!session) {
    if (typeof window !== "undefined") router.push("/api/auth/signin");
    return null;
  }

  const handleScan = (code) => {
    setBarcode(code);
    setShowScanner(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, barcode, image, category }),
      });

      if (res.ok) {
        router.push("/products");
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao criar produto");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Hortifruti", "Padaria", "Açougue", "Bebidas", "Mercearia",
    "Limpeza", "Higiene", "Frios", "Laticínios", "Outros"
  ];

  return (
    <Layout>
      <div className="p-4 pt-8 pb-24">
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-white">Adicionar Produto</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300">Nome do Produto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Ex: Arroz Branco 5kg"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-300">Código de Barras</label>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="text-sm text-blue-400 flex items-center gap-1 hover:text-blue-300"
              >
                <Scan size={16} /> Escanear
              </button>
            </div>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300">URL da Imagem</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {image && (
              <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-slate-800 border border-white/10">
                <img src={image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
              </div>
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
              "Salvar Produto"
            )}
          </button>
        </form>

        {showScanner && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </Layout>
  );
}
