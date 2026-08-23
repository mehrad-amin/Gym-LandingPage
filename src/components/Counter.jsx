"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const toEnglishDigits = (str) =>
  str
    .replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
    .replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d));

function parseCounterValue(value) {
  const rawString = String(value);
  const normalizedStr = toEnglishDigits(rawString);

  const numberMatch = normalizedStr.match(/\d+/);
  const targetNumber = numberMatch ? parseInt(numberMatch[0], 10) : 0;

  const parts = rawString.split(/[۰-۹\d]+/);
  const prefix = parts[0] || "";
  const suffix = parts[1] || "";

  return { targetNumber, prefix, suffix };
}

export function Counter({ value, duration = 1.2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px 150px 0px" });

  const { targetNumber, prefix, suffix } = useMemo(
    () => parseCounterValue(value),
    [value],
  );

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!isInView || targetNumber <= 0) return;

    const unsubscribe = rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString("fa-IR")}${suffix}`;
      }
    });

    const controls = animate(count, targetNumber, {
      duration,
      ease: "easeOut",
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [isInView, targetNumber, count, rounded, duration, prefix, suffix]);

  return (
    <span ref={ref} dir="rtl">
      {prefix}۰{suffix}
    </span>
  );
}
