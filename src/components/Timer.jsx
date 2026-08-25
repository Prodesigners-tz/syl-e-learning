import { useEffect, useRef, useState } from 'react'
import { QUESTION_TIME_SECONDS } from '../utils/quizLogic'

export default function Timer({ resetKey, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(
    QUESTION_TIME_SECONDS
  )

  const expiredRef = useRef(false)

  useEffect(() => {
    setSecondsLeft(QUESTION_TIME_SECONDS)
    expiredRef.current = false
  }, [resetKey])

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