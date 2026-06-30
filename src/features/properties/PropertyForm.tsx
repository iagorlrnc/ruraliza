import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Imovel, ImagemImovel, TipoImovel, ModalidadeImovel, StatusImovel } from '../../types';
import { 
  ArrowLeft, Save, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, Plus, X,
  Home as HomeIcon, Zap, Droplets, Fence, Trees, Sprout, ShieldCheck, Lock,
  Tractor, Fish, Sun, Waves, Warehouse, Leaf
} from 'lucide-react';
import MapPicker from '../../components/MapPicker';

const getPrefix = (tipo: TipoImovel): string => {
  switch (tipo) {
    case 'Fazenda': return 'FAZ';
    case 'Chácara': return 'CHA';
    case 'Sítio': return 'SIT';
    case 'Rancho': return 'RAN';
    case 'Terreno Rural': return 'TER';
    case 'Área Agrícola': return 'AGR';
    default: return 'IMO';
  }
};

const parseCaracteristicas = (descricao: string): string[] => {
  if (!descricao) return [];
  
  const marker1 = '--- Caraterísticas de Infraestrutura ---';
  const marker2 = '--- Características de Infraestrutura ---';
  
  let idx = descricao.indexOf(marker1);
  let markerLength = marker1.length;
  if (idx === -1) {
    idx = descricao.indexOf(marker2);
    markerLength = marker2.length;
  }
  
  if (idx !== -1) {
    const block = descricao.substring(idx + markerLength).trim();
    let cleanBlock = block;
    if (block.startsWith('(Tags para indexação de busca:')) {
      cleanBlock = block.replace('(Tags para indexação de busca:', '').replace(')', '').trim();
    }
    if (cleanBlock) {
      return cleanBlock.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  
  // Fallback: parse from description text using the legacy rules to preserve compatibility
  const legacyTags: string[] = [];
  const descLower = descricao.toLowerCase();
  if (descLower.includes('sede') || descLower.includes('casa')) legacyTags.push('Casa Sede|home');
  if (descLower.includes('energia') || descLower.includes('luz') || descLower.includes('trifásica')) legacyTags.push('Energia Elétrica|zap');
  if (descLower.includes('poço') || descLower.includes('artesiano') || descLower.includes('água')) legacyTags.push('Poço Artesiano|droplets');
  if (descLower.includes('curral') || descLower.includes('manejo') || descLower.includes('confinamento')) legacyTags.push('Curral / Manejo|fence');
  if (descLower.includes('pasto') || descLower.includes('pastagem') || descLower.includes('pecuária')) legacyTags.push('Pastagem Formada|trees');
  if (descLower.includes('agrícola') || descLower.includes('agricultura') || descLower.includes('plantio') || descLower.includes('grãos') || descLower.includes('soja')) legacyTags.push('Área Agricultável|sprout');
  if (descLower.includes('reserva') || descLower.includes('car') || descLower.includes('preservada') || descLower.includes('floresta')) legacyTags.push('Reserva Legal|shield');
  if (descLower.includes('regularizada') || descLower.includes('geo') || descLower.includes('documentação')) legacyTags.push('Regularizado|lock');
  
  return legacyTags;
};

const AVAILABLE_ICONS = [
  { key: 'home', label: 'Casa / Sede', Icon: HomeIcon },
  { key: 'zap', label: 'Energia / Luz', Icon: Zap },
  { key: 'droplets', label: 'Água / Poço', Icon: Droplets },
  { key: 'fence', label: 'Cerca / Curral', Icon: Fence },
  { key: 'trees', label: 'Árvores / Reserva', Icon: Trees },
  { key: 'sprout', label: 'Lavoura / Plantio', Icon: Sprout },
  { key: 'shield', label: 'Segurança / Regularizado', Icon: ShieldCheck },
  { key: 'lock', label: 'Acesso Restrito', Icon: Lock },
  { key: 'tractor', label: 'Trator / Galpão', Icon: Tractor },
  { key: 'fish', label: 'Açude / Peixe', Icon: Fish },
  { key: 'sun', label: 'Energia Solar', Icon: Sun },
  { key: 'waves', label: 'Piscina / Rio', Icon: Waves },
  { key: 'warehouse', label: 'Galpão / Silo', Icon: Warehouse },
  { key: 'leaf', label: 'Mata / Área Verde', Icon: Leaf },
];

const ESTADOS_BRASIL = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'TO', nome: 'Tocantins' }
];

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
  const [uploading, setUploading] = useState(false);

  // Infrastructure tag states
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);
  const [novaCaracteristica, setNovaCaracteristica] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('home');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleAddCaracteristica = () => {
    const trimmed = novaCaracteristica.trim();
    if (!trimmed) return;
    const normalizedName = trimmed.toLowerCase();
    if (caracteristicas.some(c => c.split('|')[0].toLowerCase() === normalizedName)) {
      showToast('Esta característica já foi adicionada.', 'info');
      return;
    }
    setCaracteristicas([...caracteristicas, `${trimmed}|${selectedIcon}`]);
    setNovaCaracteristica('');
  };

  const handleRemoveCaracteristica = (indexToRemove: number) => {
    setCaracteristicas(caracteristicas.filter((_, idx) => idx !== indexToRemove));
  };

  // Fetch existing property for editing
  const { data: existingProperty, isLoading } = useQuery({
    queryKey: ['admin-property', id],
    queryFn: () => api.getPropertyById(id || ''),
    enabled: !isNew && !!id
  });

  // Fetch all properties to compute unique sequential code
  const { data: properties = [] } = useQuery({
    queryKey: ['admin-properties-list'],
    queryFn: api.getProperties,
    enabled: isNew
  });

  // Fetch office configurations for setting default coordinates
  const { data: config } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getConfiguracoes
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingProperty && !isNew) {
      setTitulo(existingProperty.titulo);
      setCodigo(existingProperty.codigo);

      // Strip tags block from description for cleaner editing
      let descClean = existingProperty.descricao;
      const markers = [
        '\n\n--- Caraterísticas de Infraestrutura ---',
        '\n\n--- Características de Infraestrutura ---'
      ];
      for (const marker of markers) {
        const splitIndex = descClean.indexOf(marker);
        if (splitIndex !== -1) {
          descClean = descClean.substring(0, splitIndex);
          break;
        }
      }
      setDescricao(descClean);

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

      // Parse features from description
      const parsedTags = parseCaracteristicas(existingProperty.descricao);
      setCaracteristicas(parsedTags);
    }
  }, [existingProperty, isNew]);

  // Set default coordinates from office location when creating a new property
  useEffect(() => {
    if (isNew && config && latitude === 0 && longitude === 0) {
      if (config.latitude && config.longitude) {
        setLatitude(config.latitude);
        setLongitude(config.longitude);
      }
    }
  }, [config, isNew, latitude, longitude]);

  // Automatically generate unique sequential code for new properties based on type
  useEffect(() => {
    if (isNew) {
      const prefix = getPrefix(tipo);
      
      // Filter properties that have the same type, and extract their numeric suffix
      const matchingCodes = properties
        .filter(p => p.tipo === tipo && p.codigo && p.codigo.startsWith(prefix))
        .map(p => {
          const numStr = p.codigo.substring(prefix.length);
          const num = parseInt(numStr, 10);
          return isNaN(num) ? 0 : num;
        });

      const nextNum = matchingCodes.length > 0 ? Math.max(...matchingCodes) + 1 : 1;
      const formattedNum = String(nextNum).padStart(4, '0');
      setCodigo(`${prefix}${formattedNum}`);
    }
  }, [tipo, properties, isNew]);

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

    let finalDesc = descricao;
    if (caracteristicas.length > 0) {
      finalDesc += `\n\n--- Características de Infraestrutura ---\n${caracteristicas.join(', ')}`;
    }

    const payload: Partial<Imovel> & { titulo: string } = {
      id,
      codigo: codigo || undefined,
      titulo,
      descricao: finalDesc,
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
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Show a temporary info toast
        showToast(`Enviando imagem ${file.name}...`, 'info');
        
        const publicUrl = await api.uploadFile(file, 'imoveis');
        uploadedUrls.push(publicUrl);
      }

      const newImgs: ImagemImovel[] = uploadedUrls.map((url, idx) => ({
        id: 'new-img-' + Math.random().toString(36).substr(2, 9),
        imovel_id: id || '',
        url,
        ordem: imagens.length + idx
      }));

      setImagens((prev) => [...prev, ...newImgs]);
      showToast('Imagem(ns) enviada(s) com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao fazer upload da imagem.', 'error');
    } finally {
      setUploading(false);
      // Clear file input value
      e.target.value = '';
    }
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
                  disabled
                  value={codigo}
                  placeholder="Gerado automaticamente..."
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 py-2.5 px-3 focus:outline-none cursor-not-allowed"
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

          {/* Characteristics & Infrastructure Checklist (Placed BEFORE Location) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Características & Infraestrutura</h3>
            
            <div className="flex gap-2 items-center relative">
              {/* Icon Selector Button & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="bg-transparent hover:bg-gray-200/50 dark:hover:bg-zinc-800 text-gray-750 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 p-2.5 rounded-xl transition-colors flex items-center justify-center cursor-pointer min-w-[42px] h-[38px]"
                  title="Selecionar ícone"
                >
                  {(() => {
                    const matched = AVAILABLE_ICONS.find(i => i.key === selectedIcon);
                    if (matched) {
                      const IconComp = matched.Icon;
                      return <IconComp className="h-4 w-4 text-primary-medium" />;
                    }
                    return <ShieldCheck className="h-4 w-4 text-primary-medium" />;
                  })()}
                </button>

                {showIconPicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowIconPicker(false)} 
                    />
                    <div className="absolute left-0 mt-2 w-64 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-3 z-50 grid grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-1 duration-155">
                      {AVAILABLE_ICONS.map((ico) => {
                        const IconComp = ico.Icon;
                        return (
                          <button
                            key={ico.key}
                            type="button"
                            onClick={() => {
                              setSelectedIcon(ico.key);
                              setShowIconPicker(false);
                            }}
                            className={`p-2 rounded-xl transition-all flex flex-col items-center justify-center border hover:scale-105 ${
                              selectedIcon === ico.key
                                ? 'bg-primary-medium/10 text-primary-medium border-primary-medium/30'
                                : 'bg-transparent text-gray-600 dark:text-zinc-400 border-transparent hover:bg-gray-200/50 dark:hover:bg-zinc-800'
                            }`}
                            title={ico.label}
                          >
                            <IconComp className="h-4 w-4 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={novaCaracteristica}
                onChange={(e) => setNovaCaracteristica(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCaracteristica();
                  }
                }}
                placeholder="Adicionar característica (ex: Casa Sede)"
                className="flex-1 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white h-[38px]"
              />

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAddCaracteristica}
                className="bg-primary-medium hover:bg-primary-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer h-[38px] shrink-0"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>

            {caracteristicas.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Nenhuma característica adicionada ainda.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {caracteristicas.map((char, index) => {
                  const parts = char.split('|');
                  const name = parts[0];
                  const iconKey = parts[1] || 'home';
                  const matched = AVAILABLE_ICONS.find(i => i.key === iconKey) || { Icon: ShieldCheck };
                  const IconComp = matched.Icon;

                  return (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border bg-gray-50 dark:bg-zinc-800 text-gray-750 dark:text-zinc-250 border-gray-200/60 dark:border-zinc-700/60 shadow-sm"
                    >
                      <IconComp className="h-3.5 w-3.5 text-primary-medium" />
                      {name}
                      <button
                        type="button"
                        onClick={() => handleRemoveCaracteristica(index)}
                        className="text-gray-400 hover:text-red-500 rounded-full transition-colors p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
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
                <select
                  required
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                >
                  <option value="">Selecione...</option>
                  {ESTADOS_BRASIL.map((est) => (
                    <option key={est.sigla} value={est.sigla}>
                      {est.sigla} - {est.nome}
                    </option>
                  ))}
                </select>
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

            {/* Upload Area */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400">
                Adicionar Imagens do Imóvel
              </label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary-medium dark:border-zinc-700 dark:hover:border-primary-light rounded-2xl p-6 bg-gray-50 hover:bg-gray-100/70 dark:bg-zinc-800 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-200 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-medium dark:text-zinc-500 dark:group-hover:text-primary-light transition-colors mb-2" />
                <span className="text-xs font-semibold text-gray-700 dark:text-zinc-200">
                  {uploading ? 'Enviando imagens...' : 'Clique para selecionar ou arraste imagens'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 text-center font-sans">
                  Suporta PNG, JPG, JPEG e WEBP (múltiplas imagens)
                </span>
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
