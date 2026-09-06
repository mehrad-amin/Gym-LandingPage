import FitnessCalculator from "@/components/FitnessCalculator";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import BookingForm from "@/components/BookingForm";
import {
  SERVICES,
  TRANSFORMATIONS,
  PRICING_PLANS,
  FAQS,
} from "@/constants/fitnessData";
import ContactSection from "@/components/ContactSection";
import HeroSection from "@/components/HeroSection";
import MethodologySection from "@/components/MethodologySection";
import PricingSection from "@/components/PricingSection";

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-fitness-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

const CURRENT_YEAR = new Date().getFullYear();

export default function FitnessLandingPage() {
  return (
    <main className="flex flex-col items-center justify-between">
      {/* هیرو سکشن */}
      <HeroSection />

      {/* سرویس‌ها و متدها */}
      <MethodologySection services={SERVICES} />

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
      <PricingSection plans={PRICING_PLANS} />

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
            © {CURRENT_YEAR} تمامی حقوق برای آکادمی فیتنس و مربیگری محفوظ است.
          </p>
          <p className="mt-2 font-mono text-[11px] text-fitness-primary">
            Developed by mehrad_amin
          </p>
        </div>
      </footer>
    </main>
  );
}
