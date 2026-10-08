import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface OlympusProps {
  relicActionActive: boolean;
  onActionComplete: () => void;
}

// Helper to generate jagged branching lightning paths
const generateLightningPath = (start: THREE.Vector3, end: THREE.Vector3, segments = 10) => {
  const points: THREE.Vector3[] = [start];
  for (let i = 1; i < segments; i++) {
    const ratio = i / segments;
    const p = new THREE.Vector3().lerpVectors(start, end, ratio);
    
    // Add jitter perpendicular to the path direction
    p.x += (Math.random() - 0.5) * 0.6;
    p.z += (Math.random() - 0.5) * 0.6;
    points.push(p);
  }
  points.push(end);
  return points;
};

export const Olympus: React.FC<OlympusProps> = ({
  relicActionActive,
  onActionComplete,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const boltRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const crystalCageRef = useRef<THREE.Mesh>(null);
  const sparksRef = useRef<THREE.Points>(null);
  
  const [flashIntensity, setFlashIntensity] = useState(0);
  const [lightningBranches, setLightningBranches] = useState<THREE.Vector3[][]>([]);
  
  // Physics parameters for exploding sparks
  const sparkProgress = useRef(0);
  const sparkVelocities = useRef<Float32Array | null>(null);
  const baseSparkPositions = useRef<Float32Array | null>(null);

  // Initialize sparks velocity vectors
  useEffect(() => {
    const count = 120;
    const vels = new Float32Array(count * 3);
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Explode outwards radially
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const speed = 2.0 + Math.random() * 3.5;
      
      vels[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vels[i * 3 + 1] = Math.cos(phi) * speed; // vertical push
      vels[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
      
      // Starting positions near the bolt
      pos[i * 3] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = 0.8 + (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    sparkVelocities.current = vels;
    baseSparkPositions.current = pos;
  }, []);

  // Lightning strike loop
  useEffect(() => {
    if (relicActionActive) {
      sparkProgress.current = 0.01; // trigger spark animation reset
      let strikes = 0;
      
      const interval = setInterval(() => {
        setFlashIntensity(strikes % 2 === 0 ? 15 : 2);
        
        // Generate main and branch lightning bolts
        const start = new THREE.Vector3((Math.random() - 0.5) * 3, 7.5, (Math.random() - 0.5) * 3);
        const end = new THREE.Vector3(0, 0.8, 0);
        const mainBolt = generateLightningPath(start, end);
        
        // Secondary sub-branch
        const branchStart = mainBolt[Math.floor(mainBolt.length / 2)];
        const branchEnd = new THREE.Vector3(
          branchStart.x + (Math.random() - 0.5) * 2,
          branchStart.y - 2,
          branchStart.z + (Math.random() - 0.5) * 2
        );
        const branchBolt = generateLightningPath(branchStart, branchEnd, 5);

        setLightningBranches([mainBolt, branchBolt]);
        strikes++;
        
        if (strikes > 6) {
          clearInterval(interval);
          setFlashIntensity(0);
          setLightningBranches([]);
          onActionComplete();
        }
      }, 90);
      
      return () => clearInterval(interval);
    }
  }, [relicActionActive, onActionComplete]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Floating animation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.1;
      groupRef.current.rotation.y = t * 0.04;
    }

    // Spin bolt
    if (boltRef.current) {
      boltRef.current.rotation.y = t * 2.8;
      boltRef.current.position.y = Math.sin(t * 2.2) * 0.12;
    }

    // Rotate cage
    if (crystalCageRef.current) {
      crystalCageRef.current.rotation.x = t * 0.35;
      crystalCageRef.current.rotation.y = -t * 0.15;
    }

    // Breathing light intensity
    if (lightRef.current && !relicActionActive) {
      lightRef.current.intensity = 2.0 + Math.sin(t * 4) * 0.4;
    }

    // Particle explosion logic
    if (sparksRef.current && baseSparkPositions.current && sparkVelocities.current) {
      const geom = sparksRef.current.geometry;
      const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
      
      if (sparkProgress.current > 0) {
        sparkProgress.current += delta;
        const progress = sparkProgress.current;
        
        for (let i = 0; i < posAttr.count; i++) {
          // New position = Base + (Velocity * progress) + gravity force
          const bx = baseSparkPositions.current[i * 3];
          const by = baseSparkPositions.current[i * 3 + 1];
          const bz = baseSparkPositions.current[i * 3 + 2];
          
          const vx = sparkVelocities.current[i * 3];
          const vy = sparkVelocities.current[i * 3 + 1];
          const vz = sparkVelocities.current[i * 3 + 2];
          
          posAttr.setX(i, bx + vx * progress);
          // Apply gravity pulling sparks downward
          posAttr.setY(i, by + vy * progress - 4.9 * progress * progress);
          posAttr.setZ(i, bz + vz * progress);
        }
        
        posAttr.needsUpdate = true;
        
        // Hide particles after 1.8 seconds
        if (progress > 1.8) {
          sparkProgress.current = 0;
          // Reset sparks to center
          for (let i = 0; i < posAttr.count; i++) {
            posAttr.setX(i, 0);
            posAttr.setY(i, 0.8);
            posAttr.setZ(i, 0);
          }
          posAttr.needsUpdate = true;
        }
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Lights */}
      <pointLight 
        ref={lightRef} 
        position={[0, 1.2, 0]} 
        color="#fff176" 
        intensity={relicActionActive ? flashIntensity : 2.5} 
        distance={18} 
        castShadow 
      />
      <directionalLight position={[10, 15, 5]} intensity={1.6} color="#f0f5ff" castShadow />
      
      {/* Volumetric sky light beam shooting from Olympus temple roof down to the bolt */}
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[1.5, 9, 16, 1, true]} />
        <meshBasicMaterial 
          color="#ffe082" 
          transparent 
          opacity={relicActionActive ? 0.22 : 0.07} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Floating Architecture */}
      <group ref={groupRef}>
        {/* TEMPLE STRUCTURE STEPS (Hyperrealistic Pedestal) */}
        {/* Step 3 (Top Platform) */}
        <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.8, 2.9, 0.2, 32]} />
          <meshStandardMaterial color="#eae9e5" roughness={0.1} metalness={0.8} />
        </mesh>
        
        {/* Step 2 (Middle Pedestal) */}
        <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[3.2, 3.35, 0.3, 32]} />
          <meshStandardMaterial color="#deddd9" roughness={0.15} metalness={0.7} />
        </mesh>

        {/* Step 1 (Grand Base) */}
        <mesh position={[0, -0.75, 0]} receiveShadow>
          <cylinderGeometry args={[3.6, 3.8, 0.4, 32]} />
          <meshStandardMaterial color="#cecdca" roughness={0.2} metalness={0.6} />
        </mesh>
        
        {/* Gold Circular Pedestal Border */}
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[2.82, 2.82, 0.04, 32, 1, true]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
        </mesh>

        {/* 4 GRAND FLUTED PILLARS WITH DECORATIVE GOLD CAPITALS */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2;
          const radius = 2.3;
          const px = Math.cos(angle) * radius;
          const pz = Math.sin(angle) * radius;
          return (
            <group key={i} position={[px, 0.9, pz]}>
              {/* Pedestal Base */}
              <mesh position={[0, -0.8, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.26, 0.26, 0.12, 12]} />
                <meshStandardMaterial color="#eae9e5" roughness={0.1} />
              </mesh>
              {/* Fluted Column Shaft (Using grouped cylinders for realistic ridges) */}
              <group position={[0, 0, 0]}>
                {/* Core cylinder */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[0.16, 0.18, 1.4, 16]} />
                  <meshStandardMaterial color="#deddd9" roughness={0.25} />
                </mesh>
                {/* 8 Fluted vertical ridges */}
                {Array.from({ length: 8 }).map((_, fIdx) => {
                  const fAngle = (fIdx / 8) * Math.PI * 2;
                  const fRadius = 0.17;
                  return (
                    <mesh 
                      key={fIdx} 
                      position={[Math.cos(fAngle) * fRadius, 0, Math.sin(fAngle) * fRadius]}
                    >
                      <cylinderGeometry args={[0.015, 0.015, 1.4, 4]} />
                      <meshStandardMaterial color="#cecdca" roughness={0.25} />
                    </mesh>
                  );
                })}
              </group>
              {/* Gold capital top ring */}
              <mesh position={[0, 0.72, 0]} castShadow>
                <cylinderGeometry args={[0.24, 0.19, 0.08, 12]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Top Slab */}
              <mesh position={[0, 0.8, 0]} castShadow>
                <boxGeometry args={[0.3, 0.08, 0.3]} />
                <meshStandardMaterial color="#eae9e5" roughness={0.15} />
              </mesh>
            </group>
          );
        })}

        {/* Temple Archway Fragments (Background visual depth) */}
        <group position={[0, 1.8, -2.3]} rotation={[0, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3.2, 0.25, 0.4]} />
            <meshStandardMaterial color="#eae9e5" roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[3.26, 0.05, 0.46]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Storm Clouds Particle Group */}
        <group position={[0, -1.2, 0]}>
          {Array.from({ length: 30 }).map((_, idx) => {
            const angle = (idx / 30) * Math.PI * 2;
            const dist = 3.6 + Math.random() * 1.8;
            const size = 0.5 + Math.random() * 0.7;
            const cy = Math.random() * 0.9;
            return (
              <mesh 
                key={idx} 
                position={[Math.cos(angle) * dist, cy, Math.sin(angle) * dist]}
              >
                <sphereGeometry args={[size, 10, 10]} />
                <meshStandardMaterial 
                  color={relicActionActive ? '#fff59d' : '#1c1e28'} 
                  transparent 
                  opacity={0.7} 
                  roughness={0.95}
                />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* ----------------- RELIC: MASTER BOLT ----------------- */}
      <group position={[0, 0.8, 0]}>
        {/* Double cone glowing bolt */}
        <group ref={boltRef}>
          <mesh castShadow>
            <coneGeometry args={[0.18, 1.3, 5]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#fff59d" 
              emissiveIntensity={relicActionActive ? 12 : 2.5} 
              roughness={0.05}
              metalness={0.95}
            />
          </mesh>
          <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.04, 0]} castShadow>
            <coneGeometry args={[0.18, 1.3, 5]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#fff59d" 
              emissiveIntensity={relicActionActive ? 12 : 2.5} 
              roughness={0.05}
              metalness={0.95}
            />
          </mesh>
          {/* Core electrical spark sphere */}
          <mesh>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
          </mesh>
        </group>

        {/* Orbiting Glass Crystal Cage */}
        <mesh ref={crystalCageRef}>
          <octahedronGeometry args={[1.3, 1]} />
          <meshPhysicalMaterial 
            color="#fff" 
            transparent 
            opacity={0.35} 
            transmission={0.95}
            thickness={0.6}
            roughness={0.01} 
            wireframe
          />
        </mesh>
        
        {/* Ambient Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 8, 48]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* ----------------- HYPERREALISTIC POWER VFX: BOLTS ----------------- */}
      {relicActionActive && lightningBranches.map((branch, i) => (
        <Line 
          key={i} 
          points={branch} 
          color="#ffffff" 
          lineWidth={4} 
          transparent 
          opacity={0.95}
        />
      ))}

      {/* Exploding sparks debris Points system */}
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(120 * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ffe082" 
          size={relicActionActive ? 0.08 : 0.01} 
          sizeAttenuation 
          transparent 
          opacity={0.9} 
        />
      </points>

      {/* Ambient background particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 150 }, () => (Math.random() - 0.5) * 8).flatMap((val, i) =>
                  i % 3 === 1 ? val + 0.8 : val
                )
              ),
              3
            ]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ffe082" 
          size={0.035} 
          sizeAttenuation 
          transparent 
          opacity={0.6} 
        />
      </points>
    </group>
  );
};
