import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatDate, formatDateTime, formatPhone } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
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
  ExternalLink,
  Copy,
  Check,
  Inbox,
  X,
  Pencil,
  Bookmark
} from 'lucide-react';
import { StatusVisita } from '../../types';
import DetalheImovel from '../../pages/DetalheImovel';
import { parseNotes } from '../../utils/notes';

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
  const { user: currentUser } = useAuth();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'visits' | 'messages'>('all');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Notes state
  const [editingNoteState, setEditingNoteState] = useState<{ messageId: string; noteIndex: number; text: string } | null>(null);

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

  // Edit Note Mutation
  const editNoteMutation = useMutation({
    mutationFn: (payload: { messageId: string; noteIndex: number; text: string }) => 
      api.updateInternalNote(payload.messageId, payload.noteIndex, payload.text),
    onSuccess: () => {
      showToast('Observação atualizada com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setEditingNoteState(null);
    },
    onError: () => {
      showToast('Erro ao atualizar observação.', 'error');
    }
  });

  // Delete Note Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (payload: { messageId: string; noteIndex: number }) => 
      api.deleteInternalNote(payload.messageId, payload.noteIndex),
    onSuccess: () => {
      showToast('Observação excluída com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: () => {
      showToast('Erro ao excluir observação.', 'error');
    }
  });

  const handleSaveEditedNote = () => {
    if (!editingNoteState) return;
    editNoteMutation.mutate({
      messageId: editingNoteState.messageId,
      noteIndex: editingNoteState.noteIndex,
      text: editingNoteState.text.trim()
    });
  };

  const handleDeleteNote = (messageId: string, noteIndex: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      deleteNoteMutation.mutate({ messageId, noteIndex });
    }
  };

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
                  const currentMessage = item.type === 'message' ? allMessages.find(m => m.id === item.id) : null;

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

                        {/* Note block below message */}
                        {item.type === 'message' && currentMessage && (
                          <div className="mt-4 border-t border-gray-250/20 dark:border-zinc-800/60 pt-4 space-y-3 shrink-0">
                            
                            {/* Notes List */}
                            <div className="space-y-3">
                              {parseNotes(currentMessage.observacao_interna).map((note, idx) => {
                                const isMyNote = note.userId === currentUser?.id || note.userName === currentUser?.nome;
                                const isEditing = editingNoteState?.messageId === currentMessage.id && editingNoteState?.noteIndex === idx;

                                return (
                                  <div key={idx} className="bg-amber-50/40 dark:bg-amber-950/10 p-3 rounded-2xl border border-amber-250/20 dark:border-amber-900/20 flex flex-col space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                                        <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                                          Notas de {note.userName}
                                        </span>
                                      </div>
                                      {isMyNote && (
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => setEditingNoteState({ messageId: currentMessage.id, noteIndex: idx, text: note.text })}
                                            className="text-gray-400 hover:text-primary-medium dark:hover:text-primary-light p-1 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                                            title="Editar Nota"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteNote(currentMessage.id, idx)}
                                            className="text-gray-400 hover:text-red-655 p-1 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                                            title="Excluir Nota"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {isEditing ? (
                                      <div className="space-y-2">
                                        <textarea
                                          rows={2}
                                          value={editingNoteState.text}
                                          onChange={(e) => setEditingNoteState(prev => prev ? { ...prev, text: e.target.value } : null)}
                                          className="w-full text-xs rounded-xl border border-primary-medium bg-white dark:bg-zinc-900 p-2.5 focus:outline-none dark:text-white resize-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setEditingNoteState(null)}
                                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors border-none cursor-pointer"
                                          >
                                            Cancelar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={handleSaveEditedNote}
                                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary-dark text-white hover:bg-primary-medium transition-colors border-none cursor-pointer shadow-sm"
                                          >
                                            Salvar
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                                        {note.text}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
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
                                <button
                                  type="button"
                                  onClick={() => setSelectedPropertyId(item.rawItem.imovel_id)}
                                  className="text-[9px] bg-white hover:bg-gray-100 text-gray-700 border border-gray-250 dark:border-zinc-800 px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                                >
                                  Ver Imóvel
                                </button>
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

export default UserDetails;
