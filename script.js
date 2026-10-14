// =========================================================
// LÁ NO MEU QUINTAL — comportamento do site
// Apenas HTML, CSS e JavaScript. Os dados vêm de receitas.js
// (receitas) e dicas.js (dicas).
//
// COMO ESTE ARQUIVO FUNCIONA (resumo):
//   1. Este é o único script usado em TODAS as páginas.
//   2. Quando a página termina de carregar, ele descobre em qual
//      página está (início, receitas, dicas ou uma receita) e
//      monta só a parte que aquela página precisa.
//   3. Ele nunca escreve HTML "solto": os elementos são criados
//      pela função el(), o que evita problemas de segurança.
//
// ORGANIZAÇÃO DO ARQUIVO (de cima para baixo):
//   - Configurações e foco das fotos
//   - Utilidades (el, normalizar, texto, lista, foto reserva)
//   - Preparação dos dados (prepararReceitas, prepararDicas)
//   - Início da página e menu do celular
//   - Cartão de receita
//   - Página de receitas (busca e filtros)
//   - Página de dicas (busca e filtros)
//   - Foto ampliada (lightbox)
//   - Página de uma receita
// =========================================================

// Tudo fica dentro desta função que executa sozinha. Assim, as variáveis
// e funções daqui não "vazam" nem conflitam com outros scripts da página.
(function () {
  // Modo estrito: o navegador avisa de erros comuns (ex.: usar uma variável que não existe).
  "use strict";

  // Foto reserva: aparece quando a receita não tem foto ou quando o arquivo da foto não é encontrado.
  const IMAGEM_PADRAO = "assets/logo.jpeg";

  // Ponto de foco de cada foto (x% y%) para o recorte 4:3 dos cartões e do topo
  // da receita. Fotos em pé ou muito largas são cortadas pelo recorte; aqui
  // dizemos qual parte da foto deve ficar visível. Foto que não está na lista
  // usa o centro. A foto ampliada sempre mostra a imagem inteira.
  //
  // Como ler "50% 30%": o primeiro número é a posição na horizontal
  // (0% = esquerda, 50% = meio, 100% = direita) e o segundo é na vertical
  // (0% = topo, 50% = meio, 100% = base). Quanto MAIOR o segundo número,
  // mais a parte de BAIXO da foto aparece.
  // Para uma foto nova: "nome-do-arquivo-sem-extensao": "50% 40%",
  const FOCO_DAS_FOTOS = {
    "antepasto-de-berinjela": "50% 30%",
    "banoffee-pie": "50% 40%",
    "bolo-de-limao-siciliano-com-mirtilo": "50% 30%",
    "bolo-de-morango-com-chantininho": "50% 35%",
    "bolo-de-nozes-com-glace-de-caramelo": "50% 40%",
    "bolo-napolitano-de-morango": "50% 78%",
    "bolo-veludo-vermelho": "20% 50%",
    "brigadeiro-de-colher": "50% 60%",
    "brioche": "50% 62%",
    "caldo-verde": "30% 50%",
    "cuscuz-paulista": "50% 45%",
    "estrogonofe-de-carne": "50% 65%",
    "mousse-de-limao": "50% 40%",
    "pao-de-lo-de-fecula-de-batata": "50% 45%",
    "pirao-de-peixe": "24% 50%",
    "pudim-sorvete": "50% 70%",
    "rolo-de-carne-com-bacon-e-batatas": "50% 45%",
    "sardinha-escabeche": "50% 45%",
    "sopa-de-cebola": "50% 55%",
    "tarte-tatin": "50% 65%",
    "torta-de-morango": "50% 70%",
    "torta-seca-de-banana": "50% 75%",
  };

  // Aplica o ponto de foco na foto (se ela estiver na lista acima).
  // Pega só o nome do arquivo, sem pasta nem extensão (ex.: "assets/receitas/brioche.jpg" -> "brioche"),
  // procura esse nome na lista e define o "object-position" do CSS, que escolhe a parte da foto que fica visível.
  function aplicarFoco(img, caminho) {
    // Extrai o nome do arquivo: corta na última "/" e tira o ".jpg" / ".png" do final.
    const nome = String(caminho || "").split("/").pop().replace(/\.[a-z0-9]+$/i, "");
    const foco = FOCO_DAS_FOTOS[nome];
    // Só mexe na foto se ela estiver na lista; as outras ficam centralizadas.
    if (foco) img.style.objectPosition = foco;
    return img;
  }

  // ---------- Utilidades ----------
  // Funções pequenas que o resto do arquivo usa o tempo todo.

  // el(tag, atributos, filhos): cria um elemento HTML de forma segura.
  // Não usa innerHTML (que poderia executar código malicioso vindo dos dados).
  // Exemplo: el("a", { href: "x.html", texto: "Oi" }) cria <a href="x.html">Oi</a>.
  function el(tag, atributos, filhos) {
    // Cria o elemento HTML pedido (ex.: "div", "button", "img").
    const no = document.createElement(tag);
    // Para cada atributo informado: "texto" vira o conteúdo escrito do elemento;
    // os demais (class, src, href, aria-label...) viram atributos HTML normais.
    // Valores vazios (undefined, null, false) são ignorados; true vira um atributo sem valor (ex.: hidden).
    Object.entries(atributos || {}).forEach(([chave, valor]) => {
      if (valor === undefined || valor === null || valor === false) return;
      if (chave === "texto") no.textContent = valor;
      else no.setAttribute(chave, valor === true ? "" : valor);
    });
    // Coloca os "filhos" dentro do elemento: podem ser outros elementos ou simples textos.
    // Itens vazios (null) são pulados, o que permite usar "condição ? elemento : null".
    (filhos || []).forEach((filho) => {
      if (filho) no.appendChild(typeof filho === "string" ? document.createTextNode(filho) : filho);
    });
    return no;
  }

  // Deixa o texto em minúsculas e sem acento, para a busca ignorar maiúsculas e acentos:
  // quem digita "feijao" encontra "Feijão".
  function normalizar(texto) {
    return String(texto || "")
      // Separa cada letra do seu acento (ex.: "é" vira "e" + acento solto).
      .normalize("NFD")
      // Apaga os acentos soltos, deixando só as letras.
      .replace(/[\u0300-\u036f]/g, "")
      // Converte tudo para minúsculas.
      .toLowerCase();
  }

  // Devolve o texto sem espaços sobrando.
  // Se o valor não for texto, ou estiver vazio, devolve o "padrao" informado.
  function texto(valor, padrao) {
    return typeof valor === "string" && valor.trim() ? valor.trim() : padrao;
  }

  // Garante uma lista de textos: se o valor não for lista, devolve lista vazia;
  // se for, descarta itens que não são texto ou que estão vazios e tira espaços das pontas.
  function lista(valor) {
    return Array.isArray(valor)
      ? valor.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
      : [];
  }

  // Se a foto não carregar (arquivo ausente ou nome errado), troca pela foto reserva.
  // O "removeEventListener" garante que isso aconteça só uma vez, evitando um loop
  // caso a própria foto reserva também falhe. Também limpa o ponto de foco, pois a logo fica melhor centralizada.
  function comFallbackDeImagem(img) {
    img.addEventListener("error", function aoFalhar() {
      img.removeEventListener("error", aoFalhar);
      img.style.objectPosition = "";
      img.src = IMAGEM_PADRAO;
    });
    return img;
  }

  // Valida e completa cada receita de receitas.js. Receita com problema é ignorada
  // (ou corrigida) sem derrubar o site. Devolve a lista de receitas prontas para uso.
  function prepararReceitas() {
    // A variável "receitas" vem do arquivo receitas.js. Se ela não existir ou não for uma lista, usa lista vazia.
    const origem = typeof receitas !== "undefined" && Array.isArray(receitas) ? receitas : [];
    // Guarda os ids já usados para detectar receitas com id repetido (um Set não aceita repetição).
    const ids = new Set();
    // Aqui vão ficando as receitas já validadas e completas.
    const prontas = [];

    origem.forEach((r, posicao) => {
      if (!r || typeof r !== "object") return;

      // Receita sem título é ignorada (e um aviso aparece no console do navegador, tecla F12).
      const titulo = texto(r.titulo, "");
      if (!titulo) {
        console.warn(`receitas.js: item ${posicao + 1} ignorado (sem título).`);
        return;
      }

      // O id identifica a receita no endereço (receita.html?id=...). Se faltar, é criado a partir do título
      // (ex.: "Bolo de Fubá" -> "bolo-de-fuba"). Se já existir outro igual, ganha um número no final (-2, -3...).
      let id = texto(r.id, "") || normalizar(titulo).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (!id || ids.has(id)) {
        let contador = 2;
        const base = id || "receita";
        while (ids.has(`${base}-${contador}`)) contador++;
        console.warn(`receitas.js: id repetido ou vazio em "${titulo}"; usando "${base}-${contador}".`);
        id = `${base}-${contador}`;
      }
      ids.add(id);

      // Guarda a receita "limpa". Campos que faltaram recebem um valor padrão
      // (categoria "Outras"; tempo, porções e dificuldade "—"; listas vazias).
      prontas.push({
        id,
        titulo,
        categoria: texto(r.categoria, "Outras"),
        resumo: texto(r.resumo, ""),
        imagem: texto(r.imagem, IMAGEM_PADRAO),
        // Fotos extras da receita (além da "imagem" principal). Pode ficar vazio.
        fotos: lista(r.fotos),
        tempo: texto(r.tempo, "—"),
        porcoes: texto(r.porcoes, "—"),
        dificuldade: texto(r.dificuldade, "—"),
        ingredientes: lista(r.ingredientes),
        modoDePreparo: lista(r.modoDePreparo),
        dica: texto(r.dica, ""),
      });
    });

    return prontas;
  }

  // Valida as dicas de dicas.js (precisam de título e texto). Dica quebrada não derruba a página.
  function prepararDicas() {
    const origem = typeof dicas !== "undefined" && Array.isArray(dicas) ? dicas : [];
    // Aqui vão ficando as receitas já validadas e completas.
    const prontas = [];
    origem.forEach((d, posicao) => {
      if (!d || typeof d !== "object") return;
      const titulo = texto(d.titulo, "");
      const corpo = texto(d.texto, "");
      // Dica sem título ou sem texto é ignorada, com aviso no console.
      if (!titulo || !corpo) {
        console.warn(`dicas.js: item ${posicao + 1} ignorado (precisa de titulo e texto).`);
        return;
      }
      // Guarda a receita "limpa". Campos que faltaram recebem um valor padrão
      // (categoria "Outras"; tempo, porções e dificuldade "—"; listas vazias).
      prontas.push({ titulo, texto: corpo, categoria: texto(d.categoria, "Outras") });
    });
    return prontas;
  }

  // ---------- Início ----------
  // O que acontece quando qualquer página do site abre.

  // Ponto de partida: roda quando o HTML da página termina de carregar.
  // Aqui o script decide o que montar, dependendo da página em que está.
  document.addEventListener("DOMContentLoaded", () => {
    // Atualiza o ano do rodapé automaticamente (© 2026, 2027...).
    const anoEl = document.getElementById("ano");
    if (anoEl) anoEl.textContent = new Date().getFullYear();

    // Liga o botão de menu do celular (☰).
    iniciarMenu();

    // Lê, valida e completa as receitas de receitas.js.
    const todas = prepararReceitas();
    // Cada página tem um elemento próprio, então só roda a parte da página onde está:
    // "grade" = lista de receitas, "gradeDicas" = lista de dicas, "receitaTopo" = página de uma receita.
    if (document.getElementById("grade")) iniciarPaginaReceitas(todas);
    if (document.getElementById("gradeDicas")) iniciarPaginaDicas(prepararDicas());
    if (document.getElementById("receitaTopo")) iniciarPaginaReceita(todas);
  });

  // ---------- Menu mobile ----------
  // Botão ☰ que abre e fecha o menu em telas pequenas.

  function iniciarMenu() {
    const botao = document.getElementById("botaoMenu");
    const nav = document.getElementById("navegacao");
    if (!botao || !nav) return;

    // Abre (true) ou fecha (false) o menu: troca a classe CSS "aberto",
    // atualiza os atributos de acessibilidade (para leitores de tela) e troca o ícone (☰ / ✕).
    function definir(aberto) {
      nav.classList.toggle("aberto", aberto);
      botao.setAttribute("aria-expanded", String(aberto));
      botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
      botao.textContent = aberto ? "✕" : "☰";
    }

    // Clicar no botão alterna entre menu aberto e fechado.
    botao.addEventListener("click", () => definir(!nav.classList.contains("aberto")));
    // Clicar em um link do menu fecha o menu.
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) definir(false);
    });
    // Apertar Esc fecha o menu e devolve o foco ao botão.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("aberto")) {
        definir(false);
        botao.focus();
      }
    });
    // Clicar em qualquer lugar fora do menu também fecha o menu.
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("aberto") && !nav.contains(e.target) && !botao.contains(e.target)) definir(false);
    });
    // Se a janela ficar larga (tela de computador), o menu do celular é fechado.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 680) definir(false);
    });
  }

  // Monta o cartão de UMA receita (foto, categoria, título e resumo).
  // O cartão inteiro é um link para receita.html?id=<id da receita>.
  // "loading: lazy" faz a foto só carregar quando está perto de aparecer na tela (página mais leve).
  function criarCartao(receita) {
    const imagem = aplicarFoco(comFallbackDeImagem(
      el("img", { src: receita.imagem, alt: receita.titulo, loading: "lazy", width: "400", height: "300" })
    ), receita.imagem);
    return el("a", { href: `receita.html?id=${encodeURIComponent(receita.id)}`, class: "cartao-receita" }, [
      el("div", { class: "cartao-imagem" }, [imagem]),
      el("div", { class: "cartao-corpo" }, [
        el("span", { class: "cartao-categoria", texto: receita.categoria }),
        el("h3", { texto: receita.titulo }),
        receita.resumo ? el("p", { texto: receita.resumo }) : null,
      ]),
    ]);
  }

  // ---------- Página de receitas ----------
  // Lista com busca por texto e filtro por categoria (receitas.html).

  // Monta a página "Receitas": botões de categoria, campo de busca e a grade de cartões.
  function iniciarPaginaReceitas(todas) {
    // Pega na página os elementos que serão controlados: grade de cartões,
    // área dos botões de categoria, campo de busca, botão de limpar e contador de resultados.
    const grade = document.getElementById("grade");
    const filtrosEl = document.getElementById("filtros");
    const campoBusca = document.getElementById("campoBusca");
    const botaoLimpar = document.getElementById("limparBusca");
    const contagem = document.getElementById("contagem");

    // Botões de filtro: "Todas" + cada categoria que existe nos dados (o Set remove as repetidas).
    const categorias = ["Todas", ...new Set(todas.map((r) => r.categoria))];
    // Lê o endereço da página (ex.: ?categoria=Doces&q=bolo), para que um link já abra filtrado.
    const params = new URLSearchParams(window.location.search);

    // Estado atual dos filtros: categoria escolhida e texto digitado na busca.
    // Se o endereço trouxer uma categoria que não existe, volta para "Todas".
    let categoriaAtiva = categorias.includes(params.get("categoria")) ? params.get("categoria") : "Todas";
    let termoBusca = (params.get("q") || "").trim();
    campoBusca.value = termoBusca;

    // Cria um botão (chip) para cada categoria. Clicar nele muda a categoria ativa e redesenha a lista.
    const chips = categorias.map((categoria) => {
      const chip = el("button", { type: "button", class: "filtro-chip", texto: categoria });
      chip.addEventListener("click", () => {
        categoriaAtiva = categoria;
        atualizarChips();
        renderizar();
      });
      filtrosEl.appendChild(chip);
      return chip;
    });

    // Destaca o botão da categoria ativa (visualmente e para leitores de tela).
    function atualizarChips() {
      chips.forEach((chip) => {
        const ativo = chip.textContent === categoriaAtiva;
        chip.classList.toggle("ativo", ativo);
        chip.setAttribute("aria-pressed", String(ativo));
      });
    }

    // Busca enquanto a pessoa digita, mas espera 120 ms de pausa antes de refazer a lista
    // (assim não redesenha a cada letra). Também mostra/esconde o botão ✕ de limpar.
    let atraso;
    campoBusca.addEventListener("input", () => {
      clearTimeout(atraso);
      atraso = setTimeout(() => {
        termoBusca = campoBusca.value.trim();
        renderizar();
      }, 120);
      botaoLimpar.hidden = !campoBusca.value;
    });
    // Enter não faz nada (a busca já é automática e não precisa enviar nada).
    campoBusca.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.preventDefault();
    });
    // Botão ✕: apaga a busca, esconde o próprio botão, devolve o cursor ao campo e redesenha a lista.
    botaoLimpar.addEventListener("click", () => {
      campoBusca.value = "";
      termoBusca = "";
      botaoLimpar.hidden = true;
      campoBusca.focus();
      renderizar();
    });

    // Atualiza o endereço do navegador com a categoria e a busca atuais, sem recarregar a página.
    // Assim dá para copiar o link e abrir a mesma lista filtrada depois.
    function sincronizarEndereco() {
      // Monta a parte final do endereço só com o que está em uso (categoria diferente de "Todas" e/ou busca).
      const novo = new URLSearchParams();
      if (categoriaAtiva !== "Todas") novo.set("categoria", categoriaAtiva);
      if (termoBusca) novo.set("q", termoBusca);
      const consulta = novo.toString();
      try {
        history.replaceState(null, "", window.location.pathname + (consulta ? "?" + consulta : "") + window.location.hash);
      } catch (erro) {
        /* abrir direto do arquivo (file://) pode bloquear — não é problema, só não atualiza o endereço */
      }
    }

    // Redesenha a lista de acordo com a categoria e a busca atuais:
    // filtra os itens, limpa a grade, cria os cartões e atualiza o contador de resultados.
    function renderizar() {
      // Separa o que foi digitado em palavras (sem acento e em minúsculas). TODAS precisam aparecer no item.
      const termos = normalizar(termoBusca).split(/\s+/).filter(Boolean);

      // Mantém só os itens da categoria escolhida que contêm todas as palavras da busca.
      const filtradas = todas.filter((r) => {
        if (categoriaAtiva !== "Todas" && r.categoria !== categoriaAtiva) return false;
        // Junta os textos onde a busca procura (título, resumo/texto, categoria etc.), sem acento e em minúsculas.
        const alvo = normalizar([r.titulo, r.resumo, r.categoria, r.ingredientes.join(" ")].join(" "));
        return termos.every((t) => alvo.includes(t));
      });

      // Esvazia a grade antes de desenhar de novo.
      grade.textContent = "";

      if (todas.length === 0) {
        grade.appendChild(el("p", { class: "sem-resultados", texto: "Ainda não há receitas publicadas. Volte em breve!" }));
        contagem.textContent = "";
        return;
      }

      if (filtradas.length === 0) {
        grade.appendChild(el("p", { class: "sem-resultados", texto: "Nenhuma receita encontrada. Tente outro termo ou categoria." }));
        contagem.textContent = "Nenhuma receita encontrada.";
      } else {
        // O "fragmento" junta todos os cartões fora da página e os insere de uma vez só (mais rápido).
        const fragmento = document.createDocumentFragment();
        filtradas.forEach((r) => fragmento.appendChild(criarCartao(r)));
        grade.appendChild(fragmento);
        contagem.textContent = filtradas.length === 1 ? "1 receita encontrada" : `${filtradas.length} receitas encontradas`;
      }

      // Depois de desenhar, deixa o endereço do navegador igual ao filtro atual.
      sincronizarEndereco();
    }

    botaoLimpar.hidden = !campoBusca.value;
    atualizarChips();
    renderizar();
  }

  // ---------- Página de dicas ----------
  // Mesma ideia da página de receitas, para as dicas (dicas.html).

  // Monta a página "Dicas". Funciona igual à página de receitas (busca + filtros),
  // mas desenha cartões de dica em vez de cartões de receita.
  function iniciarPaginaDicas(todas) {
    // Pega na página os elementos que serão controlados (mesma ideia da página de receitas).
    const grade = document.getElementById("gradeDicas");
    const filtrosEl = document.getElementById("filtros");
    const campoBusca = document.getElementById("campoBusca");
    const botaoLimpar = document.getElementById("limparBusca");
    const contagem = document.getElementById("contagem");

    // Botões de filtro: "Todas" + cada categoria que existe nos dados (o Set remove as repetidas).
    const categorias = ["Todas", ...new Set(todas.map((d) => d.categoria))];
    // Lê o endereço da página (ex.: ?categoria=Doces&q=bolo), para que um link já abra filtrado.
    const params = new URLSearchParams(window.location.search);

    // Estado atual dos filtros: categoria escolhida e texto digitado na busca.
    // Se o endereço trouxer uma categoria que não existe, volta para "Todas".
    let categoriaAtiva = categorias.includes(params.get("categoria")) ? params.get("categoria") : "Todas";
    let termoBusca = (params.get("q") || "").trim();
    campoBusca.value = termoBusca;

    // Cria um botão (chip) para cada categoria. Clicar nele muda a categoria ativa e redesenha a lista.
    const chips = categorias.map((categoria) => {
      const chip = el("button", { type: "button", class: "filtro-chip", texto: categoria });
      chip.addEventListener("click", () => {
        categoriaAtiva = categoria;
        atualizarChips();
        renderizar();
      });
      filtrosEl.appendChild(chip);
      return chip;
    });

    // Destaca o botão da categoria ativa (visualmente e para leitores de tela).
    function atualizarChips() {
      chips.forEach((chip) => {
        const ativo = chip.textContent === categoriaAtiva;
        chip.classList.toggle("ativo", ativo);
        chip.setAttribute("aria-pressed", String(ativo));
      });
    }

    // Busca enquanto a pessoa digita, mas espera 120 ms de pausa antes de refazer a lista
    // (assim não redesenha a cada letra). Também mostra/esconde o botão ✕ de limpar.
    let atraso;
    campoBusca.addEventListener("input", () => {
      clearTimeout(atraso);
      atraso = setTimeout(() => {
        termoBusca = campoBusca.value.trim();
        renderizar();
      }, 120);
      botaoLimpar.hidden = !campoBusca.value;
    });
    // Enter não faz nada (a busca já é automática e não precisa enviar nada).
    campoBusca.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.preventDefault();
    });
    // Botão ✕: apaga a busca, esconde o próprio botão, devolve o cursor ao campo e redesenha a lista.
    botaoLimpar.addEventListener("click", () => {
      campoBusca.value = "";
      termoBusca = "";
      botaoLimpar.hidden = true;
      campoBusca.focus();
      renderizar();
    });

    // Atualiza o endereço do navegador com a categoria e a busca atuais, sem recarregar a página.
    // Assim dá para copiar o link e abrir a mesma lista filtrada depois.
    function sincronizarEndereco() {
      // Monta a parte final do endereço só com o que está em uso (categoria diferente de "Todas" e/ou busca).
      const novo = new URLSearchParams();
      if (categoriaAtiva !== "Todas") novo.set("categoria", categoriaAtiva);
      if (termoBusca) novo.set("q", termoBusca);
      const consulta = novo.toString();
      try {
        history.replaceState(null, "", window.location.pathname + (consulta ? "?" + consulta : "") + window.location.hash);
      } catch (erro) {
        /* abrir direto do arquivo (file://) pode bloquear — não é problema */
      }
    }

    // Emoji de cada categoria de dica. Categoria nova (não listada aqui) usa 💡.
    const ICONES = { Cozinha: "🍳", Despensa: "🫙", Quintal: "🌱", Economia: "💰" };

    // Monta o cartão de UMA dica (ícone, categoria, título e texto).
    function criarCartaoDica(dica) {
      return el("article", { class: "cartao-dica" }, [
        el("span", { class: "dica-icone", "aria-hidden": "true", texto: ICONES[dica.categoria] || "💡" }),
        el("span", { class: "cartao-categoria", texto: dica.categoria }),
        el("h3", { texto: dica.titulo }),
        el("p", { texto: dica.texto }),
      ]);
    }

    // Redesenha a lista de acordo com a categoria e a busca atuais:
    // filtra os itens, limpa a grade, cria os cartões e atualiza o contador de resultados.
    function renderizar() {
      // Separa o que foi digitado em palavras (sem acento e em minúsculas). TODAS precisam aparecer no item.
      const termos = normalizar(termoBusca).split(/\s+/).filter(Boolean);

      // Mantém só os itens da categoria escolhida que contêm todas as palavras da busca.
      const filtradas = todas.filter((d) => {
        if (categoriaAtiva !== "Todas" && d.categoria !== categoriaAtiva) return false;
        // Junta os textos onde a busca procura (título, resumo/texto, categoria etc.), sem acento e em minúsculas.
        const alvo = normalizar([d.titulo, d.texto, d.categoria].join(" "));
        return termos.every((t) => alvo.includes(t));
      });

      // Esvazia a grade antes de desenhar de novo.
      grade.textContent = "";

      if (todas.length === 0) {
        grade.appendChild(el("p", { class: "sem-resultados", texto: "Ainda não há contos publicados. Volte em breve!" }));
        contagem.textContent = "";
        return;
      }

      if (filtradas.length === 0) {
        grade.appendChild(el("p", { class: "sem-resultados", texto: "Nenhum conto encontrado. Tente outro termo ou categoria." }));
        contagem.textContent = "Nenhum conto encontrado.";
      } else {
        // O "fragmento" junta todos os cartões fora da página e os insere de uma vez só (mais rápido).
        const fragmento = document.createDocumentFragment();
        filtradas.forEach((d) => fragmento.appendChild(criarCartaoDica(d)));
        grade.appendChild(fragmento);
        contagem.textContent = filtradas.length === 1 ? "1 conto encontrado" : `${filtradas.length} contos encontrados`;
      }

      // Depois de desenhar, deixa o endereço do navegador igual ao filtro atual.
      sincronizarEndereco();
    }

    botaoLimpar.hidden = !campoBusca.value;
    atualizarChips();
    renderizar();
  }

  // ---------- Foto ampliada (lightbox) ----------
  // Abre as fotos da receita em tela cheia, numa janela escura.
  // Quando a receita tem mais de uma foto, dá para passar entre elas:
  //   - botões ‹ e › na tela,
  //   - setas ← → do teclado,
  //   - deslizar o dedo para o lado (celular).
  // Fecha com ✕, Esc ou clicando no fundo escuro. A foto aparece inteira, sem zoom.

  // abrirFotoAmpliada(fotos, indiceInicial, titulo, origem, aoMudar)
  //   fotos         : lista com o endereço de cada foto
  //   indiceInicial : posição da foto que abre primeiro (0 = primeira)
  //   titulo        : nome da receita (legenda e texto alternativo)
  //   origem        : elemento da página que abriu a foto (o foco volta para ele ao fechar)
  //   aoMudar       : (opcional) função chamada com a posição da foto sempre que
  //                   a pessoa troca de foto aqui dentro; serve para a foto da
  //                   página acompanhar a que está aberta
  function abrirFotoAmpliada(fotos, indiceInicial, titulo, origem, aoMudar) {
    // Se já existe uma foto ampliada aberta, não abre outra por cima.
    if (document.getElementById("fotoAmpliada") || !fotos.length) return;

    const total = fotos.length;
    // Posição da foto mostrada agora (limitada entre a primeira e a última).
    let atual = Math.min(Math.max(indiceInicial || 0, 0), total - 1);

    // Peças da janela: a foto (sempre inteira, sem recorte), o botão ✕, as setas,
    // o contador "2 / 4" e o "palco", que segura a foto.
    const foto = el("img", { src: fotos[atual], alt: titulo, class: "foto-ampliada-img" });
    const fechar = el("button", { type: "button", class: "foto-ampliada-fechar", "aria-label": "Fechar foto", texto: "✕" });
    const anterior = el("button", { type: "button", class: "foto-ampliada-seta anterior", "aria-label": "Foto anterior", texto: "‹" });
    const proxima = el("button", { type: "button", class: "foto-ampliada-seta proxima", "aria-label": "Próxima foto", texto: "›" });
    const contador = el("p", { class: "foto-ampliada-contador", "aria-live": "polite" });
    const palco = el("div", { class: "foto-ampliada-palco" }, [foto]);

    // A "caixa" é a janela escura que cobre a tela toda. "role=dialog" e "aria-modal"
    // avisam os leitores de tela de que é uma janela sobreposta.
    // Com uma foto só, as setas e o contador nem entram na janela.
    const caixa = el("div", { class: "foto-ampliada", id: "fotoAmpliada", role: "dialog", "aria-modal": "true", "aria-label": titulo }, [
      fechar,
      total > 1 ? anterior : null,
      total > 1 ? proxima : null,
      palco,
      el("p", { class: "foto-ampliada-legenda", texto: titulo }),
      total > 1 ? contador : null,
    ]);

    // Botões que o Tab percorre dentro da janela.
    const botoes = total > 1 ? [fechar, anterior, proxima] : [fechar];

    // Se a foto não carregar, mostra a foto reserva. O teste "endsWith" evita um loop
    // caso a própria foto reserva também falhe.
    foto.addEventListener("error", () => {
      if (!foto.src.endsWith(IMAGEM_PADRAO)) foto.src = IMAGEM_PADRAO;
    });

    // Mostra a foto de posição "i". A conta com "%" faz dar a volta:
    // depois da última vem a primeira, e antes da primeira vem a última.
    function mostrar(i) {
      atual = (i + total) % total;
      foto.src = fotos[atual];
      foto.alt = total > 1 ? `${titulo} — foto ${atual + 1} de ${total}` : titulo;
      contador.textContent = `${atual + 1} / ${total}`;
      // Já pede ao navegador a próxima foto, para a troca ser instantânea.
      if (total > 1) new Image().src = fotos[(atual + 1) % total];
      if (typeof aoMudar === "function") aoMudar(atual);
    }

    // Trava a rolagem da página enquanto a foto está aberta (guarda o valor anterior para devolver depois).
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.appendChild(caixa);
    // Adiciona a classe "aberta" no quadro seguinte para a janela aparecer com um efeito suave (fade).
    requestAnimationFrame(() => caixa.classList.add("aberta"));
    mostrar(atual);
    // Coloca o foco no botão ✕, para quem navega por teclado ou leitor de tela.
    fechar.focus();

    // Fecha a foto: para de ouvir o teclado, devolve a rolagem da página, faz o fade de saída,
    // remove a janela do HTML e devolve o foco ao botão da foto na página.
    function encerrar() {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
      caixa.classList.remove("aberta");
      setTimeout(() => caixa.remove(), 180);
      if (origem && origem.focus) origem.focus();
    }

    // Teclado: Esc fecha; ← e → trocam de foto; Tab fica preso dentro da janela
    // (circula entre os botões) para o foco não sair para a página que está atrás.
    function aoTeclar(evento) {
      if (evento.key === "Escape") encerrar();
      if (total > 1 && evento.key === "ArrowLeft") mostrar(atual - 1);
      if (total > 1 && evento.key === "ArrowRight") mostrar(atual + 1);
      if (evento.key === "Tab") {
        evento.preventDefault();
        const posicao = botoes.indexOf(document.activeElement);
        const proximo = (posicao + (evento.shiftKey ? -1 : 1) + botoes.length) % botoes.length;
        botoes[proximo].focus();
      }
    }

    // Liga os ouvintes: teclado e cliques nos botões.
    document.addEventListener("keydown", aoTeclar);
    fechar.addEventListener("click", encerrar);
    anterior.addEventListener("click", () => mostrar(atual - 1));
    proxima.addEventListener("click", () => mostrar(atual + 1));

    // Clicar no fundo escuro (fora da foto) fecha a janela.
    caixa.addEventListener("click", (evento) => {
      if (evento.target === caixa || evento.target === palco) encerrar();
    });

    // Deslizar o dedo para o lado troca de foto. Conta como "deslizar" um
    // movimento horizontal de mais de 50 px e bem maior que o vertical.
    let toqueX = 0;
    let toqueY = 0;
    palco.addEventListener("touchstart", (evento) => {
      toqueX = evento.changedTouches[0].clientX;
      toqueY = evento.changedTouches[0].clientY;
    }, { passive: true });
    palco.addEventListener("touchend", (evento) => {
      if (total < 2) return;
      const dx = evento.changedTouches[0].clientX - toqueX;
      const dy = evento.changedTouches[0].clientY - toqueY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) mostrar(atual + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  // ---------- Página de receita ----------
  // Uma receita completa (receita.html?id=...).

  // Monta a página de UMA receita (receita.html): foto, título, ingredientes, modo de preparo e links para as vizinhas.
  function iniciarPaginaReceita(todas) {
    // Descobre qual receita abrir pelo "?id=..." do endereço e procura essa receita na lista.
    // "indice" é a posição dela na lista (usado no fim para achar a anterior e a próxima).
    const id = new URLSearchParams(window.location.search).get("id");
    const indice = todas.findIndex((r) => r.id === id);
    const receita = indice > -1 ? todas[indice] : null;

    // Áreas da página que serão preenchidas: topo (foto + resumo), conteúdo (ingredientes + preparo) e navegação.
    const topo = document.getElementById("receitaTopo");
    const conteudo = document.getElementById("receitaConteudo");
    const navegacao = document.getElementById("receitaNavegacao");

    // Apaga a mensagem "Carregando receita...".
    topo.textContent = "";

    // Id que não existe: mostra um aviso amigável com link de volta para as receitas e remove o resto da página.
    if (!receita) {
      document.title = "Receita não encontrada — Lá no meu Quintal";
      topo.appendChild(
        el("div", { class: "receita-info" }, [
          el("h1", { texto: "Receita não encontrada" }),
          el("p", { texto: "Essa receita pode ter mudado de endereço ou ainda não foi publicada." }),
          el("p", {}, [el("a", { href: "receitas.html", texto: "← Voltar para todas as receitas" })]),
        ])
      );
      conteudo.remove();
      navegacao.remove();
      return;
    }

    // Preenche o título da aba do navegador, a descrição da página (para buscadores) e a trilha "Início / Receitas / categoria".
    document.title = `${receita.titulo} — Lá no meu Quintal`;
    const meta = document.getElementById("metaDescricao");
    if (meta && receita.resumo) meta.setAttribute("content", receita.resumo);
    document.getElementById("trilhaCategoria").textContent = receita.categoria;

    // ---- Topo da página: foto, título e botões ----
    const imagem = aplicarFoco(comFallbackDeImagem(el("img", { src: receita.imagem, alt: receita.titulo })), receita.imagem);
    // Botões "Compartilhar" e "Imprimir"; o "aviso" mostra mensagens curtas ao lado deles.
    const botaoCompartilhar = el("button", { type: "button", class: "botao-acao", texto: "Compartilhar" });
    const botaoImprimir = el("button", { type: "button", class: "botao-acao", texto: "Imprimir" });
    const aviso = el("span", { class: "aviso-acao", role: "status", "aria-live": "polite" });

    // Imprimir: abre a janela de impressão do navegador (o CSS esconde menu, rodapé etc. na impressão).
    botaoImprimir.addEventListener("click", () => window.print());
    // Compartilhar: no celular abre o menu de compartilhamento do aparelho; se não existir,
    // copia o link da página; se nem isso for possível, pede para copiar da barra de endereço.
    // "AbortError" significa que a pessoa só cancelou, então não mostra erro.
    botaoCompartilhar.addEventListener("click", async () => {
      const dados = { title: receita.titulo, text: receita.resumo, url: window.location.href };
      try {
        if (navigator.share) {
          await navigator.share(dados);
        } else if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href);
          avisar("Link copiado!");
        } else {
          avisar("Copie o endereço na barra do navegador.");
        }
      } catch (erro) {
        if (erro && erro.name !== "AbortError") avisar("Não foi possível compartilhar.");
      }
    });

    // Mostra uma mensagem por 2,5 segundos e depois a apaga (cada nova mensagem reinicia a contagem).
    let temporizador;
    function avisar(mensagem) {
      aviso.textContent = mensagem;
      clearTimeout(temporizador);
      temporizador = setTimeout(() => (aviso.textContent = ""), 2500);
    }

    // ---- Galeria de fotos ----
    // "fotos" reúne a foto principal ("imagem") e as extras ("fotos" do receitas.js),
    // sem repetir nenhuma. A primeira é sempre a principal (a mesma dos cartões).
    // O Set elimina repetidas; Array.from transforma o resultado de volta em lista.
    const fotos = Array.from(new Set([receita.imagem, ...receita.fotos]));
    let fotoAtual = 0; // posição da foto exibida agora no topo da página

    // Foto clicável: o botão envolve a foto e, ao clicar, abre a foto ampliada.
    // O selo "⤢ Ampliar" é só um aviso visual (o CSS o posiciona no canto).
    // O selo de contador ("1 / 3") só aparece quando há mais de uma foto.
    const contadorFotos = el("span", { class: "receita-imagem-contador", "aria-hidden": "true" });
    const botaoAmpliar = el("button", {
      type: "button",
      class: "receita-imagem-botao",
      "aria-label": `Ampliar foto: ${receita.titulo}`,
      "aria-haspopup": "dialog",
    }, [imagem, contadorFotos, el("span", { class: "receita-imagem-lupa", "aria-hidden": "true", texto: "⤢ Ampliar" })]);

    // Faixa de miniaturas, logo abaixo da foto principal.
    const faixaMiniaturas = el("div", { class: "receita-miniaturas", role: "group", "aria-label": "Fotos da receita" });

    // Troca a foto grande do topo pela de posição "i" e atualiza o contador e a miniatura marcada.
    function mostrarNoTopo(i) {
      fotoAtual = i;
      imagem.style.objectPosition = "";
      imagem.src = fotos[i];
      imagem.alt = fotos.length > 1 ? `${receita.titulo} — foto ${i + 1} de ${fotos.length}` : receita.titulo;
      aplicarFoco(imagem, fotos[i]);
      contadorFotos.textContent = `${i + 1} / ${fotos.length}`;
      contadorFotos.hidden = fotos.length < 2;
      Array.from(faixaMiniaturas.children).forEach((botao, posicao) => {
        botao.setAttribute("aria-current", String(posicao === i));
      });
    }

    // Desenha (ou redesenha) a faixa de miniaturas. Com uma foto só, a faixa fica escondida.
    function desenharMiniaturas() {
      faixaMiniaturas.textContent = "";
      faixaMiniaturas.hidden = fotos.length < 2;
      fotos.forEach((endereco, posicao) => {
        const miniatura = aplicarFoco(el("img", { src: endereco, alt: "", loading: "lazy", width: "96", height: "72" }), endereco);
        // Foto extra que não carrega (nome errado, arquivo faltando) é retirada da galeria,
        // para não aparecer uma miniatura quebrada. A principal (posição 0) nunca sai:
        // se falhar, usa a foto reserva.
        miniatura.addEventListener("error", () => {
          if (posicao === 0) {
            miniatura.src = IMAGEM_PADRAO;
            return;
          }
          // Se a lista já mudou (outra foto quebrada foi retirada antes), este aviso está
          // desatualizado: a faixa foi redesenhada e as miniaturas novas cuidam do caso.
          if (fotos[posicao] !== endereco) return;
          console.warn(`receitas.js: a foto "${endereco}" de "${receita.titulo}" não foi encontrada e foi ignorada.`);
          fotos.splice(posicao, 1);
          if (fotoAtual >= posicao) fotoAtual = fotoAtual === posicao ? 0 : fotoAtual - 1;
          desenharMiniaturas();
          mostrarNoTopo(fotoAtual);
        }, { once: true });

        const botao = el("button", {
          type: "button",
          class: "miniatura",
          "aria-label": `Ver foto ${posicao + 1} de ${fotos.length}`,
        }, [miniatura]);
        botao.addEventListener("click", () => mostrarNoTopo(posicao));
        faixaMiniaturas.appendChild(botao);
      });
    }

    // Clicar na foto grande abre a foto ampliada na posição atual. Se a pessoa trocar de foto
    // lá dentro, a foto grande da página acompanha (função mostrarNoTopo).
    botaoAmpliar.addEventListener("click", () => abrirFotoAmpliada(fotos.slice(), fotoAtual, receita.titulo, botaoAmpliar, mostrarNoTopo));

    desenharMiniaturas();
    mostrarNoTopo(0);

    // Coloca no topo a galeria (foto principal + miniaturas) e, ao lado,
    // categoria, título, resumo, dificuldade e botões.
    topo.appendChild(el("div", { class: "receita-galeria" }, [
      el("div", { class: "receita-imagem" }, [botaoAmpliar]),
      faixaMiniaturas,
    ]));
    topo.appendChild(
      el("div", { class: "receita-info" }, [
        el("span", { class: "receita-categoria", texto: receita.categoria }),
        el("h1", { texto: receita.titulo }),
        receita.resumo ? el("p", { texto: receita.resumo }) : null,
        el("div", { class: "receita-meta" }, [
          blocoMeta(receita.dificuldade, "Dificuldade"),
        ]),
        el("div", { class: "receita-acoes" }, [botaoCompartilhar, botaoImprimir, aviso]),
      ])
    );

    // ---- Conteúdo: ingredientes e modo de preparo ----
    conteudo.textContent = "";

    // Coluna de ingredientes: cada item vira uma caixinha de marcar (checkbox),
    // para a pessoa ir marcando o que já separou. Se não houver ingredientes, mostra um aviso.
    const colunaIngredientes = el("div", {}, [el("h2", { class: "bloco-titulo", texto: "Ingredientes" })]);
    if (receita.ingredientes.length) {
      // Divisão "Massa" e "Recheio": só vale para receitas que têm os DOIS títulos na lista de
      // ingredientes (ex.: "Massa", "Recheio" ou "Massa:", "Recheio:"). Nas demais, a lista segue única.
      const ehTitulo = (item, nome) => new RegExp(`^${nome}\\s*:?$`, "i").test(item);
      const temDivisao =
        receita.ingredientes.some((item) => ehTitulo(item, "massa")) &&
        receita.ingredientes.some((item) => ehTitulo(item, "recheio"));

      // Cada grupo tem um título (ou nenhum) e seus itens.
      const grupos = [{ titulo: "", itens: [] }];
      receita.ingredientes.forEach((item, i) => {
        if (temDivisao && (ehTitulo(item, "massa") || ehTitulo(item, "recheio"))) {
          grupos.push({ titulo: ehTitulo(item, "massa") ? "Massa" : "Recheio", itens: [] });
        } else {
          grupos[grupos.length - 1].itens.push({ item, i });
        }
      });

      grupos.forEach((grupo) => {
        if (!grupo.itens.length) return;
        if (grupo.titulo) colunaIngredientes.appendChild(el("h3", { class: "subtitulo-ingredientes", texto: grupo.titulo }));
        const ul = el("ul", { class: "lista-ingredientes" });
        grupo.itens.forEach(({ item, i }) => {
          const marcador = el("input", { type: "checkbox", id: `ing-${i}` });
          ul.appendChild(el("li", {}, [el("label", { for: `ing-${i}` }, [marcador, el("span", { texto: item })])]));
        });
        colunaIngredientes.appendChild(ul);
      });
      colunaIngredientes.appendChild(el("p", { class: "nota-lista", texto: "Toque nos itens para ir marcando o que já separou." }));
    } else {
      colunaIngredientes.appendChild(el("p", { class: "nota-lista", texto: "Ingredientes não informados." }));
    }

    // Coluna do modo de preparo: lista numerada com os passos e o espaço "Dica".
    const colunaPreparo = el("div", {}, [el("h2", { class: "bloco-titulo", texto: "Modo de preparo" })]);
    if (receita.modoDePreparo.length) {
      const ol = el("ol", { class: "lista-modo" });
      receita.modoDePreparo.forEach((passo) => ol.appendChild(el("li", { texto: passo })));
      colunaPreparo.appendChild(ol);
    } else {
      colunaPreparo.appendChild(el("p", { class: "nota-lista", texto: "Modo de preparo não informado." }));
    }
    // Espaço "Dica": aparece em TODA receita. Se a receita não tiver dica, mostra um aviso.
    const blocoDica = el("section", { class: "bloco-dica", "aria-labelledby": "tituloDica" }, [
      el("h2", { class: "bloco-titulo", id: "tituloDica", texto: "Dica" }),
      receita.dica
        ? el("div", { class: "dica" }, [receita.dica])
        : el("div", { class: "dica dica-vazia" }, ["Ainda não há dica para este prato."]),
    ]);
    colunaPreparo.appendChild(blocoDica);

    // Coloca as duas colunas na página.
    conteudo.appendChild(colunaIngredientes);
    conteudo.appendChild(colunaPreparo);

    // ---- Navegação: receita anterior / próxima ----
    navegacao.textContent = "";
    // Receita anterior e próxima. A conta com "%" (resto da divisão) faz a lista "dar a volta":
    // depois da última vem a primeira, e antes da primeira vem a última.
    const anterior = todas.length > 1 ? todas[(indice - 1 + todas.length) % todas.length] : null;
    const proxima = todas.length > 1 ? todas[(indice + 1) % todas.length] : null;
    if (anterior) navegacao.appendChild(linkReceita(anterior, "← Anterior", "anterior"));
    if (proxima) navegacao.appendChild(linkReceita(proxima, "Próxima →", "proxima"));
  }

  // Monta um pequeno bloco "valor + rótulo" (ex.: "Fácil" / "Dificuldade").
  function blocoMeta(valor, rotulo) {
    return el("div", {}, [el("strong", { texto: valor }), el("span", { texto: rotulo })]);
  }

  // Monta o link para a receita vizinha ("← Anterior" ou "Próxima →") com o nome dela.
  function linkReceita(receita, rotulo, classe) {
    return el("a", { href: `receita.html?id=${encodeURIComponent(receita.id)}`, class: `receita-vizinha ${classe}` }, [
      el("small", { texto: rotulo }),
      el("span", { texto: receita.titulo }),
    ]);
  }
// Fim da função que guarda todo o código deste arquivo.
})();
