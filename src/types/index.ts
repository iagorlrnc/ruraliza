export type PerfilUsuario = 'Administrador' | 'Cliente';
export type StatusUsuario = 'Ativo' | 'Inativo';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  perfil: PerfilUsuario;
  status: StatusUsuario;
  created_at: string;
  updated_at: string;
  // CRM helper stats (calculated or aggregated)
  mensagens_enviadas_count?: number;
  imoveis_visualizados_count?: number;
  ultimo_contato?: string;
}

export type TipoImovel = 'Chácara' | 'Fazenda' | 'Sítio' | 'Rancho' | 'Terreno Rural' | 'Área Agrícola';
export type ModalidadeImovel = 'Venda' | 'Aluguel';
export type StatusImovel = 'Ativo' | 'Rascunho' | 'Excluido';

export interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: TipoImovel;
  modalidade: ModalidadeImovel;
  valor: number;
  area_total: number;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
  destaque: boolean;
  status: StatusImovel;
  created_at: string;
  updated_at: string;
  imagens?: ImagemImovel[];
}

export interface ImagemImovel {
  id: string;
  imovel_id: string;
  url: string;
  ordem: number;
}

export type StatusMensagem = 'Nova' | 'Em andamento' | 'Respondida' | 'Arquivada';

export interface Mensagem {
  id: string;
  usuario_id?: string;
  imovel_id?: string;
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  status: StatusMensagem;
  observacao_interna?: string;
  created_at: string;
  usuario?: Usuario;
  imovel?: Imovel;
}

export type StatusVisita = 'Pendente' | 'Confirmada' | 'Cancelada' | 'Concluída';

export interface SolicitacaoVisita {
  id: string;
  usuario_id?: string;
  imovel_id: string;
  data_solicitada: string;
  observacoes?: string;
  status: StatusVisita;
  created_at: string;
  usuario?: Usuario;
  imovel?: Imovel;
}

export interface Depoimento {
  id: string;
  nome: string;
  cargo: string;
  texto: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalImoveis: number;
  imoveisVenda: number;
  imoveisAluguel: number;
  totalUsuarios: number;
  totalClientes: number;
  totalAdmins: number;
  totalMensagens: number;
  mensagensPendentes: number;
  leadsMes: number;
  solicitacoesVisita: number;
  totalVisualizacoes: number;
}
