import { useState } from 'react'
import { useEffect, useRef } from 'react';
import { RotateCcw, HelpCircle, ArrowUp, Clock, Volume2, Activity,  Menu, Plus, MessageSquareShare, X} from 'lucide-react';

import VersionsComponent from '../components/versionsComponent';

function MainApplication() {
  const [activeControl, setActiveControl] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /* Sound Parameters - Updated to categorical */
  const pitchOptions = ['lower', 'low', 'normal', 'high', 'higher'];
  const loudnessOptions = ['quiet', 'very soft', 'soft', 'medium', 'loud', 'very loud'];
  const durationOptions = [1, 2, 3, 4, 5, 5.12, 6, 7, 8, 9, 10];
  
  const [pitch, setPitch] = useState(2); // Index for 'normal'
  const [loudness, setLoudness] = useState(3); // Index for 'medium'
  const [duration, setDuration] = useState(5); // Index for 5.12s

  const [isPitchAdjusted, setIsPitchAdjusted] = useState(false);
  const [isLoudnessAdjusted, setIsLoudnessAdjusted] = useState(false);
  const [isDurationAdjusted, setIsDurationAdjusted] = useState(false);
  
  /* Feature tooltips */
  const tooltips = {
    pitch: {
      title: "Pitch",
      text: "It controls how high or low a sound feels. Lower values make it deeper, while higher values make it sharper or squeaky."
    },
    loudness: {
      title: "Loudness",
      text: "It controls the volume of the sound. Softer values are quieter and subtle, while louder values make it stand out more."
    },
    duration: {
      title: "Duration",
      text: "It controls how long the sound plays. Shorter durations give quick sounds, while longer durations sustain the sound."
    }
  };

  {/* Autoscroll to the latest chat/version */}
  const chatRef = useRef(null);
  const versionRef = useRef(null);

  /* Start Over Confirmation Panel */
  const [showConfirm, setShowConfirm] = useState(false);

  /* Expanded Versional Panel */
  const [expandedVersion, setExpandedVersion] = useState(null);

  const [logs, setLogs] = useState([]);

  useEffect(() => {
  if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (versionRef.current) {
      versionRef.current.scrollTop = versionRef.current.scrollHeight;
   }
  }, [versions]);

  /* Export Chat */
  const exportChat = async () => {
    const fileName = prompt("Enter ID:", "Id Here");

    if (!fileName) return;

    try {
      const response = await fetch('api/sessions/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_input: fileName }),
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Export successful!");
      } else {
        alert("Export failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while exporting the chat.");
    }
  };
  
  const newUser = async () => {
    try {
      const response = await fetch('api/sessions/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.status === "success") {
         // Convert logs to text
        const logText = logs.join('\n')
        const blob = new Blob([logText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)

        const timestamp = new Date().toISOString()
        const a = document.createElement('a')
        a.href = url
        a.download = `${timestamp}_logs.txt`;
        a.click()

        URL.revokeObjectURL(url)

        // Reset logs
        setLogs([])
        alert("New user session started");
      } else {
        alert("failed new user session restart" + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating new user session.");
    }
  };

  const handleStartOver = async() => {
    try {
      const response = await fetch('api/sessions/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("New session started");
      } else {
        alert("failed new session restart" + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating new session.");
    }
  }

  const handleSendMessage = async() => {
    if (!userInput.trim()) return;
    setIsLoading(true)
    const newUserMessage = { role: 'user', text: userInput.trim() };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput('');

    const settings = {};
    if (isPitchAdjusted) settings.pitch = pitchOptions[pitch];
    if (isLoudnessAdjusted) settings.loudness = loudnessOptions[loudness];
    if (isDurationAdjusted) settings.duration = duration;

    try{
      const response = await fetch('api/chat/query',{
        method: 'POST',
        headers:{'Content-Type': 'application/json',},
        body: JSON.stringify({
          user_input : userInput.trim(),
          settings : settings
        })
      });

      const data = await response.json();

      if(data.status === "success"){
        const responseText = data.message;
        const audio_base64 = data.audio_base64;

        const systemMessage = {role: 'assistant', text: responseText};
        setMessages((prev)=> [...prev, systemMessage]);
        if(audio_base64 !== null){
          const audioBlob = base64ToBlob(audio_base64);
          const audioUrl = URL.createObjectURL(audioBlob);
          setVersions((prev)=> [...prev,{
            versionNumber: prev.length + 1,
            audioUrl: audioUrl
          }])
        }
      }
    } catch (error){
      console.log(error)
    }
    setIsLoading(false)
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
  };

  const logEvent = (event) => {
    const timestamp = new Date().toISOString()
    setLogs((prev) => [...prev, `[${timestamp}] ${event}`])
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
                  logEvent ("Clicked start over button")
                  if (messages.length > 0) setShowConfirm(true);
                }}
                disabled={messages.length === 0 || isLoading}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl transition
                  ${messages.length === 0 || isLoading
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
                  onClick={() =>{
                    logEvent ("Clicked tooltip button")
                    setActiveControl(activeControl === 'info' ? null : 'info')
                  }}
                  className="bg-[var(--background-2)] text-[var(--font-white)] p-3 rounded-2xl hover:bg-[#3a3a3a] transition"
                >
                  <HelpCircle size={22} />
                </button>
              </div>

              {/* More Options (New User and Export Chat) */}
              <button
                onClick={() =>{
                  logEvent ("Clicked burger button")
                  setActiveControl(activeControl === 'options' ? null : 'options')
                }}
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
                
                {/* Helper Text */}
                <p className="text-[var(--font-white)] opacity-50 text-lg mt-2">
                  Can’t think? Choose a starting point.
                </p>
                
                {/* Quick Pick Presets */}
                <div className="flex justify-center gap-3 mt-4 opacity-50">
                  {["waves", "dogs barking", "gong"].map((preset) => (
                    <button
                      key={preset}
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserInput(preset); // fills input box
                        logEvent(`Clicked preset: ${preset}`);
                      }}
                    className="px-4 py-2 bg-[var(--sound-button)] text-[var(--font-white)] 
                     rounded-xl shadow hover:brightness-120 active:scale-95 active:brightness-95 
                     transition duration-200 ease-in-out" 
                    >
                      {preset}
                    </button>
                  ))}
                </div>
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
              {isLoading &&(
                <div className="flex items-start">
                  <div
                    className={`px-5 py-4 rounded-xl w-full flex items-start gap-4 text-[var(--font-white)]`}
                  >
                      <div className="flex-shrink-0 flex items-center h-full">
                      <img
                        src="/src/assets/icon.png"
                        alt="System Icon"
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    <div className="animate-spin w-6 h-6 border-2 self-center border-white border-t-transparent rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Prompt Area */}
          <div className="flex flex-col bg-[var(--background-2)] p-6 gap-5 h-[17.5%] w-full rounded-3xl overflow-hidden">
          
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onClick={() => {setActiveControl(null)
                logEvent ("Clicked prompt area")
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              type="text"
              placeholder={
                messages.length === 0
                  ? "Describe it here. Try 'calm beach waves' or 'birds chirping.'"
                  : "Not quite right? Say what to change—or use the controls."
              }
              className="w-full bg-transparent text-[var(--font-white)] placeholder-[var(--font-gray)] text-lg focus:outline-none"
            />

            {/* Controls */}
            <div className="flex justify-between items-center relative z-10">
              <div className="flex gap-2.5">

                {/* Pitch */}
                <button
                  onClick={() => {
                    logEvent ("Clicked Pitch button")
                    setActiveControl('pitch')}}
                  disabled={isLoading}
                  className={`flex items-center gap-2 text-lg font-medium px-4 py-2 rounded-2xl transition ${
                  isLoading
                    ? 'bg-[var(--disabled-button)] text-[#353535] cursor-not-allowed'
                    : isPitchAdjusted
                      ? 'bg-white text-black'
                      : 'bg-[var(--sound-button)] text-[var(--font-white)] hover:bg-[#3a3a3a]'
                }`}
              
                >
                  <Activity
                    size={20}
                    className={ isLoading? `text-[#353535]` :isPitchAdjusted ? 'text-black' : 'text-[var(--font-white)]'}
                  />
                  Pitch
                </button>

                {/* Loudness */}
                <button
                  onClick={() => {
                    logEvent ("Clicked Loudness button")
                    setActiveControl('loudness')}}
                    disabled={isLoading}
                    className={`flex items-center gap-2 text-lg font-medium px-4 py-2 rounded-2xl transition ${
                    isLoading
                      ? 'bg-[var(--disabled-button)] text-[#353535] cursor-not-allowed'
                      : isLoudnessAdjusted
                        ? 'bg-white text-black'
                        : 'bg-[var(--sound-button)] text-[var(--font-white)] hover:bg-[#3a3a3a]'
                  }`}
                >
                  <Volume2
                    size={20}
                    className={isLoading?  `text-[#353535]`:isLoudnessAdjusted ? 'text-black' : 'text-[var(--font-white)]'}
                  />
                  Loudness
                </button>

                {/* Duration */}
                <button
                  onClick={() => {
                    logEvent ("Clicked loudness button")
                    setActiveControl('duration')}}
                    disabled={isLoading}
                  className={`flex items-center gap-2 text-lg font-medium px-4 py-2 rounded-2xl transition ${
                    isLoading
                    ? 'bg-[var(--disabled-button)] text-[#353535] cursor-not-allowed':
                    isDurationAdjusted
                      ? 'bg-white text-black'
                      : 'bg-[var(--sound-button)] text-[var(--font-white)] hover:bg-[#3a3a3a]'
                  }`}
                >
                  <Clock
                    size={20}
                    className={isLoading? `text-[#353535]` : isDurationAdjusted ? 'text-black' : 'text-[var(--font-white)]'}
                  />
                  Duration
                </button>
              </div>

              {/* Submit Arrow */}
              <button
                onClick={() => {
                  logEvent ("Clicked Submmit button")
                  handleSendMessage()
                }}
                disabled={isLoading}
                className={` p-3 rounded-2xl ${isLoading ? `bg-[var(--disabled-button)]`: `bg-[var(--sound-button)] text-[var(--font-white)] hover:bg-[#3a3a3a] transition1`} `}
              >
                <ArrowUp size={25} className={`${isLoading?  `text-[#353535]`: ``}`}/>
              </button>
            </div>

            {/*Pitch Panel*/}
            {activeControl === 'pitch' && (
              <div className="absolute left-17 translate-y-[-70%] w-80 p-5 bg-[var(--sound-button)] text-[var(--font-white)] rounded-2xl shadow-xl z-10">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-[var(--font-gray)]">Pitch</span>
                  <button
                    onClick={() =>
                      setActiveTooltip(activeTooltip === 'pitch' ? null : 'pitch')
                    }
                    className="text-[var(--font-gray)] hover:text-white transition"
                  >
                    {activeTooltip === 'pitch' ? (
                      <X size={20} />
                    ) : (
                      <HelpCircle size={20} />
                    )}
                  </button>
                </div>
            
                {activeTooltip === 'pitch' ? (
                  <div>
                    <p className="text-sm text-[var(--font-gray)]">
                      {tooltips.pitch.text}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max={pitchOptions.length - 1}
                        value={pitch}
                        onChange={(e) => {
                          setPitch(parseInt(e.target.value));
                          setIsPitchAdjusted(true);
                        }}
                        className="w-full accent-white"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      {pitchOptions.map((option, index) => (
                        <span 
                          key={index}
                          className={`capitalize ${index === pitch ? 'text-white font-medium' : ''}`}
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/*Loudness Panel*/}
            {activeControl === 'loudness' && (
              <div className="absolute left-45 translate-y-[-70%] w-96 p-5 bg-[var(--sound-button)] text-[var(--font-white)] rounded-2xl shadow-xl z-10">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-[var(--font-gray)]">Loudness</span>
                  <button
                    onClick={() =>
                      setActiveTooltip(activeTooltip === 'loudness' ? null : 'loudness')
                    }
                    className="text-[var(--font-gray)] hover:text-white transition"
                  >
                    {activeTooltip === 'loudness' ? (
                      <X size={20} />
                    ) : (
                      <HelpCircle size={20} />
                    )}
                  </button>
                </div>
            
                {activeTooltip === 'loudness' ? (
                  <div>
                    <p className="text-sm text-[var(--font-gray)]">
                      {tooltips.loudness.text}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max={loudnessOptions.length - 1}
                        value={loudness}
                        onChange={(e) => {
                          setLoudness(parseInt(e.target.value));
                          setIsLoudnessAdjusted(true);
                        }}
                        className="w-full accent-white"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      {loudnessOptions.map((option, index) => (
                        <span
                          key={index}
                          className={`capitalize ${
                            index === loudness ? 'text-white font-medium' : ''
                          }`}
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/*Duration Panel*/}
            {activeControl === 'duration' && (
              <div className="absolute left-82.5 translate-y-[-70%] w-80 p-5 bg-[var(--sound-button)] text-[var(--font-white)] rounded-2xl shadow-xl z-10">
                <div className="flex justify-between items-center text-base mb-2">
                  <span className="text-[var(--font-gray)]">Duration</span>
                  <div className="flex items-center gap-2">
                    {activeTooltip === "duration" ? null : (
                      <span className="text-[var(--font-white)]">{durationOptions[duration]}s</span>
                    )}
                    <button
                      onClick={() => {
                        setActiveTooltip(activeTooltip === "duration" ? null : "duration");
                        logEvent("Clicked Duration tooltip");
                      }}
                      className="text-[var(--font-gray)] hover:text-white transition"
                    >
                      {activeTooltip === "duration" ? (
                        <X size={20} />
                      ) : (
                        <HelpCircle size={20} />
                      )}
                    </button>
                  </div>
                </div>
            
                {activeTooltip === "duration" ? (
                  <div>
                    <p className="text-sm text-[var(--font-gray)]">
                      {tooltips.duration.text}
                    </p>
                  </div>
                ) : (
                  <input
                    type="range"
                    min="0"
                    max={durationOptions.length - 1}
                    value={duration}
                    onChange={(e) => {
                      setDuration(parseInt(e.target.value));
                      setIsDurationAdjusted(true);
                    }}
                    className="w-full accent-white"
                  />
                )}
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
                        logEvent ("Clicked start over button")
                        handleStartOver();
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
                  It's designed to be easy to use, with live previews and simple controls, so you can explore and adjust your sound until it feels just right.
                </p>
              </div>
            )}

            {/* More Options Panel */}
            {activeControl === 'options' && (
              <div className="absolute bottom-138.5 left-160 translate-y-[-100%] w-45 p-3 bg-[var(--sound-button)] text-white rounded-2xl shadow-xl z-50">
                
                {/* New User */}
                <button
                  onClick={() => {
                      newUser();
                      logEvent ("Clicked New user button")
                      setMessages([]);
                      setVersions([]);
                      setActiveControl(null);
                  }}
                  disabled={isLoading}
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
                    logEvent ("Clicked Export chat")
                    exportChat();
                    setActiveControl(null);
                  }}
                  disabled={isLoading}
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
          <VersionsComponent expandedVersion={expandedVersion} setExpandedVersion={setExpandedVersion} versions={versions} logEvent={logEvent} />
       </div>
      </div>
    </div>
  )
}

export default MainApplication