import { NextResponse } from "next/server";
import { fetchDietFromAI } from "@/lib/ai";
import { generatePersianDietPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  try {
    const update = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!update?.callback_query || !botToken) {
      return NextResponse.json({ ok: true });
    }

    const { id: callbackQueryId, data, message } = update.callback_query;

    if (data === "generate_ai_diet" && message) {
      const chatId = message.chat.id;
      const originalMessageId = message.message_id;
      const originalText = message.text || "";

      // ۱. پاسخ فوری و بدون معطلی به تلگرام برای بستن حلقه لودینگ و قطع تلاش مجدد تلگرام
      fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: "⏳ درخواست دریافت شد؛ در حال تدوین و ساخت PDF...",
        }),
      }).catch(console.error);

      // ۲. اجرای فرایند ساخت رژیم در پس‌زمینه (بدون await تا ریسپانس معطل نماند)
      processDietAndSendPdf(
        botToken,
        chatId,
        originalMessageId,
        originalText,
      ).catch((err) => console.error("Background Process Error:", err));
    }

    // بازگرداندن پاسخ فوری 200 به تلگرام (جلوگیری قطعی از تکرار درخواست توسط تلگرام)
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ ok: true }); // حتی در صورت خطا هم 200 می‌دهیم تا تلگرام اسپم نکند
  }
}

// تابع پردازش پس‌زمینه
async function processDietAndSendPdf(
  botToken,
  chatId,
  originalMessageId,
  originalText,
) {
  let statusMessageId = null;

  try {
    // ارسال پیام وضعیت موقت
    const statusRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "📄 در حال پردازش اطلاعات شاگرد و ساخت فایل PDF برنامه ۳۰ روزه...",
          reply_to_message_id: originalMessageId,
        }),
      },
    );
    const statusData = await statusRes.json();
    statusMessageId = statusData?.result?.message_id;

    // ۱. دریافت متن از هوش مصنوعی
    const dietText = await fetchDietFromAI(originalText);

    // ۲. ساخت بافر PDF
    const pdfBuffer = await generatePersianDietPdf(dietText);

    // ۳. ارسال فایل به تلگرام
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    formData.append(
      "document",
      new Blob([pdfBuffer], { type: "application/pdf" }),
      "Diet-Plan-30Days.pdf",
    );
    formData.append(
      "caption",
      "✅ برنامه غذایی ۳۰ روزه با موفقیت تنظیم و ارسال شد.",
    );
    formData.append("reply_to_message_id", originalMessageId.toString());

    await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    console.error("Diet Pipeline Failed:", err);
  } finally {
    // پاک کردن پیام وضعیت موقت
    if (statusMessageId) {
      fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: statusMessageId,
        }),
      }).catch(console.error);
    }
  }
}
