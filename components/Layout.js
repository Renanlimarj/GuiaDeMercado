import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useSupermarket } from '../context/SupermarketContext';
import { ShoppingCart, Search, Plus, LogOut, MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
  const { data: session } = useSession();
  const { selectedSupermarket, setSupermarket } = useSupermarket();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            GuiaDeMercado
          </Link>

          {/* Desktop Nav */}
          <div className="md:flex items-center gap-4 hidden">
            {selectedSupermarket && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                padding: '0.4rem 0.8rem', borderRadius: '999px', 
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.875rem'
              }}>
                <MapPin size={14} color="#3b82f6" />
                <span style={{ fontWeight: 500, maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedSupermarket.name}
                </span>
                <button 
                  onClick={() => setSupermarket(null)}
                  style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Alterar
                </button>
              </div>
            )}
            
            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/list" style={{ padding: '0.5rem', display: 'flex' }}>
                  <ShoppingCart size={20} color="#cbd5e1" />
                </Link>
                <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>{session.user.name}</span>
                  <button 
                    onClick={() => signOut()}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', color: '#94a3b8' }}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link href="/api/auth/signin" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  Entrar
                </Link>
                <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div style={{ 
            position: 'absolute', top: '70px', left: 0, right: 0, 
            background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            {selectedSupermarket && (
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div className="flex items-center gap-3">
                  <MapPin size={16} color="#3b82f6" />
                  <span style={{ fontWeight: 500 }}>{selectedSupermarket.name}</span>
                </div>
                <button 
                  onClick={() => { setSupermarket(null); setIsMenuOpen(false); }}
                  style={{ fontSize: '0.875rem', color: '#3b82f6', background: 'none', border: 'none' }}
                >
                  Alterar
                </button>
              </div>
            )}
            
            {session ? (
              <>
                <Link href="/list" className="flex items-center gap-3 p-2" style={{ color: '#f8fafc' }}>
                  <ShoppingCart size={20} />
                  <span>Minha Lista</span>
                </Link>
                <Link href="/prices/new" className="flex items-center gap-3 p-2" style={{ color: '#f8fafc' }}>
                  <Plus size={20} />
                  <span>Registrar Preço</span>
                </Link>
                <Link href="/search" className="flex items-center gap-3 p-2" style={{ color: '#f8fafc' }}>
                  <Search size={20} />
                  <span>Buscar</span>
                </Link>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                <button onClick={() => signOut()} className="flex items-center gap-3 p-2" style={{ color: '#ef4444', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                  <LogOut size={20} />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/api/auth/signin" className="btn btn-secondary" style={{ width: '100%' }}>
                  Entrar
                </Link>
                <Link href="/auth/signup" className="btn btn-primary" style={{ width: '100%' }}>
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, paddingTop: '90px', paddingBottom: '80px' }}>
        <div className="container animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      {session && (
        <div className="md:hidden" style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.1)', height: '64px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', zIndex: 50
        }}>
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#94a3b8' }}>
            <MapPin size={20} />
            <span style={{ fontSize: '10px' }}>Início</span>
          </Link>
          <Link href="/search" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#94a3b8' }}>
            <Search size={20} />
            <span style={{ fontSize: '10px' }}>Buscar</span>
          </Link>
          <Link href="/prices/new" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#94a3b8' }}>
            <div style={{ 
              padding: '0.5rem', background: '#2563eb', borderRadius: '50%', color: 'white',
              marginTop: '-24px', border: '4px solid #0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <Plus size={24} />
            </div>
          </Link>
          <Link href="/list" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#94a3b8' }}>
            <ShoppingCart size={20} />
            <span style={{ fontSize: '10px' }}>Lista</span>
          </Link>
        </div>
      )}
    </div>
  );
}
