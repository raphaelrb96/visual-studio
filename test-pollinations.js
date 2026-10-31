async function test() {
  console.log('Testando requisicao para Pollinations AI...');
  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [{ role: 'user', content: 'Gere um json: {"status": "ok"}' }],
        response_format: { type: 'json_object' }
      })
    });
    console.log('Status HTTP:', res.status);
    const text = await res.text();
    console.log('Resposta bruta:', text);
  } catch (err) {
    console.error('Erro no fetch:', err);
  }
}
test();
