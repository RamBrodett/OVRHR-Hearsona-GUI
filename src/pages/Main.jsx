import { useState } from 'react'

import { RotateCcw, HelpCircle, ArrowUp, Clock, Volume2, Activity } from 'lucide-react';

function MainApplication() {
  const [activeControl, setActiveControl] = useState(null);
  
  const [pitch, setPitch] = useState(440);
  const [loudness, setLoudness] = useState(-20);
  const [duration, setDuration] = useState(10);

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
              <button className="flex items-center gap-2.5 bg-[var(--background-2)] text-[var(--font-white)] px-3 py-2 rounded-2xl hover:bg-[#2a2a2a] transition">
                <RotateCcw size={20} />
                <span className="text-lg font-medium">Start Over</span>
              </button>
              {/* Tooltip */}
              <button
                onClick={() =>
                  setActiveControl(activeControl === 'info' ? null : 'info')
                }
                className="bg-[var(--background-2)] text-[var(--font-white)] p-3 rounded-2xl hover:bg-[#2a2a2a] transition"
              >
                <HelpCircle size={22} />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col justify-end text-center h-[70%] mb-5 w-full overflow-hidden">
            <div className="mb-2">
              <p className="text-[var(--font-white)] text-3xl">
                What sound are you imagining today?
              </p>
            </div>
          </div>

          {/* Prompt Area */}
          <div className="flex flex-col bg-[var(--background-2)] p-6 gap-5 h-[17.5%] w-full rounded-3xl overflow-hidden">
          
            <input
              type="text"
              placeholder="Describe it here. Try ‘calm beach waves’ or ‘birds chirping.’"
              className="w-full bg-transparent text-[var(--font-white)] placeholder-[var(--font-gray)] text-lg focus:outline-none"
            />

            {/* Controls */}
            <div className="flex justify-between items-center relative z-10">
              <div className="flex gap-2.5">
                
                {/* Pitch */}
                <button
                  onClick={() =>
                    setActiveControl(activeControl === 'pitch' ? null : 'pitch')
                  }
                  className="flex items-center gap-2 bg-[var(--sound-button)] text-[var(--font-white)] text-lg font-medium px-4 py-2 rounded-2xl hover:bg-[#3a3a3a] transition"
                >
                <Activity size={20} /> Pitch
                </button>

                {/* Loudness */}
                <button
                  onClick={() =>
                    setActiveControl(activeControl === 'loudness' ? null : 'loudness')
                  }
                  className="flex items-center gap-2 bg-[var(--sound-button)] text-[var(--font-white)] text-lg font-medium px-4 py-2 rounded-2xl hover:bg-[#3a3a3a] transition"
                >
                  <Volume2 size={20} /> Loudness
                </button>

                {/* Duration */}
                <button
                  onClick={() =>
                    setActiveControl(activeControl === 'duration' ? null : 'duration')
                  }
                  className="flex items-center gap-2 bg-[var(--sound-button)] text-[var(--font-white)] text-lg font-medium px-4 py-2 rounded-2xl hover:bg-[#3a3a3a] transition"
                >
                  <Clock size={20} /> Duration
                </button>
              </div>

              {/* Submit Arrow */}
              <button className="bg-[var(--sound-button)] text-[var(--font-white)] p-3 rounded-2xl hover:bg-[#3a3a3a] transition">
                <ArrowUp size={25} />
              </button>
            </div>

            {/*Pitch Panel*/}
            {activeControl === 'pitch' && (
              <div className="absolute bottom-9 left-17 translate-y-[-100%] w-64 p-4 bg-[var(--background-3)] text-[var(--font-white)] rounded-2xl shadow-lg z-10">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-[var(--font-gray)]">Pitch</span>
                  <span className="text-[var(--font-white)]">{pitch} Hz</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="1000"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="w-full accent-white"
                  />
              </div>
            )}

            {/*Loudness Panel*/}
            {activeControl === 'loudness' && (
              <div className="absolute bottom-9 left-45 translate-y-[-100%] w-64 p-4 bg-[var(--background-3)] text-[var(--font-white)] rounded-2xl shadow-lg z-10">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-[var(--font-gray)]">Loudness</span>
                  <span className="text-[var(--font-white)]">{loudness} dB</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="0"
                  value={loudness}
                  onChange={(e) => setLoudness(e.target.value)}
                  className="w-full accent-white"
                  />
              </div>
            )}

            {/*Duration Panel*/}
            {activeControl === 'duration' && (
              <div className="absolute bottom-9 left-82.5 translate-y-[-100%] w-64 p-4 bg-[var(--background-3)] text-[var(--font-white)] rounded-2xl shadow-lg z-10">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-[var(--font-gray)]">Duration</span>
                  <span className="text-[var(--font-white)]">{duration}s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full accent-white"
                  />
              </div>
            )}

            {/*Tooltip Panel*/}
            {activeControl === 'info' && (
              <div className="absolute bottom-40 left-155 translate-y-[-100%] w-100 p-5 bg-[var(--background-3)] text-white rounded-2xl shadow-lg z-50">
                <h3 className="text-lg font-medium text-[var(--font-white)] mb-2">About Hearsona</h3>
                <p className="text-base text-[var(--font-gray)]">
                  Hearsona is a tool that helps you create sounds using just words. Type what you want to hear, and the system will turn it into audio for you.
                  <br /><br />
                  You can also adjust Pitch, Loudness, and Duration to make the sound match your needs.
                  <br /><br />
                  It’s designed to be easy to use, with live previews and simple controls, so you can explore and adjust your sound until it feels just right.
                </p>
              </div>
            )}

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
