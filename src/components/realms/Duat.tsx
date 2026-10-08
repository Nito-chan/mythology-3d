import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DuatProps {
  relicActionActive: boolean;
  onActionComplete: () => void;
}

// Hyper-Realistic Detailed Heart mesh model (anatomical layout representation)
const RealisticHeart: React.FC<{ emissiveIntensity: number }> = ({ emissiveIntensity }) => {
  return (
    <group position={[0, 0.08, 0]} scale={[1.1, 1.1, 1.1]}>
      {/* Left Ventricle */}
      <mesh castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial 
          color="#d32f2f" 
          emissive="#b71c1c" 
          emissiveIntensity={emissiveIntensity} 
          roughness={0.15} 
          metalness={0.4}
        />
      </mesh>
      {/* Right Ventricle */}
      <mesh position={[0.04, -0.02, 0.01]} castShadow>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial 
          color="#b71c1c" 
          emissive="#880e4f" 
          emissiveIntensity={emissiveIntensity * 0.8} 
          roughness={0.15} 
          metalness={0.4}
        />
      </mesh>
      {/* Aorta Arch Tube */}
      <mesh position={[-0.01, 0.07, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.09, 8]} />
        <meshStandardMaterial color="#c62828" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Pulmonary Artery Tube */}
      <mesh position={[0.03, 0.06, 0.02]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
        <meshStandardMaterial color="#ad1457" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Vena Cava Tube */}
      <mesh position={[-0.03, 0.04, -0.01]} rotation={[0, 0, Math.PI / 10]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.07, 8]} />
        <meshStandardMaterial color="#1565c0" roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  );
};

