import React from 'react'
import { AudioWaveform, AudioLines } from 'lucide-react'

const PromptComponent = ({
  setPrompt,
  prompt,
  handleQuerySubmission,
  chatHistory,
  handleAudioChange
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuerySubmission()
      setPrompt('')
    }
  }

  return (
    <div className={`w-full h-full flex flex-col ${chatHistory.length !== 0 ? '' : 'justify-center'}`}>
      {chatHistory.length === 0 ? (
        <>
          <div className="text-center w-full font-semibold text-2xl text-[var(--foreground)] mb-2">
            What do you want to hear? Helo
          </div>
          <div className="flex flex-row items-center gap-2 w-full border rounded-full bg-[var(--accent-color-7)] p-3 border-[var(--accent-color-6)]">
            <textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe it here"
              className="ml-1.5 w-full resize-none bg-transparent text-[var(--foreground)] focus:outline-none placeholder-[var(--foreground)] overflow-y-auto break-words leading-1.5 py-1"
            />
            <button
              onClick={() => {
                handleQuerySubmission()
                setPrompt('')
              }}
              className="w-10 h-10 flex items-center justify-center bg-[var(--accent-color-3)] text-[var(--background)] rounded-full font-semibold"
            >
              <AudioWaveform className="w-5 h-5 text-[var(--foreground)]" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-between h-full w-full">
          {/* Chat History */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100%-3.5rem)] pr-1">
            {chatHistory.map((entry, idx) => (
              <div key={idx} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
                {entry.role === 'ai' && (
                  <div className="w-8 h-8 mr-2 rounded-full bg-[var(--accent-color-3)] flex items-center justify-center">
                    <AudioLines className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-xl text-sm ${
                    entry.role === 'user'
                      ? 'bg-[var(--accent-color-8)] text-white'
                      : 'bg-transparent text-[var(--foreground)]'
                  }`}
                >
                  {entry.content}
                </div>
              </div>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex flex-row items-center justify-between gap-3 mt-4">
            <button
              className="flex-1 rounded-full bg-[var(--accent-color-3)] px-4 py-1 text-[var(--foreground)] text-sm"
              onClick={() => handleAudioChange('prev')}
            >
              Previous Version
            </button>
            <button
              className="flex-1 rounded-full bg-[var(--accent-color-3)] px-4 py-1 text-[var(--foreground)] text-sm"
              onClick={() => handleAudioChange('next')}
            >
              Next Version
            </button>
            <button
              className="flex-1 rounded-full bg-[var(--accent-color-3)] px-4 py-1 text-[var(--foreground)] text-sm"
              onClick={() => handleAudioChange('reset')}
            >
              New Input
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptComponent