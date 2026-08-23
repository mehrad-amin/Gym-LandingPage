"use client";

import { useState } from "react";
import Image from "next/image";

export default function BeforeAfterSlider({ item }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e) => {
    setSliderPosition(Number(e.target.value));
  };

  const offsetPercent = 100 - sliderPosition;

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-fitness-border bg-fitness-surface p-4">
      <div
        dir="ltr"
        className="relative aspect-4/5 w-full select-none overflow-hidden rounded-2xl bg-neutral-900"
      >
        {/* تصویر بعد (پس‌زمینه کامل) */}
        <div className="absolute inset-0">
          <Image
            src={item.afterImg}
            alt={`${item.name} - بعد`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center"
          />
        </div>

        {/* تصویر قبل (با برش داینامیک) */}
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
        </div>

        {/* خط جداکننده و نشانگر وسط */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-fitness-primary shadow-[0_0_10px_rgba(204,255,0,0.8)]"
          style={{ right: `${offsetPercent}%` }}
        >
          <div className="absolute top-1/2 -right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-fitness-primary text-[10px] font-bold text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <polyline points="8 7 3 12 8 17" />
              <polyline points="16 7 21 12 16 17" />
            </svg>
          </div>
        </div>

        {/* کنترل‌کننده لمسی و اسلایدر */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          aria-label="اسلایدر مقایسه قبل و بعد"
        />

        <span className="absolute top-3 right-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
          بعد
        </span>
        <span className="absolute top-3 left-3 rounded-md bg-fitness-primary/90 px-2.5 py-1 text-xs font-bold text-black backdrop-blur-xs">
          قبل
        </span>
      </div>

      <div className="mt-4 px-2">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-fitness-text">
            {item.name}
          </span>
          <span className="rounded-full bg-fitness-surface-light px-2.5 py-0.5 text-xs text-fitness-primary">
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
