import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatDateTime, formatPhone } from '../../utils/format';
import { 
  Calendar, Clock, CheckCircle2, XCircle, Search, 
  Phone, Mail, X, Inbox, Check, Building, ChevronRight, ExternalLink, Archive,
} from 'lucide-react';
import { StatusVisita } from '../../types';
import DetalheImovel from '../../pages/DetalheImovel';

const statusConfig: Record<StatusVisita, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  'Pendente': { label: 'Solicitada', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30', icon: Clock },
  'Confirmada': { label: 'Confirmada', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/30', icon: Calendar },
  'Concluída': { label: 'Concluída', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-250/30 dark:border-emerald-800/30', icon: CheckCircle2 },
  'Cancelada': { label: 'Cancelada', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-800/30', icon: Archive }
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'from-primary-medium to-primary-dark',
    'from-emerald-500 to-emerald-700',
    'from-amber-500 to-amber-700',
    'from-rose-500 to-rose-700',
    'from-violet-500 to-violet-700',
    'from-cyan-500 to-cyan-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const timeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return formatDateTime(date);
};

const VisitasList: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('Pendente');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<string>('recentes');

  // Fetch all visit requests
  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['visits'],
    queryFn: api.getVisits
  });

  // Mutation to update status of a visit request
  const updateStatusMutation = useMutation({
    mutationFn: (payload: { id: string; status: StatusVisita }) => 
      api.updateVisitStatus(payload.id, payload.status),
    onSuccess: () => {
      showToast('Status da visita atualizado com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
    onError: () => {
      showToast('Erro ao atualizar status da visita.', 'error');
    }
  });

  const handleUpdateStatus = (id: string, status: StatusVisita) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Filter lists based on search query and tab/status
  const filteredVisits = visits.filter(v => {
    const nome = v.usuario?.nome || '';
    const email = v.usuario?.email || '';
    const telefone = v.usuario?.telefone || '';
    const codigoImovel = v.imovel?.codigo || '';
    const localidade = v.imovel?.cidade || '';

    const matchesSearch = 
      nome.toLowerCase().includes(busca.toLowerCase()) ||
      email.toLowerCase().includes(busca.toLowerCase()) ||
      telefone.includes(busca) ||
      codigoImovel.toLowerCase().includes(busca.toLowerCase()) ||
      localidade.toLowerCase().includes(busca.toLowerCase());

    const matchesStatus = filtroStatus === 'Todas' ? true : v.status === filtroStatus;

    return matchesSearch && matchesStatus;
  });

  const sortedVisits = [...filteredVisits].sort((a, b) => {
    if (ordenacao === 'recentes') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (ordenacao === 'antigas') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (ordenacao === 'agendamento_proximo') {
      return new Date(a.data_solicitada).getTime() - new Date(b.data_solicitada).getTime();
    }
    if (ordenacao === 'agendamento_distante') {
      return new Date(b.data_solicitada).getTime() - new Date(a.data_solicitada).getTime();
    }
    return 0;
  });

  // Count metrics
  const countAll = visits.length;
  const countPending = visits.filter(v => v.status === 'Pendente').length;
  const countConfirmed = visits.filter(v => v.status === 'Confirmada').length;
  const countCompleted = visits.filter(v => v.status === 'Concluída').length;
  const countCancelled = visits.filter(v => v.status === 'Cancelada').length;

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-poppins text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary-medium" /> Gestão de Visitas Agendadas
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Gerencie, confirme e acompanhe todas as visitas solicitadas pelos leads do portal.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <button
          onClick={() => setFiltroStatus('Todas')}
          className={`p-4 rounded-3xl border transition-all text-left shadow-sm cursor-pointer ${
            filtroStatus === 'Todas' 
              ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/30' 
              : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 text-gray-800 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <Inbox className="h-5 w-5 opacity-80" />
            <span className="text-xs font-mono font-bold">{countAll}</span>
          </div>
          <strong className="block text-sm font-poppins font-bold mt-3">Todas</strong>
        </button>

        <button
          onClick={() => setFiltroStatus('Pendente')}
          className={`p-4 rounded-3xl border transition-all text-left shadow-sm cursor-pointer ${
            filtroStatus === 'Pendente' 
              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30' 
              : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 text-gray-800 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <Clock className="h-5 w-5 opacity-80" />
            <span className="text-xs font-mono font-bold">{countPending}</span>
          </div>
          <strong className="block text-sm font-poppins font-bold mt-3">Solicitadas</strong>
        </button>

        <button
          onClick={() => setFiltroStatus('Confirmada')}
          className={`p-4 rounded-3xl border transition-all text-left shadow-sm cursor-pointer ${
            filtroStatus === 'Confirmada' 
              ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30' 
              : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 text-gray-800 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <Calendar className="h-5 w-5 opacity-80" />
            <span className="text-xs font-mono font-bold">{countConfirmed}</span>
          </div>
          <strong className="block text-sm font-poppins font-bold mt-3">Confirmadas</strong>
        </button>

        <button
          onClick={() => setFiltroStatus('Concluída')}
          className={`p-4 rounded-3xl border transition-all text-left shadow-sm cursor-pointer ${
            filtroStatus === 'Concluída' 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-250/30 dark:border-emerald-800/30' 
              : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 text-gray-800 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <CheckCircle2 className="h-5 w-5 opacity-80" />
            <span className="text-xs font-mono font-bold">{countCompleted}</span>
          </div>
          <strong className="block text-sm font-poppins font-bold mt-3">Concluídas</strong>
        </button>

        <button
          onClick={() => setFiltroStatus('Cancelada')}
          className={`p-4 rounded-3xl border transition-all text-left shadow-sm cursor-pointer ${
            filtroStatus === 'Cancelada' 
              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30' 
              : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 text-gray-800 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <XCircle className="h-5 w-5 opacity-80" />
            <span className="text-xs font-mono font-bold">{countCancelled}</span>
          </div>
          <strong className="block text-sm font-poppins font-bold mt-3">Canceladas</strong>
        </button>
      </div>

      {/* Control panel and filters */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone ou código do imóvel..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-primary-medium transition-colors"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-550 whitespace-nowrap">Classificar por:</span>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="w-full sm:w-auto bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-250 dark:border-zinc-800 text-[11px] font-bold text-gray-650 dark:text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-medium cursor-pointer transition-colors"
          >
            <option value="recentes">Mais Recentes</option>
            <option value="antigas">Mais Antigas</option>
            <option value="agendamento_proximo">Agendamento: Mais Próximo</option>
            <option value="agendamento_distante">Agendamento: Mais Distante</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-4 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-medium border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500 font-medium">Carregando solicitações de visita...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-sm">
          <div className="h-12 w-12 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
            <Inbox className="h-6 w-6 text-gray-300 dark:text-zinc-650" />
          </div>
          <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Nenhuma visita encontrada para este filtro.</p>
        </div>
      ) : (
        <div className="border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm divide-y divide-gray-100 dark:divide-zinc-800/70 overflow-hidden">
          {sortedVisits.map((visit) => {
            const statusInfo = statusConfig[visit.status] || statusConfig['Pendente'];
            const clientName = visit.usuario?.nome || 'Cliente Interessado';
            const isNew = visit.status === 'Pendente';
            const active = selectedVisitId === visit.id;
            
            return (
              <div 
                key={visit.id} 
                onClick={() => setSelectedVisitId(active ? null : visit.id)}
                className={`p-4 text-left cursor-pointer transition-all relative ${
                  active 
                    ? 'bg-primary-medium/10 dark:bg-zinc-800' 
                    : 'hover:bg-primary-medium/5 dark:hover:bg-zinc-800/60'
                }`}
              >
                {/* Left vertical indicator stripe matching message card style */}
                <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${
                  visit.status === 'Pendente' ? 'bg-amber-500' :
                  visit.status === 'Confirmada' ? 'bg-blue-500' :
                  visit.status === 'Concluída' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />

                {/* Pulsing dot for new/pending visits matching new messages */}
                {isNew && (
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                )}

                {/* Card Header matching MessagesList items layout */}
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getAvatarColor(clientName)} flex items-center justify-center shrink-0 shadow-sm`}>
                    <span className="text-white text-[11px] font-bold">{getInitials(clientName)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-xs truncate block ${isNew ? 'font-bold text-gray-800 dark:text-white' : 'font-semibold text-gray-600 dark:text-zinc-300'}`}>
                        {clientName}
                      </span>
                      <span className="text-[9px] text-gray-400 dark:text-zinc-555 shrink-0 font-medium">
                        {timeAgo(visit.created_at)}
                      </span>
                    </div>

                    <h4 className={`text-[11px] truncate mt-0.5 ${isNew ? 'font-bold text-primary-dark dark:text-primary-light' : 'font-semibold text-gray-500 dark:text-zinc-400'}`}>
                      Solicitação de Visita
                    </h4>

                    <div className="flex items-center justify-between mt-1.5 gap-2">
                      <p className="text-[10px] text-gray-400 dark:text-zinc-550 line-clamp-1 flex-1 font-sans">
                        {visit.observacoes || "Nenhuma observação informada."}
                      </p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Card Body: Details & related property mini card & actions */}
                {active && (
                  <div className="pl-[52px] mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                    {/* Contact info chips */}
                    <div className="flex flex-wrap gap-2">
                      {visit.usuario?.email && (
                        <a
                          href={`mailto:${visit.usuario.email}`}
                          className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-gray-150 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-750 transition-colors"
                        >
                          <Mail className="h-3 w-3 text-gray-400" />
                          {visit.usuario.email}
                        </a>
                      )}
                      {visit.usuario?.telefone && (
                        <a
                          href={`tel:${visit.usuario.telefone}`}
                          className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-gray-150 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-750 transition-colors"
                        >
                          <Phone className="h-3 w-3 text-gray-400" />
                          {formatPhone(visit.usuario.telefone)}
                        </a>
                      )}
                      {visit.usuario?.telefone && (
                        <a
                          href={`https://wa.me/55${visit.usuario.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          WhatsApp
                        </a>
                      )}
                    </div>

                    {/* Appointment info matching note style */}
                    <div className="bg-gray-50/80 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/50 space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-555" />
                        <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-555 uppercase tracking-wider">Agendamento</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-800 dark:text-zinc-200 font-bold text-xs">
                        <Calendar className="h-4 w-4 text-primary-medium" />
                        <span>{formatDateTime(visit.data_solicitada)}</span>
                      </div>
                      {visit.observacoes && (
                        <p className="text-xs text-gray-600 dark:text-zinc-400 italic font-sans leading-relaxed border-t border-gray-100 dark:border-zinc-800/50 pt-2.5 mt-2.5">
                          "{visit.observacoes}"
                        </p>
                      )}
                    </div>

                    {/* Related Property matching MessagesList details style */}
                    {visit.imovel && (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-primary-medium/20 bg-primary-medium/5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary-medium/10 flex items-center justify-center shrink-0">
                            <Building className="h-4 w-4 text-primary-medium" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold block text-xs text-primary-dark dark:text-primary-light truncate">
                              {visit.imovel.codigo} — {visit.imovel.titulo}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-550 font-sans block truncate">
                              {visit.imovel.cidade} / {visit.imovel.estado}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPropertyId(visit.imovel_id)}
                          className="text-[10px] bg-primary-dark hover:bg-primary-medium text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer border-none shrink-0"
                        >
                          Ver <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* Card Footer: Action button workflows */}
                    {visit.status === 'Pendente' && (
                      <div className="flex gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800/50">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(visit.id, 'Confirmada')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-none"
                        >
                          <Check className="h-4 w-4" /> Confirmar Visita
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(visit.id, 'Cancelada')}
                          className="bg-gray-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200/50 dark:bg-zinc-800 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 text-gray-650 dark:text-zinc-300 border border-gray-200 dark:border-zinc-750 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Recusar
                        </button>
                      </div>
                    )}

                    {visit.status === 'Confirmada' && (
                      <div className="flex gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800/50">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(visit.id, 'Concluída')}
                          className="flex-1 bg-primary-dark hover:bg-primary-medium text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-none"
                        >
                          <Check className="h-4 w-4" /> Marcar como Concluída
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(visit.id, 'Cancelada')}
                          className="bg-gray-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200/50 dark:bg-zinc-800 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 text-gray-650 dark:text-zinc-300 border border-gray-200 dark:border-zinc-750 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancelar Visita
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Property simulation preview modal */}
      {selectedPropertyId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-150 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              <h3 className="font-poppins font-bold text-gray-800 dark:text-white">Visualização do Anúncio (Simulação)</h3>
              <button 
                onClick={() => setSelectedPropertyId(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer border-none bg-transparent"
              >
                <X className="h-4 w-4" /> Fechar
              </button>
            </div>
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">
              <DetalheImovel id={selectedPropertyId} isPreview={true} onClose={() => setSelectedPropertyId(null)} hideInterestForm={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitasList;
