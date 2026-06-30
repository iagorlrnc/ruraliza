import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useSEO } from '../hooks/useSEO';
import { formatCurrency, formatArea } from '../utils/format';
import { 
  MapPin, 
  Ruler, 
  Share2, 
  Send, 
  Calendar, 
  ArrowLeft, 
  Home as HomeIcon, 
  Zap, 
  Droplets, 
  Fence, 
  Trees, 
  Sprout, 
  ShieldCheck, 
  Lock,
  MessageCircle,
  Tractor, Fish, Sun, Waves, Warehouse, Leaf
} from 'lucide-react';


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

const getIconForFeature = (name: string, iconKey?: string) => {
  if (iconKey) {
    const key = iconKey.toLowerCase();
    if (key === 'home') return HomeIcon;
    if (key === 'zap') return Zap;
    if (key === 'droplets') return Droplets;
    if (key === 'fence') return Fence;
    if (key === 'trees') return Trees;
    if (key === 'sprout') return Sprout;
    if (key === 'shield') return ShieldCheck;
    if (key === 'lock') return Lock;
    if (key === 'tractor') return Tractor;
    if (key === 'fish') return Fish;
    if (key === 'sun') return Sun;
    if (key === 'waves') return Waves;
    if (key === 'warehouse') return Warehouse;
    if (key === 'leaf') return Leaf;
  }

  // Fallback to name-based lookup
  const lower = name.toLowerCase();
  if (lower.includes('sede') || lower.includes('casa')) return HomeIcon;
  if (lower.includes('energia') || lower.includes('luz') || lower.includes('elétrica') || lower.includes('eletrica')) return Zap;
  if (lower.includes('poço') || lower.includes('poco') || lower.includes('artesiano') || lower.includes('água') || lower.includes('agua')) return Droplets;
  if (lower.includes('curral') || lower.includes('manejo') || lower.includes('confinamento')) return Fence;
  if (lower.includes('pasto') || lower.includes('pastagem') || lower.includes('pecuária') || lower.includes('pecuaria')) return Trees;
  if (lower.includes('agrícola') || lower.includes('agricultura') || lower.includes('plantio') || lower.includes('grãos') || lower.includes('soja') || lower.includes('agricola') || lower.includes('graos')) return Sprout;
  if (lower.includes('reserva') || lower.includes('car') || lower.includes('preservada') || lower.includes('floresta')) return ShieldCheck;
  if (lower.includes('regularizado') || lower.includes('regularizada') || lower.includes('documento') || lower.includes('documentação') || lower.includes('documentacao') || lower.includes('geo')) return Lock;
  return ShieldCheck; // default fallback icon
};

const cleanDescricao = (desc: string): string => {
  if (!desc) return '';
  const markers = [
    '\n\n--- Caraterísticas de Infraestrutura ---',
    '\n\n--- Características de Infraestrutura ---'
  ];
  let clean = desc;
  for (const marker of markers) {
    const splitIndex = clean.indexOf(marker);
    if (splitIndex !== -1) {
      clean = clean.substring(0, splitIndex);
      break;
    }
  }
  return clean;
};

