import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = ({ audioUrl, logEvent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Resize canvas to container size & update internal pixel size
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentNode.getBoundingClientRect(); // use parent container size

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

    analyserRef.current = analyser;
    audioCtxRef.current = audioCtx;

    return () => {
      audio.pause();
      audio.src = '';
      cancelAnimationFrame(animationRef.current);
      audioCtx.close();
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
        const y = (v * rect.height) / 2;

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
      logEvent ("toggle pause")
      cancelAnimationFrame(animationRef.current);
    } else {
      audio.play();
      logEvent ("toggle play")
      drawWaveform();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className="flex flex-col gap-3"
      style={{ width: '100%', height: '100px' }} // fixed height here but full width
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
        className="rounded-xl overflow-hidden"
      />
      <button
        onClick={togglePlayback}
        className="flex items-center gap-2 bg-[var(--sound-button)] text-[var(--font-white)] px-4 py-2 rounded-xl hover:bg-[#4a4a4a] transition"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default AudioPlayer;
