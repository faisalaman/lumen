import { useState } from 'react'
import AppBackdrop from './components/AppBackdrop.jsx'
import ChatPage from './pages/ChatPage.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import SettingsModal from './components/SettingsModal.jsx'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <>
      <AppBackdrop />
      <ChatPage onOpenSettings={() => setSettingsOpen(true)} />
      <CommandPalette onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
