import { useState, useRef } from 'react';
import { Canvas3D } from './components/Canvas3D';
import { Navigation } from './components/Navigation';
import { StoryOverlay } from './components/StoryOverlay';
import { CodexPanel } from './components/CodexPanel';
import { AudioPlayer } from './components/AudioPlayer';
import { useSynthAudio } from './hooks/useSynthAudio';
import type { MythologyType } from './hooks/useSynthAudio';

function App() {
  const { isPlaying, togglePlay, activeMyth, setMythology } = useSynthAudio();
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [relicAction, setRelicAction] = useState<'lightning' | 'rune' | 'scale' | 'sunbeam' | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize body styles with active mythology
  const getThemeClass = () => {
    switch (activeMyth) {
      case 'greek': return 'theme-olympus greek-active';
      case 'norse': return 'theme-asgard norse-active';
      case 'egyptian': return 'theme-duat egyptian-active';
      case 'japanese': return 'theme-takamanohara japanese-active';
      default: return 'theme-olympus greek-active';
    }
  };

  // Synchronize scroll snap position to state
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    
    // Determine current index based on scroll height
    const index = Math.round(scrollTop / height);
    const myths: MythologyType[] = ['greek', 'norse', 'egyptian', 'japanese'];
    
    if (myths[index] && myths[index] !== activeMyth) {
      setMythology(myths[index]);
    }
  };

  // Trigger smooth scroll when nav items are clicked
  const handleNavigate = (myth: MythologyType) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const myths: MythologyType[] = ['greek', 'norse', 'egyptian', 'japanese'];
    const index = myths.indexOf(myth);
    const targetScroll = index * container.clientHeight;

    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
    
    // Explicitly update state if container hasn't scrolled (e.g. already there)
    setMythology(myth);
  };

  // Relic actions trigger
  const handleRelicAction = (action: 'lightning' | 'rune' | 'scale' | 'sunbeam') => {
    setRelicAction(action);
  };

  const handleRelicActionComplete = () => {
    setRelicAction(null);
  };

  return (
    <div className={`ambient-glow ${getThemeClass()}`} style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      
      {/* 3D WebGL Canvas Layer */}
      <Canvas3D 
        activeMyth={activeMyth}
        isCodexOpen={isCodexOpen}
        relicAction={relicAction}
        onRelicActionComplete={handleRelicActionComplete}
      />

      {/* Persistent Floating Navigation Header Overlay */}
      <Navigation 
        activeMyth={activeMyth}
        onNavigate={handleNavigate}
        onOpenCodex={() => setIsCodexOpen(true)}
      />

      {/* Scrolling Text Chronology Timeline Layer */}
      <StoryOverlay 
        scrollContainerRef={scrollContainerRef}
        onScroll={handleScroll}
        onOpenCodex={() => setIsCodexOpen(true)}
        onRelicAction={handleRelicAction}
      />

      {/* Floating Audio Ambient Synthesizer Overlay */}
      <AudioPlayer 
        isPlaying={isPlaying}
        togglePlay={togglePlay}
      />

      {/* Side Slide-out Detailed Codex Panel */}
      <CodexPanel 
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        activeMyth={activeMyth}
      />
    </div>
  );
}

export default App;
