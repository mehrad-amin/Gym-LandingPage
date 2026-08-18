"use client";

import { useState, useEffect } from "react";

export default function FitnessCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState("1.375");
  const [result, setResult] = useState(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("user_fitness_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        setWeight(parsed.weight || "");
        setHeight(parsed.height || "");
        setAge(parsed.age || "");
        setGender(parsed.gender || "male");
        setActivity(parsed.activity || "1.375");
        setResult(parsed.result || null);
      }
    } catch (e) {
      console.error("Failed to parse fitness data", e);
    }
  }, []);

  const calculateTDEE = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if (!w || !h || !a) return;

    // فرمول Mifflin-St Jeor
    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr = gender === "male" ? bmr + 5 : bmr - 161;

    const tdee = Math.round(bmr * parseFloat(activity));
    const calcResult = {
      tdee,
      cutting: Math.round(tdee - 450),
      bulking: Math.round(tdee + 350),
    };

    setResult(calcResult);

    const payload = {
      weight: w,
      height: h,
      age: a,
      gender,
      activity,
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
    setWeight("");
    setHeight("");
    setAge("");
    setGender("male");
    setActivity("1.375");
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

        {/* دکمه پاک‌سازی و ریست */}
        {(result || weight || height || age) && (
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
          <label className="mb-2 block text-xs text-fitness-muted">جنسیت</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          >
            <option value="male">آقا</option>
            <option value="female">خانم</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs text-fitness-muted">
            وزن (کیلوگرم)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="مثلاً ۷۵"
            required
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-fitness-muted">
            قد (سانتی‌متر)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="مثلاً ۱۸۰"
            required
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-fitness-muted">سن</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="مثلاً ۲۶"
            required
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className="mb-2 block text-xs text-fitness-muted">
            میزان فعالیت روزانه و هفتگی
          </label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          >
            <option value="1.2">کم‌تحرک (بدون تمرین / پشت‌میزنشین)</option>
            <option value="1.375">
              فعالیت سبک (۱ تا ۳ جلسه تمرین در هفته)
            </option>
            <option value="1.55">
              فعالیت متوسط (۳ تا ۵ جلسه تمرین پرفشار)
            </option>
            <option value="1.725">بسیار فعال (۶ تا ۷ جلسه تمرین سنگین)</option>
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
