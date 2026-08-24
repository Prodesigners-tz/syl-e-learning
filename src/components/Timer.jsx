import { useEffect, useRef, useState } from 'react'
import { QUESTION_TIME_SECONDS } from '../utils/quizLogic'

/**
 * Muda wa kuhesabu chini kwa kila swali. Inapofika sifuri,
 * `onExpire` inaitwa kiotomatiki (swali linapita hata bila jibu).
 * `resetKey` ibadilishwe kila swali jipya ili timer ianze upya.
 */
export default function Timer({ resetKey, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIME_SECONDS)
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
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, onExpire])

  return (
    <div className={`quiz-timer ${secondsLeft <= 3 ? 'low' : ''}`}>
      {secondsLeft}s
    </div>
  )
}
