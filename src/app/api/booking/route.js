import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, goal, experience, notes, calculatedStats } = body;

    // اعتبارسنجی فیلدهای ضروری
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "لطفاً نام و شماره تماس خود را وارد کنید." },
        { status: 400 },
      );
    }

    // استانداردسازی شماره تماس
    let formattedPhone = phone.trim().replace(/[\s\-\+]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "98" + formattedPhone.substring(1);
    }

    // ساخت بخش گزارش محاسبات بدنی در صورت وجود
    let statsSectionHtml = "";
    let statsSectionPlain = "";

    if (calculatedStats && calculatedStats.result) {
      const genderLabel = calculatedStats.gender === "female" ? "خانم" : "آقا";
      statsSectionHtml = `
📊 <b>آنالیز بدنی و کالری:</b>
• مشخصات: ${genderLabel} / ${calculatedStats.age || "-"} سال
• قد و وزن: ${calculatedStats.height || "-"}cm / ${calculatedStats.weight || "-"}kg
• کالری تثبیت (TDEE): <b>${calculatedStats.result.tdee || "-"} kcal</b>
• تارگت کات: <b>${calculatedStats.result.cutting || "-"} kcal</b>
• تارگت حجم: <b>${calculatedStats.result.bulking || "-"} kcal</b>`;

      statsSectionPlain = `
📊 آنالیز بدنی و کالری:
• مشخصات: ${genderLabel} / ${calculatedStats.age || "-"} سال
• قد و وزن: ${calculatedStats.height || "-"}cm / ${calculatedStats.weight || "-"}kg
• کالری تثبیت: ${calculatedStats.result.tdee || "-"} kcal
• تارگت کات: ${calculatedStats.result.cutting || "-"} kcal
• تارگت حجم: ${calculatedStats.result.bulking || "-"} kcal`;
    }

    // قالب پیام تلگرام
    const messageText = `🏋️‍♂️ <b>درخواست جدید مشاوره کوچینگ</b>
━━━━━━━━━━━━━━
👤 <b>نام:</b> ${name}
📞 <b>شماره:</b> <code>${phone}</code>
🎯 <b>هدف:</b> ${goal || "تعیین نشده"}
📊 <b>سابقه تمرین:</b> ${experience || "ذکر نشده"}
📝 <b>توضیحات:</b> ${notes || "ندارد"}${statsSectionHtml}
━━━━━━━━━━━━━━
⏰ <b>زمان:</b> ${new Date().toLocaleDateString("fa-IR")}`;

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const coachTelegramUsername =
      process.env.NEXT_PUBLIC_COACH_TELEGRAM_USERNAME || "";

    // تعریف دکمه‌های شیشه‌ای اینلاین برای تلگرام
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

    // ارسال غیرهمزمان و ایمن اعلان‌ها (Non-blocking)
    const notificationPromises = [];

    if (telegramToken && telegramChatId) {
      // ۱. ارسال پیام متنی
      notificationPromises.push(
        fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: messageText,
            parse_mode: "HTML",
            reply_markup: inlineKeyboard,
          }),
        }).catch((err) => console.error("Telegram Text Error:", err)),
      );

      // ۲. ارسال کارت کانتکت
      const nameParts = name.trim().split(" ");
      notificationPromises.push(
        fetch(`https://api.telegram.org/bot${telegramToken}/sendContact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            phone_number: formattedPhone.startsWith("+")
              ? formattedPhone
              : `+${formattedPhone}`,
            first_name: nameParts[0] || name,
            last_name: nameParts.slice(1).join(" ") || "شاگرد جدید",
          }),
        }).catch((err) => console.error("Telegram Contact Error:", err)),
      );
    }

    // منتظر ماندن برای ارسال همه بدون خراب کردن ریسپانس
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
