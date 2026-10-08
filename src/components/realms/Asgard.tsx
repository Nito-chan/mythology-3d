import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface AsgardProps {
  relicActionActive: boolean;
  onActionComplete: () => void;
}

const RUNES = [
  { char: 'ᚠ', name: 'WEALTH' },
  { char: 'ᚢ', name: 'STRENGTH' },
  { char: 'ᚦ', name: 'GIANT' },
  { char: 'ᚨ', name: 'WISDOM' },
  { char: 'ᚱ', name: 'JOURNEY' },
  { char: 'ᚲ', name: 'BEACON' },
  { char: 'ᚷ', name: 'GIFT' },
  { char: 'ᚹ', name: 'JOY' }
];

// Hyper-Realistic custom runestone component representing cracked stones with glowing runes
const RunicStone: React.FC<{ 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  rune: string;
  actionActive: boolean;
}> = ({ position, rotation, rune, actionActive }) => {
  const stoneRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (stoneRef.current) {
      // Gentle floating animation
      const t = state.clock.getElapsedTime();
      stoneRef.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.05;
    }
  });

  return (
    <group ref={stoneRef} position={position} rotation={rotation}>
      {/* Primary irregular stone block */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.42, 0.22]} />
        <meshStandardMaterial 
          color="#121820" 
          roughness={0.9} 
          metalness={0.25}
        />
      </mesh>
      {/* Fractured corner chip overlay */}
      <mesh position={[0.06, -0.08, 0.06]} rotation={[0.1, 0.3, 0.2]}>
        <boxGeometry args={[0.16, 0.28, 0.16]} />
        <meshStandardMaterial 
          color="#0b1016" 
          roughness={0.95} 
          metalness={0.2}
        />
      </mesh>
      {/* Glowing rune engraved on the stone's face */}
      <group position={[0, 0, 0.115]}>
        <Text
          fontSize={0.2}
          color={actionActive ? '#ffffff' : '#00e5ff'}
          anchorX="center"
          anchorY="middle"
        >
          {rune}
        </Text>
      </group>
    </group>
  );
};

