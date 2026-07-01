import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'ruraliza_cookie_consent';

const CookieConsent: React.FC = () => {
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    marketing: true,
  });

  const initializeAnalytics = () => {
    if (document.getElementById('ruraliza-analytics-script')) return;

    // Inject Google Analytics tag dynamically
    const script = document.createElement('script');
    script.id = 'ruraliza-analytics-script';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-MOCKTRACK';
    script.async = true;
    document.head.appendChild(script);

    // Initialize global gtag function
    const scriptInit = document.createElement('script');
    scriptInit.id = 'ruraliza-analytics-init';
    scriptInit.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-MOCKTRACK', { 'anonymize_ip': true });
      console.log('Google Analytics (G-MOCKTRACK) inicializado com sucesso via consentimento.');
    `;
    document.head.appendChild(scriptInit);
  };

  const cleanupAnalytics = () => {
    const script = document.getElementById('ruraliza-analytics-script');
    if (script) script.remove();

    const scriptInit = document.getElementById('ruraliza-analytics-init');
    if (scriptInit) scriptInit.remove();

    const win = window as any;
    if (win.dataLayer) {
      try {
        delete win.dataLayer;
      } catch (e) {
        win.dataLayer = undefined;
      }
    }
    if (win.gtag) {
      try {
        delete win.gtag;
      } catch (e) {
        win.gtag = undefined;
      }
    }
    win['ga-disable-G-MOCKTRACK'] = true;
  };

  const applyCookies = (prefs: CookiePreferences) => {
    // 1. Essential Cookies (always active)
    
    // 2. Functional Cookies
    if (prefs.functional) {
      console.log('Cookies Funcionais ativos: Permitindo persistência de tema.');
    } else {
      console.log('Cookies Funcionais inativos: Removendo preferências de tema armazenadas.');
      localStorage.removeItem('ruraliza_dark_mode');
    }

    // 3. Analytical & Marketing Cookies
    if (prefs.marketing) {
      console.log('Cookies Analíticos/Marketing ativos: Inicializando scripts de rastreamento.');
      initializeAnalytics();
    } else {
      console.log('Cookies Analíticos/Marketing inativos: Desativando scripts de rastreamento.');
      cleanupAnalytics();
    }
  };

  // Check if consent has already been given
  useEffect(() => {
    const savedConsent = localStorage.getItem(STORAGE_KEY);
    if (!savedConsent) {
      // Small delay for better UX entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
        applyCookies(parsed);
      } catch (e) {
        console.error('Error parsing cookie consent preferences', e);
      }
    }
  }, []);

  // Listen to custom global event to open consent settings from footer links
  useEffect(() => {
    const handleOpenSettings = () => {
      setIsVisible(true);
    };
    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = {
      essential: true,
      functional: true,
      marketing: true,
    };
    setPreferences(allPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPreferences));
    setIsVisible(false);
    applyCookies(allPreferences);
  };

  const handleRejectAll = () => {
    const minPreferences = {
      essential: true,
      functional: false,
      marketing: false,
    };
    setPreferences(minPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(minPreferences));
    setIsVisible(false);
    applyCookies(minPreferences);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setIsVisible(false);
    applyCookies(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Cannot toggle essential cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md md:max-w-lg z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-zinc-850 p-6 shadow-2xl space-y-5 text-left font-sans transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 flex items-center justify-center shrink-0">
              <img 
                src={darkMode ? '/logo.png' : '/logolight.png'} 
                alt="Ruraliza" 
                className="h-8 w-auto object-contain"
                data-no-protect="true"
              />
            </div>
            <div>
              <h3 className="font-poppins text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                Controle de Privacidade
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                Respeitamos a sua privacidade e a conformidade legal (LGPD)
              </p>
            </div>
          </div>
        </div>

        {/* Short Text Explaining Cookies (Transparência) */}
        {!showCustomize ? (
          <p className="text-xs text-gray-650 dark:text-zinc-400 leading-relaxed">
            Utilizamos cookies para melhorar sua experiência de navegação, salvar suas preferências de layout/filtro, gerar estatísticas de tráfego analítico e fornecer publicidade direcionada. Ao clicar em <strong>"Aceitar Todos"</strong>, você concorda com o uso de todas as categorias. Para mais detalhes, leia nossa <Link to="/politica-de-privacidade" onClick={() => setIsVisible(false)} className="text-primary-medium hover:underline font-bold">Política de Privacidade</Link>.
          </p>
        ) : (
          <div className="space-y-3.5 max-h-[30vh] overflow-y-auto pr-1">
            <p className="text-[11px] text-gray-550 dark:text-zinc-400 leading-relaxed border-b border-gray-100 dark:border-zinc-900 pb-2">
              Personalize suas preferências abaixo. Os cookies essenciais são necessários para o funcionamento básico e segurança da plataforma.
            </p>

            {/* Essential Category (Essenciais) */}
            <div className="flex items-start justify-between gap-3 p-3.5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-150/40 dark:border-zinc-850 rounded-2xl">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="block text-xs font-bold text-gray-850 dark:text-white flex items-center gap-1.5">
                  Cookies Essenciais
                  <span className="text-[8px] bg-primary-medium/20 text-primary-dark dark:text-primary-light border border-primary-medium/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    Obrigatório
                  </span>
                </span>
                <span className="block text-[10px] text-gray-400 dark:text-zinc-500 leading-relaxed">
                  Mantêm você logado com segurança e lembram suas escolhas básicas de navegação ou filtros temporários de busca.
                </span>
              </div>
              <div className="relative inline-flex items-center cursor-not-allowed">
                <input 
                  type="checkbox" 
                  checked 
                  disabled 
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-primary-medium rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-medium"></div>
              </div>
            </div>

            {/* Functional Category (Funcionais) */}
            <div 
              onClick={() => togglePreference('functional')}
              className="flex items-start justify-between gap-3 p-3.5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-150/40 dark:border-zinc-850 rounded-2xl cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-900 transition-colors"
            >
              <div className="space-y-0.5 max-w-[80%]">
                <span className="block text-xs font-bold text-gray-850 dark:text-white">
                  Cookies Funcionais
                </span>
                <span className="block text-[10px] text-gray-400 dark:text-zinc-500 leading-relaxed">
                  Salvam suas preferências de layout do site e tema (escuro/claro), para que você não precise configurá-los novamente em suas próximas visitas.
                </span>
              </div>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={preferences.functional}
                  onChange={() => {}}
                  className="sr-only peer"
                />
                <div className={`w-9 h-5 rounded-full transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                  preferences.functional 
                    ? 'bg-primary-medium after:translate-x-4' 
                    : 'bg-gray-200 dark:bg-zinc-800'
                }`}></div>
              </div>
            </div>

            {/* Marketing / Analytics Category (Analíticos e Marketing) */}
            <div 
              onClick={() => togglePreference('marketing')}
              className="flex items-start justify-between gap-3 p-3.5 bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-150/40 dark:border-zinc-850 rounded-2xl cursor-pointer hover:bg-gray-100/50 dark:hover:bg-zinc-900 transition-colors"
            >
              <div className="space-y-0.5 max-w-[80%]">
                <span className="block text-xs font-bold text-gray-850 dark:text-white">
                  Cookies Analíticos e Marketing
                </span>
                <span className="block text-[10px] text-gray-400 dark:text-zinc-500 leading-relaxed">
                  Rastreiam o comportamento de navegação (páginas mais visualizadas, tempo no site) para gerar relatórios estatísticos e exibir anúncios mais relevantes de imóveis.
                </span>
              </div>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={preferences.marketing}
                  onChange={() => {}}
                  className="sr-only peer"
                />
                <div className={`w-9 h-5 rounded-full transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                  preferences.marketing 
                    ? 'bg-primary-medium after:translate-x-4' 
                    : 'bg-gray-200 dark:bg-zinc-800'
                }`}></div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons (Controle de Dados) */}
        <div className="flex flex-col sm:flex-row gap-2 border-t border-gray-100 dark:border-zinc-900 pt-4">
          {!showCustomize ? (
            <>
              <button
                onClick={() => setShowCustomize(true)}
                className="flex-1 rounded-2xl border border-gray-200 dark:border-zinc-800 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Settings className="h-4 w-4 shrink-0" />
                Personalizar
              </button>
              <button
                onClick={handleRejectAll}
                className="rounded-2xl border border-gray-200 dark:border-zinc-800 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
              >
                Recusar
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 rounded-2xl bg-primary-medium hover:bg-primary-dark text-white px-5 py-2.5 text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4 shrink-0" />
                Aceitar Todos
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowCustomize(false)}
                className="rounded-2xl border border-gray-200 dark:border-zinc-800 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 rounded-2xl bg-gray-900 dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 text-white px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Salvar Preferências
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 rounded-2xl bg-primary-medium hover:bg-primary-dark text-white px-5 py-2.5 text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4 shrink-0" />
                Aceitar Todos
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
