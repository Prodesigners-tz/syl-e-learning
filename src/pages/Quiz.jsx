import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { getModuleById, getNextModule } from '../data/modules'
import { QUESTION_BANK_SAMPLE } from '../data/questionBank.sample'
import { canAttempt, nextProgressState, pickRandomQuestions, scoreAttempt } from '../utils/quizLogic'
import Timer from '../components/Timer'

export default function Quiz() {
  const { moduleId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const module = getModuleById(moduleId)

  const [phase, setPhase] = useState('loading') // loading | blocked | running | result
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)
  const [waitUntil, setWaitUntil] = useState(null)

  useEffect(() => {
    async function init() {
      const progressRef = doc(db, 'users', user.uid, 'progress', moduleId)
      const progressSnap = await getDoc(progressRef)
      const progressData = progressSnap.exists() ? progressSnap.data() : null
      setProgress(progressData)

      const attemptCheck = canAttempt(progressData)
      if (!attemptCheck.allowed) {
        setWaitUntil(attemptCheck.waitUntil)
        setPhase('blocked')
        return
      }

      // Pakia benki ya maswali: Firestore kwanza, sampuli za ndani kama fallback.
      let bank = []
      try {
        const qsnap = await getDocs(collection(db, 'questionBank', moduleId, 'questions'))
        bank = qsnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch {
        // ignore, tumia fallback
      }
      if (bank.length === 0) bank = QUESTION_BANK_SAMPLE[moduleId] || []

      const excludeIds = progressData?.lastQuestionIds || []
      const picked = pickRandomQuestions(bank, 10, excludeIds)
      setQuestions(picked)
      setPhase('running')
    }
    init()
  }, [user, moduleId])

  function recordAnswer(optionIndex) {
    setSelected(optionIndex)
  }

  function goNext() {
    const q = questions[currentIndex]
    const finalAnswers = { ...answers, [q.id]: selected }
    setAnswers(finalAnswers)
    setSelected(null)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
    } else {
      finishQuiz(finalAnswers)
    }
  }

  function handleExpire() {
    // Muda ukiisha bila jibu, swali linapita likiwa halijajibiwa.
    goNext()
  }

  async function finishQuiz(finalAnswers) {
    const scored = scoreAttempt(questions, finalAnswers)
    const newProgress = nextProgressState(progress, scored)
    newProgress.lastQuestionIds = questions.map((q) => q.id)

    const progressRef = doc(db, 'users', user.uid, 'progress', moduleId)
    await setDoc(progressRef, newProgress, { merge: true })

    await addDoc(collection(db, 'users', user.uid, 'attempts'), {
      moduleId,
      score: scored.percentage,
      passed: scored.passed,
      correct: scored.correct,
      total: scored.total,
      submittedAt: serverTimestamp(),
    })

    setResult(scored)
    setPhase('result')
  }

  if (!module) return <p>Moduli haipo.</p>

  if (phase === 'loading') return <p>Inaandaa mtihani…</p>

  if (phase === 'blocked') {
    return (
      <div className="quiz-wrap">
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Bado huwezi kufanya mtihani huu</h2>
          <p style={{ color: 'var(--color-muted)' }}>
            Ulifeli mara mbili mfululizo. Tafadhali subiri hadi{' '}
            <strong>{waitUntil?.toLocaleString('sw-TZ')}</strong> kabla ya kujaribu tena —
            hii inakupa muda wa kupitia notes vizuri zaidi.
          </p>
          <Link to={`/module/${moduleId}`} className="btn btn-secondary">Rudi kwenye notes</Link>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const nextModule = result.passed ? getNextModule(moduleId) : null
    return (
      <div className="quiz-wrap">
        <div className="card result-hero">
          <div className={`result-score ${result.passed ? 'pass' : 'fail'}`}>{result.percentage}%</div>
          <h2>{result.passed ? 'Hongera, umefaulu!' : 'Bado hujafikia alama ya kufaulu'}</h2>
          <p style={{ color: 'var(--color-muted)' }}>
            Umejibu sahihi maswali {result.correct} kati ya {result.total}. Kiwango cha kufaulu ni 75%.
          </p>
          {!result.passed && (
            <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem' }}>
              Unaweza kurudia mtihani huu na maswali tofauti. Ukifeli tena mfululizo,
              utahitaji kusubiri siku 2 kabla ya jaribu lingine.
            </p>
          )}
          <div className="module-actions" style={{ justifyContent: 'center' }}>
            <Link to={`/module/${moduleId}`} className="btn btn-secondary">Rudi kwenye notes</Link>
            {!result.passed && (
              <Link to={`/quiz/${moduleId}`} onClick={() => window.location.reload()} className="btn btn-primary">
                Jaribu Tena
              </Link>
            )}
            {result.passed && nextModule && (
              <Link to={`/module/${nextModule.id}`} className="btn btn-primary">
                Endelea: Semina {nextModule.order}
              </Link>
            )}
            {result.passed && !nextModule && (
              <Link to="/certificate" className="btn btn-primary">Pata Cheti Chako</Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // phase === 'running'
  const q = questions[currentIndex]
  return (
    <div className="quiz-wrap">
      <div className="quiz-progress">
        Swali {currentIndex + 1} kati ya {questions.length} — {module.title}
      </div>
      <Timer resetKey={q.id} onExpire={handleExpire} />
      <div className="quiz-card">
        <div className="quiz-question">{q.text}</div>
        <div className="quiz-options">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              className={`quiz-option ${selected === idx ? 'selected' : ''}`}
              onClick={() => recordAnswer(idx)}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={goNext} disabled={selected === null}>
            {currentIndex + 1 < questions.length ? 'Swali Linalofuata' : 'Maliza Mtihani'}
          </button>
        </div>
      </div>
    </div>
  )
}
