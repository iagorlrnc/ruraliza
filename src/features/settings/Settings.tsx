import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Sliders, Save, Phone, Mail, MapPin, Globe, Award, MessageCircle } from 'lucide-react';
import { Configuracoes } from '../../types';
import MapPicker from '../../components/MapPicker';
import { maskPhone, maskCreci } from '../../utils/masks';

// Custom SVG Icons to avoid lucide-react version compatibility issues
const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Settings: React.FC = () => {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const queryClient = useQueryClient();

  // Form State
  const [telefone, setTelefone] = useState('');
  const [telefoneSecundario, setTelefoneSecundario] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [creci, setCreci] = useState('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialWhatsapp, setSocialWhatsapp] = useState('');

  // Fetch settings
  const { data: config, isLoading } = useQuery<Configuracoes>({
    queryKey: ['settings'],
    queryFn: api.getConfiguracoes
  });

  // Populate form when data loads
  useEffect(() => {
    if (config) {
      setTelefone(config.telefone || '');
      setTelefoneSecundario(config.telefone_secundario || '');
      setEmail(config.email || '');
      setEndereco(config.endereco || '');
      setCreci(config.creci || '');
      setLatitude(config.latitude || 0);
      setLongitude(config.longitude || 0);
      setSocialFacebook(config.social_facebook || '');
      setSocialInstagram(config.social_instagram || '');
      setSocialLinkedin(config.social_linkedin || '');
      setSocialWhatsapp(config.social_whatsapp || '');
    }
  }, [config]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: api.saveConfiguracoes,
    onSuccess: () => {
      showToast('Configurações atualizadas com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => {
      showToast('Erro ao salvar as configurações.', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefone || !email || !endereco || !creci) {
      showToast('Por favor, preencha os campos obrigatórios.', 'error');
      return;
    }

    const cleanPhone = telefone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length < 10) {
      showToast('Por favor, insira um telefone principal válido.', 'error');
      return;
    }

    const cleanSecPhone = telefoneSecundario.replace(/\D/g, '');
    if (cleanSecPhone && cleanSecPhone.length < 10) {
      showToast('Por favor, insira um telefone secundário válido.', 'error');
      return;
    }

    saveMutation.mutate({
      id: config?.id,
      telefone,
      telefone_secundario: telefoneSecundario,
      email,
      endereco,
      creci,
      latitude,
      longitude,
      social_facebook: socialFacebook,
      social_instagram: socialInstagram,
      social_linkedin: socialLinkedin,
      social_whatsapp: socialWhatsapp
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded skeleton-shimmer"></div>
        <div className="h-96 w-full bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl skeleton-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-poppins text-lg font-bold text-gray-800 dark:text-white">Configurações do Portal</h2>
        <p className="text-xs text-gray-500 mt-0.5">Gerencie os dados institucionais, redes sociais e CRECI que aparecem no portal público.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Section 1: Contato e Endereço */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
              <Sliders className="h-5 w-5 text-primary-medium" />
              <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Informações Institucionais</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Telefone Principal *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    placeholder="Ex: (18) 3222-1234"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Telefone Secundário / Celular
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={telefoneSecundario}
                    onChange={(e) => setTelefoneSecundario(maskPhone(e.target.value))}
                    placeholder="Ex: (18) 99888-7766"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  E-mail de Contato *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: contato@ruralizanegocios.com.br"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  CRECI Jurídico *
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={creci}
                    onChange={(e) => setCreci(maskCreci(e.target.value))}
                    placeholder="Ex: 35.421-J"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                Endereço Completo *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número, bairro, cidade - UF"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary-medium dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Redes Sociais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
              <Globe className="h-5 w-5 text-primary-medium" />
              <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Redes Sociais e Integrações</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Facebook Link
                </label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={socialFacebook}
                    onChange={(e) => setSocialFacebook(e.target.value)}
                    placeholder="https://facebook.com/seu-perfil"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Instagram Link
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    placeholder="https://instagram.com/seu-perfil"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  LinkedIn Link
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={socialLinkedin}
                    onChange={(e) => setSocialLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/company/sua-empresa"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  WhatsApp Link / API
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={socialWhatsapp}
                    onChange={(e) => setSocialWhatsapp(e.target.value)}
                    placeholder="https://wa.me/5518999999999"
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary-medium dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Mapa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
              <MapPin className="h-5 w-5 text-primary-medium" />
              <h3 className="font-poppins text-sm font-bold text-gray-800 dark:text-white">Localização Geográfica do Escritório</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-2">
                Localização no Mapa (Arraste o marcador ou clique para definir a posição exata)
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  disabled
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  placeholder="Ex: -22.122765"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 py-2.5 px-3 focus:outline-none dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  disabled
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  placeholder="Ex: -51.389270"
                  className="w-full text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 py-2.5 px-3 focus:outline-none dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="p-4 sm:px-8 sm:py-5 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-xl bg-primary-dark hover:bg-primary-medium text-white px-6 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
