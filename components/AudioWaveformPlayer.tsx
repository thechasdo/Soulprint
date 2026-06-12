"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";

interface AudioWaveformPlayerProps {
  src: string;
  title?: string;
  durationText?: string;
}

export function AudioWaveformPlayer({ src, title = "Voice Recording", durationText }: AudioWaveformPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Generate 40 pseudo-random bars for the waveform
  const [barHeights] = useState(() => 
    Array.from({ length: 45 }, () => Math.random() * 0.6 + 0.15)
  );

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [src]);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current.play().catch(err => console.error("Audio play failed:", err));
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play().catch(err => console.error("Audio play failed:", err));
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleScrub = (index: number) => {
    if (!audioRef.current || duration === 0) return;
    const targetPercentage = index / barHeights.length;
    const targetTime = targetPercentage * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const currentPercentage = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="rounded-[2rem] border border-navy/10 bg-gradient-to-br from-white to-cream/30 p-6 shadow-glow">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-seafoam">Voice Archive</p>
          <h4 className="mt-1 font-black text-navy text-lg">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="rounded-full p-2.5 text-navy/60 hover:bg-cream hover:text-navy transition-all"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button 
            onClick={restart}
            className="rounded-full p-2.5 text-navy/60 hover:bg-cream hover:text-navy transition-all"
            aria-label="Restart audio"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="my-8 flex h-16 items-center justify-between gap-[3px] px-2">
        {barHeights.map((height, idx) => {
          const barProgress = idx / barHeights.length;
          const isActive = barProgress <= currentPercentage;
          
          // Animate height slightly if playing and active
          const animatedHeight = isPlaying && isActive
            ? height * (1 + Math.sin(currentTime * 8 + idx) * 0.15)
            : height;

          return (
            <button
              key={idx}
              onClick={() => handleScrub(idx)}
              className="flex-1 group relative h-full flex items-center justify-center focus:outline-none"
              style={{ height: "100%" }}
            >
              <div 
                className={`w-full rounded-full transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-t from-seafoam to-sunset shadow-[0_0_8px_rgba(242,100,25,0.2)]" 
                    : "bg-navy/10 group-hover:bg-navy/20"
                }`}
                style={{ 
                  height: `${animatedHeight * 100}%`,
                  transition: isPlaying ? "height 100ms ease-out" : "all 300ms ease-out"
                }}
              />
              <span className="absolute -top-6 hidden group-hover:block rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
                {formatTime((idx / barHeights.length) * duration)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-black tracking-widest text-navy/50">
          {formatTime(currentTime)} / {durationText || formatTime(duration)}
        </span>
        <button
          onClick={togglePlay}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-glow transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-white" />
          ) : (
            <Play className="h-6 w-6 fill-white translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
