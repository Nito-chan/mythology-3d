import React from 'react';
import { BookOpen } from 'lucide-react';
import type { MythologyType } from '../hooks/useSynthAudio';

interface NavigationProps {
  activeMyth: MythologyType;
  onNavigate: (myth: MythologyType) => void;
  onOpenCodex: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeMyth,
  onNavigate,
  onOpenCodex,
}) => {
  return (
    <nav className="nav-container">
      <div className="logo" onClick={() => onNavigate('greek')}>
        PANTHEON
      </div>
      
      <div className="nav-links">
        <button
          className={`nav-link ${activeMyth === 'greek' ? 'active' : ''}`}
          onClick={() => onNavigate('greek')}
        >
          OLYMPUS
        </button>
        <button
          className={`nav-link ${activeMyth === 'norse' ? 'active' : ''}`}
          onClick={() => onNavigate('norse')}
        >
          ASGARD
        </button>
        <button
          className={`nav-link ${activeMyth === 'egyptian' ? 'active' : ''}`}
          onClick={() => onNavigate('egyptian')}
        >
          DUAT
        </button>
        <button
          className={`nav-link ${activeMyth === 'japanese' ? 'active' : ''}`}
          onClick={() => onNavigate('japanese')}
        >
          TAKAMANOHARA
        </button>
      </div>

      <button
        className="btn-myth"
        style={{ pointerEvents: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}
        onClick={onOpenCodex}
      >
        <BookOpen size={16} />
        CODEX
      </button>
    </nav>
  );
};
