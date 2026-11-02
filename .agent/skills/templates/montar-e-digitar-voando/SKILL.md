---
name: template-montar-e-digitar-voando
description: Diretriz Técnica e Design System do Template "Montar e Digitar Voando" (Esqueleto Planar -> Texto 3D Voando Caractere por Caractere -> Finalização de Luz/CTA).
---

# Template: Montar e Digitar Voando (Assemble-Then-Type-Flyin)

## 1. Visão Geral & Semântica
- **Duração Total:** 5.6s (168 frames a 30fps)
- **Energia:** Média-Alta (Início esparso com esqueleto limpo, densidade progressiva com texto 3D, finalização refinada)
- **Cores & Tokens:**
  - Fundo: Grafite escuro profundo (`#0b0e14` / `#080a0f`)
  - Acento 1: Dourado Cinematográfico (`#e4c58a` / `#facc15`)
  - Texto Primário: Branco Neutro (`#ffffff` / `#f8fafc`)
  - Esqueleto/Bordas: Vidro escuro (`rgba(255,255,255,0.08)`) com blur direcional
- **Divisão Semântica em 2 Etapas Obrigatórias:**
  1. **Etapa 1 (Quadros 0 a 50):** O Esqueleto Estrutural sem nenhum texto pousa no canvas através de deslocamentos planares X/Y com overshoot.
  2. **Pausa de Leitura (Quadros 50 a 58):** Linhas de grade desaparecem e o esqueleto estático aguarda a entrada do texto.
  3. **Etapa 2 (Quadros 58 a 128):** O texto surge do espaço 3D (Z negativo profundo), girando nos 3 eixos (X, Y, Z) e aterrissando caractere por caractere.
  4. **Etapa 3 (Quadros 128 a 168):** Acabamento final (ativação do botão CTA de contorno para dourado sólido, wipe de cor da imagem de filme, respiração lenta de 1.5%).

---

## 2. Anatomia Matemática do Motion (GSAP 3)

### A. Fase 1: Esqueleto Planar (Frames 6 → 44)
- **10 Componentes do Esqueleto:**
  1. Barra de Navegação Superior (Frame 6)
  2. Card de Paleta & Blocos de Cores (Frame 10)
  3. Logotipo Espelhado (Frame 15)
  4. Três Rodas de Cores / Scopes (Frame 19)
  5. Linhas Separadoras Horizontais (Frame 23)
  6. Contorno do Botão CTA (Frame 27)
  7. Botão Secundário (Frame 31)
  8. Três Indicadores Numéricos (Frame 35)
  9. Moldura Principal da Imagem / Filme (Frame 39)
  10. Painel Lateral de Informações (Frame 44)
- **Física de Entrada:**
  - Deslocamento Planar: `from: { y: 120 a 420px, rotation: ±7deg, opacity: 0 }`
  - Duração: 16 frames (~0.53s) por componente
  - Curva: `back.out(1.7)` (overshoot)

### B. Fase 2: Texto 3D Voando Caractere por Caractere (Frames 58 → 128)
- **Perspectiva:** `perspective: 900px` em cada caractere.
- **Função Aleatória Determinística:**
  `rand(i) = frac(sin(i * 127.1 + 311.7) * 43758.5453)`
- **Vetor de Dispersão 3D:**
  - `dx`: ±260px
  - `dy`: ±200px
  - `dz`: -200px até -760px (vem de longe no eixo Z)
  - `rotateX`: ±170deg
  - `rotateY`: ±190deg
  - `rotateZ`: ±120deg
- **Fluxo do Texto:**
  - Elementos em `display: inline-block;` normal, apenas alterando `transform3d`.
  - Espaços convertidos estritamente em `\u00a0` (espaço não separável).
  - Ao completar a animação (`a >= 1`), resetar `transform: none` para liberar a GPU.
- **Ordem de Leitura:**
  1. Título Serifado Principal (Frames 58 / 66)
  2. Navegação e Texto do Horizonte (Frames 76 → 95)
  3. Números e Indicadores (Frames 96 → 102)
  4. Rótulos Secundários e Metadados (Frames 104 → 114)

### C. Fase 3: Toque Final de Acabamento (Frames 118 → 168)
- O botão CTA transita de contorno fino para base dourada sólida preenchida (`#e4c58a`) com texto invertido para escuro.
- Transição da imagem em escala de cinza/log para cor quente cinematográfica via wipe vertical dourado.
- Respiração geral de 1.5% de escala contínua até o final do clipe.
