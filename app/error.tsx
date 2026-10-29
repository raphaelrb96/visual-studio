'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-8">
      <h1 className="text-4xl font-bold text-red-800 mb-4">Erro inesperado</h1>
      <p className="text-lg text-red-600 mb-6">Algo deu errado. Por favor, tente novamente.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Tentar novamente
      </button>
    </div>
  );
}
