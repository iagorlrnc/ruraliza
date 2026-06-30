import React from 'react';
import { Target, Eye, Heart, Landmark, MapPin, Award, Briefcase, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const timelineEvents = [
  {
    year: '2009',
    title: 'O Início da Jornada',
    description: 'Trabalhando no setor de desapropriação na Ferrovia Norte Sul, o engenheiro agrônomo Juscelino Kubitschek percebe a grande migração de produtores rurais goianos e sulistas para investir no agronegócio tocantinense.',
    icon: MapPin,
  },
  {
    year: '2011',
    title: 'Primeira Negociação',
    description: 'Após se qualificar por meio do curso de Transações Imobiliárias, Juscelino efetiva sua primeira negociação de fazenda, marcando o começo de uma atuação cada vez mais profissional no mercado imobiliário rural.',
    icon: Briefcase,
  },
  {
    year: '2011–2019',
    title: 'Qualificação & Experiência',
    description: 'Período de intensa especialização com cursos nas áreas ambiental e fundiária, visando resguardar os investidores quanto à situação legal dos imóveis. A prática de mercado trouxe o aprimoramento em técnicas de negociação e relacionamento interpessoal.',
    icon: Award,
  },
  {
    year: '2019',
    title: 'Fundação da Ruraliza Negócios',
    description: 'Nasce a Ruraliza Negócios, com sede em Palmas, capital do Tocantins. Área de atuação abrangendo todo o estado do Tocantins e o sul do Pará, com foco em se tornar referência no setor imobiliário rural.',
    icon: TrendingUp,
  },
];

const Sobre: React.FC = () => {
  useSEO('Sobre Nós', 'Conheça a história da Ruraliza Negócios, referência em intermediação imobiliária rural no Tocantins e sul do Pará.');

  // Fetch settings for dynamic CRECI
  const { data: config } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getConfiguracoes
  });

  return (
    <div className="space-y-16 pb-20 text-left">
      {/* Banner */}
      <section className="relative h-64 bg-primary-dark text-white flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/hero.jpg"
            alt="História Ruraliza"
            className="w-full h-full object-cover opacity-20 object-center"
            data-no-protect
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-primary-dark/80"></div>
        </div>
        <div className="relative z-10 text-center space-y-2">
          <h1 className="font-poppins text-3xl font-bold">Sobre Nós</h1>
          <p className="text-sm text-brand-beige-dark/70">Conheça nossa trajetória, propósito e corpo técnico</p>
        </div>
      </section>

      {/* History */}
      <section className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-primary-medium uppercase tracking-widest block">Nossa Origem</span>
          <h2 className="font-poppins text-xl sm:text-2xl font-bold text-primary-dark dark:text-white">
            Da experiência no campo à referência em negócios rurais
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
            A história da Ruraliza Negócios começa em 2009, quando o engenheiro agrônomo e fundador da empresa, Juscelino Kubitschek, à época trabalhando no setor de desapropriação na Ferrovia Norte Sul, percebeu a grande migração de produtores rurais goianos e sulistas para investir no agronegócio tocantinense.
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
            A experiência de campo e em empresas do segmento imobiliário despertou seu interesse na área e, em 2011, após se qualificar por meio do curso de Transações Imobiliárias, efetivou sua primeira negociação de fazenda. A partir daí, sua atuação na área foi se profissionalizando, com cursos nas áreas ambiental e fundiária, a fim de resguardar os investidores da situação legal dos imóveis em oferta.
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
            Em 2019, sentiu a necessidade de empreender, resultando na fundação da Ruraliza Negócios, com sede na capital, Palmas. Sua área de atuação abrange todo o estado do Tocantins e sul do Pará, sendo o trabalho focado em se tornar referência no setor imobiliário rural a partir da qualidade de um atendimento técnico que preza pelo bom relacionamento e pela transparência com seus clientes.
          </p>
        </div>
        <div className="rounded-3xl overflow-hidden aspect-[4/3] border border-gray-200 dark:border-zinc-800 shadow-lg">
          <img
            src="/hero.jpg"
            alt="Fazenda Tocantins"
            className="w-full h-full object-cover"
            data-no-protect
          />
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-4 space-y-8">
        <div className="text-center max-w-md mx-auto space-y-2">
          <span className="text-[10px] font-bold text-primary-medium uppercase tracking-widest block">Nossa Trajetória</span>
          <h2 className="font-poppins text-xl sm:text-2xl font-bold text-primary-dark dark:text-white">
            Linha do Tempo
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-primary-medium/20 dark:bg-zinc-700 -translate-x-1/2 hidden sm:block"></div>

          <div className="space-y-10">
            {timelineEvents.map((event, idx) => {
              const Icon = event.icon;
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                    isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                >
                  {/* Content Card */}
                  <div className={`flex-1 ${isLeft ? 'sm:text-right' : 'sm:text-left'}`}>
                    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                      <span className="text-primary-medium font-poppins font-bold text-sm">{event.year}</span>
                      <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white">{event.title}</h3>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed font-sans">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Icon */}
                  <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary-medium/10 border-2 border-primary-medium/30 items-center justify-center shrink-0 z-10">
                    <Icon className="h-5 w-5 text-primary-medium" />
                  </div>

                  {/* Spacer for the other side */}
                  <div className="flex-1 hidden sm:block"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Vision Values */}
      <section className="bg-white dark:bg-zinc-900/40 py-16 transition-colors duration-300">
        <div className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="bg-brand-beige/35 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl space-y-3">
            <div className="h-9 w-9 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white">Missão</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Viabilizar transações imobiliárias rurais seguras, pautadas em atendimento técnico qualificado, prezando pelo bom relacionamento e pela transparência com nossos clientes.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-brand-beige/35 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl space-y-3">
            <div className="h-9 w-9 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white">Visão</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Ser referência no setor imobiliário rural no Tocantins e sul do Pará, reconhecida pela qualidade do atendimento técnico e pela segurança jurídica proporcionada aos investidores e produtores.
            </p>
          </div>

          {/* Values */}
          <div className="bg-brand-beige/35 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-2xl space-y-3">
            <div className="h-9 w-9 rounded-lg bg-primary-medium/10 text-primary-medium flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-gray-800 dark:text-white">Valores</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Transparência, ética, qualificação técnica contínua, bom relacionamento interpessoal e compromisso com a segurança legal dos imóveis ofertados.
            </p>
          </div>
        </div>
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

export default Sobre;
