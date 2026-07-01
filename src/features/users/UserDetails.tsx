import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatDate, formatDateTime, formatPhone } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';
import { 
  ArrowLeft, 
  Mail, 
  Phone as PhoneIcon, 
  MapPin, 
  Calendar, 
  BadgeCheck, 
  ShieldCheck,
  Building,
  Activity,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Inbox
} from 'lucide-react';
import { StatusVisita } from '../../types';

interface TimelineItem {
  id: string;
  type: 'visit' | 'message';
  date: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  statusBg: string;
  metadata?: any;
  rawItem: any;
}

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'visits' | 'messages'>('all');

  // Fetch user profile details
  const { data: user, isLoading: loadingUser, error } = useQuery({
    queryKey: ['user-details', id],
    queryFn: () => api.getUserById(id || ''),
    enabled: !!id
  });

  // Fetch messages to extract history for this user
  const { data: allMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages'],
    queryFn: api.getMessages
  });

  // Fetch visits to extract history for this user
  const { data: allVisits = [], isLoading: loadingVisits } = useQuery({
    queryKey: ['visits'],
    queryFn: api.getVisits
  });

  // Mutation to update visit status directly from CRM detail
  const updateVisitStatusMutation = useMutation({
    mutationFn: (payload: { visitId: string; status: StatusVisita }) =>
      api.updateVisitStatus(payload.visitId, payload.status),
    onSuccess: () => {
      showToast('Status da visita atualizado com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
    onError: () => {
      showToast('Erro ao atualizar status da visita.', 'error');
    }
  });

  if (loadingUser || loadingMessages || loadingVisits) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-medium border-t-transparent mx-auto"></div>
        <p className="text-sm text-gray-500 font-medium">Carregando perfil do lead...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4 text-left">
        <h2 className="font-poppins text-lg font-bold text-red-600">Usuário não encontrado</h2>
        <Link to="/clientes" className="inline-flex items-center gap-1 text-primary-medium hover:text-primary-dark font-semibold text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para clientes
        </Link>
      </div>
    );
  }

  // Filter messages and visits associated with this user
  const userMessages = allMessages.filter(m => m.usuario_id === user.id);
  const userVisits = allVisits.filter(v => v.usuario_id === user.id);

  // Generate Timeline Items
  const timelineItems: TimelineItem[] = [
    ...userVisits.map((v) => {
      let statusColor = 'text-amber-600 dark:text-amber-400';
      let statusBg = 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/55';
      if (v.status === 'Confirmada') {
        statusColor = 'text-green-600 dark:text-green-400';
        statusBg = 'bg-green-50 dark:bg-green-950/20 border-green-200/55';
      } else if (v.status === 'Cancelada') {
        statusColor = 'text-rose-600 dark:text-rose-400';
        statusBg = 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/55';
      } else if (v.status === 'Concluída') {
        statusColor = 'text-primary-medium';
        statusBg = 'bg-primary-medium/5 border-primary-medium/20';
      }

      return {
        id: v.id,
        type: 'visit' as const,
        date: v.created_at || v.data_solicitada,
        title: `Solicitação de Visita - Imóvel ${v.imovel?.codigo || 'N/A'}`,
        description: v.observacoes || 'Sem observações adicionais para a visita.',
        status: `Visita ${v.status}`,
        statusColor,
        statusBg,
        rawItem: v
      };
    }),
    ...userMessages.map((m) => {
      let statusColor = 'text-rose-600 dark:text-rose-400';
      let statusBg = 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/55';
      if (m.status === 'Em andamento') {
        statusColor = 'text-amber-600 dark:text-amber-400';
        statusBg = 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/55';
      } else if (m.status === 'Respondida') {
        statusColor = 'text-emerald-600 dark:text-emerald-400';
        statusBg = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/55';
      } else if (m.status === 'Arquivada') {
        statusColor = 'text-gray-500';
        statusBg = 'bg-gray-50 dark:bg-zinc-800/40 border-gray-200/55';
      }

      return {
        id: m.id,
        type: 'message' as const,
        date: m.created_at,
        title: m.assunto === 'Contato Geral via Site' ? 'Contato Geral via Site' : `Assunto: ${m.assunto}`,
        description: m.mensagem,
        status: `Mensagem: ${m.status}`,
        statusColor,
        statusBg,
        metadata: m.observacao_interna ? { note: m.observacao_interna } : undefined,
        rawItem: m
      };
    })
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter timeline based on active tab
  const filteredTimeline = timelineItems.filter(item => {
    if (activeTab === 'visits') return item.type === 'visit';
    if (activeTab === 'messages') return item.type === 'message';
    return true;
  });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast('Copiado para a área de transferência.', 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUpdateVisitStatus = (visitId: string, status: StatusVisita) => {
    updateVisitStatusMutation.mutate({ visitId, status });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/clientes" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary-medium transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar para clientes
          </Link>
          <h2 className="font-poppins text-xl font-bold text-gray-800 dark:text-white mt-1.5 flex items-center gap-2">
            Ficha do Lead & Histórico de Interações
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
            
            {/* Top User Intro */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-gray-100 dark:border-zinc-800 space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-medium to-primary-dark text-white flex items-center justify-center font-poppins font-black text-2xl shadow-md">
                {getInitials(user.nome)}
              </div>
              <div className="space-y-1">
                <h3 className="font-poppins font-bold text-base text-gray-850 dark:text-white leading-tight">
                  {user.nome}
                </h3>
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  user.perfil === 'Administrador' 
                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20' 
                    : 'bg-teal-50 text-teal-600 dark:bg-teal-950/20'
                }`}>
                  {user.perfil === 'Administrador' ? <ShieldCheck className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
                  {user.perfil}
                </span>
              </div>
            </div>

            {/* Core Fields */}
            <div className="space-y-4 text-xs">
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors group">
                <div className="flex items-start gap-3 min-w-0">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="block text-[9px] text-gray-400 uppercase tracking-wider">E-mail</strong>
                    <span className="text-gray-750 dark:text-zinc-300 break-all font-sans font-medium">{user.email}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopy(user.email, 'email')} 
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-all text-gray-400 cursor-pointer shrink-0"
                  title="Copiar e-mail"
                >
                  {copiedField === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex items-start justify-between gap-2 p-2.5 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors group">
                <div className="flex items-start gap-3 min-w-0">
                  <PhoneIcon className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <strong className="block text-[9px] text-gray-400 uppercase tracking-wider">Telefone</strong>
                    <span className="text-gray-750 dark:text-zinc-300 font-sans font-medium">
                      {formatPhone(user.telefone) || 'Não cadastrado'}
                    </span>
                  </div>
                </div>
                {user.telefone && (
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleCopy(user.telefone || '', 'phone')} 
                      className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-400 cursor-pointer"
                      title="Copiar telefone"
                    >
                      {copiedField === 'phone' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={`https://wa.me/55${user.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 rounded-lg"
                      title="Chamar no WhatsApp"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-2.5">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[9px] text-gray-400 uppercase tracking-wider">Cidade</strong>
                  <span className="text-gray-750 dark:text-zinc-300 font-sans font-medium">{user.cidade || 'Não informada'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[9px] text-gray-400 uppercase tracking-wider">Membro Desde</strong>
                  <span className="text-gray-750 dark:text-zinc-300 font-sans font-medium">{formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-5 space-y-4">
              <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary-medium" /> Atividade no Portal
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-50/50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800/80">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mensagens</span>
                  <strong className="text-xl text-primary-dark dark:text-primary-light block font-poppins mt-1">
                    {userMessages.length}
                  </strong>
                </div>
                <div className="bg-gray-50/50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800/80">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Visitas</span>
                  <strong className="text-xl text-primary-dark dark:text-primary-light block font-poppins mt-1">
                    {userVisits.length}
                  </strong>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Interaction timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
            
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
                Linha do Tempo de Interações
              </h3>

              <div className="flex bg-gray-100/50 dark:bg-zinc-800/40 p-1 rounded-xl border border-gray-250/50 dark:border-zinc-800 text-[11px] font-bold">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'all' 
                      ? 'bg-white dark:bg-zinc-900 text-primary-medium shadow-sm border border-gray-200/20 dark:border-zinc-700/50' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Tudo
                </button>
                <button
                  onClick={() => setActiveTab('visits')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'visits' 
                      ? 'bg-white dark:bg-zinc-900 text-primary-medium shadow-sm border border-gray-200/20 dark:border-zinc-700/50' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Visitas ({userVisits.length})
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'messages' 
                      ? 'bg-white dark:bg-zinc-900 text-primary-medium shadow-sm border border-gray-200/20 dark:border-zinc-700/50' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Mensagens ({userMessages.length})
                </button>
              </div>
            </div>

            {/* Timeline Items */}
            {filteredTimeline.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="h-10 w-10 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto">
                  <Inbox className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Nenhum evento registrado no histórico.</p>
              </div>
            ) : (
              <div className="relative border-l border-gray-150 dark:border-zinc-800 ml-4 pl-6 space-y-6 py-2">
                {filteredTimeline.map((item) => {
                  const isVisit = item.type === 'visit';

                  return (
                    <div key={item.id} className="relative group">
                      
                      {/* Circle Dot indicator */}
                      <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border-2 border-primary-medium/40 group-hover:border-primary-medium transition-colors">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-medium"></span>
                      </span>

                      {/* Content Card */}
                      <div className="bg-gray-100/60 dark:bg-zinc-950/45 border border-gray-200/50 dark:border-zinc-850/60 p-4 rounded-2xl hover:shadow-sm transition-all text-xs space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <h4 className="font-poppins font-bold text-gray-800 dark:text-white">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono block">
                              {formatDateTime(item.date)}
                            </span>
                          </div>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md border tracking-wide ${item.statusBg} ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Event Details/Content */}
                        <div className="text-gray-700 dark:text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                          {item.description}
                        </div>

                        {/* Internal notes metadata if message has notes */}
                        {item.metadata?.note && (
                          <div className="bg-amber-50/50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-amber-100/50 dark:border-zinc-750 text-[10px] text-amber-800 dark:text-amber-400 font-sans flex items-start gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                            <div>
                              <strong className="block font-bold mb-0.5">Nota do Corretor:</strong>
                              {item.metadata.note}
                            </div>
                          </div>
                        )}

                        {/* Action buttons inside timeline */}
                        {isVisit && (
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200/50 dark:border-zinc-800/80">
                            
                            {/* Property preview tag */}
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 dark:text-zinc-400">
                              <Building className="h-3.5 w-3.5 text-primary-medium" />
                              <span>{item.rawItem.imovel?.titulo}</span>
                            </div>

                            {/* Actions for visits */}
                            <div className="flex gap-2">
                              {item.rawItem.imovel_id && (
                                <Link
                                  to={`/imoveis/editar/${item.rawItem.imovel_id}`}
                                  className="text-[9px] bg-white hover:bg-gray-100 text-gray-700 border border-gray-250 dark:border-zinc-800 px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                                >
                                  Ver Imóvel
                                </Link>
                              )}
                              
                              {item.rawItem.status === 'Pendente' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateVisitStatus(item.id, 'Confirmada')}
                                    className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    onClick={() => handleUpdateVisitStatus(item.id, 'Cancelada')}
                                    className="text-[9px] bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                                  >
                                    Recusar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
