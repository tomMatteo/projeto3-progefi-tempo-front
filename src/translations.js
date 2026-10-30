// A API devolve os nomes das peças e as observações em inglês.
// Aqui ficam as traduções usadas no card de resultados.

const PIECES = {
  't-shirt': { singular: 'camiseta', plural: 'camisetas' },
  'long-sleeve': { singular: 'manga longa', plural: 'mangas longas' },
  pants: { singular: 'calça', plural: 'calças' },
  shorts: { singular: 'shorts', plural: 'shorts' },
  coat: { singular: 'agasalho', plural: 'agasalhos' },
  'heavy-coat': { singular: 'casaco pesado', plural: 'casacos pesados' },
  'second-skin': { singular: 'segunda pele', plural: 'segundas peles' },
  gloves: { singular: 'luvas', plural: 'luvas' },
}

export function translatePiece(piece, count = 1) {
  const names = PIECES[piece]
  if (!names) return piece
  return count === 1 ? names.singular : names.plural
}

// Cada regra reconhece uma frase da API (views.py do back) e monta a versão em português
const NOTE_RULES = [
  [
    /^Wanted (.+), used (.+) \(no .+ left\)$/,
    ([, ideal, fallback]) =>
      `Sem ${translatePiece(ideal, 2)} disponíveis: usamos ${translatePiece(fallback)} no lugar.`,
  ],
  [
    /^No (.+) or (.+) left$/,
    ([, ideal, fallback]) =>
      `Acabaram ${translatePiece(ideal, 2)} e ${translatePiece(fallback, 2)} para este dia.`,
  ],
  [/^Cold day but no second skin left$/, () => 'Dia frio, mas não sobrou segunda pele.'],
  [/^Very cold day but no gloves left$/, () => 'Dia muito frio, mas não sobraram luvas.'],
  [
    /^No forecast available: assumed an average day$/,
    () => 'Sem previsão para este dia: consideramos uma temperatura média.',
  ],
  [
    /^High chance of rain \((\d+)%\)/,
    ([, chance]) => `Alta chance de chuva (${chance}%): prepare-se.`,
  ],
]

export function translateNote(note) {
  for (const [pattern, translate] of NOTE_RULES) {
    const match = note.match(pattern)
    if (match) return translate(match)
  }
  return note
}
