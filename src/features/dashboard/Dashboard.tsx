import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatDateTime, formatArea } from '../../utils/format';
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
  TrendingUp,
  BarChart3,
  PieChart,
  Layers,
  MapPin
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

  // Fetch all properties for chart data computation
  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: api.getProperties
  });

  const recentMessages = messages.slice(0, 4);

  if (loadingMetrics || loadingMessages || loadingProperties) {
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
    { name: 'Clientes no CRM', value: metrics?.totalClientes || 0, icon: Users, color: 'bg-teal-500/10 text-teal-600', link: '/clientes' },
    { name: 'Usuários do Sistema', value: metrics?.totalAdmins || 0, icon: Users, color: 'bg-gray-500/10 text-gray-600', link: '/gestao-usuarios' },
    { name: 'Leads Gerados no Mês', value: metrics?.leadsMes || 0, icon: Sparkles, color: 'bg-pink-500/10 text-pink-600', link: '/clientes' },
    { name: 'Mensagens Recebidas', value: metrics?.totalMensagens || 0, icon: MessageSquare, color: 'bg-red-500/10 text-red-600', link: '/mensagens' },
    { name: 'Mensagens Pendentes', value: metrics?.mensagensPendentes || 0, icon: MessageSquare, color: 'bg-rose-500/10 text-rose-600', link: '/mensagens' },
    { name: 'Agendamentos de Visita', value: metrics?.solicitacoesVisita || 0, icon: Calendar, color: 'bg-cyan-500/10 text-cyan-600', link: '/mensagens' }
  ];

  // --- CHART 1: DONUT (Tipo de Imóveis) ---
  const typeCounts = properties.reduce((acc, p) => {
    acc[p.tipo] = (acc[p.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  const totalTypes = typeData.reduce((sum, item) => sum + item.value, 0);

  // Curated brand-harmonious contrasting colors representing nature/rural elements
  const donutColors = ['#2D6A4F', '#E9C46A', '#2A9D8F', '#E76F51', '#457B9D', '#F4A261'];
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 314.16

  let accumulatedPercent = 0;
  const donutSlices = typeData.map((item, index) => {
    const percent = totalTypes > 0 ? item.value / totalTypes : 0;
    const strokeLength = percent * circumference;
    const strokeOffset = circumference - (accumulatedPercent * circumference) + (circumference / 4); // top offset
    accumulatedPercent += percent;
    return {
      ...item,
      percent,
      strokeLength,
      strokeOffset,
      color: donutColors[index % donutColors.length]
    };
  });

  // --- CHART 2: BARS (Top 5 Imóveis Mais Visitados) ---
  const topProperties = [...properties]
    .sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0))
    .slice(0, 5);

  const maxViews = Math.max(...topProperties.map(p => p.visualizacoes || 0), 5);

  // --- CHART 3: AREA/VOLUME (Hectares sob Gestão por Estado) ---
  const stateAreas = properties.reduce((acc, p) => {
    acc[p.estado] = (acc[p.estado] || 0) + p.area_total;
    return acc;
  }, {} as Record<string, number>);

  const stateData = Object.entries(stateAreas).map(([state, area]) => ({ state, area }));
  const maxAreaVal = Math.max(...stateData.map(d => d.area), 10);

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

      {/* --- DASHBOARD CHARTS SECTION --- */}
      <section className="space-y-6">
        <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="h-4.5 w-4.5 text-primary-medium" /> Análise Gráfica & Desempenho
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Donut (Distribution of Property Types) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <PieChart className="h-4 w-4 text-emerald-600" /> Distribuição por Tipo
              </h4>
              <span className="text-[10px] text-gray-450 dark:text-zinc-500 font-bold font-sans">
                {totalTypes} Imóveis
              </span>
            </div>

            {totalTypes === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-gray-450 dark:text-zinc-500">
                Nenhum imóvel disponível para o gráfico.
              </div>
            ) : (
              <div className="flex flex-col items-center sm:flex-row sm:justify-around gap-4 py-2">
                {/* SVG Donut */}
                <div className="relative h-32 w-32 shrink-0">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      className="fill-transparent stroke-gray-100 dark:stroke-zinc-800/80"
                      strokeWidth="14"
                    />
                    {donutSlices.map((slice) => (
                      <circle
                        key={slice.name}
                        cx="60"
                        cy="60"
                        r={radius}
                        className="fill-transparent transition-all duration-300 hover:stroke-[16px] cursor-pointer"
                        stroke={slice.color}
                        strokeWidth="14"
                        strokeDasharray={`${slice.strokeLength} ${circumference}`}
                        strokeDashoffset={slice.strokeOffset}
                        strokeLinecap="round"
                      >
                        <title>{slice.name}: {slice.value} ({Math.round(slice.percent * 100)}%)</title>
                      </circle>
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-poppins font-black text-gray-800 dark:text-white leading-none">
                      {totalTypes}
                    </span>
                    <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                      Imóveis
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2 text-xs font-medium w-full max-w-[160px]">
                  {donutSlices.map((slice) => (
                    <div key={slice.name} className="flex items-center justify-between gap-2 border-b border-gray-50 dark:border-zinc-800/50 pb-1 last:border-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-3 w-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: slice.color }}></span>
                        <span className="text-gray-700 dark:text-zinc-300 font-semibold truncate">{slice.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-gray-800 dark:text-zinc-100 font-bold">
                          {slice.value}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 dark:text-zinc-550 font-semibold">
                          ({Math.round(slice.percent * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chart 2: Bar Chart (Top 5 Visited Properties) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" /> Mais Visitados (Publico)
              </h4>
              <span className="text-[10px] text-gray-450 dark:text-zinc-500 font-bold font-sans">
                Views
              </span>
            </div>

            {topProperties.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-gray-450 dark:text-zinc-500">
                Nenhum dado de visualização disponível.
              </div>
            ) : (
              <div className="flex flex-col justify-end h-40 pt-4 space-y-2">
                {/* Visual Bar Charts */}
                <div className="flex items-end justify-around h-full px-2 gap-4">
                  {topProperties.map((prop) => {
                    const views = prop.visualizacoes || 0;
                    const heightPercent = Math.min(100, Math.max(10, (views / maxViews) * 100));
                    return (
                      <div key={prop.id} className="flex flex-col items-center group w-full relative h-full justify-end">
                        {/* Tooltip */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-zinc-850 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none z-10 whitespace-nowrap font-sans">
                          {views} views
                        </div>

                        {/* Bar Wrapper (provides context for height percentage) */}
                        <div className="w-full flex-1 flex items-end justify-center relative min-h-[40px]">
                          {/* Bar */}
                          <div 
                            className="w-8 bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 rounded-t-lg transition-all duration-500 relative"
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg"></div>
                          </div>
                        </div>

                        {/* Code label */}
                        <span className="text-[9px] text-gray-500 dark:text-zinc-400 font-bold tracking-wider uppercase mt-2 block font-sans shrink-0">
                          {prop.codigo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Chart 3: Volume Chart (Total Managed Hectares by State) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary-medium" /> Hectares por Estado
              </h4>
              <span className="text-[10px] text-gray-450 dark:text-zinc-500 font-bold font-sans">
                Área Total
              </span>
            </div>

            {stateData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-gray-450 dark:text-zinc-500">
                Nenhum dado de área disponível.
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                {stateData.map((d) => {
                  const percent = Math.min(100, Math.max(5, (d.area / maxAreaVal) * 100));
                  return (
                    <div key={d.state} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary-medium" /> {d.state}
                        </span>
                        <span className="font-mono text-gray-850 dark:text-zinc-200">
                          {formatArea(d.area)}
                        </span>
                      </div>
                      
                      {/* Bar indicator track */}
                      <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-medium hover:bg-primary-light transition-all duration-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

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
