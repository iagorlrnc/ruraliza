import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { api, isSupabaseConfigured } from '../services/api';
import { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync session on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Look for a mock admin session in LocalStorage
      const mockSession = localStorage.getItem('ruraliza_mock_admin_session');
      if (mockSession) {
        try {
          const parsed = JSON.parse(mockSession);
          setUser(parsed);
        } catch {
          localStorage.removeItem('ruraliza_mock_admin_session');
        }
      }
      setLoading(false);
      return;
    }

    // Supabase auth subscription
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await api.getUserById(session.user.id);
          if (profile && profile.perfil === 'Administrador') {
            setUser(profile);
          } else {
            // Logged in but not admin
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      } catch (e) {
        console.error('Auth sync error:', e);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        try {
          const profile = await api.getUserById(session.user.id);
          if (profile && profile.perfil === 'Administrador') {
            setUser(profile);
          } else {
            setError('Acesso negado: Este perfil não possui permissões de Administrador.');
            await supabase.auth.signOut();
            setUser(null);
          }
        } catch (e) {
          setError('Erro ao carregar perfil do usuário.');
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      // Mock login check
      await new Promise((resolve) => setTimeout(resolve, 800)); // simulate latency
      if (email.toLowerCase() === 'contato@ruralizanegocios.com.br' && password === 'admin123') {
        const mockAdmin: Usuario = {
          id: 'user-admin-1',
          nome: 'Renato Silva (Administrador)',
          email: 'contato@ruralizanegocios.com.br',
          telefone: '(11) 99999-9999',
          cidade: 'Presidente Prudente',
          perfil: 'Administrador',
          status: 'Ativo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(mockAdmin);
        localStorage.setItem('ruraliza_mock_admin_session', JSON.stringify(mockAdmin));
      } else {
        setError('E-mail ou senha administrativa incorretos. (Use contato@ruralizanegocios.com.br / admin123)');
      }
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        setError(signInError.message);
      }
    } catch (e: any) {
      setError(e.message || 'Erro inesperado durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setUser(null);
      localStorage.removeItem('ruraliza_mock_admin_session');
      setLoading(false);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (e: any) {
      console.error('Logout error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.perfil === 'Administrador',
        login,
        logout,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
