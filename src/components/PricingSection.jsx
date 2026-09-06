"use client";

import React, { useState, useRef } from "react";

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-fitness-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PricingCard({ plan }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const handlePointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCoords({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });

    // چرخش ۳ بعدی ظریف (حداکثر ۸ درجه)
    const rotateX = (y / rect.height - 0.5) * -10;
    const rotateY = (x / rect.width - 0.5) * 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handlePointerLeave = () => {
    setIsInteracting(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onPointerDown={() => setIsInteracting(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      style={{
        transform: isInteracting
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-6px)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
        transition: isInteracting
          ? "none"
          : "transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border p-7 sm:p-9 [transform-style:preserve-3d] ${
        plan.isPopular
          ? "border-fitness-primary/70 bg-gradient-to-b from-[#131d16] via-fitness-surface to-[#0a0d0c] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(34,197,94,0.18)]"
          : "border-fitness-border bg-gradient-to-b from-fitness-surface to-[#0b0e11] shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:border-fitness-border/90"
      }`}
    >
      {/* نور نئونی تعاملی که زیر لمس دست یا نشانگر ماوس حرکت می‌کند */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${coords.x}% ${coords.y}%, rgba(34, 197, 94, 0.16), transparent 80%)`,
        }}
      />

      {/* هاله پشت پلن ویژه */}
      {plan.isPopular && (
        <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-fitness-primary/20 blur-3xl" />
      )}

      {/* بج سه بعدی پیشنهاد مربی (داخل کارت بدون برش) */}
      {plan.isPopular && (
        <div className="mb-4 flex items-center justify-start [transform:translateZ(30px)]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fitness-primary/50 bg-fitness-primary/15 px-3.5 py-1 text-xs font-black text-fitness-primary shadow-[0_0_15px_rgba(34,197,94,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fitness-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-fitness-primary" />
            </span>
            <span>پیشنهاد ویژه مربی</span>
          </span>
        </div>
      )}

      {/* محتوای بالایی کارت با عمق سه‌بعدی */}
      <div className="relative z-10 [transform:translateZ(20px)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white">{plan.title}</h3>
          <span className="rounded-full border border-fitness-border bg-fitness-surface-light px-3 py-1 text-xs font-semibold text-fitness-muted">
            {plan.duration}
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-1">
          <p className="text-3xl font-black tracking-tight text-fitness-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.3)] md:text-4xl">
            {plan.price}
          </p>
        </div>

        {/* لیست ویژگی‌ها */}
        <ul className="mt-7 space-y-3.5 border-t border-fitness-border/60 pt-6">
          {plan.features.map((feat, index) => (
            <li
              key={index}
              className="flex items-center gap-2.5 text-xs sm:text-sm leading-relaxed text-zinc-300"
            >
              <div className="rounded-md border border-fitness-primary/30 bg-fitness-primary/10 p-0.5">
                <CheckIcon />
              </div>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* دکمه انتخاب پلن با افکت پرسپکتیو برجسته */}
      <div className="relative z-10 mt-8 [transform:translateZ(25px)]">
        <a
          href="#booking"
          className={`block w-full rounded-2xl py-4 text-center text-sm font-black transition-all active:scale-[0.98] ${
            plan.isPopular
              ? "bg-fitness-primary text-black shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:bg-fitness-primary-hover hover:shadow-[0_0_35px_rgba(34,197,94,0.5)]"
              : "border border-fitness-border bg-fitness-surface-light text-fitness-text hover:border-fitness-primary hover:text-white"
          }`}
        >
          انتخاب این پلن
        </a>
      </div>
    </div>
  );
}

export default function PricingSection({ plans = PRICING_PLANS }) {
  return (
    <section className="relative w-full border-t border-fitness-border py-16 md:py-24 overflow-hidden">
      {/* نور محیطی ملایم پس‌زمینه */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-fitness-primary/5 blur-[150px]" />

      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full border border-fitness-primary/30 bg-fitness-primary/10 px-3.5 py-1 text-xs font-bold text-fitness-primary mb-3">
            سرمایه‌گذاری روی فیزیک بدنی
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white md:text-4xl">
            پلن‌های کوچینگ و اشتراک
          </h2>
          <p className="mt-2 text-xs text-fitness-muted md:text-sm">
            انتخاب سطح همراهی متناسب با نیاز، اهداف و تعهد شما
          </p>
        </div>

        {/* کارت‌های ۳ بعدی */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
