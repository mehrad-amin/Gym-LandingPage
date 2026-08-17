"use client";

import { useState } from "react";

export default function BeforeAfterSlider({ item }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e) => {
    setSliderPosition(e.target.value);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-fitness-border bg-fitness-surface p-4">
      <div className="relative aspect-4/5 w-full select-none overflow-hidden rounded-2xl bg-neutral-900">
        <div
          className="absolute inset-0 bg-neutral-800 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.afterImg})` }}
        />
        <div
          className="absolute inset-0 overflow-hidden bg-neutral-700 bg-cover bg-center"
          style={{
            backgroundImage: `url(${item.beforeImg})`,
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        />

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-fitness-primary shadow-[0_0_10px_rgba(204,255,0,0.8)]"
          style={{ right: `${100 - sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-fitness-primary text-[10px] font-bold text-black">
            ↔
          </div>
        </div>

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
          قبل
        </span>
        <span className="absolute top-3 left-3 rounded-md bg-fitness-primary/90 px-2.5 py-1 text-xs font-bold text-black backdrop-blur-xs">
          بعد
        </span>
      </div>

      <div className="mt-4 px-2">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-fitness-text">
            {item.name}
          </span>
          <span className="rounded-full bbg-fitness-surface-light px-2.5 py-0.5 text-xs text-fitness-primary">
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
