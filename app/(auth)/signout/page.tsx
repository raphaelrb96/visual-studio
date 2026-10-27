'use client';

import { useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';

export default function SignOutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut();
  }, [signOut]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090d16]">
      <p className="text-slate-400 text-sm">Encerrando sessao...</p>
    </div>
  );
}
