import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users2, Landmark } from 'lucide-react';
import { api } from '../services/api';
import { useSEO } from '../hooks/useSEO';

// Helper component for team member card
const TeamCard: React.FC<{ t: any; idx: number }> = ({ t, idx }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: idx * 0.1 }}
    className="w-full max-w-sm md:w-[320px] bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow text-center flex flex-col items-center"
  >
    <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-primary-medium/20 shadow-inner">
      <img 
        src={t.foto || '/imagesub.png'} 
        alt={t.nome} 
        className="w-full h-full object-cover" 
        data-no-protect 
      />
    </div>
    <div className="space-y-1">
      <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white">{t.nome}</h3>
      <span className="text-[10px] text-primary-medium dark:text-primary-light font-bold block uppercase tracking-wider">{t.role}</span>
      {t.creci && (
        <span className="text-[9px] text-gray-400 font-bold block">CRECI: {t.creci}</span>
      )}
    </div>
    <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
      {t.especializacao}
    </p>
    
    {(t.email || t.telefone) && (
      <div className="pt-2 flex justify-center gap-4 text-xs font-semibold w-full border-t border-gray-100 dark:border-zinc-800/80">
        {t.telefone && (
          <a 
            href={`https://wa.me/55${t.telefone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
          >
            WhatsApp
          </a>
        )}
        {t.email && (
          <a 
            href={`mailto:${t.email}`}
            className="text-primary-medium hover:text-primary-dark font-medium"
          >
            E-mail
          </a>
        )}
      </div>
    )}
  </motion.div>
);

const Equipe: React.FC = () => {
  useSEO('Nossa Equipe', 'Conheça os corretores e especialistas técnicos da Ruraliza Negócios em Tocantins e Pará.');

  // Fetch sellers/team technical specialists
  const { data: team = [], isLoading } = useQuery({
    queryKey: ['sellers'],
    queryFn: api.getVendedores
  });

  // Fetch configurations for CRECI
  const { data: config } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getConfiguracoes
  });

  return (
    <div className="space-y-16 pb-20 text-left">
      {/* Banner Header */}
      <section className="relative h-64 bg-primary-dark text-white flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/hero.jpg"
            alt="Equipe Ruraliza"
            className="w-full h-full object-cover opacity-20 object-center animate-pulse-slow"
            data-no-protect
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center space-y-2 px-4">
          <h1 className="font-poppins text-3xl font-bold">Nossa Equipe</h1>
          <p className="text-xs text-brand-beige-dark max-w-md mx-auto">
            Os melhores especialistas do mercado imobiliário rural prontos para te atender.
          </p>
        </div>
      </section>

      {/* Team Specialist Grid */}
      <section className="mx-auto max-w-5xl px-4 space-y-10">
        <div className="text-center max-w-sm mx-auto space-y-2">
          <div className="h-10 w-10 bg-primary-medium/10 rounded-full flex items-center justify-center mx-auto text-primary-medium">
            <Users2 className="h-5 w-5" />
          </div>
          <h2 className="font-poppins text-xl sm:text-2xl font-bold text-primary-dark dark:text-white">
            Nossos Especialistas
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Conheça a equipe técnica que cuida de cada etapa de sua negociação rural.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-wrap justify-center gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full max-w-sm md:w-[320px] h-64 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 skeleton-shimmer"></div>
            ))}
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">Nenhum corretor cadastrado no momento.</p>
          </div>
        ) : team.length === 3 || team.length === 6 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center max-w-5xl mx-auto">
            {team.map((member, idx) => (
              <TeamCard key={member.id} t={member} idx={idx} />
            ))}
          </div>
        ) : team.length === 4 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center max-w-3xl mx-auto">
            {team.map((member, idx) => (
              <TeamCard key={member.id} t={member} idx={idx} />
            ))}
          </div>
        ) : team.length === 5 ? (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
              {team.slice(0, 3).map((member, idx) => (
                <TeamCard key={member.id} t={member} idx={idx} />
              ))}
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-8">
              {team.slice(3).map((member, idx) => (
                <TeamCard key={member.id} t={member} idx={idx + 3} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member, idx) => (
              <TeamCard key={member.id} t={member} idx={idx} />
            ))}
          </div>
        )}
      </section>

      {/* Credibility / Trust Stamp */}
      <section className="mx-auto max-w-4xl px-4">
        <div className="bg-primary-dark text-white p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-between text-left">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary-light shrink-0" />
              <h3 className="font-poppins text-lg font-bold">Assessoria Imobiliária com Selo de Segurança</h3>
            </div>
            <p className="text-xs text-brand-beige-dark/75 leading-relaxed">
              Trabalhamos com rigorosa auditoria documental antes de anunciar qualquer propriedade. Garantimos que sua transação ocorra com total segurança jurídica e transparência.
            </p>
          </div>
          <div className="bg-primary-medium/25 border border-primary-medium/35 px-4 py-3 rounded-2xl shrink-0 text-center">
            <span className="block text-[10px] text-brand-beige-dark font-semibold uppercase tracking-wider">CRECI Jurídico</span>
            <strong className="text-base text-white font-poppins block">Nº {config?.creci || '[Não cadastrado]'}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Equipe;
