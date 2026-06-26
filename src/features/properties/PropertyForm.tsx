import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Imovel, ImagemImovel, TipoImovel, ModalidadeImovel, StatusImovel } from '../../types';
import { ArrowLeft, Save, Trash2, Plus, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import MapPicker from '../../components/MapPicker';

const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Form Fields State
  const [titulo, setTitulo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoImovel>('Fazenda');
  const [modalidade, setModalidade] = useState<ModalidadeImovel>('Venda');
  const [valor, setValor] = useState<number>(0);
  const [areaTotal, setAreaTotal] = useState<number>(0);
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [destaque, setDestaque] = useState(false);
  const [status, setStatus] = useState<StatusImovel>('Ativo');

  // Images state
  const [imagens, setImagens] = useState<ImagemImovel[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Fetch existing property for editing
  const { data: existingProperty, isLoading } = useQuery({
    queryKey: ['admin-property', id],
    queryFn: () => api.getPropertyById(id || ''),
    enabled: !isNew && !!id
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingProperty && !isNew) {
      setTitulo(existingProperty.titulo);
      setCodigo(existingProperty.codigo);
      setDescricao(existingProperty.descricao);
      setTipo(existingProperty.tipo);
      setModalidade(existingProperty.modalidade);
      setValor(existingProperty.valor);
      setAreaTotal(existingProperty.area_total);
      setCidade(existingProperty.cidade);
      setEstado(existingProperty.estado);
      setLatitude(existingProperty.latitude || 0);
      setLongitude(existingProperty.longitude || 0);
      setDestaque(existingProperty.destaque);
      setStatus(existingProperty.status);
      setImagens(existingProperty.imagens || []);
    }
  }, [existingProperty, isNew]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: api.saveProperty,
    onSuccess: () => {
      showToast(isNew ? 'Propriedade cadastrada com sucesso!' : 'Propriedade atualizada com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/imoveis');
    },
    onError: (e: any) => {
      showToast(e.message || 'Erro ao salvar a propriedade.', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !cidade || !estado || !valor || !areaTotal) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const payload: Partial<Imovel> & { titulo: string } = {
      id,
      codigo: codigo || undefined,
      titulo,
      descricao,
      tipo,
      modalidade,
      valor: Number(valor),
      area_total: Number(areaTotal),
      cidade,
      estado,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      destaque,
      status,
      imagens: imagens.map((img, idx) => ({
        ...img,
        ordem: idx
      }))
    };

    saveMutation.mutate(payload);
  };

  // Image Management Handlers
  const handleAddImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newImageUrl) return;

    if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
      showToast('Insira uma URL de imagem válida (iniciando com http/https).', 'error');
      return;
    }

    const newImg: ImagemImovel = {
      id: 'new-img-' + Math.random().toString(36).substr(2, 9),
      imovel_id: id || '',
      url: newImageUrl,
      ordem: imagens.length
    };

    setImagens((prev) => [...prev, newImg]);
    setNewImageUrl('');
    showToast('Imagem adicionada à lista.', 'success');
  };

  const handleRemoveImage = (imgId: string) => {
    setImagens((prev) => prev.filter((img) => img.id !== imgId));
    showToast('Imagem removida.', 'info');
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === imagens.length - 1) return;

    const newImgs = [...imagens];
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    
    // Swap elements
    const temp = newImgs[index];
    newImgs[index] = newImgs[swapWith];
    newImgs[swapWith] = temp;

    // Recalculate order indices
    const ordered = newImgs.map((img, idx) => ({
      ...img,
      ordem: idx
    }));

    setImagens(ordered);
  };

  if (!isNew && isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-medium border-t-transparent mx-auto"></div>
        <p className="text-sm text-gray-500 font-medium">Carregando dados da propriedade...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Breadcrumb Header */}
      <div>
        <Link to="/imoveis" className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary-medium transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar para imóveis
        </Link>
        <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white mt-2">
          {isNew ? 'Cadastrar Nova Propriedade Rural' : `Editar Imóvel ${codigo || ''}`}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core fields (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Dados Principais</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Título do Imóvel *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Fazenda Boa Esperança - Alta Produtividade"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Código Interno
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: FL0001"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Descrição Completa (Detalhamento Técnico)
              </label>
              <textarea
                rows={6}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Insira as informações técnicas detalhadas como tipo de solo, benfeitorias, recursos hídricos, divisões de cercas..."
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Tipo *
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoImovel)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
                >
                  <option value="Fazenda">Fazenda</option>
                  <option value="Chácara">Chácara</option>
                  <option value="Sítio">Sítio</option>
                  <option value="Rancho">Rancho</option>
                  <option value="Terreno Rural">Terreno Rural</option>
                  <option value="Área Agrícola">Área Agrícola</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Modalidade *
                </label>
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value as ModalidadeImovel)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
                >
                  <option value="Venda">Venda</option>
                  <option value="Aluguel">Aluguel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Área Total (ha) *
                </label>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="any"
                  value={areaTotal || ''}
                  onChange={(e) => setAreaTotal(Number(e.target.value))}
                  placeholder="Hectares"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={valor || ''}
                  onChange={(e) => setValor(Number(e.target.value))}
                  placeholder="Preço da propriedade"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Location & Maps Fields */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Localização Geográfica</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  required
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Município do imóvel"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Estado *
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  placeholder="UF (Ex: MT)"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-2">
                Localização no Mapa (Selecione o local exato com o marcador)
              </label>
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Manager: Images, Highlight, Status (1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Configurações de Exibição</h3>

            {/* Destaque */}
            <div className="flex items-center gap-3 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
              <input
                type="checkbox"
                id="destaque"
                checked={destaque}
                onChange={(e) => setDestaque(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-medium focus:ring-primary-medium"
              />
              <label htmlFor="destaque" className="text-xs font-bold text-gray-700 dark:text-zinc-300 select-none cursor-pointer">
                Destacar na Página Inicial
              </label>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Status da Publicação
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusImovel)}
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none dark:text-white"
              >
                <option value="Ativo">Ativo / Publicado</option>
                <option value="Rascunho">Rascunho</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-brand-beige py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

          {/* Multiple Image uploads manager */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Gerenciar Imagens</h3>

            {/* URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">
                Adicionar URL da Imagem
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-primary-dark hover:bg-primary-medium text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Images sorting list */}
            <div className="space-y-2">
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Imagens Cadastradas ({imagens.length})
              </span>
              
              {imagens.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center text-xs text-gray-400 flex flex-col items-center gap-1.5">
                  <ImageIcon className="h-5 w-5" />
                  Nenhuma imagem adicionada.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {imagens.map((img, idx) => (
                    <div
                      key={img.id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] border border-gray-100 dark:border-zinc-800"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-150">
                        <img src={img.url} alt="Miniatura" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <span className="block text-[10px] font-bold text-gray-700 dark:text-zinc-300">
                          Ordem: {idx + 1}
                        </span>
                        <span className="block text-[9px] text-gray-400 truncate">
                          {img.url}
                        </span>
                      </div>
                      
                      {/* Sorting and action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'up')}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-850 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === imagens.length - 1}
                          onClick={() => handleMoveImage(idx, 'down')}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-850 text-gray-500 rounded disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
