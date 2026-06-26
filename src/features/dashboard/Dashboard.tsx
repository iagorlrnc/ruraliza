import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatDateTime } from '../../utils/format';
import { Link } from 'react-router-dom';
import { 
  Home, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  MessageSquare, 
  Eye, 
  Calendar, 
  Sparkles,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Fetch metrics
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: api.getDashboardMetrics
  });

  // Fetch recent messages
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages'],
    queryFn: api.getMessages
  });

  const recentMessages = messages.slice(0, 4);

  if (loadingMetrics || loadingMessages) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 skeleton-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { name: 'Total de Imóveis', value: metrics?.totalImoveis || 0, icon: Home, color: 'bg-blue-500/10 text-blue-600', link: '/imoveis' },
    { name: 'Imóveis para Venda', value: metrics?.imoveisVenda || 0, icon: ArrowUpRight, color: 'bg-emerald-500/10 text-emerald-600', link: '/imoveis' },
    { name: 'Imóveis para Aluguel', value: metrics?.imoveisAluguel || 0, icon: ArrowDownRight, color: 'bg-amber-500/10 text-amber-600', link: '/imoveis' },
    { name: 'Visualizações de Imóveis', value: metrics?.totalVisualizacoes || 0, icon: Eye, color: 'bg-indigo-500/10 text-indigo-600', link: '/imoveis' },
    { name: 'Usuários Cadastrados', value: metrics?.totalUsuarios || 0, icon: Users, color: 'bg-purple-500/10 text-purple-600', link: '/usuarios' },
    { name: 'Clientes Ativos', value: metrics?.totalClientes || 0, icon: Users, color: 'bg-teal-500/10 text-teal-600', link: '/usuarios' },
    { name: 'Administradores', value: metrics?.totalAdmins || 0, icon: Users, color: 'bg-gray-500/10 text-gray-600', link: '/usuarios' },
    { name: 'Leads Gerados no Mês', value: metrics?.leadsMes || 0, icon: Sparkles, color: 'bg-pink-500/10 text-pink-600', link: '/usuarios' },
    { name: 'Mensagens Recebidas', value: metrics?.totalMensagens || 0, icon: MessageSquare, color: 'bg-red-500/10 text-red-600', link: '/mensagens' },
    { name: 'Mensagens Pendentes', value: metrics?.mensagensPendentes || 0, icon: MessageSquare, color: 'bg-rose-500/10 text-rose-600', link: '/mensagens' },
    { name: 'Agendamentos de Visita', value: metrics?.solicitacoesVisita || 0, icon: Calendar, color: 'bg-cyan-500/10 text-cyan-600', link: '/mensagens' }
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Seja bem-vindo ao CRM Ruraliza</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Aqui estão as atividades de seus leads e o controle técnico dos imóveis rurais.</p>
        </div>
        <div className="inline-flex items-center gap-1 bg-primary-medium/10 text-primary-medium px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans">
          <TrendingUp className="h-4 w-4 shrink-0" /> Operações Ativas
        </div>
      </div>

      {/* Stats indicators grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.name}
              to={kpi.link}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 hover:border-primary-medium dark:hover:border-zinc-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="space-y-1">
                <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider">{kpi.name}</span>
                <span className="block text-xl font-poppins font-black text-gray-850 dark:text-white">{kpi.value}</span>
              </div>
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.color} transition-transform group-hover:scale-105`}>
                <Icon className="h-5 w-5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid: Recent Leads & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Messages (3 cols) */}
        <section className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Últimas Mensagens & Leads</h3>
            <Link
              to="/mensagens"
              className="text-[10px] text-primary-medium hover:text-primary-dark font-bold uppercase tracking-wider flex items-center gap-0.5"
            >
              Ver Tudo <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">Nenhuma mensagem recebida ainda.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4 justify-between">
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-800 dark:text-white line-clamp-1">{msg.nome}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        msg.status === 'Nova' 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                          : msg.status === 'Em andamento'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans font-medium line-clamp-1">
                      {msg.mensagem}
                    </p>
                    <span className="text-[10px] text-gray-400 block">
                      Enviado em: {formatDateTime(msg.created_at)}
                    </span>
                  </div>
                  {msg.imovel && (
                    <span className="text-[10px] bg-primary-medium/10 text-primary-medium font-bold px-2 py-0.5 rounded shrink-0">
                      Imóvel: {msg.imovel.codigo}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Database Status Info panel (2 cols) */}
        <section className="lg:col-span-2 bg-primary-dark text-white p-6 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="font-poppins text-sm font-bold text-white flex items-center gap-2">
              Conexão com Banco de Dados
            </h3>
            <p className="text-xs text-brand-beige-dark/70 leading-relaxed font-sans">
              O sistema possui detecção automática de banco de dados. Caso o Supabase não esteja parametrizado no `.env`, o CRM roda no modo simulação de demonstração, persistindo as edições de forma isolada na sessão local do navegador.
            </p>
          </div>

          <div className="bg-primary-medium/20 dark:bg-zinc-800/40 p-4 rounded-xl border border-primary-medium/30 space-y-2">
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-brand-beige-dark">
              Status Atual do Conector
            </span>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${api.isConfigured() ? 'bg-green-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
              <span className="text-xs font-bold text-white">
                {api.isConfigured() ? 'Conectado ao Supabase Cloud' : 'Modo Simulação (LocalStorage)'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
