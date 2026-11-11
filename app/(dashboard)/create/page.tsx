'use client';

import React from 'react';
import Link from 'next/link';
import { Film, Plus } from 'lucide-react';

export default function CreateVideoPage() {
  return (
    <div className="min-h-screen bg-[#070a12] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-6 text-indigo-400">
        <Film className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold mb-2">Motor de Vídeo Zerado</h1>
      <p className="text-gray-400 max-w-md text-sm mb-6">
        Todas as funções antigas, templates fixos e fluxos engessados foram completamente removidos. O projeto está pronto para a implementação do novo fluxo 100% IA.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all border border-white/10"
      >
        Voltar ao Painel
      </Link>
    </div>
  );
}
