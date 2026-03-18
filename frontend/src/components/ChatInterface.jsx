const API = 'http://localhost:8000'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Zap, AlertCircle } from 'lucide-react'
import MessageBubble from './MessageBubble'
import DocumentUpload from './DocumentUpload'

const NEXUS_GREETINGS = [
  "NEXUS online. Feed me your documents, then ask what you seek.",
  "Temporal uplink established. I am receiving from 2157. What knowledge do you need?",
  "I have traversed time to answer your questions. Load your documents and begin.",
]

export default function ChatInterface() {
  const [messages, setMessages]   = useState([
    {
      role: 'system',
      content: 'UPLINK ESTABLISHED — TEMPORAL BRIDGE ACTIVE'
    },
    {
      role: 'assistant',
      content: NEXUS_GREETINGS[Math.floor(Math.random() * NEXUS_GREETINGS.length)],
    }
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [docCount, setDocCount]   = useState(0)
  const [error, setError]         = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const abortRef    = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const query = input.trim()
    setInput('')
    setError('')

    setMessages(prev => [...prev, { role: 'user', content: query }])
    setLoading(true)

    // Add streaming placeholder
    setMessages(prev => [...prev, {
      role: 'assistant', content: '', streaming: true, sources: []
    }])

    try {
      const fd = new FormData()
      fd.append('query', query)
      fd.append('stream', 'true')

      const response = await fetch(`${API}/chat`, { method: 'POST', body: fd })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'NEXUS failed to respond.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let sources = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data:'))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(5).trim())
            if (data.text) {
              fullText += data.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: 'assistant', content: fullText, streaming: true, sources: []
                }
                return updated
              })
            }
            if (data.done) {
              sources = data.sources || []
            }
          } catch { /* partial chunk */ }
        }
      }

      // Finalize message
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant', content: fullText, streaming: false, sources
        }
        return updated
      })

    } catch (e) {
      setError(e.message)
      setMessages(prev => prev.slice(0, -1)) // remove placeholder
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  async function resetAll() {
    try {
      await fetch(`${API}/reset`, { method: 'DELETE' })
      setDocCount(0)
      setMessages([
        { role: 'system', content: 'MEMORY WIPED — NEXUS RESET' },
        { role: 'assistant', content: 'Memory purged. Feed me new knowledge and we begin again.' }
      ])
    } catch { setError('Reset failed.') }
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      background: '#000000',
      fontFamily: 'Rajdhani, sans-serif',
      overflow: 'hidden',
    }}>

      {/* Scanline overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,247,255,0.012) 2px, rgba(0,247,255,0.012) 4px)',
      }} />

      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,247,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,247,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* ── SIDEBAR ─────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '280px', flexShrink: 0,
              borderRight: '1px solid rgba(0,247,255,0.1)',
              background: 'rgba(2,4,8,0.98)',
              display: 'flex', flexDirection: 'column',
              zIndex: 10, position: 'relative',
              padding: '1rem',
              gap: '1rem',
            }}
          >
            {/* Logo area */}
            <div style={{
              borderBottom: '1px solid rgba(0,247,255,0.1)',
              paddingBottom: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '32px', height: '32px',
                    border: '1px solid rgba(0,247,255,0.6)',
                    borderRadius: '50%',
                    borderTopColor: '#00f7ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                />
                <div>
                  <h1 style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '1.1rem', fontWeight: 900,
                    color: '#00f7ff',
                    textShadow: '0 0 15px rgba(0,247,255,0.5)',
                    letterSpacing: '0.2em',
                  }}>NEXUS</h1>
                  <p style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: '0.55rem',
                    color: 'rgba(0,247,255,0.4)',
                    letterSpacing: '0.15em',
                  }}>INTELLIGENCE FROM 2157</p>
                </div>
              </div>
            </div>

            {/* Upload panel */}
            <div style={{ flex: 1 }}>
              <DocumentUpload
                docCount={docCount}
                onDocumentAdded={() => {
                  setDocCount(c => c + 1)
                  setMessages(prev => [...prev, {
                    role: 'system',
                    content: 'NEW KNOWLEDGE SOURCE ABSORBED'
                  }])
                }}
              />
            </div>

            {/* Reset button */}
            <motion.button
              onClick={resetAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                fontFamily: 'Orbitron, monospace',
                fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.2em',
                padding: '0.6rem',
                background: 'rgba(255,51,85,0.05)',
                border: '1px solid rgba(255,51,85,0.2)',
                color: 'rgba(255,51,85,0.7)',
                cursor: 'pointer', borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Trash2 size={10} /> WIPE MEMORY
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CHAT AREA ───────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          height: '52px', flexShrink: 0,
          borderBottom: '1px solid rgba(0,247,255,0.1)',
          background: 'rgba(2,4,8,0.95)',
          display: 'flex', alignItems: 'center',
          padding: '0 1.25rem', gap: '1rem',
        }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'none', border: '1px solid rgba(0,247,255,0.2)',
              color: 'rgba(0,247,255,0.6)', cursor: 'pointer',
              padding: '4px 8px', borderRadius: '2px',
              fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem',
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          <div style={{ flex: 1 }}>
            <span style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '0.7rem', fontWeight: 700,
              color: 'rgba(0,247,255,0.7)',
              letterSpacing: '0.15em',
            }}>
              TEMPORAL UPLINK
            </span>
            <span style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.6rem',
              color: 'rgba(0,247,255,0.3)',
              marginLeft: '1rem',
            }}>
              {docCount} SOURCE(S) · RAG ACTIVE
            </span>
          </div>

          {/* Status dot */}
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: docCount > 0 ? '#00ff88' : '#ffaa00',
              boxShadow: `0 0 6px ${docCount > 0 ? '#00ff88' : '#ffaa00'}`,
            }}
          />
          <span style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.6rem',
            color: docCount > 0 ? '#00ff88' : '#ffaa00',
          }}>
            {docCount > 0 ? 'READY' : 'AWAITING FEED'}
          </span>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex', flexDirection: 'column',
        }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} index={i} />
          ))}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: '#ff3355', fontFamily: 'Share Tech Mono, monospace',
                fontSize: '0.75rem', padding: '0.75rem',
                border: '1px solid rgba(255,51,85,0.2)',
                borderRadius: '4px', marginBottom: '1rem',
                background: 'rgba(255,51,85,0.05)',
              }}
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{
          borderTop: '1px solid rgba(0,247,255,0.1)',
          background: 'rgba(2,4,8,0.98)',
          padding: '1rem 1.25rem',
        }}>
          <div style={{
            display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
            border: '1px solid rgba(0,247,255,0.2)',
            borderRadius: '4px',
            background: 'rgba(0,247,255,0.03)',
            padding: '0.75rem',
            transition: 'border-color 0.2s',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="ASK NEXUS ANYTHING FROM YOUR DOCUMENTS..."
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none', outline: 'none',
                color: '#e8f4f8',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1rem', fontWeight: 400,
                resize: 'none',
                lineHeight: 1.5,
                maxHeight: '120px',
                overflowY: 'auto',
                placeholder: { color: 'rgba(0,247,255,0.2)' },
              }}
            />
            <motion.button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '36px', height: '36px', flexShrink: 0,
                background: loading || !input.trim()
                  ? 'rgba(0,247,255,0.05)'
                  : 'rgba(0,247,255,0.15)',
                border: `1px solid ${loading || !input.trim()
                  ? 'rgba(0,247,255,0.1)'
                  : 'rgba(0,247,255,0.5)'}`,
                borderRadius: '2px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                color: loading || !input.trim()
                  ? 'rgba(0,247,255,0.2)'
                  : '#00f7ff',
              }}
            >
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Zap size={14} />
                  </motion.div>
                : <Send size={14} />
              }
            </motion.button>
          </div>
          <p style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(0,247,255,0.25)',
            marginTop: '0.4rem',
            textAlign: 'center',
            letterSpacing: '0.1em',
          }}>
            ENTER to send · SHIFT+ENTER for newline · Answers grounded in your documents
          </p>
        </div>
      </div>
    </div>
  )
}
