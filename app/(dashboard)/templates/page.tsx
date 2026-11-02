'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MOTION_TEMPLATES, TEMPLATE_CATEGORIES, TemplateCategoryId } from '@/lib/motion-templates';
import { MotionTemplateSquarePreview } from '@/components/motion/MotionTemplateSquarePreview';
import { Sparkles, Layers, ArrowRight, Filter, Search } from 'lucide-react';

export default function TemplatesCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtragem dos templates
  const filteredTemplates = useMemo(() => {
    return MOTION_TEMPLATES.filter((tpl) => {
      const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            Catálogo Oficial de Motion Graphics • {MOTION_TEMPLATES.length} Modelos
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Templates de Vídeo &amp; Motion Design
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-1 max-w-2xl">
            Modelos de alta retenção visual com prévia em tempo real. Escolha um template para explorar a física, timing e anatomia técnica.
          </p>
        </div>

        <Link
          href="/create"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 flex items-center gap-2 shrink-0 self-start md:self-auto transition-all"
        >
          <Sparkles className="w-4 h-4" /> Criar Vídeo com IA
        </Link>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0a0e19] p-4 rounded-2xl border border-white/10">
        {/* Seletor Dropdown por Categoria */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 shrink-0">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Categoria:</span>
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TemplateCategoryId)}
              className="appearance-none bg-[#111827] text-white text-xs md:text-sm font-semibold py-2.5 pl-4 pr-10 rounded-xl border border-white/15 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {TEMPLATE_CATEGORIES.map((cat) => {
                const count = cat.id === 'all'
                  ? MOTION_TEMPLATES.length
                  : MOTION_TEMPLATES.filter((t) => t.category === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id} className="bg-[#111827] text-white py-1">
                    {cat.label} ({count})
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Input de Busca Rápida */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou efeito..."
            className="w-full bg-[#111827] text-white text-xs md:text-sm py-2.5 pl-10 pr-4 rounded-xl border border-white/15 focus:outline-none focus:border-indigo-500 placeholder-gray-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid de Templates em Formato Horizontal Cinemático (16:9) */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/templates/${tpl.id}`}
              className="group rounded-2xl bg-[#0c101d] border border-white/10 hover:border-amber-500/50 p-4 flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
            >
              {/* Item no Formato Horizontal Exato (16:9) Sem Distorção */}
              <div className="w-full aspect-video rounded-xl overflow-hidden relative shadow-inner border border-white/5 bg-[#080b12]">
                <MotionTemplateSquarePreview
                  templateId={tpl.id}
                  name={tpl.name}
                  previewGif={tpl.previewGif}
                />
              </div>

              {/* Informações Abaixo do Item */}
              <div className="pt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    {tpl.badge}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {tpl.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {tpl.name}
                  </h3>
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0 self-start">
                    {tpl.categoryName}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed min-h-[3.25rem]">
                  {tpl.description}
                </p>

                <div className="pt-2 flex items-center text-xs font-bold text-indigo-400 group-hover:text-amber-400 transition-colors gap-1">
                  <span>Explorar Anatomia</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl space-y-3">
          <p className="text-base text-gray-400 font-medium">Nenhum template encontrado com esses filtros.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="text-xs font-bold text-indigo-400 hover:underline"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
