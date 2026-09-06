"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function BeforeAfterSlider({ item }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef(null);

  const handleSliderChange = (e) => {
    setSliderPosition(Number(e.target.value));
  };

  // محاسبه زاویه چرخش ۳ بعدی بر اساس موقعیت اسلایدر (از -4 تا +4 درجه)
  const tiltY = ((sliderPosition - 50) / 50) * 4.5;
  const offsetPercent = 100 - sliderPosition;

  return (
    <div
      ref={containerRef}
      style={{
        transform: isInteracting
          ? `perspective(1000px) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`
          : "perspective(1000px) rotateY(0deg) scale3d(1, 1, 1)",
        transition: isInteracting
          ? "none"
          : "transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-fitness-border/90 bg-gradient-to-b from-fitness-surface to-[#0c0f12] p-4 shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-colors hover:border-fitness-primary/40"
    >
      {/* هاله نور نئونی پشت کارت */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${sliderPosition}% 50%, rgba(34, 197, 94, 0.12), transparent 70%)`,
        }}
      />

      <div
        dir="ltr"
        className="relative aspect-4/5 w-full select-none overflow-hidden rounded-2xl bg-neutral-950 shadow-inner"
      >
        {/* تصویر بعد (After) */}
        <div className="absolute inset-0">
          <Image
            src={item.afterImg}
            alt={`${item.name} - بعد`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center"
          />
        </div>

        {/* تصویر قبل (Before) با برش افقی */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${offsetPercent}% 0 0)` }}
        >
          <Image
            src={item.beforeImg}
            alt={`${item.name} - قبل`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center"
          />
          {/* خط اسکن خطی بسیار محو روی تصویر قبل */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px]" />
        </div>

        {/* خط لیزر اسکن نئونی ۳ بعدی */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-[2px] bg-fitness-primary shadow-[0_0_15px_rgba(34,197,94,1),0_0_30px_rgba(34,197,94,0.6)]"
          style={{ right: `${offsetPercent}%` }}
        >
          {/* هندل اسلایدر دایره‌ای متالیک */}
          <div className="absolute top-1/2 -right-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black bg-fitness-primary shadow-[0_0_18px_rgba(34,197,94,0.9)]">
            <svg
              className="h-3.5 w-3.5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l-3 3 3 3m8-6l3 3-3 3"
              />
            </svg>
          </div>
        </div>

        {/* برچسب‌های شناور ۳ بعدی (Glass Badges) */}
        <span className="pointer-events-none absolute top-3.5 right-3.5 rounded-xl border border-white/10 bg-black/65 px-3 py-1 text-[11px] font-black text-white shadow-lg backdrop-blur-md">
          بعد
        </span>
        <span className="pointer-events-none absolute top-3.5 left-3.5 rounded-xl border border-fitness-primary/40 bg-fitness-primary/85 px-3 py-1 text-[11px] font-black text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] backdrop-blur-md">
          قبل
        </span>

        {/* اینپوت رنج لمسی تمام‌صفحه */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          onPointerDown={() => setIsInteracting(true)}
          onPointerUp={() => setIsInteracting(false)}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 touch-pan-y"
          aria-label="اسلایدر مقایسه قبل و بعد"
        />

        {/* راهنمای کوچک لمس در پایین تصویر */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-3 py-0.5 text-[10px] text-zinc-300 backdrop-blur-md">
          اسلایدر را بکشید
        </div>
      </div>

      {/* اطلاعات کارنامه شاگرد با لایه‌بندی شفاف */}
      <div className="mt-4 px-1.5">
        <div className="flex items-center justify-between">
          <span className="text-base font-black tracking-tight text-white">
            {item.name}
          </span>
          <span className="rounded-xl border border-fitness-primary/30 bg-fitness-primary/10 px-3 py-0.5 text-xs font-bold text-fitness-primary">
            {item.period}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-fitness-muted">
          {item.achievement}
        </p>
      </div>
    </div>
  );
}
