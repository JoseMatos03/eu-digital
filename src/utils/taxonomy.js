// src/utils/taxonomy.js
const hierarchy = {
  Pessoal: {
    Fotografia: [],
    Pensamento: [],
    Crónica: [],
  },
  Atividades: {
    Evento: {
      "Jantar de Aniversário": [],
      "Participação em Evento": [],
    },
    Desporto: {
      "Passeio de Bicicleta": [],
      "Treino de Natação": [],
      Corrida: [],
      "Registo Desportivo": [],
    },
    Viagem: [],
  },
  Académico: {
    "Resultado Académico": [],
    "Comentário Web": [],
  },
};

function getFlatTags(node = hierarchy, prefix = "") {
  return Object.entries(node).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}/${key}` : key;
    if (child && typeof child === "object" && Object.keys(child).length) {
      return [path, ...getFlatTags(child, path)];
    } else {
      return [path];
    }
  });
}

module.exports = { hierarchy, getFlatTags };
