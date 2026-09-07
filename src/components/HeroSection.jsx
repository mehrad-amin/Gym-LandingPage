"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// متریال‌های متالیک روشن با رفلکس بالا
const brightMetalMat = new THREE.MeshStandardMaterial({
  color: "#3f3f46",
  metalness: 0.85,
  roughness: 0.2,
});

const neonGlowMat = new THREE.MeshStandardMaterial({
  color: "#22c55e",
  emissive: "#22c55e",
  emissiveIntensity: 1.5,
  metalness: 0.1,
  roughness: 0.2,
});

const metallicAccentMat = new THREE.MeshStandardMaterial({
  color: "#a1a1aa",
  metalness: 0.95,
  roughness: 0.15,
});

// ۱. کتل‌بل
function CrispKettlebell(props) {
  return (
    <group {...props}>
      <mesh material={brightMetalMat}>
        <sphereGeometry args={[0.5, 16, 16]} />
      </mesh>
      <mesh material={neonGlowMat}>
        <torusGeometry args={[0.52, 0.03, 10, 20]} />
      </mesh>
      <mesh material={metallicAccentMat} position={[0, 0.48, 0]}>
        <torusGeometry args={[0.26, 0.07, 10, 16]} />
      </mesh>
    </group>
  );
}

// ۲. دیسک وزنه
function CrispWeightPlate(props) {
  return (
    <group {...props}>
      <mesh material={brightMetalMat} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.16, 20]} />
      </mesh>
      <mesh material={neonGlowMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.86, 0.035, 10, 20]} />
      </mesh>
      <mesh material={metallicAccentMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.04, 10, 16]} />
      </mesh>
    </group>
  );
}

// ۳. شیکر ورزشی
function CrispShaker(props) {
  return (
    <group {...props}>
      <mesh material={metallicAccentMat} position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 0.85, 16]} />
      </mesh>
      <mesh material={neonGlowMat} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.29, 0.29, 0.04, 16]} />
      </mesh>
      <mesh material={brightMetalMat} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.18, 16]} />
      </mesh>
      <mesh material={neonGlowMat} position={[0.08, 0.54, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 10]} />
      </mesh>
    </group>
  );
}

// ۴. دمبل
function CrispDumbbell(props) {
  return (
    <group {...props}>
      <mesh material={metallicAccentMat} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 12]} />
      </mesh>
      <mesh
        material={brightMetalMat}
        position={[-0.52, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.36, 0.36, 0.18, 16]} />
      </mesh>
      <mesh
        material={neonGlowMat}
        position={[-0.52, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[0.37, 0.02, 10, 16]} />
      </mesh>
      <mesh
        material={brightMetalMat}
        position={[0.52, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.36, 0.36, 0.18, 16]} />
      </mesh>
      <mesh
        material={neonGlowMat}
        position={[0.52, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[0.37, 0.02, 10, 16]} />
      </mesh>
    </group>
  );
}

