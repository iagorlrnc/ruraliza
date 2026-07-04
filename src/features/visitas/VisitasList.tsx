import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatDateTime, formatPhone, formatCurrency } from '../../utils/format';
import { 
  Calendar, Clock, CheckCircle2, XCircle, Search, 
  Phone, Mail, X, Inbox, Check,
} from 'lucide-react';
import { StatusVisita } from '../../types';
import DetalheImovel from '../../pages/DetalheImovel';

const statusConfig: Record<StatusVisita, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  'Pendente': { label: 'Solicitada', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30', icon: Clock },
  'Confirmada': { label: 'Confirmada', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30', icon: CheckCircle2 },
  'Cancelada': { label: 'Cancelada', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-800/30', icon: XCircle },
  'Concluída': { label: 'Concluída', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/30', icon: Calendar }
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const VisitasList: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('Pendente');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

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

  // Count metrics
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setFiltroStatus('Pendente')}
          className={`p-4 rounded-3xl border transition-all text-left shadow-sm cursor-pointer ${
            filtroStatus === 'Pendente' 
              ? 'bg-amber-500 text-white border-amber-600 dark:border-amber-400/20' 
              : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 text-gray-800 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <Clock className="h-5 w-5 opacity-80" />
            <span className="text-xs font-mono font-bold">{countPending}</span>
          </div>
          <strong className="block text-sm font-poppins font-bold mt-3">Solicitadas (Pendente)</strong>
        </button>

        <button
          onClick={() => setFiltroStatus('Confirmada')}
          className={`p-4 rounded-3xl border transition-all text-left shadow-sm cursor-pointer ${
            filtroStatus === 'Confirmada' 
              ? 'bg-emerald-600 text-white border-emerald-700 dark:border-emerald-500/20' 
              : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 text-gray-800 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <CheckCircle2 className="h-5 w-5 opacity-80" />
            <span className="text-xs font-mono font-bold">{countConfirmed}</span>
          </div>
          <strong className="block text-sm font-poppins font-bold mt-3">Confirmadas</strong>
        </button>

        <button
          onClick={() => setFiltroStatus('Concluída')}
          className={`p-4 rounded-3xl border transition-all text-left shadow-sm cursor-pointer ${
            filtroStatus === 'Concluída' 
              ? 'bg-blue-600 text-white border-blue-700 dark:border-blue-500/20' 
              : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 text-gray-800 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <Calendar className="h-5 w-5 opacity-80" />
            <span className="text-xs font-mono font-bold">{countCompleted}</span>
          </div>
          <strong className="block text-sm font-poppins font-bold mt-3">Concluídas</strong>
        </button>

        <button
          onClick={() => setFiltroStatus('Cancelada')}
          className={`p-4 rounded-3xl border transition-all text-left shadow-sm cursor-pointer ${
            filtroStatus === 'Cancelada' 
              ? 'bg-rose-600 text-white border-rose-700 dark:border-rose-500/20' 
              : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 text-gray-800 dark:text-white'
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
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone ou código do imóvel..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-primary-medium transition-colors"
          />
        </div>

        {/* Tab filters */}
        <div className="flex bg-gray-100/50 dark:bg-zinc-800/40 p-1 rounded-xl border border-gray-250/50 dark:border-zinc-800 text-[11px] font-bold w-full md:w-auto overflow-x-auto shrink-0 justify-center">
          {['Pendente', 'Confirmada', 'Concluída', 'Cancelada', 'Todas'].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filtroStatus === status 
                  ? 'bg-white dark:bg-zinc-900 text-primary-medium shadow-sm border border-gray-200/20 dark:border-zinc-700/50' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
            >
              {status === 'Todas' ? 'Todas' : statusConfig[status as StatusVisita]?.label}
            </button>
          ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVisits.map((visit) => {
            const statusInfo = statusConfig[visit.status] || statusConfig['Pendente'];
            const StatusIcon = statusInfo.icon;
            const clientName = visit.usuario?.nome || 'Cliente Interessado';
            
            return (
              <div 
                key={visit.id} 
                className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                {/* Left vertical indicator stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  visit.status === 'Pendente' ? 'bg-amber-400' :
                  visit.status === 'Confirmada' ? 'bg-emerald-500' :
                  visit.status === 'Concluída' ? 'bg-blue-500' : 'bg-rose-500'
                }`} />

                {/* Card Header: Client details */}
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary-medium to-primary-dark text-white flex items-center justify-center font-poppins font-black text-sm shadow-sm shrink-0">
                    {getInitials(clientName)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-poppins font-bold text-gray-850 dark:text-white text-xs truncate">
                        {clientName}
                      </h4>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border tracking-wide flex items-center gap-1 shrink-0 ${statusInfo.bg} ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" /> {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400 dark:text-zinc-550">
                      {visit.usuario?.telefone && (
                        <a 
                          href={`https://wa.me/55${visit.usuario.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span>{formatPhone(visit.usuario.telefone)}</span>
                        </a>
                      )}
                      {visit.usuario?.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{visit.usuario.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body: Request scheduling detail & property mini card */}
                <div className="space-y-4">
                  
                  {/* Appointment info */}
                  <div className="bg-gray-50/50 dark:bg-zinc-950/30 border border-gray-150 dark:border-zinc-800/80 p-3 rounded-2xl space-y-1">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Data Solicitada</span>
                    <div className="flex items-center gap-1.5 text-gray-800 dark:text-zinc-300 font-sans font-bold text-xs">
                      <Calendar className="h-4 w-4 text-primary-medium" />
                      <span>{formatDateTime(visit.data_solicitada)}</span>
                    </div>
                    {visit.observacoes && (
                      <p className="text-[11px] text-gray-500 dark:text-zinc-450 pt-1 border-t border-gray-150 dark:border-zinc-850 mt-2 italic font-sans leading-relaxed">
                        "{visit.observacoes}"
                      </p>
                    )}
                  </div>

                  {/* Property Mini-Card */}
                  {visit.imovel && (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl p-2.5 flex items-center gap-3">
                      <img 
                        src={visit.imovel.imagens?.[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'} 
                        alt={visit.imovel.titulo}
                        className="h-14 w-20 object-cover rounded-xl shrink-0 bg-gray-50"
                      />
                      <div className="min-w-0 flex-1">
                        <strong className="block text-[9px] text-primary-medium font-bold uppercase tracking-wider">Código {visit.imovel.codigo}</strong>
                        <h5 className="font-poppins font-bold text-gray-800 dark:text-white text-[11px] truncate mt-0.5 leading-tight">{visit.imovel.titulo}</h5>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-zinc-400 mt-1 font-semibold">
                          <span>{formatCurrency(visit.imovel.valor)}</span>
                          <span className="text-gray-300 dark:text-zinc-700">•</span>
                          <span>{visit.imovel.cidade} - {visit.imovel.estado}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPropertyId(visit.imovel_id)}
                        className="text-[9px] bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                      >
                        Ver Imóvel
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Footer: Action button workflows */}
                {visit.status === 'Pendente' && (
                  <div className="flex gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
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
                  <div className="flex gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
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
