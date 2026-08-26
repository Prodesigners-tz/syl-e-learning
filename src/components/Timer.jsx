import { useEffect, useRef, useState } from 'react'
import {
  QUESTION_TIME_SECONDS,
  LONG_QUESTION_TIME_SECONDS,
  LONG_QUESTION_THRESHOLD,
} from '../utils/quizLogic'

// Quiz timer finalized
export default function Timer({ resetKey, question, onExpire }) {
  const questionTime =
    question?.text?.length >= LONG_QUESTION_THRESHOLD
      ? LONG_QUESTION_TIME_SECONDS
      : QUESTION_TIME_SECONDS

  const [secondsLeft, setSecondsLeft] = useState(
    questionTime
  )

  const expiredRef = useRef(false)

  useEffect(() => {
    setSecondsLeft(questionTime)
    expiredRef.current = false
  }, [resetKey, questionTime])

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true
        onExpire()
      }

      return
    }

    const timer = setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft, onExpire])

  return (
    <div
      className={`quiz-timer ${
        secondsLeft <= 3 ? 'low' : ''
      }`}
    >
      {secondsLeft}s
    </div>
  )
}