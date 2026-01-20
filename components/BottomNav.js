import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Search, Camera, MapPin, List } from 'lucide-react';

export default function BottomNav() {
  const router = useRouter();
  const pathname = router.pathname;

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Produtos', href: '/products', icon: Search },
    { name: 'Escanear', href: '/scan', icon: Camera, primary: true },
    { name: 'Mercados', href: '/supermarkets', icon: MapPin },
    { name: 'Listas', href: '/lists', icon: List },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href) && item.href !== '/' ? true : item.href === '/' && pathname === '/';

          if (item.primary) {
            return (
              <Link href={item.href} key={item.name} className="relative -top-5">
                <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-900/50 hover:bg-blue-500 transition-colors">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              href={item.href}
              key={item.name}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                active ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
