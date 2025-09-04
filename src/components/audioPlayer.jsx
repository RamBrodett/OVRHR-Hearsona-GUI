import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = ({ audioUrl, logEvent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const isSeekingRef = useRef(false);

  // Resize canvas to container size & update internal pixel size
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => {
      // only update time while not actively seeking
      if (!isSeekingRef.current) setCurrentTime(audio.currentTime);
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      cancelAnimationFrame(animationRef.current);
      // Reset audio position to beginning
      audio.currentTime = 0;
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    analyserRef.current = analyser;
    audioCtxRef.current = audioCtx;

    return () => {
      audio.pause();
      audio.src = '';
      cancelAnimationFrame(animationRef.current);
      audioCtx.close();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const rect = canvas.parentNode.getBoundingClientRect();

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#DBE4DB';
      ctx.beginPath();

      const sliceWidth = rect.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = ((v - 1) * rect.height) / 2 + rect.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(rect.width, rect.height / 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    const ctx = audioCtxRef.current;

    if (!audio || !ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (isPlaying) {
      audio.pause();
      logEvent?.('toggle pause');
      cancelAnimationFrame(animationRef.current);
    } else {
      audio.play();
      logEvent?.('toggle play');
      drawWaveform();
    }

    setIsPlaying(!isPlaying);
  };

  const seekToPercent = (percent) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const clamped = Math.min(Math.max(percent, 0), 1);
    const newTime = clamped * duration;
    // mark seeking so timeupdate doesn't fight our setCurrentTime
    isSeekingRef.current = true;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // pointer (mouse/touch) based seeking on the bar container
  const handlePointerDownOnBar = (e) => {
    // only left button or touch/pointer
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();

    const calcPercent = (clientX) => {
      return (clientX - rect.left) / rect.width;
    };

    // initial seek
    seekToPercent(calcPercent(e.clientX));

    // attach listeners for move/up
    const handleMove = (mv) => {
      // ignore non-pointer events
      if (mv.clientX == null) return;
      seekToPercent(calcPercent(mv.clientX));
    };

    const handleUp = () => {
      // small delay to allow timeupdate to resume updating
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      // after finishing seek, allow timeupdate to overwrite currentTime again
      // use a short timeout to avoid race with final timeupdate (optional)
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 0);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    // capture this pointer so we keep receiving events even if leaving the element
    if (bar.setPointerCapture && typeof bar.setPointerCapture === 'function') {
      try {
        bar.setPointerCapture(e.pointerId);
      } catch (error) {
        console.warn('setPointerCapture failed', error);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="flex flex-col gap-3"
      style={{ width: '100%', height: '140px' }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100px' }}
        className="rounded-xl overflow-hidden"
      />

      {/* outer container: acts as the clickable/draggable seek bar */}
      <div
        role="presentation"
        onPointerDown={handlePointerDownOnBar}
        className="relative flex items-center bg-[var(--sound-button)] text-[var(--font-white)] px-4 py-3 rounded-xl hover:bg-[#4a4a4a] transition overflow-hidden select-none"
        style={{ height: '48px', cursor: 'pointer' }}
      >
        {/* progress fill (behind) */}
        <div
          className="absolute left-0 top-0 h-full bg-white/20"
          style={{ width: `${progressPercent}%` }}
        />

        {/* content (above the bar) */}
        <div className="relative z-10 flex justify-between items-center w-full">
          {/* Left side: a dedicated toggle button (stops pointer events from propagating) */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()} // prevent starting a seek when pressing the toggle
            onClick={togglePlayback}
            className="flex items-center gap-2 bg-transparent text-[var(--font-white)] px-2 py-1 rounded focus:outline-none"
            aria-pressed={isPlaying}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Right: time */}
          <span className="text-xs opacity-75">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
