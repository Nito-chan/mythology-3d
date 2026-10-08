import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Olympus } from './realms/Olympus';
import { Asgard } from './realms/Asgard';
import { Duat } from './realms/Duat';
import { Takamanohara } from './realms/Takamanohara';
import type { MythologyType } from '../hooks/useSynthAudio';

interface Canvas3DProps {
  activeMyth: MythologyType;
  isCodexOpen: boolean;
  relicAction: 'lightning' | 'rune' | 'scale' | 'sunbeam' | null;
  onRelicActionComplete: () => void;
}

// Camera coordinates for each mythology (Offset target to sit in the right 58% of screen)
const CAMERA_PRESETS = {
  greek: {
    pos: new THREE.Vector3(-1.3, 1.8, 6.8),
    look: new THREE.Vector3(1.1, 0.8, 0),
    orbitTarget: [1.1, 0.8, 0] as [number, number, number]
  },
  norse: {
    pos: new THREE.Vector3(23.7, -7.5, -17.5),
    look: new THREE.Vector3(26.1, -9.1, -25),
    orbitTarget: [26.1, -9.1, -25] as [number, number, number]
  },
  egyptian: {
    pos: new THREE.Vector3(-26.3, 12.5, -8.0),
    look: new THREE.Vector3(-23.9, 10.9, -15),
    orbitTarget: [-23.9, 10.9, -15] as [number, number, number]
  },
  japanese: {
    pos: new THREE.Vector3(-1.3, 26.8, -33.2),
    look: new THREE.Vector3(1.1, 25.8, -40),
    orbitTarget: [1.1, 25.8, -40] as [number, number, number]
  }
};

// Sub-component to manage camera interpolation and camera shake VFX
const SceneCamera: React.FC<{ 
  activeMyth: MythologyType; 
  isCodexOpen: boolean;
  relicAction: 'lightning' | 'rune' | 'scale' | 'sunbeam' | null;
}> = ({
  activeMyth,
  isCodexOpen,
  relicAction
}) => {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(1.1, 0.8, 0));
  const shakeOffset = useRef(new THREE.Vector3(0, 0, 0));

  // Keep track of the GSAP-animated camera targets
  const gsapTargetPos = useRef(CAMERA_PRESETS[activeMyth].pos.clone());
  const gsapTargetLook = useRef(CAMERA_PRESETS[activeMyth].look.clone());

  // Initialize camera facing
  useEffect(() => {
    camera.lookAt(currentLookAt.current);
  }, [camera]);

  // Smoothly animate target settings on realm switch using GSAP
  useEffect(() => {
    const preset = CAMERA_PRESETS[activeMyth];

    gsap.killTweensOf(gsapTargetPos.current);
    gsap.killTweensOf(gsapTargetLook.current);

    gsap.to(gsapTargetPos.current, {
      x: preset.pos.x,
      y: preset.pos.y,
      z: preset.pos.z,
      duration: 1.8,
      ease: 'power2.out'
    });

    gsap.to(gsapTargetLook.current, {
      x: preset.look.x,
      y: preset.look.y,
      z: preset.look.z,
      duration: 1.8,
      ease: 'power2.out'
    });
  }, [activeMyth]);

  useFrame(() => {
    // Only lerp camera target if OrbitControls is not taking override priority (when Codex drawer is closed)
    if (!isCodexOpen) {
      // Calculate high-frequency screen shake offset during Greek lightning strike or solar flare
      if ((activeMyth === 'greek' && relicAction === 'lightning') || (activeMyth === 'japanese' && relicAction === 'sunbeam')) {
        const shakeMult = activeMyth === 'greek' ? 0.22 : 0.12;
        shakeOffset.current.set(
          (Math.random() - 0.5) * shakeMult,
          (Math.random() - 0.5) * shakeMult,
          (Math.random() - 0.5) * (shakeMult * 0.4)
        );
      } else {
        // Smoothly fade back out
        shakeOffset.current.lerp(new THREE.Vector3(0, 0, 0), 0.15);
      }

      // Add shake offset to target positions
      const targetPos = gsapTargetPos.current.clone().add(shakeOffset.current);
      camera.position.lerp(targetPos, 0.05);
      
      currentLookAt.current.lerp(gsapTargetLook.current, 0.05);
      camera.lookAt(currentLookAt.current);
    }
  });

  return null;
};

export const Canvas3D: React.FC<Canvas3DProps> = ({
  activeMyth,
  isCodexOpen,
  relicAction,
  onRelicActionComplete,
}) => {
  const activePreset = CAMERA_PRESETS[activeMyth];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2, pointerEvents: 'none' }}>
      <Canvas
        shadows
        camera={{ fov: 45, near: 0.1, far: 100, position: [-1.3, 1.8, 6.8] }}
        style={{ pointerEvents: 'auto' }} // Allow mouse events
      >
        {/* Deep Space Background stars */}
        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0.5} fade speed={1.5} />
        
        {/* Ambient base lighting */}
        <ambientLight intensity={0.45} />
        
        {/* Camera coordinator */}
        <SceneCamera activeMyth={activeMyth} isCodexOpen={isCodexOpen} relicAction={relicAction} />

        {/* 3D Realms */}
        <Olympus 
          relicActionActive={relicAction === 'lightning'} 
          onActionComplete={onRelicActionComplete} 
        />
        <Asgard 
          relicActionActive={relicAction === 'rune'} 
          onActionComplete={onRelicActionComplete} 
        />
        <Duat 
          relicActionActive={relicAction === 'scale'} 
          onActionComplete={onRelicActionComplete} 
        />
        <Takamanohara 
          relicActionActive={relicAction === 'sunbeam'} 
          onActionComplete={onRelicActionComplete} 
        />

        {/* Orbit inspection controls active at all times */}
        <OrbitControls 
          enableZoom={true} 
          minDistance={3} 
          maxDistance={15} 
          target={activePreset.orbitTarget}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
};
