import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useSEO } from '../hooks/useSEO';
import { Phone, Mail, MapPin, MessageSquare, Clock } from 'lucide-react';
import MapView from '../components/MapView';

const Contato: React.FC = () => {
  useSEO('Contato', 'Fale com os consultores da Ruraliza Negócios. Tire dúvidas, solicite visitas ou envie propostas.');
  const { showToast } = useToast();
  
  const { data: config } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getConfiguracoes
  });

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [assunto, setAssunto] = useState('Contato Geral');
  const [mensagem, setMensagem] = useState('');

  const mutation = useMutation({
    mutationFn: api.registrarMensagemContato,
    onSuccess: () => {
      showToast('Mensagem enviada com sucesso! Um consultor técnico retornará em breve.', 'success');
      setNome('');
      setEmail('');
      setTelefone('');
      setAssunto('Contato Geral');
      setMensagem('');
    },
    onError: () => {
      showToast('Erro ao registrar sua mensagem. Tente novamente.', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !mensagem) {
      showToast('Por favor, preencha os campos obrigatórios (Nome, E-mail e Mensagem).', 'error');
      return;
    }
    mutation.mutate({
      nome,
      email,
      telefone,
      assunto,
      mensagem
    });
  };

  return (
    <div className="space-y-16 pb-20 text-left">
      {/* Banner */}
      <section className="relative h-64 bg-primary-dark text-white flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
            alt="Contato Ruraliza"
            className="w-full h-full object-cover opacity-20 object-center"
            data-no-protect
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-primary-dark/80"></div>
        </div>
        <div className="relative z-10 text-center space-y-2">
          <h1 className="font-poppins text-3xl font-bold">Fale Conosco</h1>
          <p className="text-sm text-brand-beige-dark/70">Canais de atendimento direto e localização de nosso escritório</p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Panels (1 col) */}
        <div className="space-y-4 md:col-span-1">
          {/* Card 1: Telefone / WhatsApp */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="h-8 w-8 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Telefone & WhatsApp</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans">{config?.telefone || '(18) 3222-1234'}</p>
              {config?.telefone_secundario && (
                <p className="text-xs text-primary-medium dark:text-primary-light font-bold font-sans">{config.telefone_secundario}</p>
              )}
            </div>
          </div>

          {/* Card 2: E-mail */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="h-8 w-8 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">E-mail Corporativo</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans break-all">{config?.email || 'contato@ruralizanegocios.com.br'}</p>
            </div>
          </div>

          {/* Card 3: Endereço */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="h-8 w-8 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Nosso Escritório</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-snug">
                {config?.endereco || 'Av. Coronel José Soares Marcondes, 1500 - Centro, Presidente Prudente - SP'}
              </p>
            </div>
          </div>

          {/* Card 4: Horário */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="h-8 w-8 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Horário de Expediente</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
                Segunda a Sexta: 08:00 às 18:00<br />
                Sábado: 08:00 às 12:00 (plantão)
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Panel (2 cols) */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-8 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Envie uma mensagem eletrônica</h3>
            <p className="text-xs text-gray-500 mt-0.5">Nossa mesa de atendimento técnico irá cadastrar a solicitação em nosso funil.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Telefone / Celular
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(18) 99999-9999"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Assunto da Mensagem
                </label>
                <select
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                >
                  <option value="Contato Geral">Contato Geral / Dúvidas</option>
                  <option value="Avaliação de Propriedade">Avaliar Minha Propriedade</option>
                  <option value="Procura Técnica">Quero Comprar / Investir</option>
                  <option value="Parceria Comercial">Parceria Comercial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Sua Mensagem *
              </label>
              <textarea
                rows={5}
                required
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreva detalhadamente a sua solicitação..."
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-white py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
            >
              <MessageSquare className="h-4 w-4" />
              {mutation.isPending ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        </div>
      </section>

      {/* Map Segment */}
      <section className="mx-auto max-w-5xl px-4 space-y-4">
        <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Localização do Escritório</h3>
        <div className="h-80 rounded-3xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden relative flex items-center justify-center">
          <MapView 
            latitude={config?.latitude} 
            longitude={config?.longitude} 
            popupText="Escritório Ruraliza Negócios"
          />
        </div>
      </section>
    </div>
  );
};

export default Contato;