// Hyper-Realistic Detailed Feather mesh model (quill + 12 angled ribbed vane pairs)
const RealisticFeather: React.FC = () => {
  return (
    <group position={[0, 0.05, 0]} rotation={[0, 0, -Math.PI / 12]}>
      {/* Central Quill Spine */}
      <mesh castShadow>
        <cylinderGeometry args={[0.007, 0.003, 0.32, 8]} />
        <meshStandardMaterial color="#e0e0d0" roughness={0.4} metalness={0.1} />
      </mesh>
      
      {/* Angled ribs forming the feather vanes (12 pairs cascading outwards) */}
      {Array.from({ length: 12 }).map((_, idx) => {
        const y = -0.13 + (idx * 0.024);
        // Taper width toward top and bottom
        const width = 0.082 * Math.sin((idx / 12) * Math.PI);
        
        return (
          <group key={idx} position={[0, y, 0]}>
            {/* Left vane segment */}
            <mesh position={[-width / 2, 0, 0.001]} rotation={[0, 0, 0.35]} castShadow>
              <boxGeometry args={[width, 0.008, 0.003]} />
              <meshStandardMaterial 
                color="#ffe082" 
                emissive="#ffb300"
                emissiveIntensity={0.15}
                roughness={0.45} 
                metalness={0.3}
              />
            </mesh>
            {/* Right vane segment */}
            <mesh position={[width / 2, 0, 0.001]} rotation={[0, 0, -0.35]} castShadow>
              <boxGeometry args={[width, 0.008, 0.003]} />
              <meshStandardMaterial 
                color="#ffe082" 
                emissive="#ffb300"
                emissiveIntensity={0.15}
                roughness={0.45} 
                metalness={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const Duat: React.FC<DuatProps> = ({
  relicActionActive,
  onActionComplete,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const scaleStandRef = useRef<THREE.Group>(null);
  const crossbarRef = useRef<THREE.Group>(null);
  const leftPlateRef = useRef<THREE.Mesh>(null);
  const rightPlateRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Custom particle systems for judgment mist/sparks
  const heartMistRef = useRef<THREE.Points>(null);
  const featherSparksRef = useRef<THREE.Points>(null);
  
  const [scaleAngle, setScaleAngle] = useState(0);
  const mistProgress = useRef(0);

  // Animate the scale tilt and particles when action is triggered
  useEffect(() => {
    if (relicActionActive) {
      mistProgress.current = 0.01; // Trigger particle rise
      
      // Step 1: Tilt scale left (heavy heart)
      setScaleAngle(0.18);
      
      // Step 2: Tilt right (feather balance)
      const timer1 = setTimeout(() => {
        setScaleAngle(-0.06);
      }, 1200);

      // Step 3: Return to balance
      const timer2 = setTimeout(() => {
        setScaleAngle(0);
        onActionComplete();
      }, 2600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [relicActionActive, onActionComplete]);

  // Variables for scale geometry
  const crossbarWidth = 1.6;
  const halfWidth = crossbarWidth / 2;

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Float entire scene group
    if (groupRef.current) {
      groupRef.current.position.y = 10 + Math.sin(t * 0.45) * 0.1;
      groupRef.current.rotation.y = t * 0.04;
    }

    // Gentle rotate scale stand
    if (scaleStandRef.current) {
      scaleStandRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    }

    // Lerp crossbar angle
    if (crossbarRef.current) {
      crossbarRef.current.rotation.z = THREE.MathUtils.lerp(
        crossbarRef.current.rotation.z,
        scaleAngle,
        0.06
      );
    }

    // Calculate Y offsets for left and right plates based on crossbar rotation
    const currentZRotation = crossbarRef.current ? crossbarRef.current.rotation.z : 0;
    const lOffset = Math.sin(currentZRotation) * halfWidth;
    const rOffset = -Math.sin(currentZRotation) * halfWidth;

    if (leftPlateRef.current) {
      leftPlateRef.current.position.y = -0.7 + lOffset;
    }
    if (rightPlateRef.current) {
      rightPlateRef.current.position.y = -0.7 + rOffset;
    }

    // Pulse light intensity
    if (lightRef.current) {
      lightRef.current.intensity = relicActionActive
        ? 4 + Math.sin(t * 15) * 1.5
        : 2 + Math.sin(t * 3) * 0.3;
    }

    // Update rising particle vortexes on action
    if (mistProgress.current > 0) {
      mistProgress.current += delta;
      const progress = mistProgress.current;

      // Update Heart Mist (Left)
      if (heartMistRef.current && leftPlateRef.current) {
        const geom = heartMistRef.current.geometry;
        const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
        
        const lpY = leftPlateRef.current.position.y + 0.6; // offset slightly above plate
        
        for (let i = 0; i < posAttr.count; i++) {
          const pAngle = (i * 0.1) + (progress * 4.0);
          const radius = 0.08 + Math.sin(i + t) * 0.06;
          
          posAttr.setX(i, -halfWidth + Math.cos(pAngle) * radius);
          posAttr.setY(i, lpY + (i / posAttr.count) * 1.2 * progress);
          posAttr.setZ(i, Math.sin(pAngle) * radius);
        }
        posAttr.needsUpdate = true;
      }

      // Update Feather Sparks (Right)
      if (featherSparksRef.current && rightPlateRef.current) {
        const geom = featherSparksRef.current.geometry;
        const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
        
        const rpY = rightPlateRef.current.position.y + 0.6;
        
        for (let i = 0; i < posAttr.count; i++) {
          const radius = 0.12 * Math.random();
          const theta = Math.random() * Math.PI * 2;
          
          posAttr.setX(i, halfWidth + Math.cos(theta) * radius);
          posAttr.setY(i, rpY + (i / posAttr.count) * 1.4 * progress);
          posAttr.setZ(i, Math.sin(theta) * radius);
        }
        posAttr.needsUpdate = true;
      }

      // Reset particles after action finishes
      if (progress > 2.5) {
        mistProgress.current = 0;
        
        if (heartMistRef.current) {
          const posAttr = heartMistRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
          for (let i = 0; i < posAttr.count; i++) posAttr.setY(i, -99);
          posAttr.needsUpdate = true;
        }
        if (featherSparksRef.current) {
          const posAttr = featherSparksRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
          for (let i = 0; i < posAttr.count; i++) posAttr.setY(i, -99);
          posAttr.needsUpdate = true;
        }
      }
    }
  });

  return (
    <group position={[-25, 10, -15]}>
      {/* Lights */}
      <pointLight 
        ref={lightRef} 
        position={[0, 1.2, 0]} 
        color="#c084fc" 
        intensity={2} 
        distance={15} 
        castShadow 
      />
      <directionalLight position={[5, 6, -2]} intensity={1.2} color="#ffe57f" />

      {/* Wireframe Pyramid Background */}
      <mesh position={[0, 1.8, -7]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[6, 8, 4]} />
        <meshBasicMaterial 
          color="#c084fc" 
          transparent 
          opacity={0.06} 
          wireframe
        />
      </mesh>
      
      {/* Floating Golden Capstone (Pyramidion) */}
      <mesh position={[0, 5.9, -7]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.7, 1.0, 4]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
      </mesh>
      
      {/* Outer Glow Ring of Pyramid */}
      <mesh position={[0, -2, -7]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.2, 0.02, 8, 4]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.15} />
      </mesh>

      <group ref={groupRef}>
        {/* Basalt Stone Platform Base */}
        <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.5, 2.7, 0.4, 32]} />
          <meshStandardMaterial 
            color="#141416" 
            roughness={0.8} 
            metalness={0.6}
          />
        </mesh>
        
        {/* Stone Slab Tiled Mortar Grids on Floor */}
        {[-1.5, -0.75, 0, 0.75, 1.5].map((val, i) => (
          <group key={i}>
            <mesh position={[val, -0.19, 0]} receiveShadow>
              <boxGeometry args={[0.02, 0.01, 4.4]} />
              <meshStandardMaterial color="#000" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.19, val]} receiveShadow>
              <boxGeometry args={[4.4, 0.01, 0.02]} />
              <meshStandardMaterial color="#000" roughness={0.9} />
            </mesh>
          </group>
        ))}
        
        {/* Purple Ring of Fire Border */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[2.52, 2.52, 0.05, 32, 1, true]} />
          <meshStandardMaterial color="#c084fc" emissive="#7b1fa2" emissiveIntensity={0.8} roughness={0.1} />
        </mesh>

        {/* Floating golden hieroglyphs */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * Math.PI * 2) / 8;
          const radius = 2.0;
          const px = Math.cos(angle) * radius;
          const pz = Math.sin(angle) * radius;
          return (
            <mesh key={i} position={[px, 0.25 + Math.sin(i * 3) * 0.15, pz]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.08, 0.28, 0.03]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} transparent opacity={0.6} />
            </mesh>
          );
        })}
      </group>

      {/* ----------------- RELIC: KINETIC SCALES OF ANUBIS ----------------- */}
      <group ref={scaleStandRef} position={[0, 0.6, 0]}>
        {/* Central Stand Column */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.09, 1.3, 16]} />
          <meshStandardMaterial color="#2d1c3d" roughness={0.3} metalness={0.8} />
        </mesh>
        
        {/* Base Plate of Stand */}
        <mesh position={[0, -0.32, 0]} receiveShadow>
          <cylinderGeometry args={[0.3, 0.35, 0.08, 16]} />
          <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Cap of Stand (Jackal Ear ornament) */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* TILTING CROSSBAR SYSTEM */}
        <group ref={crossbarRef} position={[0, 0.9, 0]}>
          {/* Main Horizontal Bar */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, crossbarWidth, 16]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
          </mesh>

          {/* Left Plate (Heart Container) */}
          <mesh ref={leftPlateRef} position={[-halfWidth, -0.7, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.03, 16]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
            {/* Hanging suspension chains representation */}
            {[-0.08, 0, 0.08].map((offset, i) => (
              <mesh key={i} position={[offset, 0.35, 0]} rotation={[0, 0, 0.05 * (i - 1)]}>
                <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
              </mesh>
            ))}
            
            {/* HYPER-REALISTIC ORGANIC HEART MODEL */}
            <RealisticHeart emissiveIntensity={relicActionActive ? 3.5 : 1} />
          </mesh>

          {/* Right Plate (Feather Container) */}
          <mesh ref={rightPlateRef} position={[halfWidth, -0.7, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.03, 16]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
            {/* Hanging suspension chains representation */}
            {[-0.08, 0, 0.08].map((offset, i) => (
              <mesh key={i} position={[offset, 0.35, 0]} rotation={[0, 0, 0.05 * (i - 1)]}>
                <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
              </mesh>
            ))}
            
            {/* HYPER-REALISTIC RIBBED GOLDEN FEATHER MODEL */}
            <RealisticFeather />
          </mesh>
        </group>
      </group>

      {/* ----------------- HYPERREALISTIC POWER VFX: JUDGMENT PARTICLES ----------------- */}
      {/* Heart Mist (Left rising dark shadow mist) */}
      <points ref={heartMistRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(80 * 3).fill(-99), 3]} 
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#311b92" 
          size={0.075} 
          sizeAttenuation 
          transparent 
          opacity={0.8} 
        />
      </points>

      {/* Feather Sparks (Right rising golden sparkles) */}
      <points ref={featherSparksRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(80 * 3).fill(-99), 3]} 
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ffd54f" 
          size={0.06} 
          sizeAttenuation 
          transparent 
          opacity={0.95} 
        />
      </points>

      {/* Floating Sandstorm Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 150 }, () => (Math.random() - 0.5) * 8).flatMap((val, i) =>
                  i % 3 === 0 ? val : i % 3 === 1 ? val + 0.8 : val - 2
                )
              ),
              3
            ]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ffcc80" 
          size={0.035} 
          sizeAttenuation 
          transparent 
          opacity={0.45} 
        />
      </points>
    </group>
  );
};
