import FitnessCalculator from "@/components/FitnessCalculator";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import BookingForm from "@/components/BookingForm";
import {
  HERO_STATS,
  SERVICES,
  TRANSFORMATIONS,
  PRICING_PLANS,
  FAQS,
} from "@/constants/fitnessData";
import ContactSection from "@/components/ContactSection";

export default function FitnessLandingPage() {
  return (
    <main className="flex flex-col items-center justify-between">
      {/* هیرو سکشن */}
      <section className="relative w-full overflow-hidden border-b border-fitness-border py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="inline-block rounded-full border border-fitness-primary/30 bg-fitness-primary/10 px-4 py-1.5 text-xs font-semibold text-fitness-primary">
            کوچینگ علمی و تخصصی تناسب اندام
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            رسیدن به اوج فیزیک بدنی با <br className="hidden md:inline" />
            <span className="text-fitness-primary">
              برنامه‌ریزی دقیق و بدون حدس‌و‌گمان
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-fitness-muted md:text-lg">
            تمرینات هدفمند، رژیم غذایی اصولی و آنالیز مستمر هفتگی، طراحی‌شده
            اختصاصی برای ژنتیک و سبک زندگی شما.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#booking"
              className="inline-flex items-center justify-center rounded-xl bg-fitness-primary px-8 py-4 font-bold text-black transition-all hover:bg-fitness-primary-hover"
            >
              دریافت برنامه اختصاصی
            </a>
            <a
              href="#calculator"
              className="inline-flex items-center justify-center rounded-xl border border-fitness-border bg-fitness-surface px-8 py-4 font-semibold text-fitness-text transition-all hover:border-fitness-primary"
            >
              محاسبه رایگان کالری
            </a>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 border-t border-fitness-border pt-10">
            {HERO_STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-black text-fitness-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-fitness-muted md:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* سرویس‌ها و متدها */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-black md:text-3xl">
              متدولوژی و دوره‌های تمرینی
            </h2>
            <p className="mt-2 text-sm text-fitness-muted">
              مسیر رسیدن به هدف شما طبق استانداردهای روز فیتنس
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SERVICES.map((s) => (
              <div
                key={s.id}
                className="flex flex-col justify-between rounded-3xl border border-fitness-border bg-fitness-surface p-6 transition-all hover:border-fitness-primary/40"
              >
                <div>
                  <span className="inline-block rounded-md bg-fitness-surface-light px-3 py-1 text-xs font-semibold text-fitness-primary">
                    {s.badge}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fitness-muted">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ماشین حساب BMR / TDEE */}
      <section
        id="calculator"
        className="w-full border-t border-fitness-border py-20"
      >
        <div className="mx-auto max-w-4xl px-6">
          <FitnessCalculator />
        </div>
      </section>

      {/* نتایج و تحول شاگردان */}
      <section className="w-full border-t border-fitness-border py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-black md:text-3xl">
              نتایج واقعی، بدون فیلتر
            </h2>
            <p className="mt-2 text-sm text-fitness-muted">
              اسلایدر را بکشید تا تغییرات فیزیک بدنی را مشاهده کنید
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {TRANSFORMATIONS.map((item) => (
              <BeforeAfterSlider key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* تعرفه‌ها و پکیج‌ها */}
      <section className="w-full border-t border-fitness-border py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-black md:text-3xl">
              پلن‌های کوچینگ و اشتراک
            </h2>
            <p className="mt-2 text-sm text-fitness-muted">
              انتخاب سطح همراهی متناسب با نیاز و تعهد شما
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-8 ${
                  plan.isPopular
                    ? "border-fitness-primary bg-fitness-surface shadow-[0_0_30px_rgba(204,255,0,0.05)]"
                    : "border-fitness-border bg-fitness-surface"
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-fitness-primary px-4 py-1 text-xs font-black text-black">
                    پیشنهاد ویژه مربی
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{plan.title}</h3>
                    <span className="text-xs text-fitness-muted">
                      {plan.duration}
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-black text-fitness-primary">
                    {plan.price}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-fitness-muted"
                      >
                        <svg
                          className="h-4 w-4 shrink-0 text-fitness-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#booking"
                  className={`mt-8 block w-full rounded-xl py-3 text-center font-bold transition-all ${
                    plan.isPopular
                      ? "bg-fitness-primary text-black hover:bg-fitness-primary-hover"
                      : "border border-fitness-border bg-fitness-surface-light text-fitness-text hover:border-fitness-primary"
                  }`}
                >
                  انتخاب این پلن
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* سوالات متداول */}
      <section className="w-full border-t border-fitness-border py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black md:text-3xl">سوالات پرتکرار</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-fitness-border bg-fitness-surface p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between font-bold text-fitness-text">
                  <span>{faq.question}</span>
                  <span className="transition-transform group-open:rotate-180">
                    ↓
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-fitness-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* بخش راه‌های ارتباطی و موقعیت مکانی */}
      <ContactSection />

      {/* فرم ثبت نام */}
      <section
        id="booking"
        className="w-full border-t border-fitness-border py-20"
      >
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black md:text-3xl">
              شروع همکاری و دریافت مشاوره
            </h2>
            <p className="mt-2 text-sm text-fitness-muted">
              فرم زیر را تکمیل کنید تا برنامه اولیه شما آنالیز و تنظیم شود
            </p>
          </div>
          <BookingForm />
        </div>
      </section>

      {/* فوتر */}
      <footer className="w-full border-t border-fitness-border bg-fitness-surface py-8 text-center text-xs text-fitness-muted">
        <div className="mx-auto max-w-6xl px-6">
          <p>
            © {new Date().getFullYear()} تمامی حقوق برای آکادمی فیتنس و مربیگری
            محفوظ است.
          </p>
          <p className="mt-2 font-mono text-[11px] text-fitness-primary">
            Developed by mehrad_amin
          </p>
        </div>
      </footer>
    </main>
  );
}