const DetalheImovel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoInteresse, setTipoInteresse] = useState<'contato' | 'visita'>('contato');
  const [dataVisita, setDataVisita] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Fetch property details
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => api.getPropertyById(id || ''),
    enabled: !!id
  });

  // Fetch configurations for contact info
  const { data: config } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getConfiguracoes
  });

  // Increment view count only once per user/property using localStorage tracking
  useEffect(() => {
    if (id) {
      const viewedKey = 'ruraliza_viewed_properties';
      try {
        const viewedList = JSON.parse(localStorage.getItem(viewedKey) || '[]');
        if (!viewedList.includes(id)) {
          viewedList.push(id);
          localStorage.setItem(viewedKey, JSON.stringify(viewedList));
          api.incrementPropertyViews(id).catch((err) =>
            console.error('Error incrementing view count:', err)
          );
        }
      } catch (e) {
        // Fallback in case localStorage is blocked
        api.incrementPropertyViews(id).catch((err) =>
          console.error('Error incrementing view count:', err)
        );
      }
    }
  }, [id]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !property) return;

    const lat = property.latitude && property.latitude !== 0 ? property.latitude : -22.1226;
    const lng = property.longitude && property.longitude !== 0 ? property.longitude : -51.3888;

    // Create read-only map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 11,
      zoomControl: true,
      dragging: !L.Browser.mobile,
      scrollWheelZoom: true
    });
    mapRef.current = map;

    // Google Maps Tile Layers (100% Free CDN integration without API Keys)
    const googleRoads = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

    const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

    // Default layer
    googleRoads.addTo(map);

    // Layer control to toggle standard/satellite map
    const baseMaps = {
      "Mapa": googleRoads,
      "Satélite": googleHybrid
    };
    L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map);

    // Draw 10km radius circle around the region (10,000 meters)
    L.circle([lat, lng], {
      color: '#2D6A4F',
      fillColor: '#52B788',
      fillOpacity: 0.25,
      weight: 2,
      radius: 5000
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [property]);

  useSEO(
    property ? property.titulo : 'Carregando Imóvel...',
    property ? property.descricao.substring(0, 160) : 'Carregando detalhes da propriedade rural...'
  );

  // Mutations
  const contactMutation = useMutation({
    mutationFn: api.registrarMensagemContato,
    onSuccess: () => {
      showToast('Mensagem enviada com sucesso! Logo um consultor responderá.', 'success');
      setNome('');
      setEmail('');
      setTelefone('');
      setMensagem('');
    },
    onError: () => {
      showToast('Ocorreu um erro ao registrar seu interesse. Tente novamente.', 'error');
    }
  });

  const visitMutation = useMutation({
    mutationFn: api.registrarSolicitacaoVisita,
    onSuccess: () => {
      showToast('Solicitação de visita agendada com sucesso! Aguarde nossa confirmação.', 'success');
      setNome('');
      setEmail('');
      setTelefone('');
      setDataVisita('');
      setMensagem('');
    },
    onError: () => {
      showToast('Ocorreu um erro ao registrar sua visita. Tente novamente.', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) {
      showToast('Por favor, preencha os campos obrigatórios (Nome e E-mail).', 'error');
      return;
    }

    if (tipoInteresse === 'visita') {
      if (!dataVisita) {
        showToast('Escolha a data desejada para a visita.', 'error');
        return;
      }
      visitMutation.mutate({
        nome,
        email,
        telefone,
        imovel_id: id || '',
        data_solicitada: new Date(dataVisita).toISOString(),
        observacoes: mensagem
      });
    } else {
      if (!mensagem) {
        showToast('Escreva sua mensagem de interesse.', 'error');
        return;
      }
      contactMutation.mutate({
        nome,
        email,
        telefone,
        assunto: `Interesse no imóvel ${property?.codigo}`,
        mensagem,
        imovel_id: id
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link do imóvel copiado para a área de transferência!', 'info');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-medium border-t-transparent mx-auto"></div>
        <p className="text-sm text-gray-500 font-medium">Carregando detalhes do imóvel...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <h2 className="font-poppins text-lg font-bold text-red-600">Imóvel não encontrado</h2>
        <p className="text-xs text-gray-500">Este imóvel pode ter sido desativado ou o código está inválido.</p>
        <Link to="/imoveis" className="inline-flex items-center gap-1 text-primary-medium hover:text-primary-dark font-semibold text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para imóveis
        </Link>
      </div>
    );
  }

  // Dynamic characteristics parsing based on description text
  const activeFeatures = parseCaracteristicas(property.descricao).map(raw => {
    const parts = raw.split('|');
    const name = parts[0];
    const iconKey = parts[1] || '';
    return {
      name,
      icon: getIconForFeature(name, iconKey)
    };
  });

  // Generate WhatsApp message url
  const waMessage = encodeURIComponent(`Olá, tenho interesse no imóvel ${property?.codigo} - ${property?.titulo}. Gostaria de mais informações.`);
  const cleanPhone = config?.telefone ? config.telefone.replace(/\D/g, '') : '';
  const waUrl = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${waMessage}` : '#';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 text-left">
      {/* Back button */}
      <div>
        <Link 
          to="/imoveis" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a listagem
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-gray-100 border border-gray-200 dark:border-zinc-800">
              <img
                src={property.imagens && property.imagens.length > 0 ? property.imagens[activeImageIndex].url : '/imagesub.png'}
                alt={property.titulo}
                className="w-full h-full object-cover transition-all"
              />
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-200 p-2.5 rounded-xl border border-gray-200/50 shadow-md backdrop-blur-sm transition-colors cursor-pointer"
                title="Compartilhar Imóvel"
              >
                <Share2 className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {property.imagens && property.imagens.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.imagens.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 aspect-[4/3] rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      idx === activeImageIndex ? 'border-primary-medium' : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Info Headers */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="bg-primary-medium/10 text-primary-medium dark:text-primary-light text-xs font-bold px-3 py-1 rounded-lg">
                Código: {property.codigo}
              </span>
              <div className="flex gap-2">
                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-350 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  {property.tipo}
                </span>
                <span className="bg-primary-dark text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  {property.modalidade === 'Venda' ? 'Venda' : 'Locação'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-poppins text-xl sm:text-2xl font-bold text-gray-800 dark:text-white leading-tight">
                {property.titulo}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                <MapPin className="h-4 w-4 text-primary-medium shrink-0" />
                <span>{property.cidade} - {property.estado}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-zinc-800 pt-4">
              <div>
                <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Área Total</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Ruler className="h-4.5 w-4.5 text-primary-medium" />
                  <span className="text-base font-bold text-gray-800 dark:text-white">{formatArea(property.area_total)}</span>
                </div>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Valor Solicitado</span>
                <div className="text-base font-bold text-primary-dark dark:text-primary-light mt-0.5">
                  {property.modalidade === 'Aluguel' ? `${formatCurrency(property.valor)}/mês` : formatCurrency(property.valor)}
                </div>
              </div>
            </div>
          </div>

          {/* Characteristics Checkbox list */}
          <div className="space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
              Características & Infraestrutura
            </h3>
            {activeFeatures.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma infraestrutura detalhada inserida.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeFeatures.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.name}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200/50 dark:border-zinc-800 shadow-sm"
                    >
                      <Icon className="h-4.5 w-4.5 text-primary-medium shrink-0" />
                      <span className="text-xs font-bold text-gray-700 dark:text-zinc-350">{feat.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
              Descrição do Imóvel
            </h3>
            <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm text-xs text-gray-600 dark:text-zinc-350 leading-relaxed font-sans whitespace-pre-wrap">
              {cleanDescricao(property.descricao)}
            </div>
          </div>

          {/* Location Mock / Map */}
          <div className="space-y-4">
            <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">
              Localização aproximada
            </h3>
            <div className="h-64 rounded-3xl border border-gray-200 dark:border-zinc-800 overflow-hidden relative z-10 shadow-sm">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 leading-snug font-sans">
              A área delimitada no mapa representa uma região aproximada de 5km de raio. <br/>A localização exata e dados da matrícula são fornecidos sob agendamento com o corretor.
              <br/>Alterne no topo direito do mapa para visão de Satélite.
            </p>
          </div>
        </div>

        {/* CRM Interest Form Sidebar (1 col) */}
        <div className="space-y-6 h-fit sticky top-28">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 p-6 rounded-3xl shadow-lg space-y-6">
            <div className="space-y-1">
              <h3 className="font-poppins text-base font-bold text-gray-800 dark:text-white">Ficou Interessado?</h3>
              <p className="text-[11px] text-gray-500">Envie seus dados abaixo. Faremos o cadastro automático do lead no CRM.</p>
            </div>

            {/* Form actions selector */}
            <div className="grid grid-cols-2 gap-2 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[2px] p-1 rounded-xl border border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setTipoInteresse('contato')}
                className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                  tipoInteresse === 'contato'
                    ? 'bg-white dark:bg-zinc-800 text-primary-dark dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Tenho Interesse
              </button>
              <button
                type="button"
                onClick={() => setTipoInteresse('visita')}
                className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                  tipoInteresse === 'visita'
                    ? 'bg-white dark:bg-zinc-800 text-primary-dark dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Agendar Visita
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  E-mail de Contato *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Telefone / Celular
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(18) 99999-9999"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>

              {tipoInteresse === 'visita' && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary-medium" /> Data da Visita *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dataVisita}
                    onChange={(e) => setDataVisita(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  {tipoInteresse === 'visita' ? 'Observações da Visita' : 'Mensagem de Interesse *'}
                </label>
                <textarea
                  rows={4}
                  required={tipoInteresse === 'contato'}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder={tipoInteresse === 'visita' ? 'Ex: Prefiro no final de semana, irei com agrônomo particular...' : 'Gostaria de saber mais sobre as condições de pagamento e permuta...'}
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 px-3 focus:outline-none focus:border-primary-medium dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={contactMutation.isPending || visitMutation.isPending}
                className="w-full rounded-xl bg-primary-dark hover:bg-primary-medium text-white py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
              >
                <Send className="h-4 w-4" />
                {tipoInteresse === 'visita' ? 'Solicitar Agendamento' : 'Enviar Interesse'}
              </button>
            </form>

            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
              {cleanPhone ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white py-3 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chamar no WhatsApp
                </a>
              ) : (
                <div className="w-full rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-500 py-3 text-xs font-bold flex items-center justify-center gap-2 border border-dashed border-gray-300 dark:border-zinc-700">
                  <MessageCircle className="h-4 w-4 text-gray-400" />
                  [WhatsApp de contato não cadastrado]
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalheImovel;
