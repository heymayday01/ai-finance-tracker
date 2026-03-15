import { useState, useEffect, useRef } from 'react'

export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const prevValueRef = useRef(0)

  useEffect(() => {
    if (value === prevValueRef.current) return

    const startVal = prevValueRef.current
    const startTime = performance.now()
    let frameId

    function update(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startVal + (value - startVal) * eased

      setDisplay(current)

      if (progress < 1) {
        frameId = requestAnimationFrame(update)
      } else {
        setDisplay(value)
        prevValueRef.current = value
      }
    }

    frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [value, duration])

  return (
    <span>
      {prefix}{display.toFixed(2)}{suffix}
    </span>
  )
}
