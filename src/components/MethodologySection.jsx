"use client";

import React, { useState, useRef } from "react";

function ServiceIcon({ id }) {
  if (id === "vip" || id === 1) {
    return (
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-fitness-primary/40 bg-gradient-to-br from-fitness-primary/20 via-black to-zinc-900 shadow-[0_0_20px_rgba(34,197,94,0.25)]">
        <svg
          className="h-6 w-6 text-fitness-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 3h12l4 7-10 11L2 10l4-7z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2 10h20M12 21l-4-11 4-7 4 7-4 11z"
          />
        </svg>
      </div>
    );
  }

  if (id === "cut" || id === 2) {
    return (
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-black to-zinc-900 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        <svg
          className="h-6 w-6 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 16.121A3 3 0 1012.001 11c-.5.5-1 1-1 2.5 0 .5-.5 1-1.122 1.621z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700/60 bg-gradient-to-br from-zinc-700/20 via-black to-zinc-900">
      <svg
        className="h-6 w-6 text-zinc-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      </svg>
    </div>
  );
}

export default function MethodologySection({ services = SERVICES }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    // با توجه به حالت راست‌چین (RTL)
    if (diff > 45 && activeIndex < services.length - 1) {
      setActiveIndex((prev) => prev + 1);
    } else if (diff < -45 && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden">
      {/* نور پس‌زمینه */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fitness-primary/10 blur-[130px]" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full border border-fitness-primary/30 bg-fitness-primary/10 px-3.5 py-1 text-xs font-bold text-fitness-primary mb-3">
            مسیر تمرینی نتیجه‌محور
          </span>
          <h2 className="text-2xl font-black tracking-tight md:text-4xl text-white">
            متدولوژی و دوره‌های تمرینی
          </h2>
          <p className="mt-2 text-sm text-fitness-muted md:text-base">
            طراحی‌شده طبق استانداردهای روز بیومکانیک و هایپرتروفی
          </p>
        </div>

        {/* ۱. نمای موبایل: اسلایدر ۳ بعدی کارتی (Coverflow / 3D Stack) */}
        <div
          className="relative block md:hidden w-full select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative mx-auto h-[350px] w-full max-w-[310px]"
            style={{ perspective: "1000px" }}
          >
            {services.map((s, index) => {
              const offset = index - activeIndex;
              const isActive = offset === 0;
              const isVIP =
                s.badge?.includes("پرطرفدار") || s.id === "vip" || index === 0;

              // تنظیم موقعیت سه‌بعدی برای کارت فعال، قبلی و بعدی
              let transformStyle = "";
              let zIndex = 10 - Math.abs(offset);
              let opacity = 1;

              if (isActive) {
                transformStyle =
                  "translateZ(50px) translateX(0px) rotateY(0deg) scale(1)";
              } else if (offset === -1) {
                // کارت قبلی (سمت راست در RTL)
                transformStyle =
                  "translateZ(-80px) translateX(65px) rotateY(-18deg) scale(0.88)";
                opacity = 0.55;
              } else if (offset === 1) {
                // کارت بعدی (سمت چپ در RTL)
                transformStyle =
                  "translateZ(-80px) translateX(-65px) rotateY(18deg) scale(0.88)";
                opacity = 0.55;
              } else {
                transformStyle = `translateZ(-140px) translateX(${offset * 80}px) scale(0.75)`;
                opacity = 0;
              }

              return (
                <div
                  key={s.id || index}
                  onClick={() => setActiveIndex(index)}
                  style={{
                    transform: transformStyle,
                    zIndex,
                    opacity,
                    transition: "all 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  className={`absolute inset-0 flex flex-col justify-between rounded-3xl border p-6 backdrop-blur-xl ${
                    isVIP
                      ? "border-fitness-primary/50 bg-gradient-to-b from-fitness-surface to-black shadow-[0_12px_40px_rgba(34,197,94,0.18)]"
                      : "border-fitness-border bg-fitness-surface shadow-xl"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <div className="flex w-full items-center justify-between">
                      <ServiceIcon id={s.id || index + 1} />
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${
                          isVIP
                            ? "border border-fitness-primary/40 bg-fitness-primary/15 text-fitness-primary"
                            : "border border-fitness-border bg-fitness-surface-light text-fitness-muted"
                        }`}
                      >
                        {s.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-black text-white">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-fitness-muted">
                      {s.desc}
                    </p>
                  </div>

                  <a
                    href="#booking"
                    className="flex items-center justify-between border-t border-fitness-border/50 pt-3.5 text-xs font-semibold text-fitness-primary"
                  >
                    <span>انتخاب و دریافت برنامه</span>
                    <span className="text-sm">←</span>
                  </a>
                </div>
              );
            })}
          </div>

          {/* نشانگرهای نقطه‌ای (Pagination Dots) */}
          <div className="mt-5 flex justify-center items-center gap-2">
            {services.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? "w-7 bg-fitness-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    : "w-2 bg-fitness-border"
                }`}
                aria-label={`اسلاید ${idx + 1}`}
              />
            ))}
          </div>

          <p className="mt-2 text-center text-[11px] text-fitness-muted/80">
            برای جابه‌جایی، کارت‌ها را به چپ و راست بکشید
          </p>
        </div>

        {/* ۲. نمای دسکتاپ: چیدمان شبکه‌ای منظم با هاور سه‌بعدی */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {services.map((s, index) => {
            const isVIP =
              s.badge?.includes("پرطرفدار") || s.id === "vip" || index === 0;
            return (
              <div
                key={s.id || index}
                className={`group relative flex flex-col justify-between rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-2 ${
                  isVIP
                    ? "border-fitness-primary/50 bg-gradient-to-b from-fitness-surface to-black shadow-[0_10px_35px_rgba(34,197,94,0.12)] hover:border-fitness-primary"
                    : "border-fitness-border bg-fitness-surface hover:border-fitness-border/90"
                }`}
              >
                <div className="flex flex-col items-start">
                  <div className="flex w-full items-center justify-between">
                    <ServiceIcon id={s.id || index + 1} />
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        isVIP
                          ? "border border-fitness-primary/40 bg-fitness-primary/15 text-fitness-primary shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                          : "border border-fitness-border bg-fitness-surface-light text-fitness-muted"
                      }`}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-black text-white group-hover:text-fitness-primary transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-fitness-muted">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 border-t border-fitness-border/50 pt-4 text-xs font-semibold text-fitness-text/80 group-hover:text-fitness-primary transition-colors">
                  <span>مشاهده جزئیات دوره</span>
                  <span className="transition-transform group-hover:-translate-x-1">
                    ←
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
