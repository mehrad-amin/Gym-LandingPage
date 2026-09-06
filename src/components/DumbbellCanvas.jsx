"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function InteractiveDumbbell() {
  const groupRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.35, y: 0.8 });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: "#18181b",
    metalness: 0.9,
    roughness: 0.25,
  });

  const gripMaterial = new THREE.MeshStandardMaterial({
    color: "#27272a",
    metalness: 0.6,
    roughness: 0.6,
  });

  const neonRingMaterial = new THREE.MeshStandardMaterial({
    color: "#22c55e",
    emissive: "#22c55e",
    emissiveIntensity: 0.8,
    metalness: 0.2,
    roughness: 0.3,
  });

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!isDragging) {
      targetRotation.current.y += delta * 0.45;
    }
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation.current.y,
      0.1,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation.current.x,
      0.1,
    );
  });

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    touchStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - touchStartPos.current.x;
    const deltaY = e.clientY - touchStartPos.current.y;
    targetRotation.current.y += deltaX * 0.012;
    targetRotation.current.x += deltaY * 0.008;
    touchStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      scale={1.15}
    >
      {/* میله وسط */}
      <mesh material={gripMaterial} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 3.8, 24]} />
      </mesh>

      {/* حلقه‌های نئونی سبز */}
      <mesh
        material={neonRingMaterial}
        position={[-1.25, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[0.24, 0.04, 16, 32]} />
      </mesh>
      <mesh
        material={neonRingMaterial}
        position={[1.25, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[0.24, 0.04, 16, 32]} />
      </mesh>

      {/* دیسک‌های چپ */}
      <group position={[-1.45, 0, 0]}>
        <mesh material={metalMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.2, 1.2, 0.35, 32]} />
        </mesh>
        <mesh
          material={neonRingMaterial}
          position={[-0.22, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <torusGeometry args={[1.05, 0.04, 16, 32]} />
        </mesh>
        <mesh
          material={metalMaterial}
          position={[-0.42, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.95, 0.95, 0.32, 32]} />
        </mesh>
      </group>

      {/* دیسک‌های راست */}
      <group position={[1.45, 0, 0]}>
        <mesh material={metalMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.2, 1.2, 0.35, 32]} />
        </mesh>
        <mesh
          material={neonRingMaterial}
          position={[0.22, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <torusGeometry args={[1.05, 0.04, 16, 32]} />
        </mesh>
        <mesh
          material={metalMaterial}
          position={[0.42, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.95, 0.95, 0.32, 32]} />
        </mesh>
      </group>
    </group>
  );
}

export default function DumbbellCanvas() {
  return (
    <div className="relative mx-auto h-[220px] w-full max-w-[340px] cursor-grab active:cursor-grabbing sm:h-[260px] sm:max-w-[420px] touch-none">
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="h-36 w-36 rounded-full bg-fitness-primary/20 blur-3xl" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 6, 4]}
          intensity={2.5}
          color="#ffffff"
        />
        <pointLight
          position={[0, -3, 2]}
          intensity={3}
          color="#22c55e"
          distance={8}
        />
        <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.6}>
          <InteractiveDumbbell />
        </Float>
      </Canvas>

      <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-fitness-border/60 bg-fitness-surface/70 px-2.5 py-0.5 text-[10px] text-fitness-muted backdrop-blur-md">
        <span>🔄</span>
        <span>برای چرخش لمس کنید</span>
      </div>
    </div>
  );
}
