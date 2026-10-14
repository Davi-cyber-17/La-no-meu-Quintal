/*
  RECEITAS PENDENTES — não aparecem no site.
  Estas pastas do receitas.zip tinham título e foto, mas o receita.txt era de outra receita.
  Quando tiver o texto certo, preencha ingredientes e modoDePreparo e mova o objeto
  para dentro de receitas.js. As fotos já estão em assets/receitas/.
*/
// IMPORTANTE: nenhuma página carrega este arquivo (não há <script> para ele nos
// arquivos .html). Ele é só uma "lista de espera" para você não perder o trabalho.
//
// Cada receita aqui já tem título, categoria e foto, mas FALTA o texto
// (ingredientes e modo de preparo). Para publicar uma receita:
//   1. Preencha "ingredientes", "modoDePreparo" e, se quiser, "dica", "tempo",
//      "porcoes" e "dificuldade".
//   2. Recorte o objeto inteiro { ... } daqui e cole no final da lista
//      "receitas" do arquivo receitas.js (veja o modelo no topo dele).
//
// Os campos são os mesmos de receitas.js:
//   id            -> identificador único, sem espaços/acentos; vira o endereço (receita.html?id=...)
//   titulo        -> nome da receita
//   categoria     -> Doces, Salgados, Massas...; vira um botão de filtro na página Receitas
//   resumo        -> frase curta que aparece no cartão
//   imagem        -> caminho da foto (as fotos já estão em assets/receitas/)
//   tempo         -> ex.: "30 min"
//   porcoes       -> ex.: "6 porções"
//   dificuldade   -> "Fácil", "Média" ou "Difícil"
//   ingredientes  -> lista de textos, um ingrediente por linha
//   modoDePreparo -> lista de textos, um passo por linha (aparece numerado)
//   dica          -> observação opcional ("Dica")
const receitasPendentes = [
  {
    id: "torta-de-limao",
    titulo: "Torta de Limão",
    categoria: "Doces",
    resumo: "Receita de torta de limão.",
    imagem: "assets/receitas/torta-de-limao.jpg",
    tempo: "",
    porcoes: "",
    dificuldade: "",
    ingredientes: [],
    modoDePreparo: [],
    dica: ""
  },
  {
    id: "macarronada",
    titulo: "Macarronada",
    categoria: "Massas",
    resumo: "Receita de macarronada.",
    imagem: "assets/receitas/macarronada.jpg",
    tempo: "",
    porcoes: "",
    dificuldade: "",
    ingredientes: [],
    modoDePreparo: [],
    dica: ""
  },
  {
    id: "torta-classica-de-limao",
    titulo: "Torta Clássica de Limão",
    categoria: "Doces",
    resumo: "Receita de torta clássica de limão.",
    imagem: "assets/receitas/torta-classica-de-limao.jpg",
    tempo: "",
    porcoes: "",
    dificuldade: "",
    ingredientes: [],
    modoDePreparo: [],
    dica: ""
  }
];
