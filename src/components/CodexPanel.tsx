import React, { useState, useEffect } from 'react';
import { X, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { MythologyType } from '../hooks/useSynthAudio';

interface CodexPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeMyth: MythologyType;
}

const CODEX_DATA = {
  greek: {
    title: 'Zeus',
    subtitle: 'Ruler of Mount Olympus',
    lore: 'Zeus is the king of the Olympian Gods in Greek mythology. He rules the sky, thunder, and lightning, maintaining cosmic order and justice from his high throne on Mount Olympus. Rising up to overthrow his titan father Cronus, Zeus secured dominion over all immortals.',
    stats: [
      { name: 'Celestial Power', value: 95 },
      { name: 'Authority', value: 98 },
      { name: 'Lightning Mastery', value: 100 },
      { name: 'Ethereal Grace', value: 80 }
    ],
    legend: {
      relic: 'The Master Bolt',
      desc: 'Forged by the elder Cyclopes in the volcanic fires of Tartarus during the Titanomachy, the Master Bolt is the ultimate weapon of the heavens. It possesses the capability to shred mountains, disperse storm clouds, and disintegrate titanic forces. It represents pure, unbridled celestial authority.'
    }
  },
  norse: {
    title: 'Odin',
    subtitle: 'The Allfather of Asgard',
    lore: 'Odin is the chief ruler of Asgard and the supreme deity in Norse mythology. Known as the Allfather, he is a complex god of wisdom, war, poetry, and magic, who famously traded his right eye at Mimirs Well to drink the water of cosmic insight and hanged himself from Yggdrasil to unlock the secrets of the Runes.',
    stats: [
      { name: 'Cosmic Wisdom', value: 100 },
      { name: 'Runecraft Magic', value: 95 },
      { name: 'Battle Tactics', value: 90 },
      { name: 'Soul Sight', value: 88 }
    ],
    legend: {
      relic: 'Gungnir & Runestones',
      desc: 'Gungnir is Odins magical spear, forged by the dwarf craftsmen (Sons of Ivaldi). It is balanced so perfectly that it never misses its target, regardless of the wielders strength or wind conditions. Engraved with ancient runes, it channels cosmic law and seals contracts.'
    }
  },
  egyptian: {
    title: 'Anubis',
    subtitle: 'Guardian of the Scales',
    lore: 'Anubis is the ancient Egyptian god of mummification, graves, and guide of the dead. Depicted as a jackal or a jackal-headed man, he watches over the transitional state of the soul, guarding the gates of Duat and ensuring that only the worthy pass into the sacred afterlife (Aaru).',
    stats: [
      { name: 'Underworld Mastery', value: 95 },
      { name: 'Spiritual Judgment', value: 100 },
      { name: 'Death Alchemy', value: 92 },
      { name: 'Crypt Secrets', value: 90 }
    ],
    legend: {
      relic: 'The Scales of Maat',
      desc: 'In the Hall of Two Truths, Anubis weighs the hearts of the deceased against the white ostrich Feather of Truth (Maat). If the heart is heavier than the feather, it contains too much sin and is devoured by the beast Ammit, denying the soul eternal life.'
    }
  },
  japanese: {
    title: 'Amaterasu',
    subtitle: 'Goddess of the Sun',
    lore: 'Amaterasu is the core sun goddess of Shinto mythology, ruling over the Plain of High Heaven (Takamanohara). Symbolizing warmth, light, and agricultural fertility, she famously withdrew into the Heavenly Rock Cave, casting the cosmos into shadow until she was lured back out by a sacred bronze mirror.',
    stats: [
      { name: 'Solar Radiance', value: 98 },
      { name: 'Divine Purity', value: 96 },
      { name: 'Imperial Virtue', value: 94 },
      { name: 'Mirror Sight', value: 90 }
    ],
    legend: {
      relic: 'Yata no Kagami',
      desc: 'The eight-span sacred bronze mirror representing wisdom, truth, and celestial light. It is one of the three Imperial Regalia of Japan, with the mystical power to reveal the inner state of the soul and reflect absolute divine light to dispel spiritual darkness.'
    }
  }
};

// Staggered list container variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 120, damping: 15 } 
  }
};

export const CodexPanel: React.FC<CodexPanelProps> = ({
  isOpen,
  onClose,
  activeMyth,
}) => {
  const [activeTab, setActiveTab] = useState<'lore' | 'stats' | 'relic'>('lore');
  const data = CODEX_DATA[activeMyth];

  useEffect(() => {
    setActiveTab('lore');
  }, [activeMyth]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Clicker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 110,
              background: 'rgba(0, 0, 0, 0.4)',
              cursor: 'zoom-out',
            }}
          />

          {/* Sliding Panel with custom Spring Damping curve */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 18, stiffness: 120 }}
            className="codex-panel"
          >
            {/* Custom vertical glowing sweep border */}
            <div className="codex-sweep-border" />

            <div className="codex-header">
              <div>
                <span className="myth-eyebrow" style={{ fontSize: '0.8rem' }}>{data.subtitle}</span>
                <h2 className="codex-title" style={{ fontFamily: 'Cinzel, serif' }}>{data.title}</h2>
              </div>
              <button className="close-btn" onClick={onClose} aria-label="Close Codex">
                <X size={24} />
              </button>
            </div>

            <div className="codex-tabs">
              <button
                className={`codex-tab ${activeTab === 'lore' ? 'active' : ''}`}
                onClick={() => setActiveTab('lore')}
              >
                LORE
              </button>
              <button
                className={`codex-tab ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                ATTRIBUTES
              </button>
              <button
                className={`codex-tab ${activeTab === 'relic' ? 'active' : ''}`}
                onClick={() => setActiveTab('relic')}
              >
                SACRED RELIC
              </button>
            </div>

            <div className="codex-content">
              <AnimatePresence mode="wait">
                {activeTab === 'lore' && (
                  <motion.div
                    key="lore"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                  >
                    <motion.p 
                      variants={itemVariants} 
                      style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontWeight: 300 }}
                    >
                      {data.lore}
                    </motion.p>
                    <motion.div 
                      variants={itemVariants}
                      style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '1rem', alignItems: 'center' }}
                    >
                      <Sparkles size={24} style={{ color: 'var(--greek-primary)', flexShrink: 0 }} />
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                        Drag/rotate the 3D relic in the background to inspect its ancient craft.
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="stats-list"
                  >
                    {data.stats.map((stat) => (
                      <motion.div className="stat-item" key={stat.name} variants={itemVariants}>
                        <div className="stat-header">
                          <span>{stat.name}</span>
                          <span>{stat.value}%</span>
                        </div>
                        <div className="stat-bar-container">
                          <motion.div
                            className="stat-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'relic' && (
                  <motion.div
                    key="relic"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                  >
                    <motion.h3 
                      variants={itemVariants}
                      style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Shield size={18} />
                      {data.legend.relic}
                    </motion.h3>
                    <motion.p 
                      variants={itemVariants}
                      style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontWeight: 300 }}
                    >
                      {data.legend.desc}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
