import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, MessageSquareQuote, Check, X } from 'lucide-react';
import { Depoimento } from '../../types';

const TestimonialsList: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch testimonials (both approved and pending for the admin panel)
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: api.getTestimonials
  });

  // Toggle Approval Mutation
  const toggleApprovalMutation = useMutation({
    mutationFn: async ({ id, aprovado }: { id: string; aprovado: boolean }) => {
      return api.updateTestimonialApproval(id, aprovado);
    },
    onSuccess: (_, variables) => {
      showToast(
        variables.aprovado 
          ? 'Depoimento aprovado com sucesso e agora é público!' 
          : 'Depoimento desaprovado e ocultado da vitrine.', 
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: () => {
      showToast('Erro ao atualizar status de aprovação.', 'error');
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

  const handleToggleApproval = (dep: Depoimento) => {
    toggleApprovalMutation.mutate({
      id: dep.id,
      aprovado: !dep.aprovado
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o depoimento de ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Gestão de Depoimentos</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Aprove depoimentos enviados por clientes na página pública para que eles apareçam no carrossel da vitrine.
          </p>
        </div>
      </div>

      {/* Testimonials List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white dark:bg-zinc-900 skeleton-shimmer"></div>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-12 rounded-3xl text-center text-xs text-gray-400">
          Nenhum depoimento enviado ou cadastrado no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((dep) => (
            <div
              key={dep.id}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div className="h-8 w-8 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center">
                    <MessageSquareQuote className="h-4.5 w-4.5" />
                  </div>
                  
                  {/* Status Toggle Button (Aprovar / Desaprovar) */}
                  <button
                    onClick={() => handleToggleApproval(dep)}
                    disabled={!isAdmin || toggleApprovalMutation.isPending}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 ${
                      !isAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                    } ${
                      dep.aprovado
                        ? 'border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                        : 'border-gray-250 dark:border-zinc-850 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700'
                    }`}
                    title={!isAdmin ? 'Apenas administradores podem gerenciar depoimentos' : dep.aprovado ? 'Clique para desaprovar e ocultar' : 'Clique para aprovar e tornar público'}
                  >
                    {dep.aprovado ? (
                      <>
                        <Check className="h-3 w-3 shrink-0 text-green-600 dark:text-green-400" />
                        <span>Aprovado</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 shrink-0 text-gray-500 dark:text-zinc-450" />
                        <span>Pendente</span>
                      </>
                    )}
                  </button>
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
                {isAdmin && (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDelete(dep.id, dep.nome)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded-lg transition-colors inline-flex cursor-pointer"
                      title="Excluir Depoimento"
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

export default TestimonialsList;
