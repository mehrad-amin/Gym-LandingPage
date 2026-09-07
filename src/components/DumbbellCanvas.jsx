"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// متریال‌های کش‌شده در حافظه GPU
const metalMaterial = new THREE.MeshStandardMaterial({
  color: "#18181b",
  metalness: 0.95,
  roughness: 0.2,
});

const gripMaterial = new THREE.MeshStandardMaterial({
  color: "#27272a",
  metalness: 0.7,
  roughness: 0.5,
});

const neonRingMaterial = new THREE.MeshStandardMaterial({
  color: "#22c55e",
  emissive: "#22c55e",
  emissiveIntensity: 0.9,
  metalness: 0.2,
  roughness: 0.2,
});

const wireframeMaterial = new THREE.MeshBasicMaterial({
  color: "#22c55e",
  wireframe: true,
  transparent: true,
  opacity: 0.12,
});

// ۱. کف مشبک با افکت حرکت بی‌پایان
function CyberGridFloor() {
  const gridRef = useRef(null);

  useFrame((_, delta) => {
    if (!gridRef.current) return;
    // حرکت نرم گرید به سمت جلو
    gridRef.current.position.z = (gridRef.current.position.z + delta * 0.8) % 1;
  });

  return (
    <group position={[0, -2.2, 0]}>
      <mesh
        ref={gridRef}
        rotation={[-Math.PI / 2, 0, 0]}
        material={wireframeMaterial}
      >
        <planeGeometry args={[16, 16, 24, 24]} />
      </mesh>
    </group>
  );
}

// ۲. ذرات معلق انرژی و گچ تمرین در هوا (Energy Sparks)
function FloatingSparks({ count = 35 }) {
  const pointsRef = useRef(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      spd[i] = 0.2 + Math.random() * 0.4;
    }
    return [pos, spd];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += speeds[i] * delta;
      if (array[i * 3 + 1] > 3.5) {
        array[i * 3 + 1] = -3;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#22c55e"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ۳. رینگ‌های هولوگرافیک بیومتریک در عمق
function HologramScanRings() {
  const ring1 = useRef(null);
  const ring2 = useRef(null);

  useFrame((_, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.25;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.18;
  });

  return (
    <group position={[0, 0, -2.5]}>
      {/* حلقه بزرگ خارجی */}
      <mesh ref={ring1}>
        <ringGeometry args={[2.5, 2.52, 48]} />
        <meshBasicMaterial
          color="#22c55e"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* حلقه داخلی منقطع */}
      <mesh ref={ring2} rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[1.8, 1.83, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// دمبل تعاملی مرکزی
function InteractiveDumbbell() {
  const groupRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.35, y: 0.8 });

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
      <mesh material={gripMaterial} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 3.8, 16]} />
      </mesh>

      <mesh
        material={neonRingMaterial}
        position={[-1.25, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[0.24, 0.04, 12, 20]} />
      </mesh>
      <mesh
        material={neonRingMaterial}
        position={[1.25, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[0.24, 0.04, 12, 20]} />
      </mesh>

      {/* دیسک‌های چپ */}
      <group position={[-1.45, 0, 0]}>
        <mesh material={metalMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.2, 1.2, 0.35, 20]} />
        </mesh>
        <mesh
          material={neonRingMaterial}
          position={[-0.22, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <torusGeometry args={[1.05, 0.04, 12, 20]} />
        </mesh>
        <mesh
          material={metalMaterial}
          position={[-0.42, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.95, 0.95, 0.32, 20]} />
        </mesh>
      </group>

      {/* دیسک‌های راست */}
      <group position={[1.45, 0, 0]}>
        <mesh material={metalMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.2, 1.2, 0.35, 20]} />
        </mesh>
        <mesh
          material={neonRingMaterial}
          position={[0.22, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <torusGeometry args={[1.05, 0.04, 12, 20]} />
        </mesh>
        <mesh
          material={metalMaterial}
          position={[0.42, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.95, 0.95, 0.32, 20]} />
        </mesh>
      </group>
    </group>
  );
}

export default function DumbbellCanvas() {
  return (
    <div className="relative mx-auto h-[290px] w-full max-w-[370px] cursor-grab active:cursor-grabbing sm:h-[340px] sm:max-w-[460px] touch-none">
      {/* نورپردازی جوی (Atmospheric Glow) */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-48 w-48 rounded-full bg-fitness-primary/20 blur-[90px]" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight
          position={[5, 6, 4]}
          intensity={2.6}
          color="#ffffff"
        />
        <pointLight
          position={[0, -2, 2]}
          intensity={3.5}
          color="#22c55e"
          distance={8}
        />

        {/* ۱. رینگ‌های هولوگرام در پس‌زمینه */}
        <HologramScanRings />

        {/* ۲. ذرات انرژی معلق در هوا */}
        <FloatingSparks count={40} />

        {/* ۳. دمبل متمرکز با انیمیشن شناور */}
        <Float speed={2.5} rotationIntensity={0.25} floatIntensity={0.5}>
          <InteractiveDumbbell />
        </Float>

        {/* ۴. گرید متحرک کف سالن */}
        <CyberGridFloor />
      </Canvas>

      {/* بج تعاملی هدایت لمسی */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-fitness-primary/30 bg-black/75 px-3 py-1 text-[11px] font-medium text-zinc-300 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-fitness-primary animate-pulse" />
        <span>دمبل را لمس و بررسی کنید</span>
      </div>
    </div>
  );
}
