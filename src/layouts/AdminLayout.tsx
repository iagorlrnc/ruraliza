import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Home, 
  MessageSquare, 
  Users, 
  MessageCircle, 
  LogOut, 
  Menu, 
  X, 
  Globe,
  UserCheck,
  Sliders,
  Sun,
  Moon
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, loading, logout, isAdmin, isCorretor } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Sessão encerrada com sucesso.', 'info');
      navigate('/login');
    } catch (e) {
      showToast('Erro ao encerrar sessão.', 'error');
    }
  };

  const handleExitAdmin = () => {
    localStorage.removeItem('ruraliza_force_admin');
    const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
    if (isLocal) {
      const port = window.location.port ? `:${window.location.port}` : '';
      window.location.href = `${window.location.protocol}//localhost${port}/`;
    } else {
      const hostnameWithoutAdmin = window.location.hostname.replace('admin.', '');
      window.location.href = `${window.location.protocol}//${hostnameWithoutAdmin}/`;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-beige dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-medium border-t-transparent"></div>
          <p className="font-poppins text-sm text-primary-dark dark:text-white font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  // Route guarding
  if (!user || (!isAdmin && !isCorretor)) {
    // If not logged in or not admin/corretor, redirect to admin login
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Gestão de Imóveis', path: '/imoveis', icon: Home },
    { name: 'Mensagens Recebidas', path: '/mensagens', icon: MessageSquare },
    { name: 'Clientes (CRM)', path: '/clientes', icon: Users },
    ...(isAdmin ? [{ name: 'Gestão de Usuários', path: '/gestao-usuarios', icon: UserCheck }] : []),
    { name: 'Gestão de Vendedores', path: '/vendedores', icon: UserCheck },
    { name: 'Depoimentos', path: '/depoimentos', icon: MessageCircle },
    ...(isAdmin ? [{ name: 'Configurações', path: '/configuracoes', icon: Sliders }] : [])
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex overflow-hidden transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img 
              src={darkMode ? "/logo.png" : "/logolight.png"} 
              alt="Ruraliza" 
              className="h-10 sm:h-10 w-auto object-contain"
            />
          </div>
          <div>
            <span className="font-poppins text-base font-bold tracking-tight text-primary-dark dark:text-white block leading-tight">
              Ruraliza
            </span>
            <span className="font-sans text-[9px] tracking-widest font-bold text-primary-medium dark:text-primary-light block uppercase">
              Painel Admin
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-dark text-white dark:bg-zinc-800 shadow-md shadow-primary-dark/10'
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
          <button
            onClick={handleExitAdmin}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-primary-dark dark:text-primary-light hover:bg-primary-medium/10 dark:hover:bg-zinc-800 transition-colors"
          >
            <Globe className="h-4 w-4" />
            Visualizar Portal Público
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile drawer backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      {/* Sidebar - Mobile drawer container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col lg:hidden transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <img 
                src={darkMode ? "/logo.png" : "/logolight.png"} 
                alt="Ruraliza" 
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <span className="font-poppins text-base font-bold text-primary-dark dark:text-white block leading-tight">Ruraliza</span>
              <span className="font-sans text-[9px] tracking-widest font-bold text-primary-medium dark:text-primary-light block uppercase">
                Painel Admin
              </span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-dark text-white dark:bg-zinc-800'
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
          <button
            onClick={() => {
              setSidebarOpen(false);
              handleExitAdmin();
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-primary-dark dark:text-primary-light transition-colors"
          >
            <Globe className="h-4 w-4" />
            Ir para o Site Público
          </button>
          <button
            onClick={() => {
              setSidebarOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Administrative Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 lg:hidden text-gray-600 dark:text-zinc-300"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">
              {navItems.find((item) => isActive(item.path))?.name || 'Administração'}
            </h1>
          </div>

          {/* Topbar User Profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Alternar modo escuro"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary-medium/10 text-primary-dark dark:text-primary-light flex items-center justify-center font-bold text-sm">
                <UserCheck className="h-4.5 w-4.5" />
              </div>
              <div className="hidden sm:block text-right">
                <span className="block text-xs font-bold text-gray-800 dark:text-zinc-200">
                  {user.nome}
                </span>
                <span className="block text-[10px] text-primary-medium dark:text-primary-light font-semibold -mt-0.5">
                  Administrador
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
