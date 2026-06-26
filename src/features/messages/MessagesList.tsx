import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatDateTime, formatPhone } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';
import { Search, Mail, Phone as PhoneIcon, Building, Bookmark, Save } from 'lucide-react';
import { Mensagem, StatusMensagem } from '../../types';

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

  return (
    <div className="space-y-6 text-left h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex justify-between items-center">
        <div>
          <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Mensagens Recebidas</h2>
          <p className="text-xs text-gray-500 mt-0.5">Gerencie os contatos, pedidos de visitas e propostas rurais.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div className="sm:col-span-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar por nome, e-mail, telefone ou conteúdo da mensagem..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none dark:text-white"
          />
        </div>
        <div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
          >
            <option value="">Todos os status</option>
            <option value="Nova">Nova</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Respondida">Respondida</option>
            <option value="Arquivada">Arquivada</option>
          </select>
        </div>
      </div>

      {/* Split Pane View */}
      <div className="flex-1 min-h-0 flex gap-6">
        {/* Messages List pane */}
        <section className="w-full sm:w-2/5 border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl overflow-y-auto shadow-sm divide-y divide-gray-100 dark:divide-zinc-800">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 skeleton-shimmer"></div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <p className="text-xs text-gray-400 p-8 text-center">Nenhuma mensagem encontrada.</p>
          ) : (
            filteredMessages.map((msg) => {
              const active = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessageId(msg.id)}
                  className={`p-4 text-left cursor-pointer transition-colors ${
                    active ? 'bg-primary-medium/5 dark:bg-zinc-800' : 'hover:bg-gray-50/50 dark:hover:bg-zinc-850/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-xs text-gray-800 dark:text-white truncate">
                      {msg.nome}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      msg.status === 'Nova' 
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' 
                        : msg.status === 'Em andamento'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                        : msg.status === 'Respondida'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                        : 'bg-gray-100 text-gray-500 dark:bg-zinc-850 dark:text-zinc-400'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-bold text-primary-dark dark:text-primary-light truncate mt-1">
                    {msg.assunto}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-0.5 font-sans leading-normal">
                    {msg.mensagem}
                  </p>
                  <span className="text-[9px] text-gray-400 block mt-2 font-mono">
                    {formatDateTime(msg.created_at)}
                  </span>
                </div>
              );
            })
          )}
        </section>

        {/* Message Details details pane */}
        <section className="hidden sm:flex sm:w-3/5 border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm flex-col justify-between overflow-y-auto">
          {selectedMessage ? (
            <div className="space-y-6 flex flex-col justify-between h-full">
              {/* Header details */}
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="font-poppins text-base font-bold text-gray-800 dark:text-white">
                      {selectedMessage.assunto}
                    </h3>
                    <div className="text-xs text-gray-400">
                      Recebida em: <span className="font-mono">{formatDateTime(selectedMessage.created_at)}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">Status</label>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => handleUpdateStatus(selectedMessage, e.target.value as StatusMensagem)}
                      className="text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-1.5 px-3 focus:outline-none dark:text-white font-bold"
                    >
                      <option value="Nova">Nova</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Respondida">Respondida</option>
                      <option value="Arquivada">Arquivada</option>
                    </select>
                  </div>
                </div>

                {/* Sender details */}
                <div className="grid grid-cols-2 gap-4 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80">
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cliente</div>
                    <span className="block font-bold text-xs text-gray-800 dark:text-zinc-200">{selectedMessage.nome}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Canais</div>
                    <div className="flex flex-col text-[11px] space-y-0.5 text-gray-600 dark:text-zinc-350 font-sans">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-gray-400" /> {selectedMessage.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PhoneIcon className="h-3.5 w-3.5 text-gray-400" /> {formatPhone(selectedMessage.telefone)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/50 text-xs text-gray-750 dark:text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedMessage.mensagem}
              </div>

              {/* Related Property (if any) */}
              {selectedMessage.imovel && (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-primary-medium/20 bg-primary-medium/5 text-xs">
                  <div className="flex items-center gap-2">
                    <Building className="h-4.5 w-4.5 text-primary-medium shrink-0" />
                    <div>
                      <span className="font-bold block text-primary-dark dark:text-primary-light">
                        Imóvel Relacionado: {selectedMessage.imovel.codigo}
                      </span>
                      <span className="text-[10px] text-gray-400 font-sans leading-none block">
                        {selectedMessage.imovel.titulo} - {selectedMessage.imovel.cidade} / {selectedMessage.imovel.estado}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/imoveis/editar/${selectedMessage.imovel_id}`}
                    className="text-[10px] bg-primary-dark hover:bg-primary-medium text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                  >
                    Ver Imóvel
                  </Link>
                </div>
              )}

              {/* Internal Observations Note */}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Bookmark className="h-3.5 w-3.5" /> Observações Internas (Corretor)
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={observacaoInterna}
                    onChange={(e) => setObservacaoInterna(e.target.value)}
                    placeholder="Adicione notas sobre o andamento do atendimento, chamadas feitas, e-mails enviados..."
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-850 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] p-2.5 focus:outline-none dark:text-white resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveObservation(selectedMessage)}
                    className="bg-primary-dark hover:bg-primary-medium text-white px-3 rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                    title="Salvar Notas"
                  >
                    <Save className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Nenhuma mensagem selecionada.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagesList;
