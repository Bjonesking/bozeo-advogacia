# Bózeo Advocacia — site institucional

SITE PRONTO - https://bozeo.adv.br/
<img width="1248" height="919" alt="image" src="https://github.com/user-attachments/assets/cd5b7f5e-923c-412e-8399-e54d70ffa896" />


Site institucional completo da **Bózeo Advocacia** (Macaé/RJ), com dados, fotos, logo e cultura reais do escritório. HTML5 + CSS3 + JavaScript vanilla, sem build step e sem frameworks — abre direto no navegador a partir do `index.html`.

Layout, ritmo visual e interações foram inspirados em `https://grupoadvmarc.regiscardoso.com.br/` (referência de estrutura/animação). Marca, fotos, logo, textos e conteúdo são 100% da Bózeo Advocacia.

## No ar

**https://bozeo-advocacia-site.vercel.app** — publicado no Vercel (projeto `bozeo-advocacia-site`, separado do projeto Next.js já existente). Para atualizar depois de qualquer alteração: `npx vercel --prod --yes` dentro desta pasta.

## Como abrir

- **Duplo clique em `index.html`** — o site não depende de servidor (só faz chamadas externas para o Google Fonts).
- Ou, com Python instalado: `python -m http.server 5500` dentro da pasta e acesse `http://localhost:5500`.

## Estrutura de pastas

```
opção 3/
├── index.html                 → página institucional (single-page com âncoras)
├── blog/
│   ├── index.html               → listagem do blog
│   ├── regularizacao-de-imoveis-macae.html
│   ├── usucapiao-como-funciona.html
│   └── aposentadoria-negada-inss.html
├── css/style.css                → design tokens, layout, animações, responsividade
├── js/main.js                   → header sticky, menu mobile, entrada, carrossel,
│                                    modal de biografia, links de WhatsApp, formulário
├── img/                         → fotos reais (webp) + placeholders SVG genéricos
│   └── logo/                    → logo real da Bózeo (cor, branca, símbolo, favicon)
└── tools/                       → scripts Python usados para tratar as fotos da equipe
                                     (remoção de fundo, recorte, otimização) — não fazem
                                     parte do site, só de apoio caso novas fotos cheguem
```

## O que é real neste site

- **Identidade**: nome, tagline ("Advocacia em todas as áreas. Profundidade em direito imobiliário."), descrição, OAB/RJ 244.018.
- **Logo**: arquivos reais extraídos de `Bozeo advogacia/LOGO - BOZEO/` (pasta na área de trabalho), convertidos para `.webp` em `img/logo/`. O header troca automaticamente entre a versão branca (sobre o hero escuro) e a colorida (ao rolar a página).
- **Equipe** (seção "Nossos advogados" + modal "Ler biografia"): Rômulo Bózeo, Ingrid Fonseca, Juliana Miranda e Amanda Figueira — fotos reais com fundo removido (via `rembg`) e recortadas em 3:4, e biografias reais revisadas a partir do arquivo `Quem sou!.txt` fornecido.
- **Cultura** ("Nossos valores" + citação): propósito, história e os 6 valores vêm do `Deck de Cultura da Bózeo Advocacia`.
- **Contato**: endereço, telefone/WhatsApp, e-mail, Instagram e horário reais (confirmados no projeto Next.js original, `bozeo-advocacia/src/lib/site.ts`).
- **Áreas de atuação**: as 8 áreas reais confirmadas pelo escritório (Imobiliário como carro-chefe + Cível, Família, Trabalhista, Previdenciário, Tributário, Empresarial e Saúde).
- **Formulário de contato e todos os botões "Fale conosco"**: abrem o WhatsApp real (`(22) 99261-0154`) já com uma mensagem preenchida — não é só um mock, funciona de verdade.
- **Blog**: 3 artigos reais e originais (não fabricados), escritos com foco em SEO local (Macaé/RJ) para as áreas de maior busca — Imobiliário e Previdenciário. Cada um tem meta description, `canonical`, schema.org `Article` e um aviso de que o conteúdo é informativo (não substitui consulta jurídica).

## O que **não** é real (e por quê)

- **Depoimentos de clientes**: removidos de propósito. O escritório é muito novo (fundado em 2024) e não foram fornecidos depoimentos reais — inventar depoimentos violaria a regra ética do `AGENTE-COPY-SEO.md` desta pasta (nunca fabricar prova social). No lugar, a seção "Nossos diferenciais" usa os 4 diferenciais reais do site original.
- **Estatística de "% de êxito"** do modelo genérico original: removida — publicidade de advocacia no Brasil (OAB) não permite esse tipo de promessa de resultado. Os números mostrados (2024, 8 áreas, 4 especialistas) são todos reais e verificáveis.
- Algumas imagens (balança da justiça, prédio do escritório, estátua da justiça clara, atendimento de mesa) ainda são **placeholders SVG elegantes**, marcados com `<!-- SUBSTITUIR: foto de ... -->` no HTML — troque por fotos reais do escritório quando disponíveis, mantendo a mesma proporção.

## Entrada (sequência de abertura)

Ao abrir o site pela primeira vez numa sessão do navegador, toca uma animação de "carimbo" com o símbolo da Bózeo antes do site aparecer (mesmo conceito do `IntroSequence` do site institucional original em Next.js, recriado aqui em CSS/JS puro). Ela:

- Roda **uma vez por sessão** (usa `sessionStorage`) — recarregar a página não repete.
- É **pulada automaticamente** para quem tem "reduzir movimento" ativado no sistema.
- Tem um botão "Pular" sempre visível.

## Testes realizados

- Console do navegador limpo (0 erros/warnings) em `index.html` e nas 4 páginas do blog.
- Layout revisado em 375px (mobile), 768px (tablet) e 1440px (desktop): hero, header/menu mobile, equipe, serviços, diferenciais, blog, contato e rodapé.
- Sem overflow horizontal real em nenhum breakpoint (confirmado via tentativa de `scrollTo` + leitura de `scrollX`).
- Interações testadas: entrada (com e sem `sessionStorage`), menu mobile, busca, carrossel da equipe (setas + arraste + hover P&B→cor), modal de biografia, validação do formulário, envio real via WhatsApp (abre `wa.me` com os dados preenchidos), navegação para os artigos do blog.
- Performance: página inicial carrega com **~450KB** de conteúdo decodificado no total (fotos reais em WebP, logo em WebP, sem JS/CSS externos além do Google Fonts) — medido via Performance API do navegador.

## Formulário de contato

Diferente do modelo genérico original, este formulário **funciona de verdade**: após validar os campos, ele monta uma mensagem com nome, e-mail, telefone e descrição, e abre o WhatsApp real da Bózeo (`5522992610154`) já preenchido — o visitante só confirma o envio. Ver comentário em `js/main.js` (seção 11) caso queira trocar por e-mail/CRM próprio no futuro.

## Pendências / próximos passos sugeridos

1. Substituir os 4 placeholders SVG restantes por fotos reais do escritório (balança, prédio, estátua clara, atendimento).
2. Confirmar o domínio de produção (`bozeo.adv.br` está assumido no `<link rel="canonical">` e no schema.org — ajustar se for outro).
3. Publicar o site (ex: mesmo fluxo já usado no projeto Next.js — Vercel) e testar em WebKit/Safari real (só foi possível testar em Chromium neste ambiente).
4. Se quiser mais artigos no blog, seguir o padrão de `blog/regularizacao-de-imoveis-macae.html` (mesma estrutura de header/footer/CTA/disclaimer) e adicionar o card em `blog/index.html` + na prévia da home.
