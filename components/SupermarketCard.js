import { MapPin, ArrowRight } from 'lucide-react';

export default function SupermarketCard({ supermarket, distance, onSelect }) {
  return (
    <div 
      onClick={() => onSelect(supermarket)}
      className="supermarket-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem', color: '#f8fafc' }}>
            {supermarket.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <MapPin size={14} />
            <span>{supermarket.address || 'Endereço não informado'}</span>
          </div>
        </div>
        
        {distance !== undefined && distance !== Infinity && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distância</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#34d399' }}>{distance.toFixed(1)} km</span>
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Toque para selecionar</span>
        <div style={{ 
          padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
          color: '#94a3b8', display: 'flex'
        }}>
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}
