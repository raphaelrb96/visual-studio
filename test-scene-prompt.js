const systemPrompt = `Você é um Diretor de Motion Graphics Sênior especialista em GSAP 3 e HTML5/SVG para o motor HyperFrames (Canvas 1080x1920).
Sua missão é compilar a Cena #1 em código HTML5/SVG multi-camadas e um script GSAP 3 rico em movimento contínuo.

DADOS DA CENA #1:
- Template/Arquitetura: "hormozi_bold"
- Prompt Visual Detalhado: "Composição de impacto tipográfico com palavras amarelas neon saltando na tela, círculos de partículas e vinheta de cinema."
- Headline: "O SEGREDO DA VIRALIZACAO"
- Subtítulo/Contexto: "Como os maiores canais prendem a atenção"
- Badge/Tag: "URGENTE"
- Locução da cena: "Mais de noventa por cento dos vídeos perdem audiência no primeiro segundo."
- Duração exata da cena: 4.5 segundos
- Cor Neon Principal: #facc15
- Cor do Texto: #ffffff

REGRAS OBRIGATÓRIAS (PROIBIDO GERAR SLIDES ESTÁTICOS):
1. NUNCA imprima o texto do "Prompt Visual Detalhado" na tela! O prompt visual é sua instrução de direção de arte para criar os elementos gráficos.
2. O container raiz deve ter id="ai-scene-content-0" e ocupar 100% da área central com perspectiva 3D.
3. Crie sub-elementos com IDs únicos.
4. O script GSAP ("compiledGsapScript") deve usar a variável global masterTl e o offset START_SEC.

Retorne ESTRITAMENTE um objeto JSON válido com as chaves:
{
  "compiledCustomHtml": "<div id='ai-scene-content-0' ...>...</div>",
  "compiledGsapScript": "..."
}`;

async function testPrompt() {
  console.log('Enviando prompt real da cena para Pollinations...');
  const t0 = Date.now();
  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [{ role: 'user', content: systemPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });
    console.log('Tempo decorrido (ms):', Date.now() - t0);
    console.log('Status HTTP:', res.status);
    const data = await res.json();
    console.log('RAW ASSISTANT CONTENT:');
    console.log(data.choices?.[0]?.message?.content);
  } catch (e) {
    console.error('ERRO:', e);
  }
}
testPrompt();
