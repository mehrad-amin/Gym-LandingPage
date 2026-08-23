"use client";

import { useState } from "react";

const INITIAL_FORM_DATA = {
  weight: "",
  height: "",
  age: "",
  gender: "male",
  activity: "1.375",
};

const ACTIVITY_OPTIONS = [
  { value: "1.2", label: "کم‌تحرک (بدون تمرین / پشت‌میزنشین)" },
  { value: "1.375", label: "فعالیت سبک (۱ تا ۳ جلسه تمرین در هفته)" },
  { value: "1.55", label: "فعالیت متوسط (۳ تا ۵ جلسه تمرین پرفشار)" },
  { value: "1.725", label: "بسیار فعال (۶ تا ۷ جلسه تمرین سنگین)" },
];

export default function FitnessCalculator() {
  // مقداردهی تنبل (Lazy Initializer) - بدون نیاز به useEffect
  const [formData, setFormData] = useState(() => {
    if (typeof window === "undefined") return INITIAL_FORM_DATA;
    try {
      const saved = sessionStorage.getItem("user_fitness_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          weight: parsed.weight || "",
          height: parsed.height || "",
          age: parsed.age || "",
          gender: parsed.gender || "male",
          activity: parsed.activity || "1.375",
        };
      }
    } catch (e) {
      console.error("Failed to parse fitness data", e);
    }
    return INITIAL_FORM_DATA;
  });

  const [result, setResult] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = sessionStorage.getItem("user_fitness_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.result || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTDEE = (e) => {
    e.preventDefault();
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    const a = parseFloat(formData.age);

    if (!w || !h || !a) return;

    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr = formData.gender === "male" ? bmr + 5 : bmr - 161;

    const tdee = Math.round(bmr * parseFloat(formData.activity));
    const calcResult = {
      tdee,
      cutting: Math.round(tdee - 450),
      bulking: Math.round(tdee + 350),
    };

    setResult(calcResult);

    const payload = {
      ...formData,
      result: calcResult,
    };

    try {
      sessionStorage.setItem("user_fitness_data", JSON.stringify(payload));
      window.dispatchEvent(
        new CustomEvent("fitness_calc_updated", { detail: payload }),
      );
    } catch (err) {
      console.error("Session storage error", err);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setResult(null);

    try {
      sessionStorage.removeItem("user_fitness_data");
      window.dispatchEvent(
        new CustomEvent("fitness_calc_updated", { detail: null }),
      );
    } catch (err) {
      console.error("Failed to clear session", err);
    }
  };

  const isFormDirty =
    Boolean(result) ||
    Boolean(formData.weight) ||
    Boolean(formData.height) ||
    Boolean(formData.age);

  return (
    <div className="rounded-3xl border border-fitness-border bg-fitness-surface p-6 md:p-10">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-right">
        <div>
          <h3 className="text-xl font-bold text-fitness-text md:text-2xl">
            محاسبه‌گر کالری و نیاز پایه بدن (TDEE)
          </h3>
          <p className="mt-1 text-sm text-fitness-muted">
            مشخصات فردی خود را وارد کنید تا انرژی روزانه و تارگت‌های تمرینی شما
            دقیق محاسبه شود.
          </p>
        </div>

        {isFormDirty && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-fitness-border bg-fitness-surface-light px-3.5 py-2 text-xs font-semibold text-fitness-muted transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>پاک‌سازی فرم و حافظه</span>
          </button>
        )}
      </div>

      <form
        onSubmit={calculateTDEE}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <label
            htmlFor="gender"
            className="mb-2 block text-xs text-fitness-muted"
          >
            جنسیت
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          >
            <option value="male">آقا</option>
            <option value="female">خانم</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="weight"
            className="mb-2 block text-xs text-fitness-muted"
          >
            وزن (کیلوگرم)
          </label>
          <input
            id="weight"
            name="weight"
            type="number"
            value={formData.weight}
            onChange={handleChange}
            placeholder="مثلاً ۷۵"
            required
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        <div>
          <label
            htmlFor="height"
            className="mb-2 block text-xs text-fitness-muted"
          >
            قد (سانتی‌متر)
          </label>
          <input
            id="height"
            name="height"
            type="number"
            value={formData.height}
            onChange={handleChange}
            placeholder="مثلاً ۱۸۰"
            required
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        <div>
          <label
            htmlFor="age"
            className="mb-2 block text-xs text-fitness-muted"
          >
            سن
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            placeholder="مثلاً ۲۶"
            required
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label
            htmlFor="activity"
            className="mb-2 block text-xs text-fitness-muted"
          >
            میزان فعالیت روزانه و هفتگی
          </label>
          <select
            id="activity"
            name="activity"
            value={formData.activity}
            onChange={handleChange}
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-fitness-primary py-3.5 text-center font-bold text-black transition-colors hover:bg-fitness-primary-hover"
          >
            محاسبه آنی کالری مصرفی
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8 border-t border-fitness-border pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-fitness-surface-light p-4 text-center">
              <span className="text-xs text-fitness-muted">
                کالری نگه‌دارنده (تثبیت)
              </span>
              <p className="mt-1 text-2xl font-black text-fitness-text">
                {result.tdee} kcal
              </p>
            </div>
            <div className="rounded-2xl border border-fitness-primary/30 bg-fitness-surface-light p-4 text-center">
              <span className="text-xs text-fitness-primary">
                هدف چربی‌سوزی و کات
              </span>
              <p className="mt-1 text-2xl font-black text-fitness-primary">
                {result.cutting} kcal
              </p>
            </div>
            <div className="rounded-2xl bg-fitness-surface-light p-4 text-center">
              <span className="text-xs text-fitness-muted">
                هدف حجم و عضله‌سازی
              </span>
              <p className="mt-1 text-2xl font-black text-fitness-text">
                {result.bulking} kcal
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <a
              href="#booking"
              className="inline-flex items-center gap-2 text-sm font-bold text-fitness-primary underline underline-offset-8 transition-colors hover:text-fitness-primary-hover"
            >
              ثبت این نتایج و دریافت برنامه تمرینی متناسب با آن ←
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
