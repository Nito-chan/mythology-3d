import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  isPlaying: boolean;
  togglePlay: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  togglePlay,
}) => {
  return (
    <div className="audio-control-container">
      <button 
        className="audio-btn" 
        onClick={togglePlay} 
        aria-label={isPlaying ? 'Mute audio' : 'Unmute audio'}
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
      
      <div className="visualizer-bars">
        <div className={`vis-bar ${isPlaying ? 'playing' : ''}`} />
        <div className={`vis-bar ${isPlaying ? 'playing' : ''}`} />
        <div className={`vis-bar ${isPlaying ? 'playing' : ''}`} />
        <div className={`vis-bar ${isPlaying ? 'playing' : ''}`} />
        <div className={`vis-bar ${isPlaying ? 'playing' : ''}`} />
      </div>
    </div>
  );
};
