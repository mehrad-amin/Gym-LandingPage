"use client";

import { useState, useEffect } from "react";

const INITIAL_FORM_DATA = {
  name: "",
  phone: "",
  goal: "کات و چربی‌سوزی",
  experience: "زیر ۶ ماه (مبتدی)",
  notes: "",
};

const GOAL_OPTIONS = [
  "کات و چربی‌سوزی",
  "افزایش حجم و عضله‌سازی",
  "آمادگی جسمانی و سلامت",
  "آماده‌سازی مسابقات",
];

const EXPERIENCE_OPTIONS = [
  "زیر ۶ ماه (مبتدی)",
  "۱ تا ۳ سال (متوسط)",
  "بیش از ۳ سال (پیشرفته)",
];

function SuccessCheckIcon() {
  return (
    <svg
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function BookingForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [calcData, setCalcData] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("user_fitness_data");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });
  const [coachUsername, setCoachUsername] = useState("");

  useEffect(() => {
    const handleUpdate = (event) => {
      const data = event?.detail || null;
      setCalcData(data);

      if (data?.result?.goalKey) {
        if (data.result.goalKey === "cut") {
          setFormData((prev) => ({ ...prev, goal: "کات و چربی‌سوزی" }));
        } else if (data.result.goalKey === "bulk") {
          setFormData((prev) => ({ ...prev, goal: "افزایش حجم و عضله‌سازی" }));
        } else if (data.result.goalKey === "maintain") {
          setFormData((prev) => ({ ...prev, goal: "آمادگی جسمانی و سلامت" }));
        }
      }
    };

    window.addEventListener("fitness_calc_updated", handleUpdate);
    return () =>
      window.removeEventListener("fitness_calc_updated", handleUpdate);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearCalcData = () => {
    try {
      sessionStorage.removeItem("user_fitness_data");
    } catch (_) {}
    setCalcData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    let currentStats = calcData;
    if (!currentStats) {
      try {
        const stored = sessionStorage.getItem("user_fitness_data");
        if (stored) currentStats = JSON.parse(stored);
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          goal: formData.goal,
          experience: formData.experience,
          notes: formData.notes,
          calculatedStats: currentStats || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "خطایی در ثبت اطلاعات رخ داد.");
      }

      setCoachUsername(
        data.coachTelegramUsername ||
          process.env.NEXT_PUBLIC_COACH_TELEGRAM_USERNAME ||
          "",
      );
      setStatus({ loading: false, success: true, error: "" });

      try {
        sessionStorage.removeItem("user_fitness_data");
      } catch (_) {}
      setCalcData(null);
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        error: err.message || "خطایی رخ داده است.",
      });
    }
  };

  if (status.success) {
    const telegramDirectUrl = coachUsername
      ? `https://t.me/${coachUsername.replace("@", "")}`
      : "https://t.me";

    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-fitness-primary/40 bg-gradient-to-b from-[#101b14] via-fitness-surface to-black p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(34,197,94,0.15)] md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-fitness-primary/50 bg-fitness-primary/20 text-fitness-primary shadow-[0_0_25px_rgba(34,197,94,0.4)]">
          <SuccessCheckIcon />
        </div>

        <h3 className="mt-6 text-2xl font-black text-white">
          اطلاعات شما با موفقیت ثبت شد!
        </h3>
        <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-fitness-muted md:text-sm">
          مشخصات بدنی و اطلاعات تماس برای مربی ارسال گردید. برای تسریع در آنالیز
          و دریافت برنامه، می‌توانید مستقیماً وارد تلگرام شوید.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={telegramDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-fitness-primary px-8 py-4 font-black text-black shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-all hover:bg-fitness-primary-hover active:scale-[0.98] sm:w-auto"
          >
            <span>ارتباط مستقیم با مربی در تلگرام</span>
            <span className="text-sm">←</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setFormData(INITIAL_FORM_DATA);
              setStatus({ loading: false, success: false, error: "" });
            }}
            className="w-full rounded-2xl border border-fitness-border bg-zinc-950/70 px-6 py-4 text-xs font-bold text-zinc-300 transition-colors hover:text-white sm:w-auto"
          >
            ثبت فرم جدید
          </button>
        </div>
      </div>
    );
  }

  const displayCalories =
    calcData?.result?.targetCalories ||
    calcData?.result?.tdee ||
    calcData?.result?.cutting;

  const goalName =
    calcData?.result?.goal ||
    (calcData?.result?.goalKey === "bulk"
      ? "افزایش حجم و عضله‌سازی"
      : calcData?.result?.goalKey === "maintain"
        ? "آمادگی جسمانی و سلامت"
        : "کات و چربی‌سوزی");

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-fitness-border bg-gradient-to-b from-fitness-surface via-[#0d1110] to-black p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] md:p-10">
      {/* هاله نور نئونی گوشه فرم */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-fitness-primary/10 blur-[100px]" />

      {/* کارت الصاق آنالیز ماشین‌حساب به سبک هاب بیومتریک */}
      {calcData && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-fitness-primary/40 bg-gradient-to-r from-fitness-primary/10 via-[#0d1a12] to-black p-4 shadow-[0_0_25px_rgba(34,197,94,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fitness-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-fitness-primary" />
              </span>
              <span className="font-mono text-xs font-bold tracking-wider text-fitness-primary">
                بیومتریک متصل شد:
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearCalcData}
              className="cursor-pointer text-[11px] text-zinc-400 underline transition-colors hover:text-red-400"
            >
              حذف داده‌ها
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 text-center font-mono">
            <div className="rounded-xl border border-zinc-800/80 bg-black/50 p-2">
              <span className="text-[10px] text-zinc-500 font-sans">وزن</span>
              <p className="text-xs font-bold text-white">
                {calcData.weight} kg
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-black/50 p-2">
              <span className="text-[10px] text-zinc-500 font-sans">قد</span>
              <p className="text-xs font-bold text-white">
                {calcData.height} cm
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-black/50 p-2">
              <span className="text-[10px] text-zinc-500 font-sans">
                تارگت کالری
              </span>
              <p className="text-xs font-bold text-fitness-primary">
                {displayCalories} kcal
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-black/50 p-2">
              <span className="text-[10px] text-zinc-500 font-sans">
                استراتژی
              </span>
              <p className="text-xs font-bold text-emerald-400 truncate font-sans">
                {goalName}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="booking-name"
              className="mb-2 block text-xs font-medium text-fitness-muted"
            >
              نام و نام خانوادگی
            </label>
            <input
              id="booking-name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: علی رضایی"
              className="w-full rounded-xl border border-fitness-border bg-zinc-950/70 p-3.5 text-sm text-fitness-text outline-none transition-colors focus:border-fitness-primary"
            />
          </div>

          <div>
            <label
              htmlFor="booking-phone"
              className="mb-2 block text-xs font-medium text-fitness-muted"
            >
              شماره تماس (جهت هماهنگی و پشتیبانی)
            </label>
            <input
              id="booking-phone"
              type="tel"
              name="phone"
              required
              dir="ltr"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0912xxxxxxx"
              className="w-full rounded-xl border border-fitness-border bg-zinc-950/70 p-3.5 text-right font-mono text-sm text-fitness-text outline-none transition-colors focus:border-fitness-primary"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="booking-goal"
            className="mb-2 block text-xs font-medium text-fitness-muted"
          >
            هدف اصلی از دوره
          </label>
          <select
            id="booking-goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="w-full rounded-xl border border-fitness-border bg-zinc-950/70 p-3.5 text-sm text-fitness-text outline-none transition-colors focus:border-fitness-primary"
          >
            {GOAL_OPTIONS.map((g) => (
              <option key={g} value={g} className="bg-zinc-900 text-white">
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* سابقه تمرین به شکل دکمه‌های لمسی ارگونومیک */}
        <div>
          <span className="mb-2 block text-xs font-medium text-fitness-muted">
            سابقه تمرین منظم
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {EXPERIENCE_OPTIONS.map((exp) => (
              <button
                key={exp}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, experience: exp }))}
                className={`cursor-pointer rounded-xl border p-3 text-xs font-bold transition-all ${
                  formData.experience === exp
                    ? "border-fitness-primary bg-fitness-primary/15 text-fitness-primary shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="booking-notes"
            className="mb-2 block text-xs font-medium text-fitness-muted"
          >
            توضیحات تکمیلی یا آسیب‌دیدگی مفصلی (اختیاری)
          </label>
          <textarea
            id="booking-notes"
            rows="3"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="هرگونه آسیب‌دیدگی، شرایط پزشکی یا ترجیحات غذایی خاص..."
            className="w-full rounded-xl border border-fitness-border bg-zinc-950/70 p-3.5 text-sm text-fitness-text outline-none transition-colors focus:border-fitness-primary"
          />
        </div>

        {status.error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {status.error}
          </p>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="w-full cursor-pointer rounded-2xl bg-fitness-primary py-4 text-center font-black text-black shadow-[0_0_30px_rgba(34,197,94,0.35)] transition-all hover:bg-fitness-primary-hover active:scale-[0.98] disabled:opacity-50"
        >
          {status.loading
            ? "در حال ثبت و ارسال به ربات..."
            : "شروع مشاوره و دریافت برنامه اختصاصی"}
        </button>
      </form>
    </div>
  );
}
