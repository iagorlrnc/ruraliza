import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { TreePine, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { user, login, error, clearError, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to admin home
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    setSubmitting(true);
    clearError();

    try {
      await login(email, password);
    } catch (e: any) {
      showToast(e.message || 'Erro ao realizar login.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Expose authentication error from Context
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [error, clearError, showToast]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-primary-dark via-primary-medium to-emerald-950 p-4">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-light blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-light blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 text-left">
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary-dark text-brand-beige mx-auto flex items-center justify-center shadow-lg">
            <TreePine className="h-7 w-7 text-primary-light" />
          </div>
          <div className="space-y-1">
            <h2 className="font-poppins text-lg font-bold text-primary-dark dark:text-white leading-tight">
              Ruraliza Negócios Rurais
            </h2>
            <span className="font-sans text-[10px] tracking-[0.2em] font-semibold text-primary-medium uppercase block">
              Controle Administrativo
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
              E-mail Administrativo
            </label>
            <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-[2px] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
              <Mail className="h-4 w-4 text-gray-400 shrink-0 mr-2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@ruralizanegocios.com.br"
                className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
              Senha de Acesso
            </label>
            <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-[2px] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
              <Lock className="h-4 w-4 text-gray-400 shrink-0 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
          >
            {submitting ? 'Autenticando...' : 'Acessar Painel'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-gray-400">
            Acesso exclusivo para corretores credenciados Ruraliza.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
