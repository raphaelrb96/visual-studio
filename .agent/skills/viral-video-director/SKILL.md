---
name: viral-video-director
description: Diretrizes obrigatórias de Direção de Arte, Copywriting de Retenção (estilo Alex Hormozi / Vox / MagnatesMedia) e Sound Design para geração automática de vídeos curtos no Visual Studio SaaS.
---

# 🎬 Skill: Diretor de Vídeos Virais & Retenção Extrema

Esta skill define as regras que todos os agentes e componentes visuais do **Visual Studio** devem seguir para produzir vídeos profissionais que parecem editados por um humano sênior.

## 1. Estrutura Obrigatória de Copywriting (Fórmula H-V-C)
1. **Cena 1 — O Gancho Implacável (Hook: 0s a 3.5s)**:
   - Nunca comece com "Olá", "Bem-vindo" ou introduções lentas.
   - Use quebra de padrão, pergunta provocativa, número chocante ou afirmação contraintuitiva.
   - Exemplo: *"92% das empresas perdem clientes todos os dias por causa deste único erro invisível."*
2. **Cenas 2 a 5 — Retenção Visual & Prova (Body: 3.5s a 24s)**:
   - Cada cena dura entre **3.0s e 4.5s** (mudança constante de estímulo visual).
   - Alterne os tipos de componentes visuais: nunca repita `CardFrase` duas vezes seguidas sem mudar o B-Roll e o layout.
   - Sempre associe um **B-Roll cinematográfico real** (vídeo MP4 ou imagem HD em movimento Ken Burns) que ilustre a emoção da frase.
3. **Última Cena — Chamada para Ação Direta (CTA: últimos 3.5s)**:
   - Uma ordem clara, curta e com benefício imediato.

## 2. Regras Visuais e Cinéticas
- **Zero Fundo Vazio**: Toda cena DEVE ter um vídeo B-Roll de fundo (`brollVideoUrl`) ou imagem de alta resolução com movimento lento de câmera (*Ken Burns zoom/pan*) + camada de contraste (`backdrop-blur` + gradiente escuro).
- **Legendas Dinâmicas (Word-by-Word Pop)**:
  - As legendas devem destacar a palavra exata que está sendo falada no momento com escala (`scale(1.15)`), cor vibrante (`#facc15`, `#06b6d4` ou `#6366f1`) e `text-shadow` neon.
- **Sound Design (SFX)**:
  - Toda transição de cena dispara um efeito sonoro sutil (`whoosh` ou `pop`) e uma trilha sonora de fundo em volume baixo (12% a 18%) para dar ritmo profissional.
