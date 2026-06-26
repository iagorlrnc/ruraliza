import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatDate, formatDateTime, formatPhone } from '../../utils/format';
import { 
  ArrowLeft, 
  Mail, 
  Phone as PhoneIcon, 
  MapPin, 
  Calendar, 
  BadgeCheck, 
  ShieldCheck,
  Building,
  Activity
} from 'lucide-react';

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

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
        <Link to="/usuarios" className="inline-flex items-center gap-1 text-primary-medium hover:text-primary-dark font-semibold text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para usuários
        </Link>
      </div>
    );
  }

  // Filter messages and visits associated with this user
  const userMessages = allMessages.filter(m => m.usuario_id === user.id);
  const userVisits = allVisits.filter(v => v.usuario_id === user.id);

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Breadcrumb Header */}
      <div>
        <Link to="/usuarios" className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary-medium transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar para usuários
        </Link>
        <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white mt-2">
          Ficha do Cliente / Histórico
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Profile Details (1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
            {/* User identification */}
            <div className="flex items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary-medium/10 text-primary-medium flex items-center justify-center font-poppins font-black text-lg shrink-0">
                {user.nome.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-gray-800 dark:text-white line-clamp-1 leading-snug">
                  {user.nome}
                </h3>
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${
                  user.perfil === 'Administrador' ? 'text-purple-600' : 'text-teal-600'
                }`}>
                  {user.perfil === 'Administrador' ? <ShieldCheck className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
                  {user.perfil}
                </span>
              </div>
            </div>

            {/* Core details */}
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[9px] text-gray-400 uppercase tracking-wider">E-mail</strong>
                  <span className="text-gray-700 dark:text-zinc-350 break-all">{user.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneIcon className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[9px] text-gray-400 uppercase tracking-wider">Telefone</strong>
                  <span className="text-gray-700 dark:text-zinc-350">{formatPhone(user.telefone) || 'Não cadastrado'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[9px] text-gray-400 uppercase tracking-wider">Cidade</strong>
                  <span className="text-gray-700 dark:text-zinc-350">{user.cidade || 'Não informada'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[9px] text-gray-400 uppercase tracking-wider">Data de Cadastro</strong>
                  <span className="text-gray-700 dark:text-zinc-350">{formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>

            {/* CRM Engagement indicators */}
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-3">
              <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary-medium" /> Métricas de Engajamento
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mensagens</span>
                  <strong className="text-lg text-primary-dark dark:text-primary-light block font-poppins">{userMessages.length}</strong>
                </div>
                <div className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Visitas</span>
                  <strong className="text-lg text-primary-dark dark:text-primary-light block font-poppins">{userVisits.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interaction timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Visit Requests */}
          <section className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
              Solicitações de Visitas Agendadas ({userVisits.length})
            </h3>

            {userVisits.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Nenhuma solicitação de visita registrada.</p>
            ) : (
              <div className="space-y-4">
                {userVisits.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] border border-gray-100 dark:border-zinc-800/80 rounded-2xl space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary-dark dark:text-primary-light">
                        <Building className="h-4 w-4 shrink-0" />
                        <span>Imóvel Relacionado: {v.imovel?.codigo || 'Cód. Indisponível'}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        v.status === 'Pendente' 
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                          : v.status === 'Confirmada'
                          ? 'bg-green-50 text-green-600 dark:bg-green-950/20'
                          : 'bg-red-50 text-red-600 dark:bg-red-950/20'
                      }`}>
                        Visita: {v.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-700 dark:text-zinc-300 font-sans space-y-1">
                      <div>
                        <strong>Data Agendada:</strong> {formatDateTime(v.data_solicitada)}
                      </div>
                      {v.observacoes && (
                        <div>
                          <strong>Notas de Agendamento:</strong> {v.observacoes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Contact Message History */}
          <section className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
              Histórico de Mensagens Enviadas ({userMessages.length})
            </h3>

            {userMessages.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Nenhuma mensagem registrada no histórico.</p>
            ) : (
              <div className="space-y-4">
                {userMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] border border-gray-100 dark:border-zinc-800/85 rounded-2xl text-xs space-y-2 text-left"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <strong className="block text-primary-dark dark:text-primary-light font-poppins">{msg.assunto}</strong>
                        <span className="text-[10px] text-gray-400 font-mono">{formatDateTime(msg.created_at)}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        msg.status === 'Nova' 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                          : msg.status === 'Em andamento'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                      }`}>
                        Mensagem: {msg.status}
                      </span>
                    </div>

                    <p className="text-gray-650 dark:text-zinc-350 leading-relaxed font-sans mt-2 whitespace-pre-wrap">
                      {msg.mensagem}
                    </p>

                    {msg.observacao_interna && (
                      <div className="bg-amber-50/50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-amber-100/50 dark:border-zinc-750 text-[11px] text-amber-800 dark:text-amber-400 font-sans mt-2">
                        <strong>Nota do Corretor:</strong> {msg.observacao_interna}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
