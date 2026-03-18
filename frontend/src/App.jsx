import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import NexusIntro from './components/NexusIntro'
import ChatInterface from './components/ChatInterface'
import './styles/globals.css'

export default function App() {
  const [phase, setPhase] = useState('intro') // 'intro' | 'chat'

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <AnimatePresence mode="wait">
        {phase === 'intro' ? (
          <NexusIntro key="intro" onComplete={() => setPhase('chat')} />
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%', height: '100%' }}
          >
            <ChatInterface />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
