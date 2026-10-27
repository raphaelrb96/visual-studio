export default function Contact() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Contato</h1>
      <p className="mb-4">Entre em contato conosco através do formulário abaixo.</p>
      <form className="grid gap-4">
        <input type="text" placeholder="Nome" className="border p-2 rounded" />
        <input type="email" placeholder="E‑mail" className="border p-2 rounded" />
        <textarea placeholder="Mensagem" rows={5} className="border p-2 rounded"></textarea>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          Enviar
        </button>
      </form>
    </main>
  );
}
