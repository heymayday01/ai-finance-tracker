import { useEffect, useRef } from 'react'

export default function ConfettiBurst({ trigger }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!trigger) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const COLORS = ['#00d4ff', '#00ff88', '#ff6b6b', '#ffb432', '#a78bfa', '#ffffff']

    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 8 + 3
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 6 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1,
        decay: Math.random() * 0.015 + 0.008,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      })
    }

    let animId
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false

      for (const p of particles) {
        if (p.life <= 0) continue
        alive = true

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15 // gravity
        p.vx *= 0.99
        p.rotation += p.rotSpeed
        p.life -= p.decay

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      if (alive) {
        animId = requestAnimationFrame(animate)
      }
    }

    animate()
    return () => cancelAnimationFrame(animId)
  }, [trigger])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        pointerEvents: 'none',
      }}
    />
  )
}
