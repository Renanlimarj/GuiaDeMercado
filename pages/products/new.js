import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
        router.back();
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
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => router.back()} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Adicionar Produto</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-bold" style={{ color: '#cbd5e1' }}>Nome do Produto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
              placeholder="Ex: Arroz Branco 5kg"
            />
          </div>

          {/* Barcode */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold" style={{ color: '#cbd5e1' }}>Código de Barras</label>
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
              className="input"
              placeholder="Opcional"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 text-sm font-bold" style={{ color: '#cbd5e1' }}>Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block mb-2 text-sm font-bold" style={{ color: '#cbd5e1' }}>URL da Imagem</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="input"
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
            className="btn btn-primary w-full" 
            style={{ width: "100%", padding: "1rem", fontSize: '1.125rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} style={{ marginRight: '0.5rem' }} />
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
