"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// --- متریال‌های متالیک روشن با رفلکس بالا و کش‌شده در حافظه GPU ---
const brightMetalMat = new THREE.MeshStandardMaterial({
  color: "#3f3f46", // نقره‌ای تیتانیومی روشن به جای رنگ تیره
  metalness: 0.85,
  roughness: 0.2,
});

const neonGlowMat = new THREE.MeshStandardMaterial({
  color: "#22c55e",
  emissive: "#22c55e",
  emissiveIntensity: 1.4, // افزایش شدت درخشش نئون
  metalness: 0.1,
  roughness: 0.2,
});

const metallicAccentMat = new THREE.MeshStandardMaterial({
  color: "#a1a1aa", // قطعات نقره‌ای براق
  metalness: 0.95,
  roughness: 0.15,
});

// ۱. کتل‌بل روشن با هایلایت نقره‌ای و نئون
function CrispKettlebell(props) {
  return (
    <group {...props}>
      <mesh material={brightMetalMat}>
        <sphereGeometry args={[0.55, 16, 16]} />
      </mesh>
      <mesh material={neonGlowMat} position={[0, 0, 0]}>
        <torusGeometry args={[0.57, 0.03, 10, 20]} />
      </mesh>
      <mesh material={metallicAccentMat} position={[0, 0.52, 0]}>
        <torusGeometry args={[0.3, 0.08, 10, 16]} />
      </mesh>
    </group>
  );
}

// ۲. دیسک وزنه المپیکی با لبه‌های نئونی براق
function CrispWeightPlate(props) {
  return (
    <group {...props}>
      <mesh material={brightMetalMat} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.18, 20]} />
      </mesh>
      <mesh material={neonGlowMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.035, 10, 20]} />
      </mesh>
      <mesh material={metallicAccentMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.045, 10, 16]} />
      </mesh>
    </group>
  );
}

// ۳. شیکر مکمل با نوار نئونی درخشان
function CrispShaker(props) {
  return (
    <group {...props}>
      <mesh material={metallicAccentMat} position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.32, 0.25, 0.95, 16]} />
      </mesh>
      <mesh material={neonGlowMat} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.05, 16]} />
      </mesh>
      <mesh material={brightMetalMat} position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.2, 16]} />
      </mesh>
      <mesh material={neonGlowMat} position={[0.1, 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 10]} />
      </mesh>
    </group>
  );
}

// ۴. دمبل هگزاگونال متالیک براق
function CrispDumbbell(props) {
  return (
    <group {...props}>
      <mesh material={metallicAccentMat} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 1.4, 12]} />
      </mesh>
      <mesh
        material={brightMetalMat}
        position={[-0.6, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.42, 0.42, 0.22, 16]} />
      </mesh>
      <mesh
        material={neonGlowMat}
        position={[-0.6, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[0.43, 0.025, 10, 16]} />
      </mesh>
      <mesh
        material={brightMetalMat}
        position={[0.6, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.42, 0.42, 0.22, 16]} />
      </mesh>
      <mesh
        material={neonGlowMat}
        position={[0.6, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <torusGeometry args={[0.43, 0.025, 10, 16]} />
      </mesh>
    </group>
  );
}

// ۵. ذرات کریستالی نورانی با وضوح بالا
function AmbientEnergyDust({ count = 35 }) {
  const pointsRef = useRef(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      spd[i] = 0.25 + Math.random() * 0.35;
    }
    return [pos, spd];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      if (arr[i * 3 + 1] > 4.5) arr[i * 3 + 1] = -4.5;
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
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
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
        depth: true,
      }}
    >
      {/* روشنایی تقویت‌شده با شدت بالا جهت دیده شدن واضح بافت‌ها */}
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

      <AmbientEnergyDust count={35} />

      {/* المان ۱: وزنه المپیکی براق - بالا راست */}
      <Float speed={2.0} rotationIntensity={0.5} floatIntensity={0.6}>
        <CrispWeightPlate
          position={[4.0, 1.7, -1]}
          rotation={[0.4, 0.4, 0.2]}
          scale={1.15}
        />
      </Float>

      {/* المان ۲: کتل‌بل تیتانیومی - بالا چپ */}
      <Float speed={2.2} rotationIntensity={0.4} floatIntensity={0.7}>
        <CrispKettlebell
          position={[-3.8, 1.5, -0.7]}
          rotation={[-0.3, 0.5, 0.1]}
          scale={1.1}
        />
      </Float>

      {/* المان ۳: شیکر ورزشی نقره‌ای - پایین راست */}
      <Float speed={1.9} rotationIntensity={0.4} floatIntensity={0.8}>
        <CrispShaker
          position={[3.6, -2.0, -0.4]}
          rotation={[0.2, -0.3, -0.2]}
          scale={1.0}
        />
      </Float>

      {/* المان ۴: مینی دمبل - پایین چپ */}
      <Float speed={2.4} rotationIntensity={0.5} floatIntensity={0.6}>
        <CrispDumbbell
          position={[-3.5, -1.8, -0.8]}
          rotation={[0.5, -0.4, 0.3]}
          scale={0.9}
        />
      </Float>
    </Canvas>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden border-b border-zinc-800 bg-[#0c1012] flex items-center justify-center">
      {/* ۱. کانوِس ۳ بعدی تمام‌عرض با وضوح و رفلکس بالا */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <SceneCanvas />
      </div>

      {/* نورپردازی پس‌زمینه شارپ و سبز متمرکز */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-fitness-primary/20 blur-[130px]" />

      {/* ۲. محتوای وسط‌چین با بالاترین کنتراست متنی */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-20 text-center">
        {/* بج هولوگرافیک */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fitness-primary/50 bg-black/60 px-4 py-1.5 shadow-[0_0_25px_rgba(34,197,94,0.3)] backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fitness-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-fitness-primary" />
          </span>
          <span className="font-mono text-xs font-bold text-fitness-primary">
            HYPERTROPHY &amp; FAT LOSS PROTOCOL
          </span>
        </div>

        {/* تیتر اصلی */}
        <h1 className="text-3xl font-black leading-[1.25] tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
          مهندسی دقیق فیزیک بدنی؛ <br />
          <span className="mt-2 inline-block bg-gradient-to-r from-fitness-primary via-emerald-300 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">
            فراتر از تمرینات معمولی
          </span>
        </h1>

        {/* توضیحات */}
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-200 sm:text-base drop-shadow-md">
          برنامه‌ریزی متابولیک و تمرینات تخصصی هایپرتروفی متناسب با بیومتریک
          انحصاری بدن شما. بدون رژیم‌های طاقت‌فرسا و اتلاف وقت، مسیر علمی کاهش
          چربی و ساخت عضلات باکیفیت را شروع کنید.
        </p>

        {/* دکمه‌های اقدام (CTA) */}
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

        {/* آمار مربی */}
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
