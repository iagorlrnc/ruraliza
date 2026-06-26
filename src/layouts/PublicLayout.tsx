import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, TreePine, MapPin, Phone, Mail } from 'lucide-react';

const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Início', path: '/' },
    { name: 'Imóveis', path: '/imoveis' },
    { name: 'Sobre Nós', path: '/sobre' },
    { name: 'Contato', path: '/contato' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-beige dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-primary-dark/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-dark text-brand-beige transition-transform group-hover:scale-105">
                <TreePine className="h-6 w-6 text-primary-light" />
              </div>
              <div>
                <span className="font-poppins text-xl font-bold tracking-tight text-primary-dark dark:text-white block leading-tight">
                  Ruraliza
                </span>
                <span className="font-sans text-[10px] tracking-[0.2em] font-semibold text-primary-medium dark:text-primary-light block -mt-1 uppercase">
                  Negócios Rurais
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-poppins text-sm font-medium transition-colors hover:text-primary-medium dark:hover:text-primary-light ${
                    isActive(item.path)
                      ? 'text-primary-dark dark:text-white border-b-2 border-primary-medium pb-1'
                      : 'text-gray-600 dark:text-zinc-400'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Header Right Actions */}
            <div className="hidden md:flex items-center gap-4">
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-300">
            <div className="space-y-1 px-4 py-3">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 font-poppins text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-dark/5 text-primary-dark dark:bg-zinc-800 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {/* Removed Mobile Admin login */}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Corporate Footer */}
      <footer className="bg-primary-dark text-white dark:bg-zinc-900 border-t border-primary-medium/20 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-medium text-white">
                  <TreePine className="h-5 w-5 text-primary-light" />
                </div>
                <span className="font-poppins text-lg font-bold block leading-tight text-white">
                  Ruraliza Negócios
                </span>
              </div>
              <p className="text-xs text-brand-beige-dark/70 font-sans leading-relaxed">
                Especialistas em intermediação imobiliária rural. Conectando investidores e produtores às melhores fazendas, sítios e áreas agrícolas do Brasil com segurança jurídica e excelência técnica.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h3 className="font-poppins text-sm font-semibold uppercase tracking-wider text-primary-light mb-4">
                Navegação
              </h3>
              <ul className="space-y-2 text-sm text-brand-beige-dark/80">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="hover:text-primary-light transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h3 className="font-poppins text-sm font-semibold uppercase tracking-wider text-primary-light mb-4">
                Fale Conosco
              </h3>
              <ul className="space-y-3 text-sm text-brand-beige-dark/80">
                <li className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-primary-light mt-0.5" />
                  <span>(18) 3222-1234 / (18) 99888-7766</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-primary-light mt-0.5" />
                  <span className="break-all">contato@ruralizanegocios.com.br</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-primary-light mt-0.5" />
                  <span className="leading-snug">Av. Coronel José Soares Marcondes, 1500 - Centro, Presidente Prudente - SP</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Real Estate CRECI */}
            <div>
              <h3 className="font-poppins text-sm font-semibold uppercase tracking-wider text-primary-light mb-4">
                Credenciais
              </h3>
              <div className="bg-primary-medium/20 dark:bg-zinc-800/50 p-4 rounded-xl border border-primary-medium/30 space-y-2">
                <p className="text-xs text-brand-beige-dark/80">
                  CRECI Jurídico: <strong className="text-white">35.421-J</strong>
                </p>
                <p className="text-[11px] text-brand-beige-dark/60 leading-relaxed">
                  Todas as propriedades passam por rigorosa auditoria documental antes de serem anunciadas.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-primary-medium/10 pt-6 text-center text-xs text-brand-beige-dark/50">
            &copy; {new Date().getFullYear()} Ruraliza Negócios Imobiliários Ltda. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
