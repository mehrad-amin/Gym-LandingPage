"use client";

import { useState } from "react";

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    goal: "کات و چربی‌سوزی",
    experience: "زیر ۱ سال",
    notes: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "مشکلی در ارسال رخ داده است.");
      }

      setStatus({ loading: false, success: true, error: "" });
      setFormData({
        name: "",
        phone: "",
        goal: "کات و چربی‌سوزی",
        experience: "زیر ۱ سال",
        notes: "",
      });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div className="rounded-3xl border border-fitness-border bg-fitness-surface p-6 md:p-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs text-fitness-muted">
            نام و نام خانوادگی
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            required
            dir="ltr"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
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
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
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
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
            >
              <option value="مبتدی (زیر ۶ ماه)">مبتدی (زیر ۶ ماه)</option>
              <option value="متوسط (۱ تا ۳ سال)">متوسط (۱ تا ۳ سال)</option>
              <option value="پیشرفته (بیش از ۳ سال)">
                پیشرفته (بیش از ۳ سال)
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
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="آسیب مفصلی، بیماری خاص یا ترجیحات..."
            className="w-full rounded-xl border border-fitness-border bg-fitness-surface-light p-3 text-sm text-fitness-text outline-none focus:border-fitness-primary"
          />
        </div>

        {status.error && (
          <p className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400">
            {status.error}
          </p>
        )}

        {status.success && (
          <p className="rounded-lg bg-green-500/10 p-3 text-xs text-fitness-primary">
            درخواست شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.
          </p>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="w-full cursor-pointer rounded-xl bg-fitness-primary py-4 text-center font-black text-black transition-all hover:bg-fitness-primary-hover disabled:opacity-50"
        >
          {status.loading
            ? "در حال ارسال اطلاعات..."
            : "شروع مشاوره و دریافت برنامه"}
        </button>
      </form>
    </div>
  );
}
