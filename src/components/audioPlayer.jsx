import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react'
import { Howl } from 'howler';
import SiriWave from 'siriwave';


const AudioPlayer = ({audioUrl}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const howlRef = useRef(null);
    const waveRef = useRef(null);
    const siriRef = useRef(null);

    useEffect(() => {
      const sound = new Howl({
        src: [audioUrl],
        html5: true,
        onend: () => {
          setIsPlaying(false);
          siriRef.current?.stop();
        },
        onplay: () => {
          siriRef.current?.start();
          setIsPlaying(true);
        },
        onpause: () => {
          siriRef.current?.stop();
          setIsPlaying(false);
        },
        onstop: () => {
          siriRef.current?.stop();
          setIsPlaying(false);
        },
      });

      howlRef.current = sound;

      siriRef.current = new SiriWave({
        container: waveRef.current,
        style: 'ios',
        height: 100,
        amplitude: 1,
        speed: 0,
        autostart: false,
      });

      return () => {
        sound.unload();
        siriRef.current?.stop();
      };
    }, [audioUrl]);

    const togglePlayback = () => {
      const sound = howlRef.current;
      if (!sound) return;

      if (isPlaying) {
        sound.pause();
      } else {
        sound.play();
      }
    };

    return (
        <div className="flex flex-col gap-3">
        <div ref={waveRef} className="rounded-xl overflow-hidden bg-amber-50" />
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