import { NavLink } from 'react-router-dom';
import { Home, Tag, MapPin, Settings } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/categories', icon: Tag, label: '分类' },
    { to: '/locations', icon: MapPin, label: '位置' },
    { to: '/settings', icon: Settings, label: '设置' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-100 z-40">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 transition-colors min-h-[56px] ${
                isActive ? 'text-green-600' : 'text-stone-400'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
