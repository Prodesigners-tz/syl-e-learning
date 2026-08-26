import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  addDoc,
} from 'firebase/firestore'

import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { getModuleById, getNextModule } from '../data/modules'
import { QUESTION_BANK_SAMPLE } from '../data/questionBank.sample'

import {
  canAttempt,
  nextProgressState,
  pickRandomQuestions,
  scoreAttempt,
  QUESTIONS_PER_ATTEMPT,
} from '../utils/quizLogic'

import Timer from '../components/Timer'

export default function Quiz() {
  const { moduleId } = useParams()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const module = getModuleById(moduleId)

  const [phase, setPhase] = useState('loading')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)
  const [waitUntil, setWaitUntil] = useState(null)

  useEffect(() => {
    async function init() {
      if (!user) return

      const progressRef = doc(
        db,
        'users',
        user.uid,
        'progress',
        moduleId
      )

      const progressSnap = await getDoc(progressRef)
      const progressData = progressSnap.exists()
        ? progressSnap.data()
        : null

      let refreshData = null

      try {
        const savedRefresh = localStorage.getItem(
          "quiz-refresh-pending"
        )

        if (savedRefresh) {
          refreshData = JSON.parse(savedRefresh)
          localStorage.removeItem("quiz-refresh-pending")
        }
      } catch {
        refreshData = null
      }

      const isRefresh =
        refreshData?.moduleId === moduleId &&
        refreshData?.questionId

      setProgress(progressData)

      const wasInterrupted =
        progressData?.quizInterrupted === true || isRefresh

      const interruptedIndex = isRefresh
        ? refreshData.currentIndex
        : progressData?.interruptedQuestionIndex ?? null

      const interruptedQuestionId = isRefresh
        ? refreshData.questionId
        : progressData?.interruptedQuestionId ?? null

      if (isRefresh && refreshData?.answers) {
        setAnswers(refreshData.answers)
      }

      const attemptCheck = canAttempt(progressData)

      if (!attemptCheck.allowed) {
        setWaitUntil(attemptCheck.waitUntil)
        setPhase('blocked')
        return
      }

      let bank = []

      try {
        const qsnap = await getDocs(
          collection(
            db,
            'questionBank',
            moduleId,
            'questions'
          )
        )

        bank = qsnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      } catch {
        // Tumia question bank ya ndani kama fallback.
      }

      if (bank.length === 0) {
        bank = QUESTION_BANK_SAMPLE[moduleId] || []
      }

      const excludeIds = progressData?.lastQuestionIds || []

      if (wasInterrupted && interruptedQuestionId) {
        excludeIds.push(interruptedQuestionId)
      }

      let picked

      if (
        wasInterrupted &&
        Array.isArray(progressData?.quizQuestionIds) &&
        progressData.quizQuestionIds.length > 0
      ) {
        const savedQuestions = progressData.quizQuestionIds
          .map((id) => bank.find((q) => q.id === id))
          .filter(Boolean)

        picked = savedQuestions
      } else {
        picked = pickRandomQuestions(
          bank,
          QUESTIONS_PER_ATTEMPT,
          excludeIds
        )
      }

      setQuestions(picked)

      if (wasInterrupted && interruptedIndex !== null) {
        setCurrentIndex(
          Math.min(
            interruptedIndex + 1,
            Math.max(picked.length - 1, 0)
          )
        )
      }

      if (isRefresh) {
        await setDoc(
          progressRef,
          {
            quizInterrupted: true,
            interruptedQuestionIndex: interruptedIndex,
            interruptedQuestionId: interruptedQuestionId,
            quizQuestionIds:
              refreshData?.quizQuestionIds ||
              progressData?.quizQuestionIds ||
              [],
            penalty: true,
            interruptedAnswer: null,
            lastAttemptAt: serverTimestamp(),
          },
          { merge: true }
        )
      } else if (wasInterrupted) {
        await setDoc(
          progressRef,
          {
            quizInterrupted: false,
            interruptedQuestionIndex: null,
            interruptedQuestionId: null,
          },
          { merge: true }
        )
      }

      setPhase('running')
    }

    init()
  }, [user, moduleId])

  function recordAnswer(optionIndex) {
    setSelected(optionIndex)
  }

  // Quiz exit penalty finalized
  async function handleQuizExit() {
    const q = questions[currentIndex]

    if (!q) {
      await logout()
      navigate("/login")
      return
    }

    const progressRef = doc(
      db,
      "users",
      user.uid,
      "progress",
      moduleId
    )

    await setDoc(
      progressRef,
      {
        quizInterrupted: true,
        interruptedQuestionIndex: currentIndex,
        interruptedQuestionId: q.id,
        quizQuestionIds: questions.map((question) => question.id),
        penalty: true,
        interruptedAnswer: null,
        lastAttemptAt: serverTimestamp(),
      },
      { merge: true }
    )

    await logout()
    navigate("/login")
  }

  useEffect(() => {
    function handleBrowserBack() {
      window.history.pushState(null, '', window.location.href)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handleBrowserBack)

    return () => {
      window.removeEventListener('popstate', handleBrowserBack)
    }
  }, [])

  useEffect(() => {
    function onQuizExit() {
      handleQuizExit()
    }

    window.addEventListener('quiz-exit', onQuizExit)

    return () => {
      window.removeEventListener('quiz-exit', onQuizExit)
    }
  }, [questions, currentIndex])

  useEffect(() => {
    if (phase !== "running" || !questions[currentIndex]) return

    localStorage.setItem(
      "quiz-interruption",
      JSON.stringify({
        moduleId,
        currentIndex,
        questionId: questions[currentIndex].id,
        quizQuestionIds: questions.map((q) => q.id),
      })
    )
  }, [phase, moduleId, currentIndex, questions])

  // Quiz refresh resume finalized
  useEffect(() => {
    if (phase !== "running") return

    function markQuizRefresh() {
      localStorage.setItem(
        "quiz-refresh-pending",
        JSON.stringify({
          moduleId,
          currentIndex,
          questionId: questions[currentIndex]?.id,
          quizQuestionIds: questions.map((q) => q.id),
          answers,
        })
      )
    }

    window.addEventListener("beforeunload", markQuizRefresh)

    return () => {
      window.removeEventListener("beforeunload", markQuizRefresh)
    }
  }, [phase, moduleId, currentIndex, questions])

  function goNext() {
    const q = questions[currentIndex]

    const finalAnswers = {
      ...answers,
      [q.id]: selected,
    }

    setAnswers(finalAnswers)
    setSelected(null)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
    } else {
      finishQuiz(finalAnswers)
    }
  }

  function handleExpire() {
    // Muda ukiisha bila jibu:
    // swali linahesabiwa kama halijajibiwa na quiz inaendelea.
    goNext()
  }

  async function finishQuiz(finalAnswers) {
    const scored = scoreAttempt(
      questions,
      finalAnswers
    )

    const newProgress = nextProgressState(
      progress,
      scored
    )

    newProgress.lastQuestionIds =
      questions.map((q) => q.id)

    const progressRef = doc(
      db,
      'users',
      user.uid,
      'progress',
      moduleId
    )

    await setDoc(
      progressRef,
      newProgress,
      { merge: true }
    )

    await addDoc(
      collection(
        db,
        'users',
        user.uid,
        'attempts'
      ),
      {
        moduleId,
        score: scored.percentage,
        passed: scored.passed,
        correct: scored.correct,
        total: scored.total,
        submittedAt: serverTimestamp(),
      }
    )

    setResult(scored)
    setPhase('result')
  }

  if (!module) {
    return <p>Moduli haipo.</p>
  }

  if (phase === 'loading') {
    return <p>Inaandaa mtihani…</p>
  }

  if (phase === 'blocked') {
    return (
      <div className="quiz-wrap">
        <div
          className="card"
          style={{ textAlign: 'center' }}
        >
          <h2>Bado huwezi kufanya mtihani huu</h2>

          <p style={{ color: 'var(--color-muted)' }}>
            Umefeli mtihani huu.
            Tafadhali subiri hadi{' '}
            <strong>
              {waitUntil?.toLocaleString('sw-TZ')}
            </strong>{' '}
            kabla ya kujaribu tena.
          </p>

          <Link
            to={`/module/${moduleId}`}
            className="btn btn-secondary"
          >
            Rudi kwenye notes
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    const nextModule = result.passed
      ? getNextModule(moduleId)
      : null

    return (
      <div className={`quiz-result-screen ${result.passed ? 'quiz-result-pass' : 'quiz-result-fail'}`}>
        {result.passed && (
          <div className="celebration-field" aria-hidden="true">
            {['🌸','🌺','🌷','💮','🌼','🌸','🌹','🌺','🌷','🌼','✨','🎉','🌸','🌺','✨','🌷','🌼','🎊','🌸','🌺','✨','🌷','🌹','🌼','🎉','🌸','🌺','🌷','✨','🌼'].map((item,index)=>(
              <span key={index} className="celebration-particle" style={{'--particle-index':index}}>{item}</span>
            ))}
          </div>
        )}

        <div className="quiz-result-content">
          <div className={`result-score ${result.passed ? 'pass' : 'fail'}`}>
            {result.percentage}%
          </div>

          {result.passed ? (
            <>
              <p className="result-eyebrow">MATOKEO YA MTIHANI</p>
              <h2 className="result-title">Hongera!</h2>
              <p className="result-message">Umefaulu mtihani huu</p>

              <div className="success-burst-button">
                <span>UMEFAULU</span>
              </div>

              <p className="result-detail">
                Umejibu sahihi maswali {result.correct} kati ya {result.total}.
                <br />
                Kiwango cha kufaulu ni 75%.
              </p>

              <div className="result-next-actions">
                {nextModule && (
                  <Link to={`/module/${nextModule.id}`} className="btn btn-primary">
                    Endelea: Semina {nextModule.order}
                  </Link>
                )}

                {!nextModule && (
                  <Link to="/certificate" className="btn btn-primary">
                    Pata Cheti Chako
                  </Link>
                )}

                <Link to={`/module/${moduleId}`} className="btn btn-secondary">
                  Rudi kwenye notes
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="result-eyebrow">MATOKEO YA MTIHANI</p>

              <div className="failure-button">POLE</div>

              <p className="result-detail">
                Umejibu sahihi maswali {result.correct} kati ya {result.total}.
                <br />
                Kiwango cha kufaulu ni 75%.
              </p>

              <div className="retry-message">
                <span>Rudia kozi hii</span>
                <strong>baada ya siku mbili.</strong>
              </div>

              <Link to={`/module/${moduleId}`} className="btn btn-secondary">
                Rudi kwenye notes
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  const q = questions[currentIndex]

  return (
    <div className="quiz-wrap">
      <div className="quiz-progress">
        Swali {currentIndex + 1} kati ya{' '}
        {questions.length} — {module.title}
      </div>

      <Timer
        resetKey={q.id}
        question={q}
        onExpire={handleExpire}
      />

      <div className="quiz-card">
        <div className="quiz-question">
          {q.text}
        </div>

        <div className="quiz-options">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              className={`quiz-option ${
                selected === idx
                  ? 'selected'
                  : ''
              }`}
              onClick={() => recordAnswer(idx)}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="module-actions">
          <button
            className="btn btn-primary"
            onClick={goNext}
            disabled={selected === null}
          >
            {currentIndex + 1 < questions.length
              ? 'Swali Linalofuata'
              : 'Maliza Mtihani'}
          </button>
        </div>
      </div>
    </div>
  )
}