"use client";

import React, { useState, useRef } from "react";

function ServiceIcon({ id }) {
  if (id === "vip" || id === 1) {
    return (
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-fitness-primary/40 bg-gradient-to-br from-fitness-primary/20 via-black to-zinc-900 shadow-[0_0_15px_rgba(34,197,94,0.25)]">
        <svg
          className="h-5 w-5 text-fitness-primary"
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
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-black to-zinc-900 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
        <svg
          className="h-5 w-5 text-emerald-400"
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
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/60 bg-gradient-to-br from-zinc-700/20 via-black to-zinc-900">
      <svg
        className="h-5 w-5 text-zinc-300"
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

  // تابع انتقال چرخشی به کارت بعدی (بدون بن‌بست)
  const goToNextCard = () => {
    setActiveIndex((prev) => (prev + 1) % services.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = Math.abs(touchStartX.current - touchEndX.current);
    // چه کاربر به چپ بکشد چه به راست، با حداقل ۳۰ پیکسل سوایپ به کارت بعدی می‌رود
    if (diff > 30) {
      goToNextCard();
    }
  };

  return (
    <section className="relative w-full py-12 md:py-24 overflow-hidden">
      {/* نور پس‌زمینه لطیف */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fitness-primary/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center md:mb-12">
          <span className="inline-block rounded-full border border-fitness-primary/30 bg-fitness-primary/10 px-3.5 py-1 text-xs font-bold text-fitness-primary mb-2.5">
            مسیر تمرینی نتیجه‌محور
          </span>
          <h2 className="text-2xl font-black tracking-tight md:text-4xl text-white">
            متدولوژی و دوره‌های تمرینی
          </h2>
          <p className="mt-1.5 text-xs text-fitness-muted md:text-sm">
            طراحی‌شده طبق استانداردهای روز بیومکانیک و هایپرتروفی
          </p>
        </div>

        {/* ۱. نمای موبایل: ۳D Coverflow فیت و چرخش نامحدود */}
        <div
          className="relative block md:hidden w-full select-none cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={goToNextCard}
        >
          {/* ارتفاع فیت‌شده روی 240 پیکسل بدون فضای مرده */}
          <div
            className="relative mx-auto h-[240px] w-full max-w-[320px]"
            style={{ perspective: "900px" }}
          >
            {services.map((s, index) => {
              // محاسبه موقعیت نسبی در حلقه نامحدود (Infinite Loop)
              const count = services.length;
              let diff = (index - activeIndex) % count;
              if (diff < -Math.floor(count / 2)) diff += count;
              if (diff > Math.floor(count / 2)) diff -= count;

              const isActive = diff === 0;
              const isVIP =
                s.badge?.includes("پرطرفدار") || s.id === "vip" || index === 0;

              let transformStyle = "";
              let zIndex = 10 - Math.abs(diff);
              let opacity = 1;

              if (isActive) {
                transformStyle =
                  "translateZ(35px) translateX(0px) rotateY(0deg) scale(1)";
              } else if (diff === 1) {
                // کارت بعدی
                transformStyle =
                  "translateZ(-60px) translateX(-45px) rotateY(14deg) scale(0.92)";
                opacity = 0.55;
              } else if (diff === -1) {
                // کارت قبلی
                transformStyle =
                  "translateZ(-60px) translateX(45px) rotateY(-14deg) scale(0.92)";
                opacity = 0.55;
              } else {
                transformStyle = `translateZ(-120px) translateX(${diff * 60}px) scale(0.8)`;
                opacity = 0;
              }

              return (
                <div
                  key={s.id || index}
                  style={{
                    transform: transformStyle,
                    zIndex,
                    opacity,
                    transition: "all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                  }}
                  className={`absolute inset-0 flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-xl ${
                    isVIP
                      ? "border-fitness-primary/50 bg-gradient-to-b from-fitness-surface to-black shadow-[0_8px_30px_rgba(34,197,94,0.16)]"
                      : "border-fitness-border bg-fitness-surface shadow-lg"
                  }`}
                >
                  <div>
                    <div className="flex w-full items-center justify-between">
                      <ServiceIcon id={s.id || index + 1} />
                      <span
                        className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
                          isVIP
                            ? "border border-fitness-primary/40 bg-fitness-primary/15 text-fitness-primary"
                            : "border border-fitness-border bg-fitness-surface-light text-fitness-muted"
                        }`}
                      >
                        {s.badge}
                      </span>
                    </div>

                    <h3 className="mt-3.5 text-base font-black text-white">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-fitness-muted line-clamp-3">
                      {s.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-fitness-border/40 pt-2.5 text-[11px] font-semibold text-fitness-primary">
                    <span>انتخاب و دریافت برنامه</span>
                    <span className="text-xs">←</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* نشانگر نقطه‌ای */}
          <div className="mt-4 flex justify-center items-center gap-1.5">
            {services.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? "w-6 bg-fitness-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    : "w-1.5 bg-fitness-border"
                }`}
                aria-label={`دوره ${idx + 1}`}
              />
            ))}
          </div>

          <p className="mt-2 text-center text-[10px] text-fitness-muted/70">
            برای رفتن به دوره بعدی، به چپ/راست بکشید یا لمس کنید
          </p>
        </div>

        {/* ۲. نمای دسکتاپ */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {services.map((s, index) => {
            const isVIP =
              s.badge?.includes("پرطرفدار") || s.id === "vip" || index === 0;
            return (
              <div
                key={s.id || index}
                className={`group relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1.5 ${
                  isVIP
                    ? "border-fitness-primary/50 bg-gradient-to-b from-fitness-surface to-black shadow-[0_10px_35px_rgba(34,197,94,0.12)] hover:border-fitness-primary"
                    : "border-fitness-border bg-fitness-surface hover:border-fitness-border/90"
                }`}
              >
                <div>
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

                  <h3 className="mt-4 text-xl font-black text-white group-hover:text-fitness-primary transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fitness-muted">
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
