import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './lib/AuthContext';

export const metadata: Metadata = {
  title: 'Visual Studio | Video as Code SaaS',
  description: 'Micro-SaaS headless e modular de Motion Graphics programatico em 9:16 e 16:9.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
