import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

// Custom SVG Icons to avoid lucide-react version compatibility issues
const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 1. Prevent right-click and drag on images
    const preventActions = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventActions);
    document.addEventListener('dragstart', preventActions);

    // Prevent copying content
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData('text/plain', 'Conteúdo Protegido pela Ruraliza Negócios Rurais');
    };
    document.addEventListener('copy', handleCopy);

    // 2. Block print shortcut Ctrl+P / Cmd+P and key print screen combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
      }

      // PrintScreen key down
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        setShowWatermark(true);
        try {
          navigator.clipboard.writeText('Conteúdo Protegido pela Ruraliza Negócios Rurais');
        } catch {}
      }

      // Block Win+Shift+S or Cmd+Shift+S / Cmd+Shift+4 / Cmd+Shift+3
      if (
        (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) || 
        (e.metaKey && e.shiftKey && (e.key === '4' || e.key === '3'))
      ) {
        setShowWatermark(true);
        try {
          navigator.clipboard.writeText('Conteúdo Protegido pela Ruraliza Negócios Rurais');
        } catch {}
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        setShowWatermark(true);
        try {
          navigator.clipboard.writeText('Conteúdo Protegido pela Ruraliza Negócios Rurais');
        } catch {}
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 3. Screen print / focus-blur protection
    const handleBlur = () => {
      setShowWatermark(true);
      try {
        navigator.clipboard.writeText('Conteúdo Protegido pela Ruraliza Negócios Rurais');
      } catch {}
    };
    const handleFocus = () => {
      setShowWatermark(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowWatermark(true);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', preventActions);
      document.removeEventListener('dragstart', preventActions);
      document.removeEventListener('copy', handleCopy);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const { data: config } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getConfiguracoes
  });

  const menuItems = [
    { name: 'Início', path: '/' },
    { name: 'Imóveis', path: '/imoveis' },
    { name: 'Sobre Nós', path: '/sobre' },
    { name: 'Equipe', path: '/equipe' },
    { name: 'Contato', path: '/contato' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isHome = location.pathname === '/';

  return (
    <div className={`public-layout min-h-screen flex flex-col bg-brand-beige dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 transition-colors duration-300 ${showWatermark ? 'watermark-active' : ''}`}>
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 border-b border-primary-dark/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-all duration-500 ${
        isHome && !scrolled 
          ? '-translate-y-full opacity-0 pointer-events-none' 
          : 'translate-y-0 opacity-100'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img 
              src="/logonome.png" 
              alt="Ruraliza" 
              className="h-8 sm:h-10 w-auto object-contain"
              data-no-protect
              />
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
      <main className={`flex-1 ${isHome ? '' : 'pt-20'}`}>
        <Outlet />
      </main>

      {/* Corporate Footer */}
      <footer className="bg-primary-dark text-white dark:bg-zinc-900 border-t border-primary-medium/20 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand Info */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2">
                  <img 
                    src="/logonome.png" 
                    alt="Ruraliza" 
                    className="h-12 sm:h-12 w-auto object-contain"
                    data-no-protect
                  />
                
              </div>
              <p className="text-xs text-brand-beige-dark/70 font-sans leading-relaxed">
                Especialistas em intermediação imobiliária rural. Conectando investidores e produtores às melhores fazendas, sítios e áreas agrícolas do Brasil com segurança jurídica e excelência técnica.
              </p>
              {/* Social icons if present */}
              {(config?.social_facebook || config?.social_instagram || config?.social_linkedin || config?.social_whatsapp) && (
                <div className="flex gap-3 pt-2">
                  {config.social_facebook && (
                    <a href={config.social_facebook} target="_blank" rel="noopener noreferrer" className="text-brand-beige-dark/60 hover:text-white transition-colors">
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {config.social_instagram && (
                    <a href={config.social_instagram} target="_blank" rel="noopener noreferrer" className="text-brand-beige-dark/60 hover:text-white transition-colors">
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {config.social_linkedin && (
                    <a href={config.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-brand-beige-dark/60 hover:text-white transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Column 2: Navigation Links */}
            <div className="text-left">
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
            <div className="text-left">
              <h3 className="font-poppins text-sm font-semibold uppercase tracking-wider text-primary-light mb-4">
                Fale Conosco
              </h3>
              <ul className="space-y-3 text-sm text-brand-beige-dark/80">
                <li className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-primary-light mt-0.5" />
                  <span>
                    {config?.telefone || '(99) 99999-9999'}
                    {config?.telefone_secundario ? ` / ${config.telefone_secundario}` : ''}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-primary-light mt-0.5" />
                  <span className="break-all">{config?.email || 'contato@ruralizanegocios.com.br'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-primary-light mt-0.5" />
                  <span className="leading-snug">{config?.endereco || 'Palmas -TO'}</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Real Estate CRECI */}
            <div className="text-left">
              <h3 className="font-poppins text-sm font-semibold uppercase tracking-wider text-primary-light mb-4">
                Credenciais
              </h3>
              <div className="bg-primary-medium/20 dark:bg-zinc-800/50 p-4 rounded-xl border border-primary-medium/30 space-y-2">
                <p className="text-xs text-brand-beige-dark/80">
                  CRECI Jurídico: <strong className="text-white">{config?.creci || '35.421-J'}</strong>
                </p>
                <p className="text-[11px] text-brand-beige-dark/60 leading-relaxed">
                  Todas as propriedades passam por rigorosa auditoria documental antes de serem anunciadas.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-primary-medium/10 pt-6 text-center text-xs text-brand-beige-dark/50">
            &copy; {new Date().getFullYear()} Ruraliza Negócios. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Global Image Protection CSS + Watermark on images only */}
      <style>{`
        @media print {
          body {
            display: none !important;
          }
        }
        /* Exclude leaflet components completely from any image protection */
        .leaflet-container img, 
        .leaflet-marker-icon, 
        .leaflet-marker-shadow, 
        .leaflet-tile {
          -webkit-user-drag: auto !important;
          user-select: auto !important;
          pointer-events: auto !important;
          filter: none !important;
        }

        .public-layout img:not(.leaflet-tile):not(.leaflet-marker-icon):not(.leaflet-marker-shadow) {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-select: none !important;
          pointer-events: none !important;
        }

        /* When watermark is active, blur all content images and show logo overlay */
        .public-layout.watermark-active img:not([data-no-protect]):not(.leaflet-tile):not(.leaflet-marker-icon):not(.leaflet-marker-shadow) {
          filter: blur(16px) brightness(0.5) !important;
          transition: filter 0.2s ease;
        }

        /* Exclude leaflet map containers from watermark overlay */
        .leaflet-container img {
          filter: none !important;
        }

        /* Overlay the logo watermark on every image container */
        .public-layout.watermark-active *:not(.leaflet-container):not(.leaflet-tile-pane):not(.leaflet-layer):has(> img:not([data-no-protect]):not(.leaflet-tile):not(.leaflet-marker-icon):not(.leaflet-marker-shadow)) {
          position: relative;
        }
        .public-layout.watermark-active *:not(.leaflet-container):not(.leaflet-tile-pane):not(.leaflet-layer):has(> img:not([data-no-protect]):not(.leaflet-tile):not(.leaflet-marker-icon):not(.leaflet-marker-shadow))::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 20;
          background: url('/logonome.png') center / 40% no-repeat;
          pointer-events: none;
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
};

export default PublicLayout;
