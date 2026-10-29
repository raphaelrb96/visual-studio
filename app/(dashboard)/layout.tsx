'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  LayoutDashboard,
  Video,
  PlusCircle,
  Palette,
  Settings,
  Zap,
  Menu,
  X,
  Sparkles,
  Cloud,
  LogOut,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/app/lib/AuthContext';
import { getUserCredits, UserCredits } from '@/app/lib/firestore';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Meus Vídeos', href: '/videos', icon: Video },
  { label: 'Criar Vídeo', href: '/create', icon: PlusCircle, highlight: true },
  { label: 'Presets & Estilos', href: '/presets', icon: Palette },
  { label: 'Configurações', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [credits, setCredits] = useState<UserCredits | null>(null);

  useEffect(() => {
    if (user) {
      getUserCredits(user.uid).then(setCredits);
    }
  }, [user]);

  const percentUsed = credits
    ? Math.min(100, Math.round((credits.availableCredits / credits.totalCredits) * 100))
    : 100;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0c111e]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">Visual Studio</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 z-40 bg-[#090d18]/95 backdrop-blur-xl border-r border-slate-800/80 p-5 flex flex-col justify-between transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white block">Visual Studio</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Gerador SaaS 2.0
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      NOVO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Credits & Status Reais */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          {/* Box de Créditos Reais */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Saldo de Vídeos
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300">
                {credits ? `${credits.availableCredits} / ${credits.totalCredits}` : '...'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block font-medium capitalize">
              Plano: {credits?.plan === 'free' ? 'Teste Gratuito' : credits?.plan || 'Ativo'}
            </span>
          </div>

          {/* Botão de Upgrade SaaS */}
          <Link
            href="/#planos"
            className="w-full py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fazer Upgrade de Plano</span>
          </Link>

          {/* User info & Signout */}
          <div className="flex items-center justify-between px-1 pt-2 border-t border-slate-800/80">
            <div className="text-xs truncate max-w-[140px]">
              <p className="font-semibold text-white truncate">{user?.displayName || 'Usuário'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-30 h-16 bg-[#070a12]/80 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ambiente: <strong className="text-white">Produção Conectada</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gerar Vídeo</span>
            </Link>

            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md uppercase">
              {user?.displayName ? user.displayName.slice(0, 2) : 'VS'}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