export const Asgard: React.FC<AsgardProps> = ({
  relicActionActive,
  onActionComplete,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const monolithRef = useRef<THREE.Mesh>(null);
  const runesGroupRef = useRef<THREE.Group>(null);
  const auroraRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  
  // Runic Light Column refs
  const lightPillarRef = useRef<THREE.Mesh>(null);
  const pillarScaleY = useRef(0.01);
  const summoningRingRef = useRef<THREE.Mesh>(null);
  const snowRef = useRef<THREE.Points>(null);

  const [translationVisible, setTranslationVisible] = useState(false);

  // Snow particles configuration
  const snowCount = 180;
  const snowData = useMemo(() => {
    const data = [];
    for (let i = 0; i < snowCount; i++) {
      data.push({
        x: (Math.random() - 0.5) * 8,
        y: Math.random() * 8 - 3, // Initial spread
        z: (Math.random() - 0.5) * 8,
        speedY: 0.3 + Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        swaySpeed: 0.6 + Math.random() * 1.0,
        swayOffset: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, [snowCount]);

  const [initialSnowPositions] = useMemo(() => {
    const pos = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      pos[i * 3] = snowData[i].x;
      pos[i * 3 + 1] = snowData[i].y;
      pos[i * 3 + 2] = snowData[i].z;
    }
    return [pos];
  }, [snowData, snowCount]);

  useEffect(() => {
    if (relicActionActive) {
      setTranslationVisible(true);
      const timer = setTimeout(() => {
        setTranslationVisible(false);
        onActionComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [relicActionActive, onActionComplete]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Floating animation
    if (groupRef.current) {
      groupRef.current.position.y = -10 + Math.sin(t * 0.4) * 0.12;
      groupRef.current.rotation.y = t * 0.03;
    }

    // Monolith spin/float
    if (monolithRef.current) {
      monolithRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    }

    // Orbiting runes speed ramp
    if (runesGroupRef.current) {
      const speed = relicActionActive ? 3.2 : 0.45;
      runesGroupRef.current.rotation.y = t * speed;
    }

    // Aurora wave animation
    if (auroraRef.current) {
      auroraRef.current.position.y = -6 + Math.sin(t * 0.8) * 0.3;
      auroraRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
    }

    // Pulse lights
    if (pointLightRef.current) {
      pointLightRef.current.intensity = relicActionActive 
        ? 6 + Math.sin(t * 20) * 2.5 
        : 2.5 + Math.sin(t * 2) * 0.4;
    }

    // Rotate rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.y = t * 0.25;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.18;
    }

    // Volumetric light pillar animation
    const targetScale = relicActionActive ? 9.0 : 0.01;
    pillarScaleY.current = THREE.MathUtils.lerp(pillarScaleY.current, targetScale, 0.07);
    if (lightPillarRef.current) {
      lightPillarRef.current.scale.y = pillarScaleY.current;
      lightPillarRef.current.position.y = 0.9 + (pillarScaleY.current * 4.5);
      lightPillarRef.current.visible = pillarScaleY.current > 0.05;
    }

    // Animate summoning ring pulse
    if (summoningRingRef.current) {
      summoningRingRef.current.rotation.z = -t * 0.1;
      const targetOpacity = relicActionActive ? 0.9 : 0.25;
      const material = summoningRingRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.1);
    }

    // Animate falling snow
    if (snowRef.current) {
      const geom = snowRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;

      for (let i = 0; i < snowCount; i++) {
        const data = snowData[i];
        
        // Let snow fall down
        data.y -= data.speedY * delta;
        data.x += Math.sin(t * data.swaySpeed + data.swayOffset) * 0.15 * delta;

        // Wrap around when falling too low
        if (data.y < -3.5) {
          data.y = 4.5;
          data.x = (Math.random() - 0.5) * 8;
        }

        posAttr.setX(i, data.x);
        posAttr.setY(i, data.y);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[25, -10, -25]}>
      {/* Light Source */}
      <pointLight 
        ref={pointLightRef} 
        position={[0, 1.2, 0]} 
        color="#00d2ff" 
        intensity={2.5} 
        distance={15} 
        castShadow 
      />
      <directionalLight position={[-5, 8, -5]} intensity={1.2} color="#00e5ff" />

      {/* Aurora Borealis Ribbon */}
      <mesh ref={auroraRef} position={[0, -5, -8]} rotation={[-Math.PI / 3, 0, 0]}>
        <planeGeometry args={[16, 5, 1, 1]} />
        <meshBasicMaterial 
          color="#00ffcc" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
      <mesh position={[2, -4.5, -9]} rotation={[-Math.PI / 3, 0.2, 0]}>
        <planeGeometry args={[16, 4, 1, 1]} />
        <meshBasicMaterial 
          color="#03a9f4" 
          transparent 
          opacity={0.1} 
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>

      {/* ----------------- HYPERREALISTIC POWER VFX: LIGHT PILLAR ----------------- */}
      <mesh ref={lightPillarRef} position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.7, 1.2, 9, 16, 1, true]} />
        <meshBasicMaterial 
          color="#00e5ff" 
          transparent 
          opacity={0.25} 
          side={THREE.DoubleSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={groupRef}>
        {/* Deep Reflective Glass/Ice Platform */}
        <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.5, 2.7, 0.4, 6]} />
          <meshPhysicalMaterial 
            color="#071b2d" 
            roughness={0.03} 
            metalness={0.9} 
            transmission={0.9} 
            thickness={1.5}
            ior={1.6} 
            transparent
            opacity={0.95}
          />
        </mesh>
        
        {/* Ice crystals trimming */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[2.52, 2.52, 0.05, 6, 1, true]} />
          <meshStandardMaterial color="#00d2ff" emissive="#00bcd4" emissiveIntensity={0.5} roughness={0.1} />
        </mesh>

        {/* Summoning ground ring */}
        <mesh ref={summoningRingRef} position={[0, -0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.25} side={THREE.DoubleSide} wireframe />
        </mesh>

        {/* ----------------- HYPER-REALISTIC NORSE RUNESTONES ----------------- */}
        {[
          { pos: [1.9, 0.1, 0.9] as [number, number, number], rot: [0.1, -0.4, 0] as [number, number, number], rune: 'ᚨ' },
          { pos: [0.9, 0.1, 1.9] as [number, number, number], rot: [0.2, -0.8, -0.1] as [number, number, number], rune: 'ᚱ' },
          { pos: [-0.9, 0.1, 1.9] as [number, number, number], rot: [0.1, 0.8, 0.1] as [number, number, number], rune: 'ᚲ' },
          { pos: [-1.9, 0.1, 0.9] as [number, number, number], rot: [-0.1, 0.4, 0.2] as [number, number, number], rune: 'ᚷ' },
          { pos: [-1.9, 0.1, -0.9] as [number, number, number], rot: [-0.2, -0.4, -0.1] as [number, number, number], rune: 'ᚹ' },
          { pos: [0, 0.1, -2.0] as [number, number, number], rot: [0.3, 0, 0] as [number, number, number], rune: 'ᚦ' }
        ].map((stone, i) => (
          <RunicStone 
            key={i} 
            position={stone.pos} 
            rotation={stone.rot} 
            rune={stone.rune} 
            actionActive={relicActionActive}
          />
        ))}

        {/* ----------------- HIGH TRANSMISSION BIFROST BRIDGE ----------------- */}
        <group position={[0, -0.4, -4.2]} rotation={[-Math.PI / 16, 0, 0]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.1, 8.4]} />
            <meshPhysicalMaterial 
              color="#00e5ff"
              transmission={0.92}
              thickness={1.0}
              roughness={0.02}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Neon Rainbow interior tracks */}
          {[-0.6, -0.3, 0, 0.3, 0.6].map((offset, i) => {
            const colors = ['#e53935', '#fdd835', '#43a047', '#00acc1', '#8e24aa'];
            return (
              <mesh key={i} position={[offset, 0.055, 0]}>
                <boxGeometry args={[0.08, 0.012, 8.4]} />
                <meshBasicMaterial color={colors[i]} transparent opacity={0.85} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* ----------------- RELIC: RUNIC MONOLITH ----------------- */}
      <group position={[0, 0.9, 0]}>
        {/* Norse Runestone Obelisk */}
        <mesh ref={monolithRef} castShadow>
          <cylinderGeometry args={[0.3, 0.45, 1.8, 3]} />
          <meshStandardMaterial 
            color="#121824" 
            roughness={0.7} 
            metalness={0.3}
          />
        </mesh>
        
        {/* Core glow within the stone */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.31, 0.46, 1.4, 3, 1, true]} />
          <meshBasicMaterial 
            color="#00d2ff" 
            transparent 
            opacity={relicActionActive ? 0.75 : 0.3} 
            wireframe
          />
        </mesh>

        {/* Orbiting Norse Runes Group */}
        <group ref={runesGroupRef}>
          {RUNES.map((rune, idx) => {
            const angle = (idx / RUNES.length) * Math.PI * 2;
            const radius = 1.35;
            const rx = Math.cos(angle) * radius;
            const rz = Math.sin(angle) * radius;
            const ry = Math.sin(idx * 2) * 0.4;
            
            return (
              <group key={idx} position={[rx, ry, rz]}>
                <Text
                  fontSize={0.22}
                  color={relicActionActive ? '#ffffff' : '#00e5ff'}
                  maxWidth={2}
                  lineHeight={1}
                  letterSpacing={0.02}
                  textAlign="center"
                  anchorX="center"
                  anchorY="middle"
                >
                  {rune.char}
                </Text>
                
                {translationVisible && (
                  <Text
                    position={[0, 0.25, 0]}
                    fontSize={0.1}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {rune.name}
                  </Text>
                )}
              </group>
            );
          })}
        </group>

        {/* Orbiting magical rings */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.5, 0.015, 8, 32]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.2} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[-Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.65, 0.015, 8, 32]} />
          <meshBasicMaterial color="#03a9f4" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Falling Snow System */}
      <points ref={snowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialSnowPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ffffff" 
          size={0.05} 
          sizeAttenuation 
          transparent 
          opacity={0.8} 
        />
      </points>

      {/* Floating Sparkles (Aurora dust) */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 180 }, () => (Math.random() - 0.5) * 6).flatMap((val, i) =>
                  i % 3 === 1 ? val + 0.8 : val
                )
              ),
              3
            ]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#00ffcc" 
          size={0.035} 
          sizeAttenuation 
          transparent 
          opacity={0.65} 
        />
      </points>
    </group>
  );
};
