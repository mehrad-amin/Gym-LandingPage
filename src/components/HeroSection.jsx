"use client";
import dynamic from "next/dynamic";
import { Counter } from "./Counter";
import { HERO_STATS } from "@/constants/fitnessData";

const DumbbellCanvas = dynamic(() => import("./DumbbellCanvas"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex h-[220px] w-full max-w-[340px] items-center justify-center sm:h-[260px]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-fitness-primary border-t-transparent" />
    </div>
  ),
});

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden border-b border-fitness-border py-12 md:py-24">
      {/* نور پس‌زمینه نئونی */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-fitness-primary/15 blur-[120px] md:h-96 md:w-96" />

      <div className="mx-auto max-w-6xl px-6 text-center">
        <span className="inline-block rounded-full border border-fitness-primary/30 bg-fitness-primary/10 px-4 py-1.5 text-xs font-semibold text-fitness-primary">
          کوچینگ علمی و تخصصی تناسب اندام
        </span>

        <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-6xl">
          رسیدن به اوج فیزیک بدنی با <br className="hidden md:inline" />
          <span className="text-fitness-primary">
            برنامه‌ریزی دقیق و بدون حدس‌و‌گمان
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-fitness-muted md:mt-6 md:text-lg">
          تمرینات هدفمند، رژیم غذایی اصولی و آنالیز مستمر هفتگی، طراحی‌شده
          اختصاصی برای ژنتیک و سبک زندگی شما.
        </p>

        {/* المان سه‌بعدی واکنش‌گرا و سازگار با لمس موبایل */}
        <div className="my-3 md:my-5">
          <DumbbellCanvas />
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="#booking"
            className="inline-flex items-center justify-center rounded-xl bg-fitness-primary px-8 py-3.5 text-base font-bold text-black shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all hover:bg-fitness-primary-hover active:scale-[0.98]"
          >
            دریافت برنامه اختصاصی
          </a>
          <a
            href="#calculator"
            className="inline-flex items-center justify-center rounded-xl border border-fitness-border bg-fitness-surface px-8 py-3.5 font-semibold text-fitness-text transition-all hover:border-fitness-primary active:scale-[0.98]"
          >
            محاسبه رایگان کالری
          </a>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 border-t border-fitness-border pt-8 md:mt-16 md:pt-10">
          {HERO_STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black text-fitness-primary md:text-4xl">
                <Counter value={stat.value} duration={2} />
              </p>
              <p className="mt-1 text-xs text-fitness-muted md:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
