import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ruraliza_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return false; // Default theme is light theme
  });

  const timeoutRef = useRef<any>(null);

  const toggleDarkMode = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const existingStyle = document.getElementById('theme-transition-override');
    if (existingStyle) {
      existingStyle.remove();
    }

    const css = document.createElement('style');
    css.id = 'theme-transition-override';
    css.type = 'text/css';
    css.appendChild(
      document.createTextNode(
        `* {
           -webkit-transition: background-color 350ms cubic-bezier(0.4, 0, 0.2, 1), border-color 350ms cubic-bezier(0.4, 0, 0.2, 1), color 350ms cubic-bezier(0.4, 0, 0.2, 1), fill 350ms cubic-bezier(0.4, 0, 0.2, 1), stroke 350ms cubic-bezier(0.4, 0, 0.2, 1) !important;
           -moz-transition: background-color 350ms cubic-bezier(0.4, 0, 0.2, 1), border-color 350ms cubic-bezier(0.4, 0, 0.2, 1), color 350ms cubic-bezier(0.4, 0, 0.2, 1), fill 350ms cubic-bezier(0.4, 0, 0.2, 1), stroke 350ms cubic-bezier(0.4, 0, 0.2, 1) !important;
           -o-transition: background-color 350ms cubic-bezier(0.4, 0, 0.2, 1), border-color 350ms cubic-bezier(0.4, 0, 0.2, 1), color 350ms cubic-bezier(0.4, 0, 0.2, 1), fill 350ms cubic-bezier(0.4, 0, 0.2, 1), stroke 350ms cubic-bezier(0.4, 0, 0.2, 1) !important;
           -ms-transition: background-color 350ms cubic-bezier(0.4, 0, 0.2, 1), border-color 350ms cubic-bezier(0.4, 0, 0.2, 1), color 350ms cubic-bezier(0.4, 0, 0.2, 1), fill 350ms cubic-bezier(0.4, 0, 0.2, 1), stroke 350ms cubic-bezier(0.4, 0, 0.2, 1) !important;
           transition: background-color 350ms cubic-bezier(0.4, 0, 0.2, 1), border-color 350ms cubic-bezier(0.4, 0, 0.2, 1), color 350ms cubic-bezier(0.4, 0, 0.2, 1), fill 350ms cubic-bezier(0.4, 0, 0.2, 1), stroke 350ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        }`
      )
    );
    document.head.appendChild(css);

    setDarkMode(prev => !prev);

    // Remove the style block after the transition has completed (350ms + small buffer) to restore regular transitions
    timeoutRef.current = setTimeout(() => {
      const styleToRemove = document.getElementById('theme-transition-override');
      if (styleToRemove) {
        styleToRemove.remove();
      }
      timeoutRef.current = null;
    }, 400);
  };

  useEffect(() => {
    // Check if functional cookies are allowed in preferences
    const consent = localStorage.getItem('ruraliza_cookie_consent');
    let allowFunctional = true;
    if (consent) {
      try {
        allowFunctional = JSON.parse(consent).functional;
      } catch {
        allowFunctional = true;
      }
    }

    if (darkMode) {
      document.documentElement.classList.add('dark');
      if (allowFunctional) {
        localStorage.setItem('ruraliza_dark_mode', 'true');
      } else {
        localStorage.removeItem('ruraliza_dark_mode');
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (allowFunctional) {
        localStorage.setItem('ruraliza_dark_mode', 'false');
      } else {
        localStorage.removeItem('ruraliza_dark_mode');
      }
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
