import { NextResponse } from "next/server";

export const runtime = "nodejs";

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, goal, experience, notes, calculatedStats } = body;

    // اعتبارسنجی فیلدهای ضروری
    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, error: "لطفاً نام و شماره تماس خود را وارد کنید." },
        { status: 400 },
      );
    }

    const safeName = escapeHtml(name.trim());
    const safePhone = escapeHtml(phone.trim());
    const safeGoal = escapeHtml(goal || "تعیین نشده");
    const safeExperience = escapeHtml(experience || "ذکر نشده");
    const safeNotes = escapeHtml(notes || "ندارد");

    // استانداردسازی شماره تماس
    let formattedPhone = phone.trim().replace(/[\s\-\+]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "98" + formattedPhone.substring(1);
    }

    // ساخت بخش گزارش متمرکز و تفکیک‌شده آنالیز بدنی
    let statsSectionHtml = "";
    if (calculatedStats?.result) {
      const genderLabel = calculatedStats.gender === "female" ? "خانم" : "آقا";

      // استخراج کالری و استراتژی انتخابی کاربر
      const chosenCalories =
        calculatedStats.result.targetCalories ||
        calculatedStats.result.tdee ||
        "-";

      const chosenGoalTitle =
        calculatedStats.result.goal ||
        (calculatedStats.result.goalKey === "bulk"
          ? "حجم و عضله‌سازی"
          : calculatedStats.result.goalKey === "maintain"
            ? "تثبیت وزن"
            : "کات و چربی‌سوزی");

      // تفکیک ماکروها با نام کامل «کربوهیدرات»
      const protein = calculatedStats.result.macros?.protein
        ? `${calculatedStats.result.macros.protein}g`
        : `${Math.round((Number(chosenCalories) * 0.3) / 4)}g`;

      const carbs = calculatedStats.result.macros?.carbs
        ? `${calculatedStats.result.macros.carbs}g`
        : `${Math.round((Number(chosenCalories) * 0.45) / 4)}g`;

      const fats = calculatedStats.result.macros?.fats
        ? `${calculatedStats.result.macros.fats}g`
        : `${Math.round((Number(chosenCalories) * 0.25) / 9)}g`;

      statsSectionHtml = `
━━━━━━━━━━━━━━
📊 <b>آنالیز اختصاصی ماشین‌حساب:</b>
• مشخصات: ${genderLabel} / ${calculatedStats.age || "-"} سال
• وزن بدن: <b>${calculatedStats.weight || "-"} کیلوگرم</b>
• قد: <b>${calculatedStats.height || "-"} سانتی‌متر</b>
• متابولیسم پایه (BMR): <b>${calculatedStats.result.bmr || "-"} kcal</b>
• استراتژی انتخابی: <b>${chosenGoalTitle}</b>
• تارگت کالری روزانه: <b>${chosenCalories} kcal</b>
• ماکرو پیشنهادی: پروتئین: ${protein} | کربوهیدرات: ${carbs} | چربی: ${fats}`;
    }

    // تاریخ با منطقه زمانی تهران
    const currentDate = new Date().toLocaleDateString("fa-IR", {
      timeZone: "Asia/Tehran",
    });

    // قالب نهایی و خوانا برای پیام تلگرام
    const messageText = `🏋️‍♂️ <b>درخواست جدید مشاوره کوچینگ</b>
━━━━━━━━━━━━━━
👤 <b>نام متقاضی:</b> ${safeName}
📞 <b>شماره تماس:</b> <code>${safePhone}</code>
🎯 <b>هدف اعلامی در فرم:</b> ${safeGoal}
📊 <b>سابقه تمرین:</b> ${safeExperience}
📝 <b>توضیحات:</b> ${safeNotes}${statsSectionHtml}
━━━━━━━━━━━━━━
⏰ <b>زمان ثبت:</b> ${currentDate}`;

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const coachTelegramUsername =
      process.env.NEXT_PUBLIC_COACH_TELEGRAM_USERNAME || "";

    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "💬 چت مستقیم با متقاضی در تلگرام",
            url: `https://t.me/${formattedPhone}`,
          },
        ],
        [
          {
            text: "🤖 دریافت برنامه غذایی با هوش مصنوعی",
            callback_data: "generate_ai_diet",
          },
        ],
      ],
    };

    const notificationPromises = [];

    if (telegramToken && telegramChatId) {
      const fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000),
      };

      // ۱. ارسال پیام متنی
      notificationPromises.push(
        fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          ...fetchOptions,
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: messageText,
            parse_mode: "HTML",
            reply_markup: inlineKeyboard,
          }),
        }).catch((err) => console.error("Telegram Text Error:", err)),
      );

      // ۲. ارسال کارت کانتکت
      const nameParts = safeName.split(" ");
      notificationPromises.push(
        fetch(`https://api.telegram.org/bot${telegramToken}/sendContact`, {
          ...fetchOptions,
          body: JSON.stringify({
            chat_id: telegramChatId,
            phone_number: formattedPhone.startsWith("+")
              ? formattedPhone
              : `+${formattedPhone}`,
            first_name: nameParts[0] || safeName,
            last_name: nameParts.slice(1).join(" ") || "شاگرد جدید",
          }),
        }).catch((err) => console.error("Telegram Contact Error:", err)),
      );
    }

    await Promise.allSettled(notificationPromises);

    return NextResponse.json(
      {
        success: true,
        message: "درخواست با موفقیت ثبت شد.",
        coachTelegramUsername,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Booking API Fatal Error:", error);
    return NextResponse.json(
      { success: false, error: "خطایی در پردازش اطلاعات رخ داد." },
      { status: 500 },
    );
  }
}
