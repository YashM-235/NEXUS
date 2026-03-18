const API = 'http://localhost:8000'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Link, Type, X, CheckCircle, Loader } from 'lucide-react'
import axios from 'axios'

function StatusTag({ status }) {
  const colors = {
    idle:     'rgba(0,247,255,0.3)',
    loading:  '#ffaa00',
    success:  '#00ff88',
    error:    '#ff3355',
  }
  const labels = { idle: 'READY', loading: 'PROCESSING', success: 'INGESTED', error: 'FAILED' }
  return (
    <span style={{
      fontFamily: 'Share Tech Mono, monospace',
      fontSize: '0.65rem',
      letterSpacing: '0.15em',
      color: colors[status],
      border: `1px solid ${colors[status]}`,
      padding: '2px 8px',
      borderRadius: '2px',
    }}>
      {labels[status]}
    </span>
  )
}

export default function DocumentUpload({ onDocumentAdded, docCount }) {
  const [activeTab, setActiveTab] = useState('pdf')
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles]       = useState([])
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput]   = useState('')
  const [status, setStatus]       = useState('idle')
  const [message, setMessage]     = useState('')
  const fileRef = useRef(null)

  const tabs = [
    { id: 'pdf',  label: 'PDF',  icon: FileText },
    { id: 'text', label: 'TEXT', icon: Type     },
    { id: 'url',  label: 'URL',  icon: Link     },
  ]

  async function handleUpload() {
    setStatus('loading')
    setMessage('')
    try {
      if (activeTab === 'pdf' && files.length > 0) {
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        await axios.post(`${API}/ingest/pdf`, fd)
        setMessage(`${files.length} file(s) ingested into NEXUS memory.`)
        setFiles([])
      } else if (activeTab === 'text' && textInput.trim()) {
        const fd = new FormData()
        fd.append('text', textInput)
        fd.append('source_name', 'user_text_input')
        await axios.post(`${API}/ingest/text`, fd)
        setMessage('Text ingested into NEXUS memory.')
        setTextInput('')
      } else if (activeTab === 'url' && urlInput.trim()) {
        const fd = new FormData()
        fd.append('url', urlInput)
        await axios.post(`${API}/ingest/url`, fd)
        setMessage(`URL content ingested into NEXUS memory.`)
        setUrlInput('')
      } else {
        setStatus('error')
        setMessage('No content to ingest.')
        return
      }
      setStatus('success')
      onDocumentAdded()
    } catch (e) {
      setStatus('error')
      setMessage(e.response?.data?.detail || 'Ingestion failed. Check backend.')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf'))
    setFiles(prev => [...prev, ...dropped])
  }

  return (
    <div style={{
      background: 'rgba(2,4,8,0.95)',
      border: '1px solid rgba(0,247,255,0.15)',
      borderRadius: '4px',
      padding: '1.25rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#00f7ff',
          }}>KNOWLEDGE FEED</h3>
          <p style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.65rem',
            color: 'rgba(0,247,255,0.4)',
            marginTop: '2px',
          }}>
            {docCount > 0 ? `${docCount} SOURCE(S) ACTIVE` : 'NO SOURCES LOADED'}
          </p>
        </div>
        <StatusTag status={status} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setStatus('idle'); setMessage('') }}
            style={{
              flex: 1,
              fontFamily: 'Orbitron, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              fontWeight: 600,
              padding: '0.5rem',
              background: activeTab === id ? 'rgba(0,247,255,0.1)' : 'transparent',
              border: activeTab === id ? '1px solid rgba(0,247,255,0.5)' : '1px solid rgba(0,247,255,0.1)',
              color: activeTab === id ? '#00f7ff' : 'rgba(0,247,255,0.4)',
              cursor: 'pointer',
              borderRadius: '2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            <Icon size={10} />
            {label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div style={{ flex: 1 }}>
        {activeTab === 'pdf' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#00f7ff' : 'rgba(0,247,255,0.2)'}`,
              borderRadius: '4px',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(0,247,255,0.05)' : 'transparent',
              transition: 'all 0.2s',
              minHeight: '120px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            <Upload size={24} color="rgba(0,247,255,0.5)" />
            <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', color: 'rgba(0,247,255,0.5)' }}>
              DROP PDFs HERE
            </p>
            <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem', color: 'rgba(0,247,255,0.3)' }}>
              or click to select
            </p>
            <input
              ref={fileRef} type="file" accept=".pdf" multiple hidden
              onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])}
            />
          </div>
        )}

        {activeTab === 'text' && (
          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder="PASTE KNOWLEDGE HERE..."
            style={{
              width: '100%', height: '120px',
              background: 'rgba(0,247,255,0.03)',
              border: '1px solid rgba(0,247,255,0.15)',
              borderRadius: '4px',
              padding: '0.75rem',
              color: '#e8f4f8',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.75rem',
              resize: 'none',
              outline: 'none',
            }}
          />
        )}

        {activeTab === 'url' && (
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              background: 'rgba(0,247,255,0.03)',
              border: '1px solid rgba(0,247,255,0.15)',
              borderRadius: '4px',
              padding: '0.75rem',
              color: '#e8f4f8',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.75rem',
              outline: 'none',
            }}
          />
        )}
      </div>

      {/* Queued files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {files.map((f, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 8px', marginBottom: '4px',
                background: 'rgba(0,247,255,0.05)',
                border: '1px solid rgba(0,247,255,0.1)',
                borderRadius: '2px',
              }}>
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', color: 'rgba(0,247,255,0.7)' }}>
                  {f.name}
                </span>
                <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,51,85,0.7)', display: 'flex' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.65rem',
              color: status === 'success' ? '#00ff88' : '#ff3355',
              textAlign: 'center',
            }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Upload button */}
      <motion.button
        onClick={handleUpload}
        disabled={status === 'loading'}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          padding: '0.75rem',
          background: status === 'loading' ? 'rgba(0,247,255,0.1)' : 'rgba(0,247,255,0.15)',
          border: '1px solid rgba(0,247,255,0.4)',
          color: '#00f7ff',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          borderRadius: '2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          transition: 'all 0.2s',
        }}
      >
        {status === 'loading' ? (
          <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> PROCESSING...</>
        ) : (
          <><Upload size={12} /> FEED NEXUS</>
        )}
      </motion.button>
    </div>
  )
}
