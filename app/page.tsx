import Link from 'next/link';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8'>
      <section className='text-center max-w-2xl'>
        <h1 className='text-5xl font-extrabold text-gray-900 mb-4'>
          Bem-vindo ao <span className='text-indigo-600'>Meu Produto</span>
        </h1>
        <p className='text-lg text-gray-700 mb-8'>
          Uma plataforma inovadora para gerenciar seu conteúdo de vídeo de forma simples e eficaz.
        </p>
        <div className='flex gap-4 justify-center'>
          <Link href='/login' className='px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition'>Entrar</Link>
          <Link href='/register' className='px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition'>Registrar-se</Link>
        </div>
      </section>
    </main>
  );
}
