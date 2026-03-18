import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BOOT_SEQUENCE = [
  { text: "INITIALIZING NEXUS CORE...", delay: 0,    duration: 600  },
  { text: "TEMPORAL BRIDGE: ESTABLISHING...", delay: 700,  duration: 800  },
  { text: "YEAR: 2157 → 2025", delay: 1600, duration: 600  },
  { text: "QUANTUM ENCRYPTION: ACTIVE", delay: 2300, duration: 500  },
  { text: "KNOWLEDGE MATRIX: LOADING...", delay: 2900, duration: 700  },
  { text: "NEURAL PATHWAYS: CALIBRATED", delay: 3700, duration: 500  },
  { text: "WARNING: PARADOX RISK — MINIMAL", delay: 4300, duration: 600  },
  { text: "UPLINK ESTABLISHED.", delay: 5000, duration: 800  },
  { text: "NEXUS IS ONLINE.", delay: 5900, duration: 1000, highlight: true },
]

function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      color: Math.random() > 0.7 ? '#7b2fff' : '#00f7ff',
    }))

    let animId
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0, 247, 255, ${0.08 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })
        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0')
        ctx.fill()

        // Move
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
}

function HexGrid() {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1,
      backgroundImage: `radial-gradient(circle at center, transparent 40%, #000000 100%),
        repeating-linear-gradient(0deg, rgba(0,247,255,0.03) 0px, transparent 1px, transparent 39px, rgba(0,247,255,0.03) 40px),
        repeating-linear-gradient(90deg, rgba(0,247,255,0.03) 0px, transparent 1px, transparent 39px, rgba(0,247,255,0.03) 40px)`,
      backgroundSize: '100% 100%, 40px 40px, 40px 40px',
    }} />
  )
}

export default function NexusIntro({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [showLogo, setShowLogo] = useState(false)
  const [showEnter, setShowEnter] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Show logo after short delay
    const logoTimer = setTimeout(() => setShowLogo(true), 200)

    // Queue boot sequence lines
    BOOT_SEQUENCE.forEach(({ text, delay, highlight }) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, { text, highlight }])
      }, delay + 1200)
    })

    // Show enter button
    const enterTimer = setTimeout(() => setShowEnter(true), 7500)

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(enterTimer)
    }
  }, [])

  const handleEnter = () => {
    setExiting(true)
    setTimeout(onComplete, 1200)
  }

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: '#000000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <ParticleField />
          <HexGrid />

          {/* Scanning line effect */}
          <motion.div
            style={{
              position: 'absolute', left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, transparent, #00f7ff, transparent)',
              zIndex: 2, opacity: 0.6,
            }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Main content */}
          <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', width: '100%', maxWidth: '800px', padding: '0 2rem' }}>

            {/* NEXUS Logo */}
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Rotating ring */}
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute', inset: '-24px',
                        border: '1px solid rgba(0,247,255,0.3)',
                        borderRadius: '50%',
                        borderTopColor: '#00f7ff',
                      }}
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute', inset: '-40px',
                        border: '1px solid rgba(123,47,255,0.2)',
                        borderRadius: '50%',
                        borderBottomColor: '#7b2fff',
                      }}
                    />
                    <div style={{
                      width: '80px', height: '80px',
                      border: '2px solid #00f7ff',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,247,255,0.05)',
                      boxShadow: '0 0 30px rgba(0,247,255,0.3), inset 0 0 20px rgba(0,247,255,0.05)',
                    }}>
                      <span style={{
                        fontFamily: 'Orbitron, monospace',
                        fontSize: '1.4rem', fontWeight: 900,
                        color: '#00f7ff',
                        textShadow: '0 0 20px #00f7ff',
                      }}>N</span>
                    </div>
                  </div>

                  <motion.h1
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: 'clamp(3rem, 8vw, 6rem)',
                      fontWeight: 900,
                      letterSpacing: '0.3em',
                      color: '#00f7ff',
                      textShadow: '0 0 20px #00f7ff, 0 0 60px rgba(0,247,255,0.4)',
                      marginBottom: '0.5rem',
                      lineHeight: 1,
                    }}
                    animate={{ opacity: [1, 0.85, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    NEXUS
                  </motion.h1>

                  <p style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: '0.9rem',
                    color: 'rgba(0,247,255,0.5)',
                    letterSpacing: '0.4em',
                    marginBottom: '3rem',
                  }}>
                    INTELLIGENCE FROM 2157
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Boot sequence terminal */}
            <div style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.85rem',
              textAlign: 'left',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(0,247,255,0.15)',
              borderRadius: '4px',
              padding: '1.5rem',
              minHeight: '220px',
              maxWidth: '580px',
              margin: '0 auto',
            }}>
              {visibleLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    marginBottom: '0.4rem',
                    color: line.highlight ? '#00f7ff' : 'rgba(0,247,255,0.6)',
                    fontWeight: line.highlight ? 700 : 400,
                    textShadow: line.highlight ? '0 0 10px #00f7ff' : 'none',
                  }}
                >
                  <span style={{ color: 'rgba(0,247,255,0.3)', marginRight: '0.5rem' }}>›</span>
                  {line.text}
                  {i === visibleLines.length - 1 && (
                    <span style={{ animation: 'blink 1s step-end infinite', marginLeft: '4px' }}>█</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Enter button */}
            <AnimatePresence>
              {showEnter && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ marginTop: '2.5rem' }}
                >
                  <motion.button
                    onClick={handleEnter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      letterSpacing: '0.3em',
                      color: '#000000',
                      background: '#00f7ff',
                      border: 'none',
                      padding: '0.9rem 3rem',
                      cursor: 'pointer',
                      clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
                      boxShadow: '0 0 30px rgba(0,247,255,0.5)',
                      transition: 'box-shadow 0.3s',
                    }}
                  >
                    INITIALIZE UPLINK
                  </motion.button>
                  <p style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: '0.7rem',
                    color: 'rgba(0,247,255,0.3)',
                    marginTop: '1rem',
                    letterSpacing: '0.2em',
                  }}>
                    TEMPORAL PARADOX RISK: 0.003% — ACCEPTABLE
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Corner decorations */}
          {['top:1rem;left:1rem', 'top:1rem;right:1rem', 'bottom:1rem;left:1rem', 'bottom:1rem;right:1rem'].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute',
              ...Object.fromEntries(pos.split(';').map(p => p.split(':'))),
              width: '40px', height: '40px',
              borderTop: i < 2 ? '1px solid rgba(0,247,255,0.4)' : 'none',
              borderBottom: i >= 2 ? '1px solid rgba(0,247,255,0.4)' : 'none',
              borderLeft: i % 2 === 0 ? '1px solid rgba(0,247,255,0.4)' : 'none',
              borderRight: i % 2 === 1 ? '1px solid rgba(0,247,255,0.4)' : 'none',
              zIndex: 3,
            }} />
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
