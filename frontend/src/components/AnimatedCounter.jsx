import { useState, useEffect } from 'react'

export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) { setDisplay(0); return }

    const startTime = performance.now()
    const startVal = 0

    function update(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startVal + (value - startVal) * eased

      setDisplay(current)

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        setDisplay(value)
      }
    }

    requestAnimationFrame(update)
  }, [value, duration])

  return (
    <span>
      {prefix}{display.toFixed(2)}{suffix}
    </span>
  )
}
