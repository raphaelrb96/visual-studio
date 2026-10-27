export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Página não encontrada</h1>
      <p className="text-lg text-gray-600 mb-6">Desculpe, o caminho que você tentou acessar não existe.</p>
      <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
        Voltar à Home
      </a>
    </div>
  );
}
