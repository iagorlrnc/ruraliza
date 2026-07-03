import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api, isSupabaseConfigured } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Eye, EyeOff, User, Phone, ShieldCheck } from 'lucide-react';
import { maskPhone, maskCreci } from '../../utils/masks';
import { useTheme } from '../../contexts/ThemeContext';

const AdminLogin: React.FC = () => {
  const { user, login, error, clearError, isAdmin, isCorretor } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toggle mode
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration state
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regPerfil, setRegPerfil] = useState<'Administrador' | 'Corretor'>('Corretor');
  const [regCreci, setRegCreci] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regConfirmarSenha, setRegConfirmarSenha] = useState('');
  const [showRegSenha, setShowRegSenha] = useState(false);
  const [showRegConfirmarSenha, setShowRegConfirmarSenha] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-200', textClass: 'text-gray-400' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 2) {
      return { score, label: 'Senha Fraca', color: 'bg-red-500', textClass: 'text-red-500' };
    }
    if (score <= 4) {
      return { score, label: 'Senha Média', color: 'bg-yellow-500', textClass: 'text-yellow-500' };
    }
    return { score, label: 'Senha Forte', color: 'bg-green-500', textClass: 'text-green-500' };
  };

  const strength = getPasswordStrength(regSenha);

  // If already authenticated and active, redirect to admin home
  useEffect(() => {
    if (user && (isAdmin || isCorretor)) {
      navigate('/', { replace: true });
    }
  }, [user, isAdmin, isCorretor, navigate]);

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNome || !regEmail || !regSenha || !regConfirmarSenha) {
      showToast('Nome, E-mail, Senha e Confirmação de Senha são obrigatórios.', 'error');
      return;
    }

    const cleanPhone = regTelefone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length < 10) {
      showToast('Por favor, insira um telefone válido.', 'error');
      return;
    }

    if (strength.score < 5) {
      showToast('A senha precisa ser forte para prosseguir.', 'error');
      return;
    }

    if (regSenha !== regConfirmarSenha) {
      showToast('As senhas informadas não coincidem.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        sessionStorage.setItem('ruraliza_is_registering', 'true');
        const { error: signUpError } = await supabase.auth.signUp({
          email: regEmail,
          password: regSenha,
          options: {
            data: {
              nome: regNome,
              telefone: regTelefone || null,
              cidade: null,
              creci: regCreci || null,
              perfil: regPerfil
            }
          }
        });

        if (signUpError) throw signUpError;
        
        // Immediately sign out to prevent auto-login after signup
        await supabase.auth.signOut();
      } else {
        // Mock Mode: save directly
        await api.saveUser({
          nome: regNome,
          email: regEmail,
          telefone: regTelefone || undefined,
          cidade: undefined,
          creci: regCreci || undefined,
          perfil: regPerfil,
          status: 'Pendente',
          senha: regSenha
        } as any);
      }

      showToast('Solicitação de cadastro enviada com sucesso! Aguarde a aprovação do administrador para acessar o painel.', 'success');
      
      // Clear fields and switch back
      setRegNome('');
      setRegEmail('');
      setRegTelefone('');
      setRegPerfil('Corretor');
      setRegCreci('');
      setRegSenha('');
      setRegConfirmarSenha('');
      setShowRegSenha(false);
      setShowRegConfirmarSenha(false);
      setIsRegistering(false);
    } catch (err: any) {
      showToast(err.message || 'Erro ao solicitar cadastro.', 'error');
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
    <div className="min-h-screen w-full relative overflow-x-hidden flex items-center justify-center bg-gradient-to-tr from-primary-dark via-primary-medium to-emerald-950 p-4">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-light blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-light blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 text-left">
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <img 
              src={darkMode ? "/logo.png" : "/logolight.png"} 
              alt="Ruraliza" 
              className="h-8 sm:h-12 w-auto object-contain"
            />
          </div>
          <div className="space-y-1">
            <h2 className="font-poppins text-lg font-bold text-primary-dark dark:text-white leading-tight">
              Ruraliza Negócios
            </h2>
            <span className="font-sans text-[10px] tracking-[0.2em] font-semibold text-primary-medium uppercase block">
              {isRegistering ? 'Solicitação de Cadastro' : 'Controle Administrativo'}
            </span>
          </div>
        </div>

        {!isRegistering ? (
          /* LOGIN FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                E-mail
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                <Mail className="h-4 w-4 text-gray-400 shrink-0 mr-2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: corretor@ruraliza.com.br"
                  className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Senha de Acesso
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
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

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="text-xs font-bold text-primary-medium hover:text-primary-dark transition-colors cursor-pointer"
              >
                Não tem acesso? Solicitar Cadastro
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Nome Completo *
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                <User className="h-4 w-4 text-gray-400 shrink-0 mr-2" />
                <input
                  type="text"
                  required
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                E-mail *
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                <Mail className="h-4 w-4 text-gray-400 shrink-0 mr-2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Ex: joao@ruraliza.com.br"
                  className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Telefone
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={regTelefone}
                  onChange={(e) => setRegTelefone(maskPhone(e.target.value))}
                  placeholder="(18) 99999-9999"
                  className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                CRECI
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                <ShieldCheck className="h-4 w-4 text-gray-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={regCreci}
                  onChange={(e) => setRegCreci(maskCreci(e.target.value))}
                  placeholder="Ex: 12345-F"
                  className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Perfil Desejado
              </label>
              <select
                value={regPerfil}
                onChange={(e) => setRegPerfil(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
              >
                <option value="Corretor">Corretor</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Senha *
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0 mr-2" />
                <input
                  type={showRegSenha ? 'text' : 'password'}
                  required
                  value={regSenha}
                  onChange={(e) => setRegSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowRegSenha(!showRegSenha)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
                >
                  {showRegSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {regSenha && (
                <div className="mt-2 space-y-1 bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100 dark:border-zinc-800/50">
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="font-semibold text-gray-500 dark:text-zinc-400">Força da Senha:</span>
                    <span className={`font-bold ${strength.textClass}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`} 
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[9px] text-gray-400 leading-tight space-y-1 mt-2 border-t border-gray-100 dark:border-zinc-800/40 pt-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={regSenha.length >= 8 ? "text-green-500" : "text-gray-400"}>●</span>
                      <span className={regSenha.length >= 8 ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500"}>Mínimo de 8 caracteres</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[A-Z]/.test(regSenha) ? "text-green-500" : "text-gray-400"}>●</span>
                      <span className={/[A-Z]/.test(regSenha) ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500"}>Pelo menos uma letra maiúscula</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[a-z]/.test(regSenha) ? "text-green-500" : "text-gray-400"}>●</span>
                      <span className={/[a-z]/.test(regSenha) ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500"}>Pelo menos uma letra minúscula</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[0-9]/.test(regSenha) ? "text-green-500" : "text-gray-400"}>●</span>
                      <span className={/[0-9]/.test(regSenha) ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500"}>Pelo menos um número</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={/[^A-Za-z0-9]/.test(regSenha) ? "text-green-500" : "text-gray-400"}>●</span>
                      <span className={/[^A-Za-z0-9]/.test(regSenha) ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500"}>Pelo menos um caractere especial (ex: @, #, $, %)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Confirmação de Senha *
              </label>
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0 mr-2" />
                <input
                  type={showRegConfirmarSenha ? 'text' : 'password'}
                  required
                  value={regConfirmarSenha}
                  onChange={(e) => setRegConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmarSenha(!showRegConfirmarSenha)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
                >
                  {showRegConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {regConfirmarSenha && regSenha !== regConfirmarSenha && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">As senhas não coincidem.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || strength.score < 5 || regSenha !== regConfirmarSenha}
              className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando Solicitação...' : 'Solicitar Cadastro'}
            </button>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="text-xs font-bold text-primary-medium hover:text-primary-dark transition-colors cursor-pointer"
              >
                Já tem cadastro? Voltar ao Login
              </button>
            </div>
          </form>
        )}

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
