import { useState } from 'react'

import { RotateCcw, HelpCircle, ArrowUp, Clock, Volume2, Activity } from 'lucide-react';

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
    <div className="flex flex-col bg-[var(--background)] p-11 h-screen min-w-screen">

      <div className="flex flex-row h-[100%] gap-10">
        
        {/* Left Panel */}
        <div className="flex flex-col h-full w-[50%] gap-5 bg-[]">
          
          <div className="flex h-[10%] items-center justify-between py-1 w-full">
            {/* Logo */}
            <img
              src="/src/assets//logo.png"
              alt="Hearsona"
              className="h-12 w-auto"
            />
            {/* Buttons */}
            <div className="flex items-center gap-3">
              {/* Start Over */}
              <button className="flex items-center gap-2.5 bg-[var(--background-2)] text-[var(--font-color)] px-3 py-2 rounded-2xl hover:bg-[#2a2a2a] transition">
                <RotateCcw size={20} />
                <span className="text-lg font-medium">Start Over</span>
              </button>
              {/* Tooltip */}
              <button className="bg-[var(--background-2)] text-[var(--font-color)] p-3 rounded-2xl hover:bg-[#2a2a2a] transition">
                <HelpCircle size={22} />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col justify-end text-center h-[70%] mb-5 w-full overflow-hidden">
            <div className="mb-2">
              <p className="text-[var(--font-color)] text-3xl">
                What sound are you imagining today?
              </p>
            </div>
          </div>

          {/* Prompt Area */}
          <div className="flex flex-col bg-[var(--background-2)] p-6 gap-5 h-[17.5%] w-full rounded-3xl overflow-hidden">
          
            <input
              type="text"
              placeholder="Not quite right? Say what to change—or use the controls."
              className="w-full bg-transparent text-[var(--font-color)] placeholder-[var(--placeholder-color)] text-lg focus:outline-none"
            />

            {/* Controls */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2.5">
                
                {/* Pitch */}
                <button className="flex items-center gap-2 bg-[var(--sound-button)] text-[var(--font-color)] text-lg font-medium px-4 py-2 rounded-2xl hover:bg-[#3a3a3a] transition">
                  <Activity size={20} /> Pitch
                </button>

                {/* Loudness */}
                <button className="flex items-center gap-2 bg-[var(--sound-button)] text-[var(--font-color)] text-lg font-medium px-4 py-2 rounded-2xl hover:bg-[#3a3a3a] transition">
                  <Volume2 size={20} /> Loudness
                </button>

                {/* Duration */}
                <button className="flex items-center gap-2 bg-[var(--sound-button)] text-[var(--font-color)] text-lg font-medium px-4 py-2 rounded-2xl hover:bg-[#3a3a3a] transition">
                  <Clock size={20} /> Duration
                </button>
              </div>

              {/* Submit Arrow */}
              <button className="bg-[var(--sound-button)] text-[var(--font-color)] p-3 rounded-2xl hover:bg-[#3a3a3a] transition">
                <ArrowUp size={25} />
              </button>
            </div>

          </div>
        </div>

        {/* Right Panel Placeholder */}
        <div className="flex-1 rounded-3xl w-[50%] bg-[var(--background-2)]">
          {/* Right side content goes here */}
        </div>
      </div>
    </div>
  )
}

export default MainApplication
