"use client";

import React, { useState, useEffect, useId } from "react";

function FlameIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
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
  );
}

function ScaleIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
      />
    </svg>
  );
}

function BoltIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function UserMaleIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="7" r="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 21v-2a6.5 6.5 0 0113 0v2"
      />
    </svg>
  );
}

function UserFemaleIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="7" r="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 21v-2a6 6 0 0112 0v2"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 14l-2 3M15 14l2 3"
      />
    </svg>
  );
}

const ACTIVITY_LEVELS = [
  { id: "sedentary", factor: "1.2", label: "کم‌تحرک", desc: "بدون تمرین" },
  { id: "light", factor: "1.375", label: "فعالیت سبک", desc: "۱-۳ جلسه" },
  { id: "moderate", factor: "1.55", label: "متوسط", desc: "۳-۵ جلسه" },
  { id: "heavy", factor: "1.725", label: "بسیار سنگین", desc: "۶-۷ جلسه" },
];

const getStoredFitnessData = () => {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem("user_fitness_data");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export default function FitnessCalculator() {
  const [initialData] = useState(getStoredFitnessData);

  const [gender, setGender] = useState(() => initialData?.gender || "male");
  const [weight, setWeight] = useState(() => Number(initialData?.weight) || 82);
  const [height, setHeight] = useState(
    () => Number(initialData?.height) || 180,
  );
  const [age, setAge] = useState(() => Number(initialData?.age) || 27);
  const [activityIdx, setActivityIdx] = useState(() => {
    if (!initialData?.activity) return 1;
    const idx = ACTIVITY_LEVELS.findIndex(
      (a) => a.factor === String(initialData.activity),
    );
    return idx !== -1 ? idx : 1;
  });
  const [goal, setGoal] = useState(() => initialData?.result?.goalKey || "cut");

  const bmrBase = 10 * weight + 6.25 * height - 5 * age;
  const bmr = Math.round(gender === "male" ? bmrBase + 5 : bmrBase - 161);
  const currentActivity = ACTIVITY_LEVELS[activityIdx];
  const tdee = Math.round(bmr * parseFloat(currentActivity.factor));

  const targets = {
    cut: Math.round(tdee - 450),
    maintain: tdee,
    bulk: Math.round(tdee + 350),
  };

  const activeTarget = targets[goal];

  const protein = Math.round((activeTarget * 0.3) / 4);
  const carbs = Math.round((activeTarget * 0.45) / 4);
  const fats = Math.round((activeTarget * 0.25) / 9);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const goalTitle =
      goal === "cut"
        ? "کات و چربی‌سوزی"
        : goal === "bulk"
          ? "حجم و عضله‌سازی"
          : "تثبیت وزن";

    const calcResult = {
      tdee: activeTarget,
      targetCalories: activeTarget,
      calories: activeTarget,
      selectedGoalCalories: activeTarget,
      goal: goalTitle,
      goalKey: goal,
      maintenance: tdee,
      cutting: targets.cut,
      bulking: targets.bulk,
      bmr,
    };

    const payload = {
      gender,
      weight: String(weight),
      height: String(height),
      age: String(age),
      activity: currentActivity.factor,
      goal: goalTitle,
      result: calcResult,
    };

    try {
      sessionStorage.setItem("user_fitness_data", JSON.stringify(payload));
      window.dispatchEvent(
        new CustomEvent("fitness_calc_updated", { detail: payload }),
      );
    } catch (err) {
      console.error("Storage dispatch error", err);
    }
  }, [
    gender,
    weight,
    height,
    age,
    activityIdx,
    goal,
    tdee,
    activeTarget,
    bmr,
    currentActivity.factor,
    targets.cut,
    targets.bulk,
  ]);

  const handleReset = () => {
    setGender("male");
    setWeight(80);
    setHeight(178);
    setAge(26);
    setActivityIdx(1);
    setGoal("cut");

    try {
      sessionStorage.removeItem("user_fitness_data");
      window.dispatchEvent(
        new CustomEvent("fitness_calc_updated", { detail: null }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const weightInputId = useId();
  const heightInputId = useId();
  const ageInputId = useId();

  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-[#0c0f12] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(34,197,94,0.1)] md:p-8">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-fitness-primary/20 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-700/15 blur-[90px]" />

      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fitness-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-fitness-primary" />
          </span>
          <span className="font-mono text-[11px] font-bold tracking-widest text-fitness-primary">
            INBODY BIO-SCANNER 4.0
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-[10px] font-medium text-zinc-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
        >
          <svg
            className="h-3 w-3"
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
          <span>پاک‌سازی داده‌ها</span>
        </button>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-3xl border border-fitness-primary/40 bg-gradient-to-b from-[#111815] via-[#09110d] to-black p-6 shadow-[inset_0_0_30px_rgba(34,197,94,0.15)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.04)_1px,transparent_1px)] bg-[size:100%_4px]" />

        <div className="relative z-10 flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="text-center sm:text-right">
            <span className="text-[11px] font-semibold text-fitness-muted">
              تارگت کالری روزانه متناسب با هدف:
            </span>
            <div className="mt-1 flex items-baseline justify-center gap-2 sm:justify-start">
              <span className="font-mono text-5xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                {activeTarget}
              </span>
              <span className="font-mono text-xs font-bold text-fitness-primary">
                KCAL / DAY
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-3 text-[11px] text-zinc-400 sm:justify-start">
              <span>
                BMR: <strong className="text-zinc-200">{bmr}</strong>
              </span>
              <span>•</span>
              <span>
                TDEE پایه: <strong className="text-zinc-200">{tdee}</strong>
              </span>
            </div>
          </div>

          <div className="flex gap-2 rounded-2xl border border-zinc-800/80 bg-black/60 p-2.5 backdrop-blur-md">
            <div className="flex flex-col items-center px-2">
              <span className="text-[9px] text-zinc-500">پروتئین</span>
              <span className="font-mono text-xs font-black text-fitness-primary">
                {protein}g
              </span>
            </div>
            <div className="h-7 w-px bg-zinc-800" />
            <div className="flex flex-col items-center px-2">
              <span className="text-[9px] text-zinc-500">کربو</span>
              <span className="font-mono text-xs font-black text-white">
                {carbs}g
              </span>
            </div>
            <div className="h-7 w-px bg-zinc-800" />
            <div className="flex flex-col items-center px-2">
              <span className="text-[9px] text-zinc-500">چربی</span>
              <span className="font-mono text-xs font-black text-white">
                {fats}g
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-black/70 p-1.5">
          <button
            type="button"
            onClick={() => setGoal("cut")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
              goal === "cut"
                ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FlameIcon className="h-4 w-4" />
            <span>کات و چربی‌سوزی</span>
          </button>
          <button
            type="button"
            onClick={() => setGoal("maintain")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
              goal === "maintain"
                ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ScaleIcon className="h-4 w-4" />
            <span>تثبیت وزن</span>
          </button>
          <button
            type="button"
            onClick={() => setGoal("bulk")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
              goal === "bulk"
                ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BoltIcon className="h-4 w-4" />
            <span>عضله‌سازی و حجم</span>
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <span className="mb-2 block text-[11px] font-semibold text-zinc-400">
            پروفایل فیزیولوژیک:
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGender("male")}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-black transition-all ${
                gender === "male"
                  ? "border-fitness-primary bg-fitness-primary/10 text-fitness-primary shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <UserMaleIcon />
              <span>مرد / MALE</span>
            </button>
            <button
              type="button"
              onClick={() => setGender("female")}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-black transition-all ${
                gender === "female"
                  ? "border-fitness-primary bg-fitness-primary/10 text-fitness-primary shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <UserFemaleIcon />
              <span>زن / FEMALE</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor={weightInputId}
              className="text-xs font-bold text-zinc-300"
            >
              وزن بدن
            </label>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-fitness-primary">
                {weight}
              </span>
              <span className="text-[10px] text-zinc-500">KG</span>
            </div>
          </div>
          <input
            id={weightInputId}
            type="range"
            min="35"
            max="220"
            step="1"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-fitness-primary"
          />
          <div className="mt-1 flex justify-between font-mono text-[9px] text-zinc-600">
            <span>35 kg</span>
            <span>125 kg</span>
            <span>220 kg</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor={heightInputId}
              className="text-xs font-bold text-zinc-300"
            >
              قد
            </label>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-white">
                {height}
              </span>
              <span className="text-[10px] text-zinc-500">CM</span>
            </div>
          </div>
          <input
            id={heightInputId}
            type="range"
            min="120"
            max="225"
            step="1"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-fitness-primary"
          />
          <div className="mt-1 flex justify-between font-mono text-[9px] text-zinc-600">
            <span>120 cm</span>
            <span>172 cm</span>
            <span>225 cm</span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor={ageInputId}
              className="text-xs font-bold text-zinc-300"
            >
              سن
            </label>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black text-white">
                {age}
              </span>
              <span className="text-[10px] text-zinc-500">سال</span>
            </div>
          </div>
          <input
            id={ageInputId}
            type="range"
            min="12"
            max="90"
            step="1"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-fitness-primary"
          />
          <div className="mt-1 flex justify-between font-mono text-[9px] text-zinc-600">
            <span>12 سال</span>
            <span>50 سال</span>
            <span>90 سال</span>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-[11px] font-semibold text-zinc-400">
            فرکانس تمرینی در هفته:
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACTIVITY_LEVELS.map((lvl, idx) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setActivityIdx(idx)}
                className={`flex cursor-pointer flex-col items-center rounded-xl border p-2.5 transition-all ${
                  activityIdx === idx
                    ? "border-fitness-primary bg-fitness-primary/15 shadow-[0_0_15px_rgba(34,197,94,0.25)]"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >
                <span
                  className={`text-[11px] font-bold ${
                    activityIdx === idx
                      ? "text-fitness-primary"
                      : "text-zinc-300"
                  }`}
                >
                  {lvl.label}
                </span>
                <span className="mt-0.5 text-[9px] text-zinc-500">
                  {lvl.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <a
          href="#booking"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-fitness-primary py-4 text-center font-black text-black shadow-[0_0_30px_rgba(34,197,94,0.35)] transition-all hover:bg-fitness-primary-hover active:scale-[0.98]"
        >
          <span>دریافت برنامه اختصاصی بر پایه {activeTarget} کالری</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
