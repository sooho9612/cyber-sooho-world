import { useEffect, useRef, useState } from 'react';
import { ASSETS } from '../config/assets';
import type { MusicTrack } from '../types';

export function useAudioPlayer() {
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('player_volume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current && playlist.length > 0 && playlist[currentTrackIndex]) {
      audioRef.current.src = playlist[currentTrackIndex].url;
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex, playlist]);

  useEffect(() => {
    clickSoundRef.current = new Audio(ASSETS.clickSound);
    clickSoundRef.current.volume = 0.5;
    const handleClick = () => {
      if (clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (audioRef.current && playlist.length > 0) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex((currentTrackIndex + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex((currentTrackIndex - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('player_volume', newVolume.toString());
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    handleNext();
  };

  const handleSetPlaylist = (newTracks: MusicTrack[], startIndex = 0) => {
    setPlaylist(newTracks);
    setCurrentTrackIndex(startIndex);
    setIsPlaying(true);
  };

  return {
    audioRef,
    playlist,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    formatTime,
    togglePlayPause,
    handleStop,
    handleNext,
    handlePrev,
    handleVolumeChange,
    handleTimeUpdate,
    handleAudioEnded,
    handleSetPlaylist,
  };
}