// ۵. ذرات کریستالی نورانی
function AmbientEnergyDust({ count = 35 }) {
  const pointsRef = useRef(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      spd[i] = 0.2 + Math.random() * 0.35;
    }
    return [pos, spd];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#4ade80"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 🚀 کامپوننت کلیدی: محاسبه دقیق موقعیت المان‌ها متناسب با عرض واقعی نمایشگر
function ResponsiveElements() {
  const { viewport } = useThree();

  // تشخیص موبایل بر اساس عرض دید دوربین در Three.js
  const isMobile = viewport.width < 5.5;

  // در موبایل المان‌ها به داخل کادر (x کمتر) و بالا و پایین متن کشیده می‌شوند
  const platePos = isMobile
    ? [viewport.width * 0.36, 2.6, -0.5]
    : [3.8, 1.6, -0.5];
  const kettlebellPos = isMobile
    ? [-viewport.width * 0.36, 2.4, -0.3]
    : [-3.6, 1.5, -0.3];
  const shakerPos = isMobile
    ? [viewport.width * 0.35, -2.8, -0.2]
    : [3.5, -1.8, -0.2];
  const dumbbellPos = isMobile
    ? [-viewport.width * 0.35, -2.7, -0.4]
    : [-3.4, -1.7, -0.4];

  // اسکیل متناسب تا در موبایل صفحه را نپوشانند
  const elemScale = isMobile ? 0.78 : 1.1;

  return (
    <>
      <AmbientEnergyDust count={isMobile ? 25 : 40} />

      {/* وزنه المپیکی */}
      <Float speed={2.0} rotationIntensity={0.5} floatIntensity={0.6}>
        <CrispWeightPlate
          position={platePos}
          rotation={[0.4, 0.4, 0.2]}
          scale={elemScale}
        />
      </Float>

      {/* کتل‌بل */}
      <Float speed={2.2} rotationIntensity={0.4} floatIntensity={0.7}>
        <CrispKettlebell
          position={kettlebellPos}
          rotation={[-0.3, 0.5, 0.1]}
          scale={elemScale}
        />
      </Float>

      {/* شیکر ورزشی */}
      <Float speed={1.9} rotationIntensity={0.4} floatIntensity={0.8}>
        <CrispShaker
          position={shakerPos}
          rotation={[0.2, -0.3, -0.2]}
          scale={elemScale}
        />
      </Float>

      {/* دمبل */}
      <Float speed={2.4} rotationIntensity={0.5} floatIntensity={0.6}>
        <CrispDumbbell
          position={dumbbellPos}
          rotation={[0.5, -0.4, 0.3]}
          scale={elemScale * 0.9}
        />
      </Float>
    </>
  );
}

function SceneCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[6, 8, 5]} intensity={3.5} color="#ffffff" />
      <directionalLight
        position={[-6, -4, -2]}
        intensity={1.5}
        color="#22c55e"
      />
      <pointLight
        position={[0, 0, 3]}
        intensity={4.0}
        color="#22c55e"
        distance={12}
      />

      <ResponsiveElements />
    </Canvas>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden border-b border-zinc-800 bg-[#0c1012] flex items-center justify-center">
      {/* کانوِس ۳ بعدی تمام‌عرض */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <SceneCanvas />
      </div>

      {/* هاله نور پس‌زمینه */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-fitness-primary/20 blur-[130px]" />

      {/* محتوای متنی وسط‌چین */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fitness-primary/50 bg-black/60 px-4 py-1.5 shadow-[0_0_25px_rgba(34,197,94,0.3)] backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fitness-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-fitness-primary" />
          </span>
          <span className="font-mono text-xs font-bold text-fitness-primary">
            HYPERTROPHY &amp; FAT LOSS PROTOCOL
          </span>
        </div>

        <h1 className="text-3xl font-black leading-[1.25] tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
          مهندسی دقیق فیزیک بدنی؛ <br />
          <span className="mt-2 inline-block bg-gradient-to-r from-fitness-primary via-emerald-300 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">
            فراتر از تمرینات معمولی
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-200 sm:text-base drop-shadow-md">
          برنامه‌ریزی متابولیک و تمرینات تخصصی هایپرتروفی متناسب با بیومتریک
          انحصاری بدن شما. بدون رژیم‌های طاقت‌فرسا و اتلاف وقت، مسیر علمی کاهش
          چربی و ساخت عضلات باکیفیت را شروع کنید.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          <a
            href="#booking"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-fitness-primary px-8 py-4 text-center font-black text-black shadow-[0_0_35px_rgba(34,197,94,0.5)] transition-all hover:bg-fitness-primary-hover active:scale-[0.98] sm:w-auto"
          >
            <span>شروع مشاوره و دریافت برنامه</span>
            <span className="text-sm">←</span>
          </a>

          <a
            href="#calculator"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950/90 px-6 py-4 text-center text-xs font-bold text-zinc-100 shadow-md backdrop-blur-md transition-all hover:border-fitness-primary hover:text-white sm:w-auto"
          >
            <span>محاسبه آنی کالری و TDEE</span>
          </a>
        </div>

        <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-zinc-800/80 pt-6">
          <div>
            <p className="font-mono text-2xl font-black text-white sm:text-3xl">
              +450
            </p>
            <span className="text-[11px] font-medium text-zinc-400">
              تغییر موفق فیزیک
            </span>
          </div>
          <div>
            <p className="font-mono text-2xl font-black text-fitness-primary sm:text-3xl">
              98٪
            </p>
            <span className="text-[11px] font-medium text-zinc-400">
              رضایت شاگردان
            </span>
          </div>
          <div>
            <p className="font-mono text-2xl font-black text-white sm:text-3xl">
              8 سال
            </p>
            <span className="text-[11px] font-medium text-zinc-400">
              سابقه تخصصی مربی
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
