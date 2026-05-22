export function normalizeText(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  )

  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }

  return dp[a.length][b.length]
}

export function fuzzyMatch(text: string | null | undefined, query: string) {
  const normalizedText = normalizeText(text)
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) return true
  if (normalizedText.includes(normalizedQuery)) return true

  const words = normalizedText.split(/\s+/)

  return words.some((word) => {
    if (word.includes(normalizedQuery)) return true
    if (normalizedQuery.length < 4) return false

    return levenshtein(word, normalizedQuery) <= 2
  })
}