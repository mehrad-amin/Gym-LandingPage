"use client";

import React, { useState } from "react";

function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

export default function FaqSection({ faqs = FAQS }) {
  // نگهداری ایندکس سوال باز؛ مقدار null یعنی همه بسته‌اند
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="relative w-full border-t border-fitness-border py-16 md:py-24 overflow-hidden">
      {/* هاله نور پس‌زمینه */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fitness-primary/5 blur-[140px]" />

      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full border border-fitness-primary/30 bg-fitness-primary/10 px-3.5 py-1 text-xs font-bold text-fitness-primary mb-3">
            شفافیت قبل از شروع
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white md:text-4xl">
            سوالات پرتکرار
          </h2>
          <p className="mt-2 text-xs text-fitness-muted md:text-sm">
            پاسخ به متداول‌ترین سوالات شاگردان پیش از ثبت‌نام و شروع دوره
          </p>
        </div>

        {/* لیست آکاردئونی تکی (Single-Open Accordion) */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const formattedIdx = String(idx + 1).padStart(2, "0");

            return (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b from-fitness-surface to-[#0a0d0c] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                  isOpen
                    ? "border-fitness-primary/60 shadow-[0_12px_35px_rgba(34,197,94,0.12)] scale-[1.01]"
                    : "border-fitness-border hover:border-fitness-border/90"
                }`}
              >
                {/* خط نئونی بالای کارت در صورت باز بودن */}
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-fitness-primary/80 to-transparent transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full cursor-pointer select-none items-center justify-between gap-4 text-right"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`font-mono text-xs font-black transition-colors ${
                        isOpen
                          ? "text-fitness-primary"
                          : "text-fitness-muted/60"
                      }`}
                    >
                      {formattedIdx}
                    </span>
                    <span
                      className={`text-sm font-black transition-colors md:text-base ${
                        isOpen ? "text-fitness-primary" : "text-zinc-100"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </div>

                  {/* دکمه ۳ بعدی با چرخش ۴۵ درجه به ضربدر */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 border-fitness-primary/50 bg-fitness-primary/15 text-fitness-primary shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                        : "border-zinc-800 bg-zinc-900/80 text-zinc-400"
                    }`}
                  >
                    <PlusIcon />
                  </div>
                </button>

                {/* باز و بسته شدن روان با تکنیک گرید CSS */}
                <div
                  className={`grid transition-[grid-template-rows] duration-150 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-4"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  }`}
                >
                  <div className="overflow-hidden border-r-2 border-fitness-primary/40 pr-4 pt-1">
                    <p className="text-xs leading-relaxed text-fitness-muted md:text-sm">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* کارت ارتباط مستقیم */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 text-center sm:flex-row sm:text-right">
          <div>
            <p className="text-xs font-bold text-zinc-200">
              سوال دیگری دارید که در لیست نبود؟
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              می‌توانید مستقیم در تلگرام از مربی بپرسید.
            </p>
          </div>
          <a
            href="https://t.me/mehrad_amin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-fitness-primary/40 bg-fitness-primary/10 px-4 py-2 text-xs font-bold text-fitness-primary transition-colors hover:bg-fitness-primary hover:text-black"
          >
            <span>چت مستقیم با مربی</span>
            <span className="text-sm">←</span>
          </a>
        </div>
      </div>
    </section>
  );
}
