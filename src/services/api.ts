import { supabase } from '../lib/supabase';
import { parseNotes } from '../utils/notes';
import { 
  Imovel, 
  Usuario, 
  Mensagem, 
  SolicitacaoVisita, 
  Depoimento, 
  DashboardMetrics, 
  StatusMensagem, 
  StatusVisita,
  Configuracoes,
  Vendedor,
  Categoria
} from '../types';

// Dev-only logging helpers — suppress internal details in production
const devLog = (...args: any[]) => { if (import.meta.env.DEV) console.error(...args); };
const devWarn = (...args: any[]) => { if (import.meta.env.DEV) console.warn(...args); };

// Detect if Supabase is fully configured
export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return (
    !!url && 
    url !== '' && 
    !url.includes('placeholder-project') && 
    !url.includes('your-supabase-project') &&
    !!key && 
    key !== '' && 
    !key.includes('placeholder-anon-key') && 
    !key.includes('your-supabase-anon-key')
  );
};

export const api = {
  isConfigured: () => isSupabaseConfigured(),

  // --- PROPERTIES (IMOVEIS) ---
  getProperties: async (): Promise<Imovel[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('tabela_imoveis')
      .select('*, tabela_imagens_imoveis(*)')
      .neq('status', 'Excluido')
      .order('created_at', { ascending: false });

    if (error) {
      devLog('Error fetching properties from Supabase:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      codigo: row.codigo,
      titulo: row.titulo,
      descricao: row.descricao,
      tipo: row.tipo,
      modalidade: row.modalidade,
      valor: Number(row.valor),
      area_total: Number(row.area_total),
      cidade: row.cidade,
      estado: row.estado,
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
      destaque: row.destaque,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      visualizacoes: Number(row.visualizacoes || 0),
      imagens: (row.tabela_imagens_imoveis || []).map((img: any) => ({
        id: img.id,
        imovel_id: img.imovel_id,
        url: img.url,
        ordem: img.ordem
      })).sort((a: any, b: any) => a.ordem - b.ordem)
    }));
  },

  getPropertyById: async (id: string): Promise<Imovel | undefined> => {
    if (!isSupabaseConfigured()) {
      return undefined;
    }

    const { data, error } = await supabase
      .from('tabela_imoveis')
      .select('*, tabela_imagens_imoveis(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // single row empty
      devLog('Error fetching property by id from Supabase:', error);
      throw error;
    }

    if (!data || data.status === 'Excluido') return undefined;

    return {
      id: data.id,
      codigo: data.codigo,
      titulo: data.titulo,
      descricao: data.descricao,
      tipo: data.tipo,
      modalidade: data.modalidade,
      valor: Number(data.valor),
      area_total: Number(data.area_total),
      cidade: data.cidade,
      estado: data.estado,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      destaque: data.destaque,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      visualizacoes: Number(data.visualizacoes || 0),
      imagens: (data.tabela_imagens_imoveis || []).map((img: any) => ({
        id: img.id,
        imovel_id: img.imovel_id,
        url: img.url,
        ordem: img.ordem
      })).sort((a: any, b: any) => a.ordem - b.ordem)
    };
  },

  incrementPropertyViews: async (id: string): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.rpc('incrementar_visualizacoes_imovel', {
          p_imovel_id: id
        });
      } catch (err) {
        devWarn('Failed to increment views on Supabase (this is normal if the SQL function or visualizacoes column is not created yet):', err);
      }
    }
  },

  saveProperty: async (property: Partial<Imovel> & { titulo: string }): Promise<Imovel> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const isNew = !property.id;
    const propertyPayload = {
      codigo: property.codigo || 'IM' + Math.floor(1000 + Math.random() * 9000),
      titulo: property.titulo,
      descricao: property.descricao || '',
      tipo: property.tipo || 'Fazenda',
      modalidade: property.modalidade || 'Venda',
      valor: property.valor || 0,
      area_total: property.area_total || 0,
      cidade: property.cidade || '',
      estado: property.estado || '',
      latitude: property.latitude,
      longitude: property.longitude,
      destaque: property.destaque || false,
      status: property.status || 'Ativo',
      updated_at: new Date().toISOString()
    };

    let savedProperty: any;

    if (isNew) {
      const { data, error } = await supabase
        .from('tabela_imoveis')
        .insert([propertyPayload])
        .select()
        .single();
      if (error) throw error;
      savedProperty = data;
    } else {
      const { data, error } = await supabase
        .from('tabela_imoveis')
        .update(propertyPayload)
        .eq('id', property.id)
        .select()
        .single();
      if (error) throw error;
      savedProperty = data;
    }

    // Handle images
    if (property.imagens && property.imagens.length > 0) {
      // Delete old images
      if (!isNew) {
        await supabase
          .from('tabela_imagens_imoveis')
          .delete()
          .eq('imovel_id', savedProperty.id);
      }

      // Insert new images
      const imagesPayload = property.imagens.map((img, idx) => ({
        imovel_id: savedProperty.id,
        url: img.url,
        ordem: idx
      }));

      const { error: imgError } = await supabase
        .from('tabela_imagens_imoveis')
        .insert(imagesPayload);
      if (imgError) throw imgError;
    }

    // Fetch complete property details
    const complete = await api.getPropertyById(savedProperty.id);
    if (!complete) throw new Error('Failed to retrieve saved property');
    return complete;
  },

  deleteProperty: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { error } = await supabase
      .from('tabela_imoveis')
      .update({ status: 'Excluido', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- USERS ---
  getUsers: async (): Promise<Usuario[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('tabela_usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Optional: Enrich users with message counts from Supabase dynamically if needed, 
    // or just return the records
    return data || [];
  },

  getUserById: async (id: string): Promise<Usuario | undefined> => {
    if (!isSupabaseConfigured()) {
      return undefined;
    }

    const { data, error } = await supabase
      .from('tabela_usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }

    // Retrieve user interactions history
    const { data: messages } = await supabase
      .from('tabela_mensagens')
      .select('id, created_at')
      .eq('usuario_id', id);
      
    return {
      ...data,
      mensagens_enviadas_count: messages?.length || 0,
      ultimo_contato: messages && messages.length > 0 ? messages[messages.length - 1].created_at : undefined
    };
  },

  saveUser: async (user: Partial<Usuario> & { nome: string; email: string }): Promise<Usuario> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    const emailLower = user.email.toLowerCase();
    
    // Check if user already exists
    const { data: existing } = await supabase
      .from('tabela_usuarios')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    const userPayload: any = {
      nome: user.nome,
      telefone: user.telefone,
      cidade: user.cidade,
      creci: user.creci,
      perfil: user.perfil || 'Cliente',
      status: user.status || 'Ativo',
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { data, error } = await supabase
        .from('tabela_usuarios')
        .update(userPayload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;

      // Se a senha foi fornecida e o usuário não é um cliente, atualiza no Supabase Auth via RPC
      if (user.senha && existing.perfil !== 'Cliente') {
        const { error: pwdError } = await supabase.rpc('admin_alterar_senha_usuario', {
          p_usuario_id: existing.id,
          p_nova_senha: user.senha
        });
        if (pwdError) throw pwdError;
      }

      return data;
    } else {
      if (user.perfil === 'Cliente') {
        // Clientes não possuem conta no Supabase Auth, apenas registro na tabela pública
        const insertPayload = {
          email: emailLower,
          ...userPayload
        };
        if (user.id) {
          insertPayload.id = user.id;
        }
        
        const { data, error } = await supabase
          .from('tabela_usuarios')
          .insert([insertPayload])
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Usuário de Painel (Administrador/Corretor): cria no Supabase Auth + tabela pública via RPC seguro
        if (!user.senha || user.senha.length < 8) {
          throw new Error('Senha é obrigatória e deve ter no mínimo 8 caracteres para criar usuários de painel.');
        }
        const senhaFornecida = user.senha;
        
        const { data: newId, error: createError } = await supabase.rpc('admin_criar_usuario', {
          p_nome: user.nome,
          p_email: emailLower,
          p_telefone: user.telefone || null,
          p_cidade: user.cidade || null,
          p_perfil: user.perfil || 'Corretor',
          p_status: user.status || 'Pendente',
          p_senha: senhaFornecida
        });
        
        if (createError) throw createError;

        const { data, error } = await supabase
          .from('tabela_usuarios')
          .select('*')
          .eq('id', newId)
          .single();

        if (error) throw error;
        return data;
      }
    }
  },

  deleteUser: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { data, error } = await supabase.rpc('admin_deletar_usuario', {
      p_usuario_id: id
    });

    if (error) {
      devLog('Error deleting user from Supabase:', error);
      throw error;
    }
    return !!data;
  },

  // --- MESSAGES ---
  getMessages: async (): Promise<Mensagem[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('tabela_mensagens')
      .select('*, tabela_usuarios:tabela_usuarios!usuario_id(*), tabela_imoveis(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    let users: Usuario[] = [];
    try {
      users = await api.getUsers();
    } catch (e) {
      devWarn("Failed to load users for message assignment:", e);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      usuario_id: row.usuario_id,
      imovel_id: row.imovel_id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      assunto: row.assunto,
      mensagem: row.mensagem,
      status: row.status,
      observacao_interna: row.observacao_interna,
      atribuido_a_id: row.atribuido_a_id,
      atribuido_a: row.atribuido_a_id ? users.find(u => u.id === row.atribuido_a_id) : undefined,
      created_at: row.created_at,
      usuario: row.tabela_usuarios ? {
        id: row.tabela_usuarios.id,
        nome: row.tabela_usuarios.nome,
        email: row.tabela_usuarios.email,
        telefone: row.tabela_usuarios.telefone,
        cidade: row.tabela_usuarios.cidade,
        creci: row.tabela_usuarios.creci,
        perfil: row.tabela_usuarios.perfil,
        status: row.tabela_usuarios.status,
        created_at: row.tabela_usuarios.created_at,
        updated_at: row.tabela_usuarios.updated_at
      } : undefined,
      imovel: row.tabela_imoveis ? {
        id: row.tabela_imoveis.id,
        codigo: row.tabela_imoveis.codigo,
        titulo: row.tabela_imoveis.titulo,
        descricao: row.tabela_imoveis.descricao,
        tipo: row.tabela_imoveis.tipo,
        modalidade: row.tabela_imoveis.modalidade,
        valor: row.tabela_imoveis.valor,
        area_total: row.tabela_imoveis.area_total,
        cidade: row.tabela_imoveis.cidade,
        estado: row.tabela_imoveis.estado,
        destaque: row.tabela_imoveis.destaque,
        status: row.tabela_imoveis.status,
        created_at: row.tabela_imoveis.created_at,
        updated_at: row.tabela_imoveis.updated_at
      } : undefined
    }));
  },

  registrarMensagemContato: async (payload: {
    nome: string;
    email: string;
    telefone?: string;
    assunto: string;
    mensagem: string;
    imovel_id?: string;
    cidade?: string;
  }, captchaToken?: string): Promise<string> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    // Call the security definer database RPC
    let query = supabase.rpc('registrar_mensagem_contato', {
      p_nome: payload.nome,
      p_email: payload.email,
      p_telefone: payload.telefone || null,
      p_assunto: payload.assunto,
      p_mensagem: payload.mensagem,
      p_imovel_id: payload.imovel_id || null,
      p_cidade: payload.cidade || null
    });

    if (captchaToken) {
      query = query.setHeader('x-captcha-token', captchaToken);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data; // returns the generated user id, message id is generated in db
  },

  updateMessageStatus: async (id: string, status: StatusMensagem, observacao?: string, atribuidoAId?: string | null): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const payload: any = { 
      status
    };

    if (observacao !== undefined) {
      payload.observacao_interna = observacao;
    }

    if (atribuidoAId !== undefined) {
      payload.atribuido_a_id = atribuidoAId;
    }

    const { error } = await supabase
      .from('tabela_mensagens')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  addInternalNote: async (messageId: string, userId: string, userName: string, noteText: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { data, error: fetchError } = await supabase
      .from('tabela_mensagens')
      .select('observacao_interna')
      .eq('id', messageId)
      .single();

    if (fetchError) throw fetchError;

    const currentNotes = parseNotes(data?.observacao_interna);

    const userNoteIndex = currentNotes.findIndex(n => n.userId === userId || (userId === '' && n.userName === userName));
    if (userNoteIndex >= 0) {
      currentNotes[userNoteIndex].text = `${currentNotes[userNoteIndex].text}\n${noteText.trim()}`;
    } else {
      currentNotes.push({
        userId,
        userName,
        text: noteText.trim(),
        createdAt: new Date().toISOString()
      });
    }

    const { error: updateError } = await supabase
      .from('tabela_mensagens')
      .update({ observacao_interna: JSON.stringify(currentNotes) })
      .eq('id', messageId);

    if (updateError) throw updateError;
    return true;
  },

  updateInternalNote: async (messageId: string, noteIndex: number, newText: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { data, error: fetchError } = await supabase
      .from('tabela_mensagens')
      .select('observacao_interna')
      .eq('id', messageId)
      .single();

    if (fetchError) throw fetchError;

    const currentNotes = parseNotes(data?.observacao_interna);

    if (newText.trim() === '') {
      currentNotes.splice(noteIndex, 1);
    } else if (currentNotes[noteIndex]) {
      currentNotes[noteIndex].text = newText.trim();
    }

    const { error: updateError } = await supabase
      .from('tabela_mensagens')
      .update({ observacao_interna: currentNotes.length > 0 ? JSON.stringify(currentNotes) : null })
      .eq('id', messageId);

    if (updateError) throw updateError;
    return true;
  },

  deleteInternalNote: async (messageId: string, noteIndex: number): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { data, error: fetchError } = await supabase
      .from('tabela_mensagens')
      .select('observacao_interna')
      .eq('id', messageId)
      .single();

    if (fetchError) throw fetchError;

    const currentNotes = parseNotes(data?.observacao_interna);

    if (currentNotes[noteIndex]) {
      currentNotes.splice(noteIndex, 1);
    }

    const { error: updateError } = await supabase
      .from('tabela_mensagens')
      .update({ observacao_interna: currentNotes.length > 0 ? JSON.stringify(currentNotes) : null })
      .eq('id', messageId);

    if (updateError) throw updateError;
    return true;
  },

  // --- VISIT REQUESTS ---
  getVisits: async (): Promise<SolicitacaoVisita[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('tabela_solicitacoes_visita')
      .select('*, tabela_usuarios(*), tabela_imoveis(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      usuario_id: row.usuario_id,
      imovel_id: row.imovel_id,
      data_solicitada: row.data_solicitada,
      observacoes: row.observacoes,
      status: row.status,
      created_at: row.created_at,
      usuario: row.tabela_usuarios,
      imovel: row.tabela_imoveis
    }));
  },

  registrarSolicitacaoVisita: async (payload: {
    nome: string;
    email: string;
    telefone?: string;
    imovel_id: string;
    data_solicitada: string;
    observacoes?: string;
    cidade?: string;
  }, captchaToken?: string): Promise<string> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    let query = supabase.rpc('registrar_solicitacao_visita', {
      p_nome: payload.nome,
      p_email: payload.email,
      p_telefone: payload.telefone || null,
      p_imovel_id: payload.imovel_id,
      p_data_solicitada: payload.data_solicitada,
      p_observacoes: payload.observacoes || null,
      p_cidade: payload.cidade || null
    });

    if (captchaToken) {
      query = query.setHeader('x-captcha-token', captchaToken);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  updateVisitStatus: async (id: string, status: StatusVisita): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { error } = await supabase
      .from('tabela_solicitacoes_visita')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- TESTIMONIALS ---
  getTestimonials: async (): Promise<Depoimento[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('tabela_depoimentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Busca pública: apenas depoimentos aprovados
  getApprovedTestimonials: async (): Promise<Depoimento[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('tabela_depoimentos')
      .select('*')
      .eq('aprovado', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  saveTestimonial: async (testimonial: Partial<Depoimento> & { nome: string; cargo: string; texto: string }, captchaToken?: string): Promise<Depoimento> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    if (testimonial.id) {
      const { data, error } = await supabase
        .from('tabela_depoimentos')
        .update({
          nome: testimonial.nome,
          cargo: testimonial.cargo,
          texto: testimonial.texto
        })
        .eq('id', testimonial.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      let query = supabase
        .from('tabela_depoimentos')
        .insert([{
          nome: testimonial.nome,
          cargo: testimonial.cargo,
          texto: testimonial.texto
        }])
        .select()
        .single();

      if (captchaToken) {
        query = query.setHeader('x-captcha-token', captchaToken);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  },

  deleteTestimonial: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { error } = await supabase
      .from('tabela_depoimentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  updateTestimonialApproval: async (id: string, aprovado: boolean): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { error } = await supabase
      .from('tabela_depoimentos')
      .update({ aprovado })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- DASHBOARD METRICS ---
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    if (!isSupabaseConfigured()) {
      return {
        totalImoveis: 0,
        imoveisVenda: 0,
        imoveisAluguel: 0,
        totalUsuarios: 0,
        totalClientes: 0,
        totalAdmins: 0,
        totalMensagens: 0,
        mensagensPendentes: 0,
        leadsMes: 0,
        solicitacoesVisita: 0,
        totalVisualizacoes: 0
      };
    }

    // Call Supabase queries in parallel for efficiency
    try {
      const [
        propCount,
        vendaCount,
        aluguelCount,
        userCount,
        clientCount,
        adminCount,
        messageCount,
        pendingMsgCount,
        visitCount,
        viewsResult
      ] = await Promise.all([
        supabase.from('tabela_imoveis').select('id', { count: 'exact', head: true }).neq('status', 'Excluido'),
        supabase.from('tabela_imoveis').select('id', { count: 'exact', head: true }).eq('modalidade', 'Venda').neq('status', 'Excluido'),
        supabase.from('tabela_imoveis').select('id', { count: 'exact', head: true }).eq('modalidade', 'Aluguel').neq('status', 'Excluido'),
        supabase.from('tabela_usuarios').select('id', { count: 'exact', head: true }),
        supabase.from('tabela_usuarios').select('id', { count: 'exact', head: true }).eq('perfil', 'Cliente'),
        supabase.from('tabela_usuarios').select('id', { count: 'exact', head: true }).in('perfil', ['Administrador', 'Corretor']),
        supabase.from('tabela_mensagens').select('id', { count: 'exact', head: true }),
        supabase.from('tabela_mensagens').select('id', { count: 'exact', head: true }).in('status', ['Nova', 'Em andamento']),
        supabase.from('tabela_solicitacoes_visita').select('id', { count: 'exact', head: true }),
        supabase.from('tabela_imoveis').select('visualizacoes').neq('status', 'Excluido')
      ]);

      const hasDatabaseViews = viewsResult.data && viewsResult.data.length > 0 && ('visualizacoes' in viewsResult.data[0]);
      
      const totalDatabaseViews = hasDatabaseViews
        ? viewsResult.data.reduce((sum: number, row: any) => sum + Number(row.visualizacoes || 0), 0)
        : 0;

      return {
        totalImoveis: propCount.count || 0,
        imoveisVenda: vendaCount.count || 0,
        imoveisAluguel: aluguelCount.count || 0,
        totalUsuarios: userCount.count || 0,
        totalClientes: clientCount.count || 0,
        totalAdmins: adminCount.count || 0,
        totalMensagens: messageCount.count || 0,
        mensagensPendentes: pendingMsgCount.count || 0,
        leadsMes: 0,
        solicitacoesVisita: visitCount.count || 0,
        totalVisualizacoes: totalDatabaseViews
      };
    } catch (e) {
      devLog('Falha ao obter métricas do Supabase:', e);
      throw e;
    }
  },

  // --- CONFIGURATIONS ---
  getConfiguracoes: async (): Promise<Configuracoes> => {
    if (!isSupabaseConfigured()) {
      return {} as Configuracoes;
    }
    const { data, error } = await supabase
      .from('tabela_configuracoes')
      .select('*')
      .maybeSingle();

    if (error) {
      devLog('Error fetching configurations from Supabase:', error);
      throw error;
    }
    if (!data) {
      return {} as Configuracoes;
    }
    return {
      ...data,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined
    };
  },

  saveConfiguracoes: async (config: Partial<Configuracoes>): Promise<Configuracoes> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }
    const { data, error } = await supabase
      .from('tabela_configuracoes')
      .upsert({
        ...config,
        id: config.id || undefined,
        latitude: config.latitude ? Number(config.latitude) : null,
        longitude: config.longitude ? Number(config.longitude) : null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      devLog('Erro ao salvar as configurações no Supabase:', error);
      throw error;
    }
    return {
      ...data,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined
    };
  },

  // --- SELLERS ---
  getVendedores: async (): Promise<Vendedor[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }
    const { data, error } = await supabase
      .from('tabela_vendedores')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      devLog('Error fetching sellers from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  saveVendedor: async (vendedor: Partial<Vendedor> & { nome: string; role: string; especializacao: string }): Promise<Vendedor> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }
    const payload = {
      nome: vendedor.nome,
      role: vendedor.role,
      especializacao: vendedor.especializacao,
      telefone: vendedor.telefone || null,
      email: vendedor.email || null,
      foto: vendedor.foto || null,
      creci: vendedor.creci || null,
      updated_at: new Date().toISOString()
    };

    if (vendedor.id) {
      const { data, error } = await supabase
        .from('tabela_vendedores')
        .update(payload)
        .eq('id', vendedor.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('tabela_vendedores')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deleteVendedor: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }
    const { error } = await supabase
      .from('tabela_vendedores')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  uploadFile: async (file: File, bucket: string): Promise<string> => {
    if (!isSupabaseConfigured()) {
      return URL.createObjectURL(file);
    }

    // Validação de tipo de arquivo (Apenas imagens permitidas)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, WEBP, GIF) são aceitas.');
    }

    // Validação de magic bytes (file signature) para evitar bypass de MIME type
    const magicBytesMap: Record<string, number[][]> = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
    };
    const headerBytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const expectedSigs = magicBytesMap[file.type];
    if (expectedSigs) {
      const isValidSignature = expectedSigs.some(sig =>
        sig.every((byte, idx) => headerBytes[idx] === byte)
      );
      if (!isValidSignature) {
        throw new Error('O conteúdo do arquivo não corresponde ao tipo informado. Envie uma imagem válida.');
      }
    }

    // Validação de tamanho máximo (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('O arquivo excede o limite máximo de tamanho de 10MB.');
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${crypto.randomUUID()}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      devLog(`Error uploading to bucket ${bucket}:`, error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  // --- CATEGORIES ---
  getCategories: async (): Promise<Categoria[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }
    const { data, error } = await supabase
      .from('tabela_categorias')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      devLog('Error fetching categories from Supabase:', error);
      throw error;
    }
    return data || [];
  },

  saveCategory: async (category: Partial<Categoria> & { nome: string; tipo: string }): Promise<Categoria> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }
    const payload = {
      nome: category.nome,
      tipo: category.tipo,
      imagem: category.imagem || null,
      updated_at: new Date().toISOString()
    };

    if (category.id) {
      const { data, error } = await supabase
        .from('tabela_categorias')
        .update(payload)
        .eq('id', category.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('tabela_categorias')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      return false;
    }
    const { error } = await supabase
      .from('tabela_categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
