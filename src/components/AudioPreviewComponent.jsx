import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

const AudioPreviewComponent = ({ Audio }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!waveformRef.current || !Audio) return;

    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      url: Audio,
      waveColor: 'rgba(180, 140, 255, 0.3)',
      progressColor: 'rgba(200, 160, 255, 0.8)',
      cursorWidth: 0,
      height: containerRef.current ? containerRef.current.offsetHeight / 2 : 100,
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      interact: true,
      normalize: true,
      fillParent: true,
      renderFunction: (channels, ctx) => {
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);

        const centerY = height / 2;
        const channel = channels[0];

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(180, 140, 255, 0.15)');
        gradient.addColorStop(0.5, 'rgba(200, 160, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(180, 140, 255, 0.15)');

        ctx.fillStyle = gradient;
        ctx.beginPath();

        for (let i = 0; i < channel.length; i++) {
          const x = (i / channel.length) * width;
          const y = centerY - Math.abs(channel[i]) * centerY * 0.9;
          ctx.lineTo(x, y);
        }

        for (let i = channel.length - 1; i >= 0; i--) {
          const x = (i / channel.length) * width;
          const y = centerY + Math.abs(channel[i]) * centerY * 0.9;
          ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(180, 140, 255, 0.7)';
      }
    });

    wavesurferRef.current.on('ready', () => {
      console.log('Audio ready');
    });

    wavesurferRef.current.on('play', () => setIsPlaying(true));
    wavesurferRef.current.on('pause', () => setIsPlaying(false));
    wavesurferRef.current.on('finish', () => setIsPlaying(false));

    return () => wavesurferRef.current?.destroy();
  }, [Audio]);

  const togglePlayback = () => {
    if (Audio) wavesurferRef.current?.playPause();
  };

  const isDisabled = !Audio;

  return (
  <div
    className={`flex flex-col rounded-3xl p-5 h-2/5 gap-3 transition-all duration-200 
      bg-[var(--accent-color-7)] shadow-[0_0_20px_rgba(180,140,255,0.1)]
      ${isDisabled ? 'pointer-events-none' : ''}
    `}
  >
    <h1 className="text-base font-bold text-[var(--accent-color-1)]">Audio Preview</h1>

    <div ref={containerRef} className="flex flex-col flex-grow relative gap-1">
      <div 
        ref={waveformRef} 
        className="flex-grow-[0.5] min-h-[100px] z-10"
      />

      <div className="flex justify-center mt-2">
        <button
          onClick={togglePlayback}
          disabled={isDisabled}
          className={`rounded-full p-3 transition-all duration-200
            ${isDisabled
              ? 'bg-[rgba(180,140,255,0.05)] border-[rgba(180,140,255,0.1)] cursor-not-allowed'
              : 'bg-[rgba(180,140,255,0.15)] hover:bg-[rgba(180,140,255,0.25)] border border-[rgba(180,140,255,0.3)] shadow-[0_0_15px_rgba(180,140,255,0.3)]'
            }`}
        >
          {isPlaying ? (
            <div className="w-5 h-5 flex items-center justify-center">
              <div className="w-1 h-5 bg-[var(--accent-color-1)] mx-[2px] rounded-sm"/>
              <div className="w-1 h-5 bg-[var(--accent-color-1)] mx-[2px] rounded-sm"/>
            </div>
          ) : (
            <div className="w-0 h-0 
              border-t-[7px] border-t-transparent
              border-l-[12px] border-l-[var(--accent-color-1)]
              border-b-[7px] border-b-transparent
              translate-x-[1px]"
            />
          )}
        </button>
      </div>
    </div>
  </div>
);
}
export default AudioPreviewComponent;
