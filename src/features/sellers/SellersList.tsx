import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit2, Trash2, Save, User, Mail, Phone } from 'lucide-react';
import { Vendedor } from '../../types';
import { maskPhone, maskCreci } from '../../utils/masks';

const SellersList: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [role, setRole] = useState('');
  const [especializacao, setEspecializacao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState('');
  const [creci, setCreci] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch sellers
  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['sellers'],
    queryFn: api.getVendedores
  });

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: api.saveVendedor,
    onSuccess: () => {
      showToast(editingId ? 'Dados do vendedor atualizados com sucesso.' : 'Vendedor cadastrado com sucesso.', 'success');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
    onError: () => {
      showToast('Erro ao salvar vendedor. Verifique os dados.', 'error');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteVendedor,
    onSuccess: () => {
      showToast('Vendedor excluído com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
    onError: () => {
      showToast('Erro ao excluir vendedor.', 'error');
    }
  });

  const handleEdit = (vendedor: Vendedor) => {
    setEditingId(vendedor.id);
    setNome(vendedor.nome);
    setRole(vendedor.role);
    setEspecializacao(vendedor.especializacao);
    setTelefone(vendedor.telefone || '');
    setEmail(vendedor.email || '');
    setFoto(vendedor.foto || '');
    setCreci(vendedor.creci || '');
    setFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cadastro do corretor ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      showToast('Enviando foto...', 'info');
      const publicUrl = await api.uploadFile(file, 'vendedores');
      setFoto(publicUrl);
      showToast('Foto enviada com sucesso!', 'success');
    } catch (err: any) {
      if (import.meta.env.DEV) console.error(err);
      showToast(err.message || 'Erro ao enviar a foto.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !role || !especializacao) {
      showToast('Nome, Cargo e Especialização são campos obrigatórios.', 'error');
      return;
    }

    const cleanPhone = telefone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length < 10) {
      showToast('Por favor, insira um telefone válido.', 'error');
      return;
    }

    saveMutation.mutate({
      id: editingId || undefined,
      nome,
      role,
      especializacao,
      telefone,
      email,
      foto: foto || undefined,
      creci
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setRole('');
    setEspecializacao('');
    setTelefone('');
    setEmail('');
    setFoto('');
    setCreci('');
    setFormOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Gestão de Vendedores / Corretores</h2>
          <p className="text-xs text-gray-505 mt-0.5">Gerencie os corretores, engenheiros e a equipe técnica exibida na página pública "Equipe".</p>
        </div>
        {!formOpen && isAdmin && (
          <button
            onClick={() => setFormOpen(true)}
            className="rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-2.5 px-4 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Novo Vendedor
          </button>
        )}
      </div>

      {/* Form Area */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
            {editingId ? 'Editar Vendedor' : 'Cadastrar Novo Vendedor'}
          </h3>

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
                placeholder="Ex: Renato Silva"
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Cargo / Função *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Diretor Executivo & Corretor Sênior"
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Telefone / Celular
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
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: contato@ruraliza.com.br"
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Foto do Corretor / Vendedor
              </label>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 bg-gray-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  {foto ? (
                    <img src={foto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="relative border-2 border-dashed border-zinc-700/30 rounded-xl p-2 bg-zinc-900 hover:bg-zinc-800/90 text-white dark:bg-zinc-950 dark:border-zinc-800 transition-colors flex flex-col items-center justify-center cursor-pointer group text-center">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={handleFotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="text-[11px] font-bold text-zinc-200 dark:text-zinc-300">
                      {uploading ? 'Enviando...' : 'Escolher Foto'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Número de Matrícula (CRECI)
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

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
              Especialização / Biografia Curta *
            </label>
            <textarea
              rows={3}
              required
              value={especializacao}
              onChange={(e) => setEspecializacao(e.target.value)}
              placeholder="Descreva a formação técnica, foco de atuação ou resumo de experiência do profissional..."
              className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={resetForm}
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
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Vendedor'}
            </button>
          </div>
        </form>
      )}

      {/* Sellers List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white dark:bg-zinc-900 skeleton-shimmer"></div>
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-12 rounded-3xl text-center text-xs text-gray-400">
          Nenhum vendedor cadastrado no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sellers.map((vendedor) => (
            <div
              key={vendedor.id}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Photo & Main Role */}
              <div>
                <div className="flex justify-center pt-6">
                  <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-primary-medium/20 shadow-inner bg-gray-100 dark:bg-zinc-950 flex items-center justify-center shrink-0">
                    {vendedor.foto ? (
                      <img
                        src={vendedor.foto}
                        alt={vendedor.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="p-5 text-center space-y-3">
                  <div>
                    <h4 className="font-poppins text-sm font-bold text-gray-800 dark:text-white leading-tight">
                      {vendedor.nome}
                    </h4>
                    <span className="text-[10px] text-primary-medium dark:text-primary-light font-bold uppercase tracking-wide block mt-0.5">
                      {vendedor.role}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-sans line-clamp-3">
                    {vendedor.especializacao}
                  </p>
                </div>
              </div>

              {/* Contacts & Actions */}
              <div className="p-5 pt-0 border-t border-gray-100 dark:border-zinc-800/60 mt-auto">
                <div className="py-3 space-y-1.5 text-[11px] text-gray-500 dark:text-zinc-400 font-sans text-left">
                  {vendedor.creci && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                      <span>CRECI: {vendedor.creci}</span>
                    </div>
                  )}
                  {vendedor.telefone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-primary-medium" />
                      <span>{vendedor.telefone}</span>
                    </div>
                  )}
                  {vendedor.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-primary-medium" />
                      <span className="truncate">{vendedor.email}</span>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2 justify-end pt-2 border-t border-gray-100 dark:border-zinc-800/40">
                    <button
                      onClick={() => handleEdit(vendedor)}
                      className="flex-1 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-850 hover:bg-gray-50 dark:hover:bg-zinc-800 text-[11px] font-bold text-gray-600 dark:text-zinc-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(vendedor.id, vendedor.nome)}
                      className="px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200 dark:hover:border-red-950/20 dark:hover:bg-red-950/10 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellersList;
