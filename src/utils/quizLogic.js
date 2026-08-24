// Msingi wa mantiki ya quiz: uchaguzi wa maswali bila mpangilio,
// muda wa sekunde 10 kwa kila swali, alama ya kufaulu 75%, na
// kanuni ya kusubiri siku 2 baada ya kufeli mara mbili mfululizo.

export const PASS_MARK = 75
export const QUESTION_TIME_SECONDS = 10
export const QUESTIONS_PER_ATTEMPT = 10
export const COOLDOWN_HOURS = 48 // siku 2
export const CONSECUTIVE_FAILS_BEFORE_COOLDOWN = 2

/**
 * Chagua maswali kwa bahati nasibu kutoka kwenye benki ya moduli.
 * `excludeIds` huzuia maswali yaliyotumika kwenye jaribio la
 * karibuni zaidi ya mtu huyo yasijirudie mara moja.
 */
export function pickRandomQuestions(bank, count = QUESTIONS_PER_ATTEMPT, excludeIds = []) {
  const fresh = bank.filter((q) => !excludeIds.includes(q.id))
  const pool = fresh.length >= count ? fresh : bank // rudisha kwenye bank nzima ikiwa hazitoshi
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Kokotoa alama ya jaribio.
 * `answers` ni { [questionId]: chosenOptionIndex | null }
 */
export function scoreAttempt(questions, answers) {
  let correct = 0
  for (const q of questions) {
    if (answers[q.id] === q.correctIndex) correct += 1
  }
  const total = questions.length
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100)
  return { correct, total, percentage, passed: percentage >= PASS_MARK }
}

/**
 * Amua kama mtumiaji anaruhusiwa kuanza/kurudia jaribio sasa hivi,
 * kulingana na `progress` doc ya moduli hiyo:
 * { failStreak, lastAttemptAt, cooldownUntil }
 */
export function canAttempt(progress) {
  if (!progress) return { allowed: true }
  if (progress.cooldownUntil) {
    const until = progress.cooldownUntil.toDate ? progress.cooldownUntil.toDate() : new Date(progress.cooldownUntil)
    if (until > new Date()) {
      return { allowed: false, waitUntil: until }
    }
  }
  return { allowed: true }
}

/**
 * Kokotoa hali mpya ya progress baada ya jaribio kukamilika.
 * Rudisha object ya kuandika (merge) kwenye users/{uid}/progress/{moduleId}.
 */
export function nextProgressState(progress, attemptResult) {
  const now = new Date()
  const failStreak = progress?.failStreak || 0

  if (attemptResult.passed) {
    return {
      status: 'passed',
      bestScore: Math.max(progress?.bestScore || 0, attemptResult.percentage),
      failStreak: 0,
      cooldownUntil: null,
      lastAttemptAt: now,
    }
  }

  const newFailStreak = failStreak + 1
  const shouldCooldown = newFailStreak >= CONSECUTIVE_FAILS_BEFORE_COOLDOWN

  return {
    status: 'failed',
    bestScore: Math.max(progress?.bestScore || 0, attemptResult.percentage),
    failStreak: shouldCooldown ? 0 : newFailStreak, // reset baada ya cooldown kuwekwa
    cooldownUntil: shouldCooldown
      ? new Date(now.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000)
      : null,
    lastAttemptAt: now,
  }
}
