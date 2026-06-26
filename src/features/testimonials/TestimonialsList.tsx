import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit2, Trash2, Save, MessageSquareQuote } from 'lucide-react';
import { Depoimento } from '../../types';

const TestimonialsList: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [texto, setTexto] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  // Fetch testimonials
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: api.getTestimonials
  });

  // Save Mutation (Add / Edit)
  const saveMutation = useMutation({
    mutationFn: api.saveTestimonial,
    onSuccess: () => {
      showToast(editingId ? 'Depoimento atualizado com sucesso.' : 'Depoimento adicionado com sucesso.', 'success');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: () => {
      showToast('Erro ao salvar depoimento.', 'error');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteTestimonial,
    onSuccess: () => {
      showToast('Depoimento excluído com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: () => {
      showToast('Erro ao excluir depoimento.', 'error');
    }
  });

  const handleEdit = (dep: Depoimento) => {
    setEditingId(dep.id);
    setNome(dep.nome);
    setCargo(dep.cargo);
    setTexto(dep.texto);
    setFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o depoimento de ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cargo || !texto) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    saveMutation.mutate({
      id: editingId || undefined,
      nome,
      cargo,
      texto
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setCargo('');
    setTexto('');
    setFormOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Gestão de Depoimentos</h2>
          <p className="text-xs text-gray-500 mt-0.5">Organize os relatos e avaliações que aparecem na página inicial do portal.</p>
        </div>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-2.5 px-4 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Plus className="h-4 w-4" /> Novo Depoimento
          </button>
        )}
      </div>

      {/* Toggleable Form Grid */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
            {editingId ? 'Editar Depoimento' : 'Adicionar Novo Depoimento'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Nome do Autor *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Geraldo Magela"
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Cargo / Identificação *
              </label>
              <input
                type="text"
                required
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Pecuarista - Fazenda Sol Nascente"
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
              Texto do Relato / Depoimento *
            </label>
            <textarea
              rows={4}
              required
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escreva a avaliação ou história do cliente..."
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
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Depoimento'}
            </button>
          </div>
        </form>
      )}

      {/* Testimonials List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white dark:bg-zinc-900 skeleton-shimmer"></div>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-12 rounded-3xl text-center text-xs text-gray-400">
          Nenhum depoimento cadastrado no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((dep) => (
            <div
              key={dep.id}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4 text-left">
                <div className="h-8 w-8 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center">
                  <MessageSquareQuote className="h-4.5 w-4.5" />
                </div>
                <p className="text-xs text-gray-505 dark:text-zinc-350 italic font-sans leading-relaxed">
                  "{dep.texto}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-end">
                <div className="text-left">
                  <h4 className="font-poppins text-xs font-bold text-gray-800 dark:text-white">
                    {dep.nome}
                  </h4>
                  <span className="text-[10px] text-primary-medium dark:text-primary-light font-medium block">
                    {dep.cargo}
                  </span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => handleEdit(dep)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 dark:text-zinc-400 transition-colors inline-flex cursor-pointer"
                    title="Editar Depoimento"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dep.id, dep.nome)}
                    className="p-1.5 hover:bg-red-55 text-red-500 rounded-lg transition-colors inline-flex cursor-pointer"
                    title="Excluir Depoimento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialsList;
