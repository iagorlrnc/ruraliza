import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { api, isSupabaseConfigured } from '../services/api';
import { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  isAdmin: boolean;
  isCorretor: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRef = useRef<Usuario | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const clearError = () => setError(null);

  // Sync session on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase não está configurado. Autenticação indisponível.');
      setLoading(false);
      return;
    }

    // Supabase auth subscription
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const wasRegistering = sessionStorage.getItem('ruraliza_is_registering');
          if (wasRegistering) {
            sessionStorage.removeItem('ruraliza_is_registering');
            await supabase.auth.signOut();
            setUser(null);
            return;
          }

          const profile = await api.getUserById(session.user.id);
          if (profile && (profile.perfil === 'Administrador' || profile.perfil === 'Corretor')) {
            if (profile.status === 'Ativo') {
              setUser(profile);
            } else if (profile.status === 'Pendente') {
              setError('Seu cadastro está pendente de aprovação pelo administrador.');
              await supabase.auth.signOut();
              setUser(null);
            } else {
              setError('Seu acesso está inativo. Entre em contato com o administrador.');
              await supabase.auth.signOut();
              setUser(null);
            }
          } else {
            // Logged in but not allowed
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
        if (userRef.current && userRef.current.id === session.user.id) {
          return;
        }
        const wasRegistering = sessionStorage.getItem('ruraliza_is_registering');
        if (wasRegistering) {
          sessionStorage.removeItem('ruraliza_is_registering');
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        setLoading(true);
        try {
          const profile = await api.getUserById(session.user.id);
          if (profile && (profile.perfil === 'Administrador' || profile.perfil === 'Corretor')) {
            if (profile.status === 'Ativo') {
              setUser(profile);
            } else if (profile.status === 'Pendente') {
              setError('Seu cadastro está pendente de aprovação pelo administrador.');
              await supabase.auth.signOut();
              setUser(null);
            } else {
              setError('Seu acesso está inativo. Entre em contato com o administrador.');
              await supabase.auth.signOut();
              setUser(null);
            }
          } else {
            setError('Acesso negado: Perfil sem permissão para acessar o painel.');
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

  const login = async (email: string, password: string, captchaToken?: string) => {
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setError('Sistema de autenticação não disponível. Contate o administrador.');
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken
        }
      });
      if (signInError) {
        const translatedMessage = signInError.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : signInError.message;
        setError(translatedMessage);
      }
    } catch (e: any) {
      setError(e.message || 'Erro inesperado durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
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
        isCorretor: user?.perfil === 'Corretor',
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
