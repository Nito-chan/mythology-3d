import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TakamanoharaProps {
  relicActionActive: boolean;
  onActionComplete: () => void;
}

export const Takamanohara: React.FC<TakamanoharaProps> = ({
  relicActionActive,
  onActionComplete,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const mirrorRef = useRef<THREE.Group>(null);
  const sunbeamRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const sakuraRef = useRef<THREE.Points>(null);

  const [sunbeamOpacity, setSunbeamOpacity] = useState(0);

  // Trigger sunbeam pulse
  useEffect(() => {
    if (relicActionActive) {
      // Step 1: Ramp up sunbeam opacity
      setSunbeamOpacity(0.85);

      // Step 2: Gradually fade out sunbeam
      const fadeTimer = setTimeout(() => {
        setSunbeamOpacity(0);
        onActionComplete();
      }, 2500);

      return () => clearTimeout(fadeTimer);
    }
  }, [relicActionActive, onActionComplete]);

  // Sakura petal count and initial positions / speeds
  const petalCount = 120;
  const petalData = useMemo(() => {
    const data = [];
    for (let i = 0; i < petalCount; i++) {
      data.push({
        x: (Math.random() - 0.5) * 6,
        y: Math.random() * 6 - 2, // Y height relative to center
        z: (Math.random() - 0.5) * 6,
        speedY: 0.4 + Math.random() * 0.5,
        speedX: 0.1 + Math.random() * 0.2,
        swaySpeed: 0.5 + Math.random() * 1.5,
        swayOffset: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, [petalCount]);

  // Initialize buffer attributes
  const [initialPositions] = useMemo(() => {
    const pos = new Float32Array(petalCount * 3);
    for (let i = 0; i < petalCount; i++) {
      pos[i * 3] = petalData[i].x;
      pos[i * 3 + 1] = petalData[i].y;
      pos[i * 3 + 2] = petalData[i].z;
    }
    return [pos];
  }, [petalData, petalCount]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Floating animation for the whole realm
    if (groupRef.current) {
      groupRef.current.position.y = 25 + Math.sin(t * 0.4) * 0.12;
      groupRef.current.rotation.y = t * 0.025;
    }

    // Mirror spin and hover
    if (mirrorRef.current) {
      mirrorRef.current.rotation.y = Math.sin(t * 0.5) * 0.2 + t * 0.3;
      mirrorRef.current.position.y = 0.9 + Math.sin(t * 1.8) * 0.06;
    }

    // Pulsing point light intensity
    if (pointLightRef.current) {
      pointLightRef.current.intensity = relicActionActive 
        ? 6.0 + Math.sin(t * 22) * 2.0 
        : 2.2 + Math.sin(t * 2.5) * 0.3;
    }

    // Volumetric sunbeam lerping
    if (sunbeamRef.current) {
      const material = sunbeamRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = THREE.MathUtils.lerp(material.opacity, sunbeamOpacity, 0.08);
      // Scale sunbeam size when active
      const targetScale = relicActionActive ? 1.0 : 0.01;
      sunbeamRef.current.scale.x = THREE.MathUtils.lerp(sunbeamRef.current.scale.x, targetScale, 0.06);
      sunbeamRef.current.scale.y = THREE.MathUtils.lerp(sunbeamRef.current.scale.y, targetScale, 0.06);
      sunbeamRef.current.scale.z = THREE.MathUtils.lerp(sunbeamRef.current.scale.z, targetScale, 0.06);
    }

    // Cherry blossoms falling/swirling animation
    if (sakuraRef.current) {
      const geom = sakuraRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;

      for (let i = 0; i < petalCount; i++) {
        const data = petalData[i];

        if (relicActionActive) {
          // Vortex Swirl around the mirror [0, 0.9, 0]
          const targetY = 0.9 + Math.sin(t * 2 + i) * 0.8;
          // Angular orbital speed
          const angle = t * 3.5 + i * 0.12;
          const radius = 0.4 + (i % 5) * 0.25;

          // Set positions swirling in spiral
          posAttr.setX(i, Math.cos(angle) * radius);
          posAttr.setY(i, targetY);
          posAttr.setZ(i, Math.sin(angle) * radius);
        } else {
          // Natural drift downward and sideways
          data.y -= data.speedY * delta;
          data.x += Math.sin(t * data.swaySpeed + data.swayOffset) * 0.2 * delta;
          data.z += Math.cos(t * data.swaySpeed + data.swayOffset) * 0.1 * delta;

          // Reset if it drops too low
          if (data.y < -1.8) {
            data.y = 3.5;
            data.x = (Math.random() - 0.5) * 6;
            data.z = (Math.random() - 0.5) * 6;
          }

          posAttr.setX(i, data.x);
          posAttr.setY(i, data.y);
          posAttr.setZ(i, data.z);
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 25, -40]}>
      {/* Lights */}
      <pointLight 
        ref={pointLightRef} 
        position={[0, 0.9, 0]} 
        color="#ff8f00" 
        intensity={2.2} 
        distance={15} 
        castShadow 
      />
      <directionalLight position={[5, 10, -5]} intensity={1.5} color="#ffe082" />

      {/* Volumetric Sunbeam cone shooting forward towards camera */}
      <mesh ref={sunbeamRef} position={[0, 0.9, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1.3, 3.8, 16, 1, true]} />
        <meshBasicMaterial 
          color="#ffb74d" 
          transparent 
          opacity={0} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Big glowing red sun disk backdrop (Japanese theme icon) */}
      <mesh position={[0, 2.5, -4.5]} rotation={[0, 0, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial 
          color="#ff1744" 
          transparent 
          opacity={0.65} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Sakura petals points particle system */}
      <points ref={sakuraRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ff80ab" 
          size={0.065} 
          sizeAttenuation 
          transparent 
          opacity={0.8} 
        />
      </points>

      {/* Floating Architecture */}
      <group ref={groupRef}>
        
        {/* Shinto Floating Wood Deck Platform */}
        <mesh position={[0, -0.2, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.6, 2.8, 0.35, 8]} />
          <meshStandardMaterial color="#8d6e63" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Black Lacquered Deck Border */}
        <mesh position={[0, -0.015, 0]}>
          <cylinderGeometry args={[2.62, 2.62, 0.05, 8, 1, true]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Golden Base Ring Decor */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
        </mesh>

        {/* ----------------- 3D SHINTO TORII GATE ----------------- */}
        <group position={[0, 0, -1.0]}>
          {/* Left Pillar */}
          <mesh position={[-0.8, 0.8, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.06, 0.08, 1.8, 8]} />
            <meshStandardMaterial color="#ff3d00" roughness={0.25} metalness={0.1} />
          </mesh>
          {/* Right Pillar */}
          <mesh position={[0.8, 0.8, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.06, 0.08, 1.8, 8]} />
            <meshStandardMaterial color="#ff3d00" roughness={0.25} metalness={0.1} />
          </mesh>
          {/* Left base column (Black) */}
          <mesh position={[-0.8, -0.01, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.12, 8]} />
            <meshStandardMaterial color="#1e1e1e" roughness={0.6} />
          </mesh>
          {/* Right base column (Black) */}
          <mesh position={[0.8, -0.01, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.12, 8]} />
            <meshStandardMaterial color="#1e1e1e" roughness={0.6} />
          </mesh>
          {/* Lower Crossbar (Nuki) */}
          <mesh position={[0, 1.35, 0]} castShadow>
            <boxGeometry args={[1.8, 0.07, 0.07]} />
            <meshStandardMaterial color="#ff3d00" roughness={0.2} />
          </mesh>
          {/* Top Lintel (Kasagi) */}
          <mesh position={[0, 1.72, 0]} castShadow>
            <boxGeometry args={[2.2, 0.11, 0.13]} />
            <meshStandardMaterial color="#212121" roughness={0.35} metalness={0.2} />
          </mesh>
          {/* Top Lintel gold cap trim left */}
          <mesh position={[-1.1, 1.72, 0]}>
            <boxGeometry args={[0.04, 0.12, 0.14]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Top Lintel gold cap trim right */}
          <mesh position={[1.1, 1.72, 0]}>
            <boxGeometry args={[0.04, 0.12, 0.14]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* ----------------- YATA NO KAGAMI (SACRED MIRROR) ----------------- */}
        <group ref={mirrorRef} position={[0, 0.9, 0]} rotation={[0, 0, 0]}>
          {/* Bronze Mirror Outer Casing */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
            <meshStandardMaterial color="#b58d3d" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Decorative Backside ridges / knobs representation */}
          <mesh position={[0, 0, -0.026]} castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.012, 8]} />
            <meshStandardMaterial color="#8c6b2d" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* Chrome Shimmering Reflective Mirror Face */}
          <mesh position={[0, 0, 0.026]}>
            <circleGeometry args={[0.28, 32]} />
            <meshPhysicalMaterial 
              color="#e0f7fa" 
              metalness={1.0} 
              roughness={0.015} 
              clearcoat={1.0}
              clearcoatRoughness={0.01}
              emissive="#ffffff"
              emissiveIntensity={relicActionActive ? 1.8 : 0.2}
            />
          </mesh>
          {/* Mirror hanger strings/tassel representation */}
          <mesh position={[0, 0.38, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
            <meshStandardMaterial color="#d84315" roughness={0.6} />
          </mesh>
        </group>

        {/* Stone lanterns (toro) on left and right sides of deck */}
        {[
          { pos: [-1.4, 0.2, 0.6] as [number, number, number], rotY: Math.PI / 4 },
          { pos: [1.4, 0.2, 0.6] as [number, number, number], rotY: -Math.PI / 4 }
        ].map((lantern, idx) => (
          <group key={idx} position={lantern.pos} rotation={[0, lantern.rotY, 0]}>
            {/* Base block */}
            <mesh castShadow receiveShadow position={[0, -0.08, 0]}>
              <boxGeometry args={[0.22, 0.18, 0.22]} />
              <meshStandardMaterial color="#a1887f" roughness={0.95} />
            </mesh>
            {/* Shaft */}
            <mesh castShadow position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.07, 0.08, 0.25, 8]} />
              <meshStandardMaterial color="#917a72" roughness={0.95} />
            </mesh>
            {/* Lantern Light Box */}
            <mesh castShadow position={[0, 0.3, 0]}>
              <boxGeometry args={[0.16, 0.16, 0.16]} />
              <meshStandardMaterial color="#a1887f" roughness={0.95} />
            </mesh>
            {/* Glowing lantern window light */}
            <mesh position={[0, 0.3, 0.081]}>
              <planeGeometry args={[0.09, 0.09]} />
              <meshBasicMaterial color="#ffe082" />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 0.44, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.18, 0.12, 4]} />
              <meshStandardMaterial color="#5d4037" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
