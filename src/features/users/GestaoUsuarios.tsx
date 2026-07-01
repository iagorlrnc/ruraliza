import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatPhone } from '../../utils/format';
import { 
  Search, ShieldCheck, BadgeCheck, Edit2, Check, X, 
  UserPlus, Save, AlertCircle, XCircle 
} from 'lucide-react';
import { Usuario, PerfilUsuario, StatusUsuario } from '../../types';

const GestaoUsuarios: React.FC = () => {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<Usuario> | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('Corretor');
  const [status, setStatus] = useState<StatusUsuario>('Pendente');
  const [senha, setSenha] = useState('');

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers
  });

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (payload: Partial<Usuario> & { nome: string; email: string }) => api.saveUser(payload),
    onSuccess: () => {
      showToast(editingUser?.id ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.', 'success');
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: () => {
      showToast('Erro ao salvar usuário. Verifique se o e-mail já está em uso.', 'error');
    }
  });

  // Quick Approval Mutation
  const approveMutation = useMutation({
    mutationFn: async (userToApprove: Usuario) => {
      return api.saveUser({
        ...userToApprove,
        status: 'Ativo'
      });
    },
    onSuccess: () => {
      showToast('Usuário aprovado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: () => {
      showToast('Erro ao aprovar usuário.', 'error');
    }
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setCidade('');
    setPerfil('Corretor');
    setStatus('Pendente');
    setSenha('');
    setModalOpen(true);
  };

  const handleOpenEdit = (u: Usuario) => {
    setEditingUser(u);
    setNome(u.nome);
    setEmail(u.email);
    setTelefone(u.telefone || '');
    setCidade(u.cidade || '');
    setPerfil(u.perfil);
    setStatus(u.status);
    setSenha(u.senha || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) {
      showToast('Nome e E-mail são obrigatórios.', 'error');
      return;
    }

    if (!editingUser?.id && !senha) {
      showToast('A senha é obrigatória para cadastrar um novo usuário.', 'error');
      return;
    }

    const payload: any = {
      id: editingUser?.id,
      nome,
      email,
      telefone,
      cidade,
      perfil,
      status,
    };

    if (senha) {
      payload.senha = senha;
    }

    saveMutation.mutate(payload);
  };

  const handleApprove = (u: Usuario) => {
    approveMutation.mutate(u);
  };

  const handleReject = (u: Usuario) => {
    if (window.confirm(`Tem certeza que deseja inativar o cadastro de ${u.nome}?`)) {
      saveMutation.mutate({
        ...u,
        status: 'Inativo'
      });
    }
  };

  // Filter users to display only panel users (Administrador and Corretor)
  const filteredUsers = users.filter((u) => {
    const isPanelUser = u.perfil === 'Administrador' || u.perfil === 'Corretor';
    if (!isPanelUser) return false;

    const bLower = busca.toLowerCase();
    const matchSearch =
      u.nome.toLowerCase().includes(bLower) ||
      u.email.toLowerCase().includes(bLower) ||
      (u.telefone && u.telefone.includes(bLower));

    const matchPerfil = filtroPerfil ? u.perfil === filtroPerfil : true;
    const matchStatus = filtroStatus ? u.status === filtroStatus : true;

    return matchSearch && matchPerfil && matchStatus;
  });

  const isSelfEditing = editingUser?.id === currentUser?.id;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Gestão de Usuários</h2>
          <p className="text-xs text-gray-500 mt-0.5">Gerencie quem possui acesso ao painel administrativo (Administradores e Corretores).</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-2.5 px-4 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Novo Usuário
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div className="sm:col-span-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar por nome, e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none dark:text-white"
          />
        </div>
        <div>
          <select
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
          >
            <option value="">Todos os perfis</option>
            <option value="Administrador">Administradores</option>
            <option value="Corretor">Corretores</option>
          </select>
        </div>
        <div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativos</option>
            <option value="Inativo">Inativos</option>
            <option value="Pendente">Pendentes</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white dark:bg-zinc-900 skeleton-shimmer"></div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-12 rounded-3xl text-center text-xs text-gray-400">
          Nenhum usuário de sistema cadastrado ou correspondente aos filtros.
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-zinc-800 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Cidade</th>
                  <th className="px-6 py-4">Cadastro</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-sans">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-primary-medium/5 dark:hover:bg-zinc-800/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                      {u.nome} {u.id === currentUser?.id && <span className="text-[10px] text-primary-medium font-normal">(Você)</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-[11px] text-gray-500 dark:text-zinc-400">
                        <span className="block font-medium">{u.email}</span>
                        <span className="block">{formatPhone(u.telefone)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                      {u.cidade || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] font-bold text-[9px] uppercase tracking-wide ${
                        u.perfil === 'Administrador'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                      }`}>
                        {u.perfil === 'Administrador' ? (
                          <>
                            <ShieldCheck className="h-2.5 w-2.5" /> Admin
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="h-2.5 w-2.5" /> Corretor
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-[6px] font-bold text-[9px] uppercase tracking-wide ${
                        u.status === 'Ativo'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                          : u.status === 'Pendente'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-1.5">
                      {u.status === 'Pendente' && (
                        <>
                          <button
                            onClick={() => handleApprove(u)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Aprovar Usuário"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(u)}
                            className="p-1 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Inativar/Recusar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-600 dark:text-zinc-350 transition-colors inline-flex items-center cursor-pointer"
                        title="Editar Usuário"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-850 p-6 space-y-5 shadow-xl text-left overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
                {editingUser ? 'Editar Usuário do Sistema' : 'Cadastrar Novo Usuário do Sistema'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Marcos Silva"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    E-mail (Login) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: marcos@ruraliza.com.br"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex: (18) 99888-7766"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: Presidente Prudente"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Perfil de Acesso
                  </label>
                  <select
                    value={perfil}
                    disabled={isSelfEditing}
                    onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white disabled:bg-gray-150 disabled:cursor-not-allowed"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Corretor">Corretor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    Status da Conta
                  </label>
                  <select
                    value={status}
                    disabled={isSelfEditing}
                    onChange={(e) => setStatus(e.target.value as StatusUsuario)}
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white disabled:bg-gray-150 disabled:cursor-not-allowed"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Senha de Acesso {editingUser && '(Deixe em branco para manter a atual)'}
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              {isSelfEditing && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 p-3 rounded-2xl flex items-start gap-2 text-[10px] text-amber-800 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Você está editando seu próprio perfil. Por motivos de segurança, não é permitido alterar seu Perfil de Acesso ou Status por este formulário.
                  </span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="rounded-xl bg-primary-dark hover:bg-primary-medium text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoUsuarios;
