"use client";

import { useState, useEffect } from "react";

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    goal: "کات و چربی‌سوزی",
    experience: "زیر ۶ ماه (مبتدی)",
    notes: "",
  });

  const [calcData, setCalcData] = useState(null);
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });
  const [coachUsername, setCoachUsername] = useState("");

  useEffect(() => {
    const readStoredData = () => {
      try {
        const stored = sessionStorage.getItem("user_fitness_data");
        if (stored) {
          setCalcData(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Error reading stored data", e);
      }
    };

    readStoredData();

    const handleUpdate = (event) => {
      if (event?.detail) {
        setCalcData(event.detail);
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

      // پاکسازی پس از موفقیت
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

  // نمای تایید و تشکر پس از ثبت فرم
  if (status.success) {
    const telegramDirectUrl = coachUsername
      ? `https://t.me/${coachUsername.replace("@", "")}`
      : "https://t.me";

    return (
      <div className="rounded-3xl border border-fitness-primary/30 bg-fitness-surface p-8 text-center shadow-[0_0_40px_rgba(204,255,0,0.08)] md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fitness-primary/20 text-fitness-primary">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h3 className="mt-6 text-2xl font-black text-fitness-text">
          اطلاعات شما با موفقیت ثبت شد!
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fitness-muted">
          مشخصات بدنی و اطلاعات تماس برای مربی ارسال گردید. برای پیگیری سریع‌تر
          می‌توانید مستقیماً وارد تلگرام شوید.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={telegramDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fitness-primary px-8 py-4 font-black text-black transition-all hover:bg-fitness-primary-hover sm:w-auto"
          >
            <span>ارتباط مستقیم با مربی در تلگرام</span>
          </a>

          <button
            type="button"
            onClick={() =>
              setStatus({ loading: false, success: false, error: "" })
            }
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light px-6 py-4 text-xs font-semibold text-fitness-muted transition-all hover:text-fitness-text sm:w-auto"
          >
            ثبت درخواست جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-fitness-border bg-fitness-surface p-6 md:p-10">
      {calcData && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-fitness-primary/30 bg-fitness-primary/10 p-4">
          <div className="text-xs">
            <span className="font-bold text-fitness-primary">
              اطلاعات ماشین‌حساب ضمیمه شد:{" "}
            </span>
            <span className="text-fitness-text">
              وزن: {calcData.weight}kg | قد: {calcData.height}cm | هدف کالری:{" "}
              {calcData.result?.cutting} kcal
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("user_fitness_data");
              setCalcData(null);
            }}
            className="text-xs text-fitness-muted underline hover:text-white"
          >
            حذف
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs text-fitness-muted">
            نام و نام خانوادگی
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="مثال: علی رضایی"
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-fitness-muted">
            شماره تماس (جهت هماهنگی در پیام‌رسان)
          </label>
          <input
            type="tel"
            name="phone"
            required
            dir="ltr"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0912xxxxxxx"
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-right text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs text-fitness-muted">
              هدف اصلی شما
            </label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
            >
              <option value="کات و چربی‌سوزی">کات و چربی‌سوزی</option>
              <option value="افزایش حجم و عضله‌سازی">
                افزایش حجم و عضله‌سازی
              </option>
              <option value="آمادگی جسمانی و سلامت">
                آمادگی جسمانی و سلامت
              </option>
              <option value="آماده‌سازی مسابقات">آماده‌سازی مسابقات</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs text-fitness-muted">
              سابقه تمرین منظم
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
            >
              <option value="زیر ۶ ماه (مبتدی)">زیر ۶ ماه (مبتدی)</option>
              <option value="۱ تا ۳ سال (متوسط)">۱ تا ۳ سال (متوسط)</option>
              <option value="بیش از ۳ سال (پیشرفته)">
                بیش از ۳ سال (پیشرفته)
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-fitness-muted">
            توضیحات تکمیلی یا آسیب‌دیدگی قبلی
          </label>
          <textarea
            rows="3"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="آسیب مفصلی، بیماری خاص یا ترجیحات غذایی..."
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        {status.error && (
          <p className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400">
            {status.error}
          </p>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="w-full cursor-pointer rounded-xl bg-fitness-primary py-4 text-center font-black text-black transition-all hover:bg-fitness-primary-hover disabled:opacity-50"
        >
          {status.loading
            ? "در حال ثبت و ارسال..."
            : "شروع مشاوره و دریافت برنامه"}
        </button>
      </form>
    </div>
  );
}
