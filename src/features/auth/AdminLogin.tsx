import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api, isSupabaseConfigured } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Eye, EyeOff, User, Phone, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { maskPhone, maskCreci } from '../../utils/masks';
import { useTheme } from '../../contexts/ThemeContext';
import CaptchaWidget from '../../components/CaptchaWidget';
import { motion } from 'framer-motion';

const translateSupabaseError = (msg: string): string => {
  if (!msg || msg === '{}' || msg.trim() === '{}' || msg === 'null') {
    return 'E-mail inválido ou inexistente. Por favor, verifique se a digitação está correta.';
  }
  const lowerMsg = msg.toLowerCase();
  
  if (lowerMsg.includes('invalid email') || lowerMsg.includes('email is invalid') || lowerMsg.includes('bad email') || lowerMsg.includes('email address')) {
    return 'E-mail inválido ou inexistente. Por favor, verifique se a digitação está correta.';
  }
  if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('invalid credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (lowerMsg.includes('user already exists') || lowerMsg.includes('email already in use')) {
    return 'Este e-mail já está cadastrado no sistema.';
  }
  if (lowerMsg.includes('invalid confirmation code') || lowerMsg.includes('invalid token') || lowerMsg.includes('invalid otp')) {
    return 'Código de verificação inválido.';
  }
  if (lowerMsg.includes('token has expired') || lowerMsg.includes('otp has expired')) {
    return 'O código de verificação expirou. Solicite um novo código.';
  }
  if (lowerMsg.includes('captcha verification failed') || lowerMsg.includes('captcha token is invalid')) {
    return 'Falha na verificação de robô (Captcha). Tente novamente.';
  }
  if (lowerMsg.includes('password should be at least')) {
    return 'A senha não atende aos requisitos mínimos de segurança (mínimo de 8 caracteres e caracteres fortes).';
  }
  if (lowerMsg.includes('rate limit exceeded') || lowerMsg.includes('too many requests')) {
    return 'Muitas solicitações enviadas. Aguarde um momento antes de tentar novamente.';
  }
  if (lowerMsg.includes('email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado no sistema.';
  }
  if (lowerMsg.includes('network request failed') || lowerMsg.includes('failed to fetch')) {
    return 'Falha na conexão com o servidor. Verifique sua conexão com a internet.';
  }
  
  return msg;
};

const AdminLogin: React.FC = () => {
  const { user, login, error, clearError, isAdmin, isCorretor } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // Captcha States
  const [loginCaptchaToken, setLoginCaptchaToken] = useState<string | null>(null);
  const [loginCaptchaKey, setLoginCaptchaKey] = useState(0);
  const [registerCaptchaToken, setRegisterCaptchaToken] = useState<string | null>(null);
  const [registerCaptchaKey, setRegisterCaptchaKey] = useState(0);

  // Toggle mode derived from URL route path
  const location = useLocation();
  const isRegistering = location.pathname === '/cadastro';

  // Registration state
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regPerfil] = useState<'Corretor'>('Corretor');
  const [regCreci, setRegCreci] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regConfirmarSenha, setRegConfirmarSenha] = useState('');
  const [showRegSenha, setShowRegSenha] = useState(false);
  const [showRegConfirmarSenha, setShowRegConfirmarSenha] = useState(false);

  // Registration steps and verification state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [verificationInput, setVerificationInput] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  // If email or password changes, reset verification states
  useEffect(() => {
    setIsCodeSent(false);
    setIsCodeVerified(false);
    setVerificationInput('');
    setGeneratedCode('');
  }, [regEmail, regSenha]);

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

    // Rate limiting check
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSecs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      showToast(`Muitas tentativas. Aguarde ${remainingSecs}s antes de tentar novamente.`, 'error');
      return;
    }

    if (!loginCaptchaToken) {
      showToast('Por favor, confirme que você não é um robô.', 'error');
      return;
    }

    setSubmitting(true);
    clearError();

    try {
      await login(email, password, loginCaptchaToken);
      // Reset rate limiting on successful login
      setLoginAttempts(0);
      setLockoutUntil(null);
    } catch (e: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // Progressive lockout: after 5 failed attempts, lock for 60 seconds
      if (newAttempts >= 5) {
        const lockoutMs = 60 * 1000; // 60 seconds
        setLockoutUntil(Date.now() + lockoutMs);
        showToast('Muitas tentativas de login. Conta bloqueada por 60 segundos.', 'error');
        setLoginAttempts(0); // Reset counter after lockout
      } else {
        showToast(translateSupabaseError(e.message) || 'Erro ao realizar login.', 'error');
      }

      // Reset Captcha on error
      setLoginCaptchaToken(null);
      setLoginCaptchaKey(prev => prev + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep1 = () => {
    if (!regNome.trim()) {
      showToast('Nome completo é obrigatório.', 'error');
      return;
    }
    const cleanPhone = regTelefone.replace(/\D/g, '');
    if (!cleanPhone) {
      showToast('Telefone é obrigatório.', 'error');
      return;
    }
    if (cleanPhone.length < 10) {
      showToast('Por favor, insira um telefone válido.', 'error');
      return;
    }
    if (regPerfil === 'Corretor' && !regCreci.trim()) {
      showToast('CRECI é obrigatório para corretores.', 'error');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    if (!regEmail.trim()) {
      showToast('Por favor, informe o e-mail.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      showToast('Por favor, insira um e-mail válido.', 'error');
      return;
    }
    if (!regSenha) {
      showToast('A senha é obrigatória.', 'error');
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
    setCurrentStep(3);
  };

  const handleSendCode = async () => {
    if (!regEmail.trim()) {
      showToast('Por favor, informe o e-mail.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      showToast('Por favor, insira um e-mail válido.', 'error');
      return;
    }
    if (!regSenha) {
      showToast('Por favor, insira uma senha válida.', 'error');
      return;
    }
    
    if (!registerCaptchaToken) {
      showToast('Por favor, confirme que você não é um robô.', 'error');
      return;
    }

    setSendingCode(true);
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
            },
            captchaToken: registerCaptchaToken
          }
        });

        if (signUpError) throw signUpError;
      } else {
        // Mock Mode: Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        if (import.meta.env.DEV) {
          console.log('Ruraliza Mock OTP Code:', code);
          showToast(`Código de verificação enviado! Para testes, use: ${code}`, 'success');
        }
      }

      setIsCodeSent(true);
      showToast('Código de verificação enviado para o seu e-mail.', 'success');
    } catch (err: any) {
      showToast(translateSupabaseError(err.message) || 'Erro ao enviar código de verificação.', 'error');
      setRegisterCaptchaToken(null);
      setRegisterCaptchaKey(prev => prev + 1);
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationInput || verificationInput.length < 6) {
      showToast('Por favor, insira o código de 6 dígitos.', 'error');
      return;
    }

    setVerifyingCode(true);
    try {
      if (isSupabaseConfigured()) {
        sessionStorage.setItem('ruraliza_is_registering', 'true');
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: regEmail,
          token: verificationInput,
          type: 'signup'
        });

        if (verifyError) throw verifyError;

        setIsCodeVerified(true);
        showToast('E-mail verificado com sucesso!', 'success');
      } else {
        if (verificationInput === generatedCode) {
          setIsCodeVerified(true);
          showToast('E-mail verificado com sucesso!', 'success');
        } else {
          showToast('Código de verificação inválido.', 'error');
        }
      }
    } catch (err: any) {
      showToast(translateSupabaseError(err.message) || 'Erro ao verificar o código.', 'error');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeVerified) {
      showToast('Por favor, verifique seu e-mail antes de prosseguir.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        // Log out user since they are pending approval
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
      setRegCreci('');
      setRegSenha('');
      setRegConfirmarSenha('');
      setShowRegSenha(false);
      setShowRegConfirmarSenha(false);
      setCurrentStep(1);
      setVerificationInput('');
      setIsCodeSent(false);
      setIsCodeVerified(false);
      setGeneratedCode('');
      navigate('/login');
    } catch (err: any) {
      showToast(translateSupabaseError(err.message) || 'Erro ao salvar o cadastro.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (isSupabaseConfigured() && isCodeVerified) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Sign out error on cancel:', e);
      }
    }
    setRegNome('');
    setRegEmail('');
    setRegTelefone('');
    setRegCreci('');
    setRegSenha('');
    setRegConfirmarSenha('');
    setShowRegSenha(false);
    setShowRegConfirmarSenha(false);
    setCurrentStep(1);
    setVerificationInput('');
    setIsCodeSent(false);
    setIsCodeVerified(false);
    setGeneratedCode('');
    navigate('/login');
  };

  // Expose authentication error from Context
  useEffect(() => {
    if (error) {
      showToast(translateSupabaseError(error), 'error');
      clearError();
    }
  }, [error, clearError, showToast]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-between bg-gradient-to-br from-[#F5F7F6] via-[#E4ECE9] to-[#D5E2DC] dark:from-zinc-950 dark:via-[#05140D] dark:to-black p-4 transition-colors duration-500">
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 116, 139, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 116, 139, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
        }}
      />

      {/* Floating Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Orb 1: Emerald/Mint */}
        <motion.div 
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 blur-[100px]"
        />

        {/* Orb 2: Warm Gold/Olive */}
        <motion.div 
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.9, 1.2, 1]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-amber-500/15 dark:bg-yellow-600/5 blur-[120px]"
        />

        {/* Orb 3: Mint/Teal center */}
        <motion.div 
          animate={{
            x: [-20, 20, -20],
            y: [30, -30, 30],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-teal-400/10 dark:bg-teal-500/5 blur-[80px]"
        />
      </div>

      {/* Spacer for centering */}
      <div className="flex-1 flex items-center justify-center w-full max-w-4xl">
        <div className="relative z-10 flex items-start justify-center w-full gap-12 py-8">
          
          {/* Left Column: Related Banner (hidden on mobile) */}
          <div className="hidden md:flex relative items-center justify-center shrink-0 pr-4">
            {/* Banner Card */}
            <div className="relative overflow-hidden rounded-xl h-[540px] w-[320px] lg:w-[380px] shadow-2xl border border-white/20 dark:border-zinc-800/40 flex flex-col justify-between p-8 text-left text-white animate-fade-in">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="/hero.jpg" 
                  alt="Ruraliza" 
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-black/35 z-10"></div>
              </div>

              {/* Top Section */}
              <div className="relative z-20 space-y-3">
                <div className="h-10 w-auto flex items-center">
                  <img src="/logo.png" alt="Logo" className="h-full object-contain" />
                </div>
                <span className="inline-block text-[9px] bg-primary-medium/90 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Exclusivo para Corretores Credenciados
                </span>
              </div>

              {/* Middle/Bottom Section */}
              <div className="relative z-20 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-poppins text-base lg:text-lg font-bold text-brand-beige leading-tight">
                    O Futuro dos Negócios Rurais Começa Aqui
                  </h3>
                  <p className="text-[10px] lg:text-[11px] text-gray-300 leading-relaxed">
                    Acesse um ecossistema inteligente projetado para maximizar suas vendas. Gerencie leads, publique anúncios e feche transações com máxima eficiência.
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-medium"></span>
                    <span className="text-[10px] text-gray-200">Inteligência de Mercado & CRM Avançado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-medium"></span>
                    <span className="text-[10px] text-gray-200">Portfólio Exclusivo de Grandes Áreas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-medium"></span>
                    <span className="text-[10px] text-gray-200">Segurança Jurídica & Suporte Especializado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Instagram Boxes */}
          <div className="w-full max-w-sm flex flex-col gap-4">
            
            {/* Box 1: Main Form Box */}
            <div className="bg-white/80 dark:bg-zinc-900/75 backdrop-blur-xl p-8 rounded-xl border border-white/40 dark:border-zinc-800/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-6 text-left transition-all duration-300 hover:border-primary-medium/20">
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

                  <CaptchaWidget
                    key={loginCaptchaKey}
                    onVerify={setLoginCaptchaToken}
                    onExpire={() => setLoginCaptchaToken(null)}
                  />

                  <button
                    type="submit"
                    disabled={submitting || !loginCaptchaToken}
                    className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Autenticando...' : 'Acessar Painel'}
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <div className="space-y-4">
                  {/* Step Indicator */}
                  <div className="flex items-center justify-between mb-6 px-2">
                    {[1, 2, 3].map((step) => (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            currentStep === step 
                              ? 'bg-primary-medium text-white ring-4 ring-primary-medium/25'
                              : currentStep > step
                              ? 'bg-primary-dark text-white'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
                          }`}>
                            {step}
                          </div>
                          <span className={`text-[9px] font-semibold mt-1 uppercase tracking-wider ${
                            currentStep === step
                              ? 'text-primary-medium dark:text-white font-bold'
                              : 'text-gray-400 dark:text-zinc-500'
                          }`}>
                            {step === 1 ? 'Identificação' : step === 2 ? 'Autenticação' : 'Confirmação'}
                          </span>
                        </div>
                        {step < 3 && (
                          <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                            currentStep > step ? 'bg-primary-dark' : 'bg-gray-200 dark:bg-zinc-800'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {/* STEP 1: Identification */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
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
                            Telefone *
                          </label>
                          <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                            <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0 mr-2" />
                            <input
                              type="text"
                              required
                              value={regTelefone}
                              onChange={(e) => setRegTelefone(maskPhone(e.target.value))}
                              placeholder="(63) 99999-9999"
                              className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
                            />
                          </div>
                        </div>

                        {/* Perfil fixo como Corretor para segurança — promoção via Admin */}
                        <input type="hidden" value="Corretor" />

                        {regPerfil === 'Corretor' && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                              CRECI *
                            </label>
                            <div className="flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                              <ShieldCheck className="h-4 w-4 text-gray-400 shrink-0 mr-2" />
                              <input
                                type="text"
                                required
                                value={regCreci}
                                onChange={(e) => setRegCreci(maskCreci(e.target.value))}
                                placeholder="Ex: 12345-F"
                                className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 login-input"
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleNextStep1}
                          className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
                        >
                          Próximo <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* STEP 2: Email and Password */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
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
                              className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0 border-none bg-transparent"
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
                              className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0 border-none bg-transparent"
                            >
                              {showRegConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {regConfirmarSenha && regSenha !== regConfirmarSenha && (
                            <p className="text-[10px] text-red-500 font-semibold mt-1">As senhas não coincidem.</p>
                          )}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => setCurrentStep(1)}
                            className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 py-3 text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer text-center bg-transparent"
                          >
                            Voltar
                          </button>
                          <button
                            type="button"
                            onClick={handleNextStep2}
                            className="flex-1 rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
                          >
                            Próximo <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Email Confirmation */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-zinc-800/50">
                          <Mail className="h-8 w-8 text-primary-medium mx-auto mb-2" />
                          <h3 className="text-xs font-bold text-gray-700 dark:text-zinc-300">Confirmação de E-mail</h3>
                          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                            Enviaremos um código de verificação para o e-mail: <strong className="text-primary-medium">{regEmail}</strong>
                          </p>
                        </div>

                        {!isCodeSent && (
                          <CaptchaWidget
                            key={registerCaptchaKey}
                            onVerify={setRegisterCaptchaToken}
                            onExpire={() => setRegisterCaptchaToken(null)}
                          />
                        )}

                        {!isCodeSent ? (
                          <button
                            type="button"
                            disabled={sendingCode || !registerCaptchaToken}
                            onClick={handleSendCode}
                            className="w-full rounded-xl bg-primary-medium hover:bg-primary-dark text-white py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 border-none disabled:cursor-not-allowed"
                          >
                            {sendingCode ? 'Enviando...' : 'Enviar Código por E-mail'}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                                Código de Verificação (6 dígitos)
                              </label>
                              <div className="flex gap-2">
                                <div className="flex-1 flex items-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2.5 focus-within:border-primary-medium transition-colors">
                                  <input
                                    type="text"
                                    maxLength={6}
                                    disabled={isCodeVerified || verifyingCode}
                                    value={verificationInput}
                                    onChange={(e) => setVerificationInput(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Digite o código"
                                    className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder-gray-400 tracking-widest text-center font-mono font-bold"
                                  />
                                </div>
                                <button
                                  type="button"
                                  disabled={verifyingCode || isCodeVerified || verificationInput.length < 6}
                                  onClick={handleVerifyCode}
                                  className="px-4 rounded-xl bg-primary-medium hover:bg-primary-dark text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
                                >
                                  {verifyingCode ? 'Verificando...' : 'Verificar'}
                                </button>
                              </div>
                            </div>

                            {isCodeVerified && (
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/30 text-xs font-semibold">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <span>E-mail verificado com sucesso!</span>
                              </div>
                            )}

                            {!isCodeVerified && (
                              <div className="text-center pt-1">
                                <button
                                  type="button"
                                  disabled={sendingCode}
                                  onClick={() => {
                                    setIsCodeSent(false);
                                    setRegisterCaptchaToken(null);
                                    setRegisterCaptchaKey(prev => prev + 1);
                                  }}
                                  className="text-[10px] text-gray-400 hover:text-primary-medium font-semibold underline transition-colors cursor-pointer border-none bg-transparent"
                                >
                                  Não recebeu o código? Enviar novamente
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            disabled={submitting || verifyingCode}
                            onClick={() => setCurrentStep(2)}
                            className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 py-3 text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer text-center bg-transparent"
                          >
                            Voltar
                          </button>
                          <button
                            type="submit"
                            disabled={submitting || !isCodeVerified}
                            className="flex-1 rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? 'Enviando...' : 'Solicitar Cadastro'}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Box 2: Toggle Link Card */}
            <div className="bg-white/80 dark:bg-zinc-900/75 backdrop-blur-xl p-5 rounded-xl border border-white/40 dark:border-zinc-800/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] text-center text-xs text-gray-600 dark:text-zinc-400">
              {!isRegistering ? (
                <p>
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/cadastro')}
                    className="font-bold text-primary-medium hover:text-primary-dark transition-colors cursor-pointer border-none bg-transparent ml-1 font-sans text-xs"
                  >
                    Solicitar Cadastro
                  </button>
                </p>
              ) : (
                <p>
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={handleCancelRegistration}
                    className="font-bold text-primary-medium hover:text-primary-dark transition-colors cursor-pointer border-none bg-transparent ml-1 font-sans text-xs"
                  >
                    Voltar ao Login
                  </button>
                </p>
              )}
            </div>

            {/* Box 3: Faint restricted access text */}
            <div className="text-center">
              <p className="text-[10px] text-gray-400">
                Acesso exclusivo para corretores credenciados Ruraliza.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Subtle Footer Links and Copyright */}
      <footer className="w-full max-w-4xl py-4 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-center text-[10px] text-gray-400 dark:text-zinc-500">
        <div>
          © {new Date().getFullYear()} Ruraliza Negócios Imobiliários Ltda.
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin;
