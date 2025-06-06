import { useState } from 'react'
import { useEffect, useRef } from 'react';

import { RotateCcw, HelpCircle, ArrowUp, Clock, Volume2, Activity, Upload, Settings, Menu, Plus, MessageSquareShare, AudioWaveform } from 'lucide-react';

function MainApplication() {
  const [activeControl, setActiveControl] = useState(null);

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [versions, setVersions] = useState([]);
  
  const [history, setHistory] = useState([]);

  {/* Sound Parameters */}
  const [pitch, setPitch] = useState(440);
  const [loudness, setLoudness] = useState(-20);
  const [duration, setDuration] = useState(10);

  const [isPitchActive, setIsPitchActive] = useState(false);
  const [isPitchAdjusted, setIsPitchAdjusted] = useState(false);

  const [isLoudnessActive, setIsLoudnessActive] = useState(false);
  const [isLoudnessAdjusted, setIsLoudnessAdjusted] = useState(false);

  const [isDurationActive, setIsDurationActive] = useState(false);
  const [isDurationAdjusted, setIsDurationAdjusted] = useState(false);


  {/* Autoscroll to the latest chat/version */}
  const chatRef = useRef(null);
  const versionRef = useRef(null);

  {/* Start Over Confirmation Panel */}
  const [showConfirm, setShowConfirm] = useState(false);

  {/* Expanded Versional Panel */}
  const [expandedVersion, setExpandedVersion] = useState(null);

  useEffect(() => {
  if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (versionRef.current) {
      versionRef.current.scrollTop = 0;
    }
  }, [versions]);

  {/* Export Chat */}
  const exportChat = () => {
    const fileName = prompt("Enter ID:", "chat-export");

    if (!fileName) return;

    const content = history
      .map(msg => `${msg.role.toUpperCase()}: ${msg.text}`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async() => {
    if (!userInput.trim()) return;

    const newUserMessage = { role: 'user', text: userInput.trim() };
    setMessages((prev) => [...prev, newUserMessage]);
    setHistory((prev) => [...prev, newUserMessage]);
    setUserInput('');

    try{
      const response = await fetch('api/query',{
        method: 'POST',
        headers:{'Content-Type': 'application/json',},
        body: JSON.stringify({
          user_input : userInput.trim(),
          settings:{
            pitch: pitch,
            loudness: loudness,
            duration: duration
          }
        })
      });

      const data = await response.json();

      if(data.status === "success"){
        const responseText = data.message;
        const audio_base64 = data.audio_base64;
        console.log(responseText)

        const systemMessage = {role: 'assistant', text: responseText};
        setMessages((prev)=> [...prev, systemMessage]);
        setHistory((prev) => [...prev, systemMessage]);

        if(audio_base64 !== null){
          setVersions((prev)=> [...prev,{
            versionNumber: prev.length + 1,
            content: base64ToBlob(audio_base64)
          }])
        }
      }
    } catch (error){
      console.log(error)
    }
  };

  function base64ToBlob(base64, mimeType = 'audio/wav') {
    try {
      const binaryString = atob(base64);
      const byteNumbers = new Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        byteNumbers[i] = binaryString.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      console.error('Error converting base64 to Blob:', error);
      return null;
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
              <button
                onClick={() => {
                  if (messages.length > 0) setShowConfirm(true);
                }}
                disabled={messages.length === 0}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl transition
                  ${messages.length === 0
                    ? 'bg-[var(--disabled-button)] text-[var(--disabled-text)]'
                    : 'bg-[var(--background-2)] text-[var(--font-white)] hover:bg-[#3a3a3a]'}
                `}
              >
                <RotateCcw size={20} />
                <span className="text-lg font-medium">
                  Start Over
                </span>
              </button>

              {/* Tooltip */}
              <div className="relative group inline-block">
                <button
                  onClick={() =>
                    setActiveControl(activeControl === 'info' ? null : 'info')
                  }
                  className="bg-[var(--background-2)] text-[var(--font-white)] p-3 rounded-2xl hover:bg-[#3a3a3a] transition"
                >
                  <HelpCircle size={22} />
                </button>
              </div>

              {/* More Options (New User and Export Chat) */}
              <button
                onClick={() =>
                  setActiveControl(activeControl === 'options' ? null : 'options')
                }
                className="bg-[var(--background-2)] text-[var(--font-white)] p-3 rounded-2xl hover:bg-[#3a3a3a] transition"
              >
                <Menu size={22} />
              </button>

            </div>
          </div>

          {/* Chat Area */}
          <div
            onClick={() => setActiveControl(null)}
            className="flex flex-col justify-end text-center h-[70%] mb-5 w-full overflow-hidden"
          >
            {messages.length === 0 && (
              <div className="mb-2">
                {/* Prompt Question */}
                <p className="text-[var(--font-white)] text-3xl">
                  What sound are you imagining today?
                </p>
              </div>
            )}

            <div
              className="flex flex-col gap-2 px-4 py-2 overflow-y-auto scroll-smooth"
              ref={chatRef}
            >
              {/* Chat Boxes */}
              {messages.map((msg, index) => (
                <div key={index} className="flex items-start">
                  <div
                    className={`px-5 py-4 rounded-xl w-full flex items-start gap-4 ${
                      msg.role === 'user'
                        ? 'bg-[var(--background-2)]'
                        : ''
                    } text-[var(--font-white)]`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 flex items-center h-full">
                      <img
                        src="/src/assets/icon.png"
                        alt="System Icon"
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    )}
                    <span className="break-words whitespace-pre-wrap w-full text-left overflow-hidden">
                      {msg.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Prompt Area */}
          <div className="flex flex-col bg-[var(--background-2)] p-6 gap-5 h-[17.5%] w-full rounded-3xl overflow-hidden">
          
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onClick={() => setActiveControl(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              type="text"
              placeholder={
                messages.length === 0
                  ? "Describe it here. Try ‘calm beach waves’ or ‘birds chirping.’"
                  : "Not quite right? Say what to change—or use the controls."
              }
              className="w-full bg-transparent text-[var(--font-white)] placeholder-[var(--font-gray)] text-lg focus:outline-none"
            />

            {/* Controls */}
            <div className="flex justify-between items-center relative z-10">
              <div className="flex gap-2.5">

                {/* Pitch */}
                <button
                  onClick={() => setActiveControl('pitch')}
                  className={`flex items-center gap-2 text-lg font-medium px-4 py-2 rounded-2xl transition ${
                    isPitchAdjusted
                      ? 'bg-white text-black'
                      : 'bg-[var(--sound-button)] text-[var(--font-white)] hover:bg-[#3a3a3a]'
                  }`}
                >
                  <Activity
                    size={20}
                    className={isPitchAdjusted ? 'text-black' : 'text-[var(--font-white)]'}
                  />
                  Pitch
                </button>

                {/* Loudness */}
                <button
                  onClick={() => setActiveControl('loudness')}
                  className={`flex items-center gap-2 text-lg font-medium px-4 py-2 rounded-2xl transition ${
                    isLoudnessAdjusted
                      ? 'bg-white text-black'
                      : 'bg-[var(--sound-button)] text-[var(--font-white)] hover:bg-[#3a3a3a]'
                  }`}
                >
                  <Volume2
                    size={20}
                    className={isLoudnessAdjusted ? 'text-black' : 'text-[var(--font-white)]'}
                  />
                  Loudness
                </button>

                {/* Duration */}
                <button
                  onClick={() => setActiveControl('duration')}
                  className={`flex items-center gap-2 text-lg font-medium px-4 py-2 rounded-2xl transition ${
                    isDurationAdjusted
                      ? 'bg-white text-black'
                      : 'bg-[var(--sound-button)] text-[var(--font-white)] hover:bg-[#3a3a3a]'
                  }`}
                >
                  <Clock
                    size={20}
                    className={isDurationAdjusted ? 'text-black' : 'text-[var(--font-white)]'}
                  />
                  Duration
                </button>
              </div>

              {/* Submit Arrow */}
              <button
                onClick={handleSendMessage}
                className="bg-[var(--sound-button)] text-[var(--font-white)] p-3 rounded-2xl hover:bg-[#3a3a3a] transition"
              >
                <ArrowUp size={25} />
              </button>
            </div>

            {/*Pitch Panel*/}
            {activeControl === 'pitch' && (
              <div className="absolute bottom-11.5 left-17 translate-y-[-100%] w-64 p-4 bg-[var(--sound-button)] text-[var(--font-white)] rounded-2xl shadow-xl z-10">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-[var(--font-gray)]">Pitch</span>
                  <span className="text-[var(--font-white)]">{pitch} Hz</span>
                </div>
                <div className="flex items-center gap-2">

                  <input
                    type="range"
                    min="80"
                    max="1000"
                    value={pitch}
                    onChange={(e) => {
                      setPitch(e.target.value);
                      setIsPitchAdjusted(true);
                    }}
                    className="w-full accent-white"
                  />
                  <button
                    onClick={() => {
                      setPitch(440);
                      setIsPitchAdjusted(false);
                      setActiveControl(null);
                    }}
                    className="text-[var(--font-white)] hover:text-[#cccccc] transition"
                    title="Reset"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>
            )}

            {/*Loudness Panel*/}
            {activeControl === 'loudness' && (
              <div className="absolute bottom-11.5 left-45 translate-y-[-100%] w-64 p-4 bg-[var(--sound-button)] text-[var(--font-white)] rounded-2xl shadow-xl z-10">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-[var(--font-gray)]">Loudness</span>
                  <span className="text-[var(--font-white)]">{loudness} db</span>
                </div>
                <div className="flex items-center gap-2">

                  <input
                    type="range"
                    min="-60"
                    max="0"
                    value={loudness}
                    onChange={(e) => {
                      setLoudness(e.target.value);
                      setIsLoudnessAdjusted(true);
                    }}
                    className="w-full accent-white"
                  />
                  <button
                    onClick={() => {
                      setLoudness(-20);
                      setIsLoudnessAdjusted(false);
                      setActiveControl(null);
                    }}
                    className="text-[var(--font-white)] hover:text-[#cccccc] transition"
                    title="Reset"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>
            )}

            {/*Duration Panel*/}
            {activeControl === 'duration' && (
              <div className="absolute bottom-11.5 left-82.5 translate-y-[-100%] w-64 p-4 bg-[var(--sound-button)] text-[var(--font-white)] rounded-2xl shadow-xl z-10">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-[var(--font-gray)]">Duration</span>
                  <span className="text-[var(--font-white)]">{duration}s</span>
                </div>
                <div className="flex items-center gap-2">

                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      setIsDurationAdjusted(true);
                    }}
                    className="w-full accent-white"
                  />
                  <button
                    onClick={() => {
                      setDuration(15);
                      setIsDurationAdjusted(false);
                      setActiveControl(null);
                    }}
                    className="text-[var(--font-white)] hover:text-[#cccccc] transition"
                    title="Reset"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Start Over Confirmation Panel */}
            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
                <div className="bg-[var(--background-2)] p-10 rounded-2xl text-center shadow-xl w-110">
                  <p className="text-[var(--font-white)] text-xl font-medium mb-4">
                    Are you sure you want to start over?
                  </p>
                  <p className="text-[var(--font-gray)] text-base mb-8">
                    This will clear all chat history and audio versions.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setHistory((prev) => [
                          ...prev,
                          { role: 'system', text: '--- User clicked Start Over ---' },
                        ]);

                        setMessages([]);
                        setVersions([]);
                        setShowConfirm(false);
                      }}
                      className="bg-[var(--background-3)] text-[var(--font-white)] px-4 py-2 rounded-xl hover:bg-red-700 transition"
                    >
                      Start Over
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="bg-[var(--background-3)] text-[var(--font-white)] px-4 py-2 rounded-xl hover:bg-[#3a3a3a] transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tooltip Panel */}
            {activeControl === 'info' && (
              <div className="absolute bottom-52.5 left-134 translate-y-[-100%] w-100 p-5 bg-[var(--sound-button)] text-white rounded-2xl shadow-xl z-50">
                <h3 className="text-lg font-medium text-[var(--font-white)] mb-2">About Hearsona</h3>
                <p className="text-base text-[var(--font-gray)]">
                  Hearsona is a tool that helps you create sounds using just words. Type what you want to hear, and the system will turn it into audio for you.
                  You can also adjust Pitch, Loudness, and Duration to make the sound match your needs.
                  <br /><br />
                  It’s designed to be easy to use, with live previews and simple controls, so you can explore and adjust your sound until it feels just right.
                </p>
              </div>
            )}

            {/* More Options Panel */}
            {activeControl === 'options' && (
              <div className="absolute bottom-138.5 left-160 translate-y-[-100%] w-45 p-3 bg-[var(--sound-button)] text-white rounded-2xl shadow-xl z-50">
                
                {/* New User */}
                <button
                  onClick={() => {
                      setMessages([]);
                      setVersions([]);
                      setHistory([]);
                      setActiveControl(null);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 w-39 rounded-2xl transition bg-[var(--sound-button)] text-[var(--font-white)] hover:bg-[#3a3a3a]"
                >
                  <Plus size={20} />
                  <span className="text-lg font-medium">
                    New User
                  </span>
                </button>

                {/* Export Chat */}
                <button
                  onClick={() => {
                    exportChat();
                    setActiveControl(null);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 w-39 mt-2 rounded-2xl transition bg-[var(--sound-button)] text-[var(--font-white)] hover:bg-[#3a3a3a]"
                >
                  <MessageSquareShare size={20} />
                  <span className="text-lg font-medium">
                    Export Chat
                  </span>
                </button>
              </div>
            )}


          </div>
        </div>

        {/* Right Panel */}
        <div
          className="rounded-3xl p-6 overflow-y-auto w-[50%] bg-[var(--background-2)] scroll-smooth"
          ref={versionRef}
          onClick={() => setActiveControl(null)}
        >
          <div className="flex flex-col gap-6.5">
            {versions
              .slice()
              .reverse()
              .map((version) => (
                <div
                  key={version.versionNumber}
                  className="rounded-2xl overflow-hidden border border-[var(--background-3)]"
                >
                  <div
                    className={`flex justify-between items-center px-8 py-5 cursor-pointer transition-colors ${
                      expandedVersion === version.versionNumber
                        ? 'bg-[var(--background-3)]'
                        : 'bg-[var(--sound-button)]'
                    }`}
                    onClick={() =>
                      setExpandedVersion(
                        expandedVersion === version.versionNumber
                          ? null
                          : version.versionNumber
                      )
                    }
                  >
                    <p className="text-[var(--font-white)] text-xl font-medium">
                      Version {version.versionNumber}
                    </p>

                      <button className="flex items-center gap-3 bg-[var(--export-button)] text-[var(--font-white)] px-3 py-2 rounded-2xl hover:bg-[#4a4a4a] transition">
                        <Upload size={20} />
                        <span className="text-[var(--font-white)] text-lg font-medium">
                          Export
                        </span>
                      </button>
                  </div>

                  {/* Expanded Panel */}
                  {expandedVersion === version.versionNumber && (
                    <div className="bg-[#171717] px-6 py-5 space-y-4">
                      <AudioWaveform size={50} />

                      <audio controls src={version.audioUrl} className="w-full">
                      </audio>
                    </div>
                  )}
                </div>
              ))}
          </div>



        </div>

      </div>
    </div>
  )
}

export default MainApplication
