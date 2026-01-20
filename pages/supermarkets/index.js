import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, Plus, Navigation } from 'lucide-react';
import Layout from '../../components/Layout';
import { useGeolocation } from '../../hooks/useGeolocation';

export default function SupermarketsList() {
  const [supermarkets, setSupermarkets] = useState([]);
  const { location } = useGeolocation();

  useEffect(() => {
    fetch('/api/supermarkets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSupermarkets(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sortedSupermarkets = [...supermarkets].sort((a, b) => {
     if (!location) return 0;
     const distA = calculateDistance(location.latitude, location.longitude, a.latitude, a.longitude) || 9999;
     const distB = calculateDistance(location.latitude, location.longitude, b.latitude, b.longitude) || 9999;
     return distA - distB;
  });

  return (
    <Layout>
      <div className="p-4 pt-8 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Supermercados</h1>
          <Link href="/supermarkets/new" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg">
            <Plus size={24} />
          </Link>
        </div>

        <div className="space-y-4">
          {sortedSupermarkets.map((market) => {
             const dist = location ? calculateDistance(location.latitude, location.longitude, market.latitude, market.longitude) : null;

             return (
              <div key={market.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-white">{market.name}</h3>
                    <div className="flex items-center text-slate-400 text-sm mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span className="truncate max-w-[200px]">{market.address || 'Endereço não informado'}</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-800 px-2 py-1 rounded-lg">
                    <Star size={14} className="text-yellow-400 mr-1" fill="currentColor" />
                    <span className="font-bold text-sm text-white">{market.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                   <div className="text-xs text-slate-500">
                     {dist ? `${dist.toFixed(1)} km de distância` : ''}
                   </div>
                   {market.latitude && (
                     <a
                       href={`https://www.google.com/maps/dir/?api=1&destination=${market.latitude},${market.longitude}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-blue-400 text-xs flex items-center hover:underline"
                     >
                       <Navigation size={12} className="mr-1" /> Ver rota
                     </a>
                   )}
                </div>
              </div>
             );
          })}

          {supermarkets.length === 0 && (
            <div className="text-center text-slate-500 mt-10">
              <p>Nenhum supermercado cadastrado.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
