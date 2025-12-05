import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadScript = () => {
      if (window.Html5QrcodeScanner) {
        setLoading(false);
        initScanner();
        return;
      }

      const script = document.createElement('script');
      script.src = "https://unpkg.com/html5-qrcode";
      script.async = true;
      script.onload = () => {
        setLoading(false);
        initScanner();
      };
      script.onerror = () => {
        setError("Falha ao carregar biblioteca de scanner.");
        setLoading(false);
      };
      document.body.appendChild(script);
    };

    loadScript();

    return () => {
      // Cleanup logic if needed
      const element = document.getElementById('reader');
      if (element) element.innerHTML = '';
    };
  }, []);

  const initScanner = () => {
    try {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const scanner = new window.Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            onScan(decodedText);
            scanner.clear();
          },
          (errorMessage) => {
            // ignore errors during scanning
          }
        );
      }, 100);
    } catch (err) {
      console.error("Scanner init error:", err);
      setError("Erro ao inicializar câmera.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl overflow-hidden border border-white/10 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2 text-white">Escanear Código</h3>
          <p className="text-slate-400 text-sm mb-6">Aponte a câmera para o código de barras do produto.</p>
          
          <div className="relative aspect-square bg-black rounded-xl overflow-hidden border-2 border-dashed border-white/20">
            <div id="reader" className="w-full h-full"></div>
            
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center text-red-400 p-4">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
