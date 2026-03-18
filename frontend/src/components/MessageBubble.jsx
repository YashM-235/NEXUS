import { motion } from 'framer-motion'
import { User, Cpu } from 'lucide-react'

function SourceTag({ source }) {
  const short = source.length > 30 ? '...' + source.slice(-27) : source
  return (
    <span style={{
      fontFamily: 'Share Tech Mono, monospace',
      fontSize: '0.6rem',
      color: 'rgba(0,247,255,0.4)',
      border: '1px solid rgba(0,247,255,0.15)',
      padding: '1px 6px',
      borderRadius: '2px',
      marginRight: '4px',
    }}>
      {short}
    </span>
  )
}

export default function MessageBubble({ message, index }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: 'center', margin: '1rem 0' }}
      >
        <span style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(0,247,255,0.3)',
          letterSpacing: '0.2em',
        }}>
          ── {message.content} ──
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '0.75rem',
        alignItems: 'flex-start',
        marginBottom: '1.25rem',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '32px', height: '32px', flexShrink: 0,
        border: `1px solid ${isUser ? 'rgba(123,47,255,0.5)' : 'rgba(0,247,255,0.5)'}`,
        borderRadius: '4px',
        background: isUser ? 'rgba(123,47,255,0.1)' : 'rgba(0,247,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isUser
          ? '0 0 10px rgba(123,47,255,0.2)'
          : '0 0 10px rgba(0,247,255,0.2)',
      }}>
        {isUser
          ? <User size={14} color="rgba(123,47,255,0.9)" />
          : <Cpu size={14} color="rgba(0,247,255,0.9)" />
        }
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '75%', minWidth: '80px' }}>
        {/* Label */}
        <div style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          color: isUser ? 'rgba(123,47,255,0.7)' : 'rgba(0,247,255,0.7)',
          marginBottom: '0.35rem',
          textAlign: isUser ? 'right' : 'left',
        }}>
          {isUser ? 'YOU // PRESENT' : 'NEXUS // 2157'}
        </div>

        {/* Content */}
        <div style={{
          background: isUser
            ? 'rgba(123,47,255,0.08)'
            : 'rgba(0,247,255,0.05)',
          border: `1px solid ${isUser ? 'rgba(123,47,255,0.2)' : 'rgba(0,247,255,0.15)'}`,
          borderRadius: isUser ? '8px 2px 8px 8px' : '2px 8px 8px 8px',
          padding: '0.75rem 1rem',
          position: 'relative',
        }}>
          {/* Corner accent */}
          <div style={{
            position: 'absolute',
            top: 0, [isUser ? 'right' : 'left']: 0,
            width: '16px', height: '16px',
            borderTop: `1px solid ${isUser ? 'rgba(123,47,255,0.4)' : 'rgba(0,247,255,0.4)'}`,
            [isUser ? 'borderRight' : 'borderLeft']: `1px solid ${isUser ? 'rgba(123,47,255,0.4)' : 'rgba(0,247,255,0.4)'}`,
          }} />

          <p style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '0.95rem',
            fontWeight: 400,
            color: isUser ? '#c8b4f8' : '#e8f4f8',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {message.content}
            {message.streaming && (
              <span style={{
                display: 'inline-block',
                width: '8px', height: '14px',
                background: '#00f7ff',
                marginLeft: '3px',
                verticalAlign: 'text-bottom',
                animation: 'blink 0.8s step-end infinite',
              }} />
            )}
          </p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.6rem',
              color: 'rgba(0,247,255,0.3)',
              marginRight: '4px',
            }}>SRC:</span>
            {message.sources.map((s, i) => <SourceTag key={i} source={s} />)}
          </div>
        )}
      </div>
    </motion.div>
  )
}
