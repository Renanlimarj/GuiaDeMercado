import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import { Camera, RefreshCw, Check, Plus, Trash2, Save, MapPin, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import Layout from '../components/Layout';
import { useGeolocation } from '../hooks/useGeolocation';

export default function ScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { location } = useGeolocation();

  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [scannedText, setScannedText] = useState('');
  const [items, setItems] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState('');

  useEffect(() => {
    fetch('/api/supermarkets')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setSupermarkets(data);
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!session) {
    if (typeof window !== "undefined") router.push("/api/auth/signin");
    return null;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        processImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData) => {
    setProcessing(true);
    try {
      const result = await Tesseract.recognize(
        imageData,
        'por',
        { logger: m => console.log(m) }
      );

      setScannedText(result.data.text);
      parseReceipt(result.data.text);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar imagem');
    } finally {
      setProcessing(false);
    }
  };

  const parseReceipt = (text) => {
    // Basic heuristic to find lines with prices
    const lines = text.split('\n');
    const detectedItems = [];

    // Regex for price (e.g., 10,99 or 10.99) at end of line
    const priceRegex = /(\d+[.,]\d{2})\s*$/;

    lines.forEach((line, index) => {
      const match = line.match(priceRegex);
      if (match) {
        let name = line.replace(match[0], '').trim();
        // Clean up common OCR noise
        name = name.replace(/^[\d\W]+/, '');

        if (name.length > 3) {
           const price = parseFloat(match[1].replace(',', '.'));
           detectedItems.push({
             id: Date.now() + index,
             name: name,
             price: price,
             barcode: '' // We won't have barcode from OCR usually
           });
        }
      }
    });

    setItems(detectedItems);
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSave = async () => {
    if (!selectedSupermarket) {
      alert('Selecione um supermercado');
      return;
    }

    // Logic: For each item, we need to create a product (if not exists?) or link to one.
    // For MVP, we might just try to find by name or create a new product.
    // Here we'll iterate and call API. This is simplified.

    setProcessing(true);
    try {
        for (const item of items) {
           // 1. Create/Find Product
           let productId = null;

           // Try to find product by name
           const prodRes = await fetch(`/api/products?search=${encodeURIComponent(item.name)}`);
           const prods = await prodRes.json();

           if (prods.length > 0) {
              productId = prods[0].id;
           } else {
              // Create product
              const createRes = await fetch('/api/products', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ name: item.name })
              });
              const newProd = await createRes.json();
              productId = newProd.id;
           }

           // 2. Register Price
           if (productId) {
               await fetch('/api/prices', {
                   method: 'POST',
                   headers: {'Content-Type': 'application/json'},
                   body: JSON.stringify({
                       supermarketId: selectedSupermarket,
                       productId: productId,
                       price: item.price
                   })
               });
           }
        }
        alert('Dados salvos com sucesso!');
        router.push('/');
    } catch (e) {
        console.error(e);
        alert('Erro ao salvar dados.');
    } finally {
        setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 pt-8 pb-24">
        <h1 className="text-2xl font-bold text-white mb-6">Scanner de Cupom</h1>

        {!image ? (
          <div
             className="border-2 border-dashed border-slate-700 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900 transition-colors"
             onClick={() => fileInputRef.current.click()}
          >
             <Camera size={48} className="text-blue-500 mb-4" />
             <p className="text-slate-400 font-medium">Toque para tirar foto</p>
             <p className="text-slate-600 text-sm mt-1">ou selecionar da galeria</p>
             <input
               type="file"
               accept="image/*"
               capture="environment"
               className="hidden"
               ref={fileInputRef}
               onChange={handleImageUpload}
             />
          </div>
        ) : (
          <div>
             <div className="relative h-48 rounded-xl overflow-hidden mb-6 bg-black">
                <img src={image} alt="Cupom" className="w-full h-full object-contain opacity-70" />
                <button
                  onClick={() => { setImage(null); setItems([]); setScannedText(''); }}
                  className="absolute bottom-4 right-4 bg-red-600 p-2 rounded-full text-white shadow-lg"
                >
                   <Trash2 size={20} />
                </button>
             </div>

             {processing ? (
                <div className="text-center py-8">
                   <RefreshCw className="animate-spin text-blue-500 mx-auto mb-4" size={32} />
                   <p className="text-white">Processando imagem...</p>
                </div>
             ) : (
                <div className="space-y-6">

                   <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Onde você comprou?</label>
                      <select
                         value={selectedSupermarket}
                         onChange={(e) => setSelectedSupermarket(e.target.value)}
                         className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white appearance-none"
                      >
                         <option value="">Selecione um supermercado</option>
                         {supermarkets.map(s => (
                             <option key={s.id} value={s.id}>{s.name}</option>
                         ))}
                      </select>
                   </div>

                   <div>
                      <h3 className="text-lg font-bold text-white mb-3">Itens Detectados ({items.length})</h3>
                      <div className="space-y-3">
                         {items.map((item, idx) => (
                            <div key={item.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center gap-3">
                               <div className="flex-1">
                                  <input
                                     type="text"
                                     value={item.name}
                                     onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                     className="w-full bg-transparent text-white text-sm border-b border-transparent focus:border-blue-500 outline-none pb-1"
                                  />
                               </div>
                               <div className="w-24">
                                  <input
                                     type="number"
                                     value={item.price}
                                     onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                                     className="w-full bg-slate-800 rounded px-2 py-1 text-white text-sm text-right font-mono"
                                  />
                               </div>
                               <button onClick={() => removeItem(item.id)} className="text-red-500 p-1">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         ))}
                      </div>
                      <button
                         onClick={() => setItems([...items, { id: Date.now(), name: 'Novo Item', price: 0 }])}
                         className="mt-4 text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300"
                      >
                         <Plus size={16} /> Adicionar item manualmente
                      </button>
                   </div>

                   <button
                     onClick={handleSave}
                     disabled={items.length === 0 || !selectedSupermarket}
                     className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                   >
                     <Save size={20} /> Salvar Itens
                   </button>

                </div>
             )}
          </div>
        )}
      </div>
    </Layout>
  );
}
