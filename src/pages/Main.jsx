import { useState } from 'react'
import { AudioLines } from 'lucide-react'
import PromptComponent from '../components/PromptComponent'
import AudioPreviewComponent from '../components/AudioPreviewComponent'

function MainApplication() {
  const [prompt, setPrompt] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [audioCollection, setAudioCollection] = useState([])
  const [audio, setAudio] = useState(null)
  const [soundIndex, setSoundIndex] = useState(0)

  const handleQuerySubmission = async () => {
    if (prompt === '') return
    try {
      setChatHistory(prev => [...prev, { role: 'user', content: prompt }])
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Generating' }])
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      })
      if (!response.ok) {
        console.error('Error:', response.statusText)
        return
      }
      const data = await response.json()
      const processedAudios = data.results.map(result => {
        const { filename, audio_base64 } = result
        const binary = atob(audio_base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        return { filename, url }
      })
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', content: 'Sound now available for preview' }
      ])
      setAudioCollection(processedAudios)
      setAudio(processedAudios[soundIndex]?.url || null)
    } catch (error) {
      console.error('Error submitting query:', error)
    } 
  }

  const incrementSoundIndex = () => {
    if (audioCollection.length === 0) return
    const newIndex = (soundIndex + 1) % audioCollection.length
    setSoundIndex(newIndex)
  }

  const decrementSoundIndex = () => {
    if (audioCollection.length === 0) return
    const newIndex = (soundIndex - 1 + audioCollection.length) % audioCollection.length
    setSoundIndex(newIndex)
  }

  const handleAudioChange = (buttonType) => {
    if (audioCollection.length === 0) return
    if (buttonType === 'next') {
      incrementSoundIndex()
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: 'Give me other version' },
        { role: 'ai', content: 'New version available for preview' }
      ])
      setAudio(audioCollection[(soundIndex + 1) % audioCollection.length]?.url || null)
    } else if (buttonType === 'prev') {
      decrementSoundIndex()
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: 'Go back to the previous version' },
        { role: 'ai', content: 'Old version available for preview' }
      ])
      setAudio(audioCollection[(soundIndex - 1 + audioCollection.length) % audioCollection.length]?.url || null)
    } else if (buttonType === 'reset') {
      setSoundIndex(0)
      setAudioCollection([])
      setAudio(null)
      setChatHistory([])
    }
  }

  return (
    <div className="flex flex-col bg-[var(--background)] p-7 gap-5 h-screen min-w-screen">
      {/* Header */}
      <div className="flex flex-row h-[5%] gap-5 items-center">
        <AudioLines className="w-8 h-8 text-[var(--accent-color-3)]" />
        <p className="text-2xl font-bold text-[var(--accent-color-3)]">OVR HEAR</p>
      </div>

      {/* Main Content */}
      <div className="flex flex-row h-[95%] gap-7 pb-10">
        {/* Left Panel */}
        <div className="flex flex-col h-full w-2/5 rounded-3xl gap-5">
          {/* Prompt Area */}
          <div className="flex flex-col bg-[var(--background-2)] h-[70%] w-full rounded-3xl p-5 gap-4 overflow-hidden">
            <PromptComponent
              prompt={prompt}
              setPrompt={setPrompt}
              handleQuerySubmission={handleQuerySubmission}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              handleAudioChange={handleAudioChange}
            />
          </div>

          {/* Audio Previewer */}
          <AudioPreviewComponent Audio={audio} />
        </div>

        {/* Right Panel Placeholder */}
        <div className="flex-1 rounded-3xl bg-[var(--background-2)] p-5 ">
          {/* Right side content goes here */}
        </div>
      </div>
    </div>
  )
}

export default MainApplication
