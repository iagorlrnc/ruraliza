import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatDateTime, formatPhone } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';
import { 
  Search, Mail, Phone as PhoneIcon, Building, Bookmark, Save, 
  MessageSquare, Clock, CheckCircle2, Archive, Inbox, Calendar, ChevronRight, ExternalLink
} from 'lucide-react';
import { Mensagem, StatusMensagem } from '../../types';

const statusConfig: Record<StatusMensagem, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  'Nova': { label: 'Nova', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-800/30', icon: Inbox },
  'Em andamento': { label: 'Em andamento', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/30', icon: Clock },
  'Respondida': { label: 'Respondida', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/30', icon: CheckCircle2 },
  'Arquivada': { label: 'Arquivada', color: 'text-gray-500 dark:text-zinc-400', bg: 'bg-gray-50 dark:bg-zinc-800/50 border-gray-200/50 dark:border-zinc-700/30', icon: Archive },
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

const MessagesList: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  // Note editing state
  const [observacaoInterna, setObservacaoInterna] = useState('');

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: api.getMessages
  });

  // Status/Note Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; status: StatusMensagem; observacao?: string }) => 
      api.updateMessageStatus(payload.id, payload.status, payload.observacao),
    onSuccess: () => {
      showToast('Mensagem atualizada com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: () => {
      showToast('Erro ao atualizar mensagem.', 'error');
    }
  });

  const handleUpdateStatus = (msg: Mensagem, newStatus: StatusMensagem) => {
    updateMutation.mutate({
      id: msg.id,
      status: newStatus,
      observacao: msg.observacao_interna
    });
  };

  const handleSaveObservation = (msg: Mensagem) => {
    updateMutation.mutate({
      id: msg.id,
      status: msg.status,
      observacao: observacaoInterna
    });
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const bLower = busca.toLowerCase();
    const matchSearch = 
      msg.nome.toLowerCase().includes(bLower) ||
      msg.email.toLowerCase().includes(bLower) ||
      msg.telefone?.includes(bLower) ||
      msg.assunto.toLowerCase().includes(bLower) ||
      msg.mensagem.toLowerCase().includes(bLower);

    const matchStatus = filtroStatus ? msg.status === filtroStatus : true;

    return matchSearch && matchStatus;
  });

  // Select message details object
  const selectedMessage = messages.find(m => m.id === selectedMessageId) || (filteredMessages.length > 0 ? filteredMessages[0] : null);

  // Sync internal observation editor when selected message changes
  React.useEffect(() => {
    if (selectedMessage) {
      setObservacaoInterna(selectedMessage.observacao_interna || '');
    }
  }, [selectedMessage?.id]);

  // Status counters
  const statusCounts = {
    total: messages.length,
    Nova: messages.filter(m => m.status === 'Nova').length,
    'Em andamento': messages.filter(m => m.status === 'Em andamento').length,
    Respondida: messages.filter(m => m.status === 'Respondida').length,
    Arquivada: messages.filter(m => m.status === 'Arquivada').length,
  };

  // Time ago helper
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

  return (
    <div className="space-y-4 text-left min-h-[calc(100dvh-112px)] flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary-medium/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary-medium" />
            </div>
            Mensagens Recebidas
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 ml-10">
            Gerencie contatos, propostas e solicitações de visita.
          </p>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(statusConfig) as StatusMensagem[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const count = statusCounts[status];
          const isActive = filtroStatus === status;

          return (
            <button
              key={status}
              onClick={() => setFiltroStatus(isActive ? '' : status)}
              className={`relative p-3 rounded-2xl border transition-all text-left cursor-pointer group ${
                isActive 
                  ? `${config.bg} border-current shadow-sm` 
                  : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${isActive ? config.bg : 'bg-gray-50 dark:bg-zinc-800'}`}>
                  <Icon className={`h-4 w-4 ${isActive ? config.color : 'text-gray-400 dark:text-zinc-500'}`} />
                </div>
                <span className={`text-lg font-poppins font-bold ${isActive ? config.color : 'text-gray-800 dark:text-white'}`}>
                  {count}
                </span>
              </div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider mt-2 ${isActive ? config.color : 'text-gray-400 dark:text-zinc-500'}`}>
                {config.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="shrink-0 flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 px-4 py-2.5 rounded-2xl shadow-sm">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Pesquisar por nome, e-mail, telefone ou conteúdo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none dark:text-white placeholder:text-gray-400"
        />
        {busca && (
          <button onClick={() => setBusca('')} className="text-[10px] text-gray-400 hover:text-gray-600 font-bold cursor-pointer shrink-0">
            Limpar
          </button>
        )}
      </div>

      {/* Split Pane View */}
      <div className="flex-1 flex gap-5">
        {/* Messages List pane */}
        <section className="w-full sm:w-[380px] shrink-0 border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-zinc-800 skeleton-shimmer"></div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                <Inbox className="h-6 w-6 text-gray-300 dark:text-zinc-600" />
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 text-center font-medium">
                Nenhuma mensagem encontrada.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800/70">
              {filteredMessages.map((msg) => {
                const active = selectedMessage?.id === msg.id;
                const sConfig = statusConfig[msg.status];
                const isNew = msg.status === 'Nova';

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessageId(msg.id)}
                    className={`p-4 text-left cursor-pointer transition-all relative ${
                      active 
                        ? 'bg-primary-medium/10 dark:bg-zinc-800' 
                        : 'hover:bg-primary-medium/5 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-primary-medium rounded-r-full"></div>
                    )}

                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getAvatarColor(msg.nome)} flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-white text-[11px] font-bold">{getInitials(msg.nome)}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-xs truncate block ${isNew ? 'font-bold text-gray-800 dark:text-white' : 'font-semibold text-gray-600 dark:text-zinc-300'}`}>
                            {msg.nome}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-zinc-500 shrink-0 font-medium">
                            {timeAgo(msg.created_at)}
                          </span>
                        </div>

                        <h4 className={`text-[11px] truncate mt-0.5 ${isNew ? 'font-bold text-primary-dark dark:text-primary-light' : 'font-semibold text-gray-500 dark:text-zinc-400'}`}>
                          {msg.assunto}
                        </h4>

                        <div className="flex items-center justify-between mt-1.5 gap-2">
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500 line-clamp-1 flex-1 font-sans">
                            {msg.mensagem}
                          </p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${sConfig.bg} ${sConfig.color}`}>
                            {sConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* New message dot */}
                    {isNew && (
                      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Message Detail pane */}
        <section className="hidden sm:flex flex-1 border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm flex-col overflow-hidden">
          {selectedMessage ? (() => {
            const sConfig = statusConfig[selectedMessage.status];
            return (
              <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="p-5 pb-4 border-b border-gray-100 dark:border-zinc-800 space-y-4 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${getAvatarColor(selectedMessage.nome)} flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-white text-xs font-bold">{getInitials(selectedMessage.nome)}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white truncate">
                          {selectedMessage.assunto}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-gray-600 dark:text-zinc-300">{selectedMessage.nome}</span>
                          <span className="text-[9px] text-gray-400">•</span>
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(selectedMessage.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status selector */}
                    <div className="shrink-0">
                      <select
                        value={selectedMessage.status}
                        onChange={(e) => handleUpdateStatus(selectedMessage, e.target.value as StatusMensagem)}
                        className={`text-[10px] font-bold rounded-xl border py-1.5 px-3 focus:outline-none cursor-pointer ${sConfig.bg} ${sConfig.color}`}
                      >
                        <option value="Nova">● Nova</option>
                        <option value="Em andamento">● Em andamento</option>
                        <option value="Respondida">● Respondida</option>
                        <option value="Arquivada">● Arquivada</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact info chips */}
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-gray-150 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-750 transition-colors"
                    >
                      <Mail className="h-3 w-3 text-gray-400" />
                      {selectedMessage.email}
                    </a>
                    {selectedMessage.telefone && (
                      <a
                        href={`tel:${selectedMessage.telefone}`}
                        className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-gray-150 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-750 transition-colors"
                      >
                        <PhoneIcon className="h-3 w-3 text-gray-400" />
                        {formatPhone(selectedMessage.telefone)}
                      </a>
                    )}
                    {selectedMessage.telefone && (
                      <a
                        href={`https://wa.me/55${selectedMessage.telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-5 space-y-4 flex flex-col">
                  <div className="bg-gray-50/80 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/50 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      <MessageSquare className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500" />
                      <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Mensagem</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {selectedMessage.mensagem}
                    </p>
                  </div>

                  {/* Related Property */}
                  {selectedMessage.imovel && (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-primary-medium/20 bg-primary-medium/5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary-medium/10 flex items-center justify-center">
                          <Building className="h-4 w-4 text-primary-medium" />
                        </div>
                        <div>
                          <span className="font-bold block text-xs text-primary-dark dark:text-primary-light">
                            {selectedMessage.imovel.codigo} — {selectedMessage.imovel.titulo}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-sans block">
                            {selectedMessage.imovel.cidade} / {selectedMessage.imovel.estado}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/imoveis/editar/${selectedMessage.imovel_id}`}
                        className="text-[10px] bg-primary-dark hover:bg-primary-medium text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1"
                      >
                        Ver <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Internal Observations - Footer */}
                <div className="border-t border-gray-100 dark:border-zinc-800 p-4 shrink-0 bg-gray-50/50 dark:bg-zinc-900/80">
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Bookmark className="h-3.5 w-3.5" /> Observações Internas
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={observacaoInterna}
                      onChange={(e) => setObservacaoInterna(e.target.value)}
                      placeholder="Notas sobre andamento, ligações, e-mails enviados..."
                      className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 focus:outline-none dark:text-white resize-none placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveObservation(selectedMessage)}
                      className="bg-primary-dark hover:bg-primary-medium text-white px-3.5 rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-colors"
                      title="Salvar Notas"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="h-full flex flex-col items-center justify-center p-8 space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                <Mail className="h-7 w-7 text-gray-300 dark:text-zinc-600" />
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Selecione uma mensagem para visualizar</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagesList;
