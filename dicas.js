/*
  DICAS — "Lá no meu Quintal"
  ---------------------------------------------------
  Para adicionar uma dica nova, copie o modelo abaixo,
  cole no final da lista (antes do ] final) e preencha.
  Não precisa mexer em mais nada — a aba Dicas lê tudo daqui.

  {
    titulo: "Título curto da dica",
    categoria: "Cozinha" | "Despensa" | "Quintal" | "Economia",
    texto: "A dica em uma ou duas frases."
  }
*/

// COMO ESTE ARQUIVO É USADO
// "dicas" é uma lista (array) de dicas. Ela só guarda DADOS: quem desenha a página
// é o script.js (funções prepararDicas e iniciarPaginaDicas). Este arquivo é
// carregado pelo dicas.html ANTES do script.js, por isso o script.js consegue ler
// a variável "dicas".
//
// Cada dica é um objeto { ... } com 3 campos, separados por vírgula:
//   titulo    -> o título que aparece no cartão (obrigatório)
//   categoria -> agrupa a dica e vira um botão de filtro na página.
//                Ícones: Cozinha 🍳, Despensa 🫙, Quintal 🌱, Economia 💰
//                (outra categoria funciona, mas usa o ícone 💡)
//   texto     -> o conteúdo da dica (obrigatório)
// Dica sem titulo ou sem texto é ignorada pelo site.
//
// ATENÇÃO à pontuação: um objeto termina com "}," e o ÚLTIMO da lista termina
// só com "}" (sem vírgula depois). Esquecer uma vírgula quebra a lista.
const dicas = [
  {
    titulo: "Ovos na hora certa",
    categoria: "Cozinha",
    texto: "Para saber se o ovo está fresco, coloque-o num copo com água: se afundar e ficar deitado, está fresquinho; se ficar em pé ou boiar, é melhor descartar."
  },
  {
    titulo: "Bolo que cresce por igual",
    categoria: "Cozinha",
    texto: "Adicione o fermento por último e misture com uma colher, sem bater. Não abra o forno nos primeiros 25 minutos para o bolo não murchar."
  },
  {
    titulo: "Arroz soltinho",
    categoria: "Cozinha",
    texto: "Refogue o arroz no alho antes de colocar a água quente e, depois de desligar o fogo, deixe a panela tampada por uns 5 minutos."
  },
  {
    titulo: "Cebola sem choro",
    categoria: "Cozinha",
    texto: "Leve a cebola à geladeira por 15 minutos antes de cortar. Usar uma faca bem afiada também ajuda a liberar menos gás."
  },
  {
    titulo: "Ervas frescas por mais tempo",
    categoria: "Despensa",
    texto: "Guarde cheiro-verde lavado e bem seco, embrulhado em papel toalha dentro de um pote fechado na geladeira."
  },
  {
    titulo: "Farinha e fubá sem bichinho",
    categoria: "Despensa",
    texto: "Guarde em potes bem fechados e deixe uma folha de louro dentro. Em dias muito úmidos, prefira manter na geladeira."
  },
  {
    titulo: "Banana madura não se perde",
    categoria: "Despensa",
    texto: "Congele as bananas bem maduras, com casca ou sem ela, e use depois em bolos, vitaminas e pães."
  },
  {
    titulo: "Alho descascado e pronto",
    categoria: "Despensa",
    texto: "Triture o alho com um pouco de sal e guarde num potinho na geladeira, coberto com um fio de óleo. Dura cerca de uma semana."
  },
  {
    titulo: "Temperos no quintal",
    categoria: "Quintal",
    texto: "Salsinha, cebolinha, hortelã e manjericão crescem bem em vasos. Regue de manhã cedo e colha as folhas de fora para a planta rebrotar."
  },
  {
    titulo: "Colha na hora de usar",
    categoria: "Quintal",
    texto: "Ervas colhidas na hora têm muito mais aroma. Corte um pouco acima de uma folha nova para a planta continuar crescendo."
  },
  {
    titulo: "Casca de ovo no jardim",
    categoria: "Quintal",
    texto: "Lave, seque e esmigalhe as cascas de ovo para misturar na terra dos vasos. É um jeito simples de aproveitar o que sobra."
  },
  {
    titulo: "Aproveite talos e cascas",
    categoria: "Economia",
    texto: "Talos de couve, de salsinha e cascas bem lavadas de legumes rendem refogados, farofas e caldos saborosos."
  },
  {
    titulo: "Pão dormido vira receita",
    categoria: "Economia",
    texto: "Pão amanhecido vira torrada, farofa, rabanada ou farinha de rosca. Basta secar no forno e guardar em pote fechado."
  },
  {
    titulo: "Planeje a semana",
    categoria: "Economia",
    texto: "Escolha duas ou três receitas para a semana e faça a lista de compras a partir delas. Sobra menos e o orçamento agradece."
  }
];
