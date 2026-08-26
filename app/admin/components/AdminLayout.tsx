'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartLine, 
  FaUsers, 
  FaRoute, 
  FaMoneyBillWave, 
  FaCalendarCheck, 
  FaChartBar, 
  FaCog, 
  FaBars, 
  FaTimes, 
  FaBell, 
  FaSearch, 
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface User {
  prenom: string;
  nom: string;
  email: string;
  roles: string[];
}

const menuItems = [
  { icon: FaChartLine, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: FaUsers, label: 'Utilisateurs', path: '/admin/utilisateurs' },
  { icon: FaRoute, label: 'Trajets', path: '/admin/trajets' },
  { icon: FaMoneyBillWave, label: 'Paiements', path: '/admin/paiements' },
  { icon: FaCalendarCheck, label: 'Réservations', path: '/admin/reservations' },
  { icon: FaChartBar, label: 'Statistiques', path: '/admin/statistiques' },
  { icon: FaCog, label: 'Paramètres', path: '/admin/parametres' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Récupérer l'utilisateur
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* ========== SIDEBAR ========== */}
      <aside
        className={`fixed md:relative z-50 h-screen bg-white border-r border-gray-100 shadow-xl transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-0 md:w-24'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between p-5 border-b border-gray-100 ${!sidebarOpen && 'md:justify-center'}`}>
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <img src="/covocam_logo.png" alt="CovoCam"
                className="w-11 h-11 rounded-2xl object-contain shadow-lg shadow-emerald-500/30" />
              {sidebarOpen && (
                <div>
                  <span className="block text-[10px] text-gray-400 font-medium tracking-wider uppercase">Administration</span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-gray-600 md:hidden"
            >
              <FaTimes />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className={`text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3 ${!sidebarOpen && 'md:hidden'}`}>
              Navigation
            </p>
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                  }`}
                >
                  <item.icon className={`text-xl ${active ? 'scale-110' : ''}`} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {active && sidebarOpen && (
                    <span className="ml-auto w-1.5 h-8 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/30">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Administrateur</p>
                </div>
              )}
              {sidebarOpen && (
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-rose-500 transition-colors text-lg p-2 hover:bg-rose-50 rounded-xl"
                >
                  <FaSignOutAlt />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                <FaBars />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Administration</h1>
                <p className="text-xs text-gray-400 font-medium">Gérez votre plateforme</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                <FaBell className="text-xl" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/25">
                  0
                </span>
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaSearch className="text-xl" />
              </button>
              <div className="w-px h-8 bg-gray-200 hidden md:block" />
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/30">
                  {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-medium text-gray-700">{user?.prenom} {user?.nom}</p>
                  <p className="text-[10px] text-gray-400">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}