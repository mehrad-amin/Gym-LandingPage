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

    // ساخت بخش گزارش محاسبات بدنی در صورت وجود
    let statsSectionHtml = "";
    if (calculatedStats?.result) {
      const genderLabel = calculatedStats.gender === "female" ? "خانم" : "آقا";
      statsSectionHtml = `
📊 <b>آنالیز بدنی و کالری:</b>
• مشخصات: ${genderLabel} / ${calculatedStats.age || "-"} سال
• قد و وزن: ${calculatedStats.height || "-"}cm / ${calculatedStats.weight || "-"}kg
• کالری تثبیت (TDEE): <b>${calculatedStats.result.tdee || "-"} kcal</b>
• تارگت کات: <b>${calculatedStats.result.cutting || "-"} kcal</b>
• تارگت حجم: <b>${calculatedStats.result.bulking || "-"} kcal</b>`;
    }

    // تاریخ با منطقه زمانی تهران
    const currentDate = new Date().toLocaleDateString("fa-IR", {
      timeZone: "Asia/Tehran",
    });

    // قالب پیام تلگرام
    const messageText = `🏋️‍♂️ <b>درخواست جدید مشاوره کوچینگ</b>
━━━━━━━━━━━━━━
👤 <b>نام:</b> ${safeName}
📞 <b>شماره:</b> <code>${safePhone}</code>
🎯 <b>هدف:</b> ${safeGoal}
📊 <b>سابقه تمرین:</b> ${safeExperience}
📝 <b>توضیحات:</b> ${safeNotes}${statsSectionHtml}
━━━━━━━━━━━━━━
⏰ <b>زمان:</b> ${currentDate}`;

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const coachTelegramUsername =
      process.env.NEXT_PUBLIC_COACH_TELEGRAM_USERNAME || "";

    // دکمه اینلاین برای تلگرام
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "💬 چت مستقیم با متقاضی در تلگرام",
            url: `https://t.me/${formattedPhone}`,
          },
        ],
      ],
    };

    const notificationPromises = [];

    if (telegramToken && telegramChatId) {
      const fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000), // جلوگیری از معلق ماندن رکوئست در Vercel
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

    // ارسال موازی بدون معطل کردن ریسپانس در صورت خطای یک سرویس
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
