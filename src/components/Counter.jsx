"use client";

import { useEffect, useRef } from "react";
import {
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";

// تابع تبدیل ارقام فارسی و عربی به انگلیسی
const toEnglishDigits = (str) =>
  str
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

export function Counter({ value, duration = 1.2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px 150px 0px" });

  const rawString = String(value);
  const normalizedStr = toEnglishDigits(rawString);

  // استخراج عدد هدف
  const numberMatch = normalizedStr.match(/\d+/);
  const targetNumber = numberMatch ? parseInt(numberMatch[0], 10) : 0;

  // جداسازی متن‌های قبل و بعد از عدد
  const parts = rawString.split(/[۰-۹\d]+/);

  const prefix = parts[0] || "";
  const suffix = parts[1] || "";

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView && targetNumber > 0) {
      const controls = animate(count, targetNumber, {
        duration: duration,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [isInView, targetNumber, count, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      if (ref.current) {
        // تبدیل مجدد عدد در حال شمارش به ارقام فارسی
        ref.current.textContent = `${prefix}${latest.toLocaleString("fa-IR")}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [rounded, prefix, suffix]);

  return (
    <span ref={ref} dir="rtl">
      {prefix}۰{suffix}
    </span>
  );
}
