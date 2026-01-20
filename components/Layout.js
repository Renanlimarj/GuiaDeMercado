import BottomNav from './BottomNav';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-blue-500/30">
      <main className="pb-20 min-h-screen safe-area-inset-top safe-area-inset-bottom">
        <div className="max-w-md mx-auto min-h-screen bg-slate-950 shadow-2xl shadow-black relative">
          {children}
        </div>
      </main>
      <div className="max-w-md mx-auto relative">
        <BottomNav />
      </div>
    </div>
  );
}
