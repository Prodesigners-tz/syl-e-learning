// Msingi wa mantiki ya quiz: uchaguzi wa maswali bila mpangilio,
// muda wa sekunde 15 kwa kila swali, alama ya kufaulu 75%, na
// kanuni ya kusubiri siku 2 baada ya kufeli mara mbili mfululizo.

export const PASS_MARK = 75
export const QUESTION_TIME_SECONDS = 15
export const QUESTIONS_PER_ATTEMPT = 15
export const COOLDOWN_HOURS = 48
export const CONSECUTIVE_FAILS_BEFORE_COOLDOWN = 2

export function pickRandomQuestions(
  bank,
  count = QUESTIONS_PER_ATTEMPT,
  excludeIds = []
) {
  const fresh = bank.filter((q) => !excludeIds.includes(q.id))
  const pool = fresh.length >= count ? fresh : bank
  const shuffled = [...pool].sort(() => Math.random() - 0.5)

  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function scoreAttempt(questions, answers) {
  let correct = 0

  for (const q of questions) {
    if (answers[q.id] === q.correctIndex) {
      correct += 1
    }
  }

  const total = questions.length
  const percentage =
    total === 0 ? 0 : Math.round((correct / total) * 100)

  return {
    correct,
    total,
    percentage,
    passed: percentage >= PASS_MARK,
  }
}

export function canAttempt(progress) {
  if (!progress) return { allowed: true }

  if (progress.cooldownUntil) {
    const until = progress.cooldownUntil.toDate
      ? progress.cooldownUntil.toDate()
      : new Date(progress.cooldownUntil)

    if (until > new Date()) {
      return {
        allowed: false,
        waitUntil: until,
      }
    }
  }

  return { allowed: true }
}

export function nextProgressState(progress, attemptResult) {
  const now = new Date()
  const failStreak = progress?.failStreak || 0

  if (attemptResult.passed) {
    return {
      status: 'passed',
      bestScore: Math.max(
        progress?.bestScore || 0,
        attemptResult.percentage
      ),
      failStreak: 0,
      cooldownUntil: null,
      lastAttemptAt: now,
    }
  }

  const newFailStreak = failStreak + 1
  const shouldCooldown =
    newFailStreak >= CONSECUTIVE_FAILS_BEFORE_COOLDOWN

  return {
    status: 'failed',
    bestScore: Math.max(
      progress?.bestScore || 0,
      attemptResult.percentage
    ),
    failStreak: shouldCooldown ? 0 : newFailStreak,
    cooldownUntil: shouldCooldown
      ? new Date(
          now.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000
        )
      : null,
    lastAttemptAt: now,
  }
}