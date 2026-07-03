import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatPhone } from '../../utils/format';
import { 
  Search, ShieldCheck, BadgeCheck, Edit2, Check, X, 
  Save, AlertCircle, XCircle, Trash2 
} from 'lucide-react';
import { Usuario, PerfilUsuario, StatusUsuario } from '../../types';
import { maskPhone, maskCreci } from '../../utils/masks';

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
  const [creci, setCreci] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('Corretor');
  const [status, setStatus] = useState<StatusUsuario>('Pendente');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [redefinirSenha, setRedefinirSenha] = useState(false);

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

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      showToast('Usuário removido com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err: any) => {
      const msg = err instanceof Error ? err.message : 'Erro ao remover usuário.';
      showToast(msg, 'error');
    }
  });

  const handleDelete = (u: Usuario) => {
    if (u.id === currentUser?.id) {
      showToast('Você não pode remover o seu próprio usuário.', 'error');
      return;
    }
    if (window.confirm(`Tem certeza de que deseja remover permanentemente o usuário ${u.nome}? Esta ação também excluirá sua conta do Supabase Auth e não poderá ser desfeita.`)) {
      deleteMutation.mutate(u.id);
    }
  };


  const handleOpenEdit = (u: Usuario) => {
    setEditingUser(u);
    setNome(u.nome);
    setEmail(u.email);
    setTelefone(u.telefone || '');
    setCreci(u.creci || '');
    setPerfil(u.perfil);
    setStatus(u.status);
    setSenha('');
    setConfirmacaoSenha('');
    setRedefinirSenha(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setCreci('');
    setSenha('');
    setConfirmacaoSenha('');
    setRedefinirSenha(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) {
      showToast('Nome e E-mail são obrigatórios.', 'error');
      return;
    }

    const cleanPhone = telefone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length < 10) {
      showToast('Por favor, insira um telefone válido.', 'error');
      return;
    }

    if (redefinirSenha) {
      if (!senha) {
        showToast('A senha é obrigatória se a definição/redefinição estiver ativa.', 'error');
        return;
      }
      if (senha !== confirmacaoSenha) {
        showToast('As senhas não coincidem.', 'error');
        return;
      }
    } else if (!editingUser?.id) {
      showToast('A senha é obrigatória para cadastrar um novo usuário.', 'error');
      return;
    }

    const payload: any = {
      id: editingUser?.id,
      nome,
      email,
      telefone,
      cidade: editingUser?.cidade,
      creci,
      perfil,
      status,
    };

    if (redefinirSenha && senha) {
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
                  <th className="px-6 py-4">CRECI</th>
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
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 font-mono font-medium">
                      {u.creci || '-'}
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
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-650 transition-colors inline-flex items-center cursor-pointer disabled:opacity-50"
                          title="Remover Usuário"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
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
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    placeholder="Ex: (18) 99888-7766"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                    CRECI
                  </label>
                  <input
                    type="text"
                    value={creci}
                    onChange={(e) => setCreci(maskCreci(e.target.value))}
                    placeholder="Ex: 12345-F"
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

              {/* Checkbox Redefinir Senha */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="redefinirSenha"
                  checked={redefinirSenha}
                  onChange={(e) => {
                    setRedefinirSenha(e.target.checked);
                    if (!e.target.checked) {
                      setSenha('');
                      setConfirmacaoSenha('');
                    }
                  }}
                  className="rounded border-gray-300 text-primary-medium focus:ring-primary-medium h-4 w-4 cursor-pointer"
                />
                <label htmlFor="redefinirSenha" className="text-xs font-semibold text-gray-700 dark:text-zinc-350 cursor-pointer select-none">
                  {editingUser ? 'Redefinir Senha' : 'Definir Senha de Acesso'}
                </label>
              </div>

              {/* Password inputs (Senha and Confirmar Senha) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${redefinirSenha ? 'text-gray-600 dark:text-zinc-400' : 'text-gray-400 dark:text-zinc-600'}`}>
                    Senha de Acesso {redefinirSenha && '*'}
                  </label>
                  <input
                    type="password"
                    required={redefinirSenha && !editingUser}
                    disabled={!redefinirSenha}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${redefinirSenha ? 'text-gray-600 dark:text-zinc-400' : 'text-gray-400 dark:text-zinc-600'}`}>
                    Confirmar Senha {redefinirSenha && '*'}
                  </label>
                  <input
                    type="password"
                    required={redefinirSenha}
                    disabled={!redefinirSenha}
                    value={confirmacaoSenha}
                    onChange={(e) => setConfirmacaoSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
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
