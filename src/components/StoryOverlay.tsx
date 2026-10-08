import React from 'react';
import { Eye } from 'lucide-react';

interface StoryOverlayProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onOpenCodex: () => void;
  onRelicAction: (action: 'lightning' | 'rune' | 'scale' | 'sunbeam') => void;
}

export const StoryOverlay: React.FC<StoryOverlayProps> = ({
  scrollContainerRef,
  onScroll,
  onOpenCodex,
  onRelicAction,
}) => {
  return (
    <div 
      className="scroll-container" 
      ref={scrollContainerRef}
      onScroll={onScroll}
    >
      {/* SECTION 1: GREEK (ZEUS) */}
      <section className="section">
        <div className="glass-panel" style={{ maxWidth: '520px' }}>
          <span className="myth-eyebrow">GREEK CHRONICLES</span>
          <h1 className="myth-title">ZEUS</h1>
          <p className="myth-desc">
            Ascend to the summit of Mount Olympus, where golden pillars split the sky. 
            Here, the king of gods channels absolute power, holding the universe in balance 
            with the crackle of his Master Bolt.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-myth" onClick={() => onRelicAction('lightning')}>
              SUMMON THUNDER
            </button>
            <button 
              className="btn-myth" 
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}
              onClick={onOpenCodex}
            >
              <Eye size={16} /> LORE DETAILS
            </button>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>DESCEND TO ASGARD</span>
          <div className="scroll-indicator-mouse">
            <div className="scroll-indicator-wheel" />
          </div>
        </div>
      </section>

      {/* SECTION 2: NORSE (ODIN) */}
      <section className="section">
        <div className="glass-panel" style={{ maxWidth: '520px' }}>
          <span className="myth-eyebrow">NORSE CHRONICLES</span>
          <h1 className="myth-title">ODIN</h1>
          <p className="myth-desc">
            Cross the Bifrost Rainbow Bridge to the cosmic halls of Valhalla. 
            The Allfather sits upon Hlidskjalf, deciphering runes of runic magic 
            and clutching Gungnir, the spear of cosmic destiny.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-myth" onClick={() => onRelicAction('rune')}>
              TRANSLATE RUNE
            </button>
            <button 
              className="btn-myth" 
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}
              onClick={onOpenCodex}
            >
              <Eye size={16} /> LORE DETAILS
            </button>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>DESCEND TO DUAT</span>
          <div className="scroll-indicator-mouse">
            <div className="scroll-indicator-wheel" />
          </div>
        </div>
      </section>

      {/* SECTION 3: EGYPTIAN (ANUBIS) */}
      <section className="section">
        <div className="glass-panel" style={{ maxWidth: '520px' }}>
          <span className="myth-eyebrow">EGYPTIAN CHRONICLES</span>
          <h1 className="myth-title">ANUBIS</h1>
          <p className="myth-desc">
            Pass through the shadow gates of Duat into the Hall of Truth. 
            Anubis, the jackal guardian, stands over the Scales of Fate, 
            awaiting the hearts of mortals to judge their eternal souls.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-myth" onClick={() => onRelicAction('scale')}>
              WEIGH SOUL
            </button>
            <button 
              className="btn-myth" 
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}
              onClick={onOpenCodex}
            >
              <Eye size={16} /> LORE DETAILS
            </button>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>ASCEND TO TAKAMANOHARA</span>
          <div className="scroll-indicator-mouse">
            <div className="scroll-indicator-wheel" />
          </div>
        </div>
      </section>

      {/* SECTION 4: JAPANESE (AMATERASU) */}
      <section className="section">
        <div className="glass-panel" style={{ maxWidth: '520px' }}>
          <span className="myth-eyebrow">JAPANESE CHRONICLES</span>
          <h1 className="myth-title">AMATERASU</h1>
          <p className="myth-desc">
            Ascend to the Plain of High Heaven, Takamanohara, where cherry blossoms drift.
            Amaterasu, goddess of the sun, projects radiant warmth, casting dawn light
            across the lands with the sacred reflection of her Yata no Kagami.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-myth" onClick={() => onRelicAction('sunbeam')}>
              SHINE SUNBEAM
            </button>
            <button 
              className="btn-myth" 
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}
              onClick={onOpenCodex}
            >
              <Eye size={16} /> LORE DETAILS
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
