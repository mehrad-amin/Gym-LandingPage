import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { fetchDietFromAI } from "@/lib/ai";
import { generatePersianDietPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
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
      const originalText = message.text || message.caption || "";

      // ۱. ثبت فوری پاسخ کلیک برای بستن لودینگ دکمه در تلگرام
      fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: "⏳ درخواست دریافت شد؛ در حال تنظیم و ساخت فایل PDF...",
        }),
      }).catch(console.error);

      // ۲. سپردن پردازش پس‌زمینه به waitUntil
      waitUntil(
        processDietAndSendPdf(
          botToken,
          chatId,
          originalMessageId,
          originalText,
        ),
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Webhook Fatal Error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function processDietAndSendPdf(
  botToken,
  chatId,
  originalMessageId,
  originalText,
) {
  let statusMessageId = null;

  try {
    // ۱. ارسال پیام موقت «در حال پردازش»
    const statusRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🤖 هوش مصنوعی در حال تنظیم رژیم و طراحی فایل PDF اختصاصی است...",
          reply_to_message_id: originalMessageId,
        }),
      },
    );
    const statusData = await statusRes.json();
    statusMessageId = statusData?.result?.message_id;

    // ۲. دریافت متن از هوش مصنوعی
    const dietText = await fetchDietFromAI(originalText);

    // بررسی خطای احتمالی از سمت تابع هوش مصنوعی
    if (!dietText || dietText.startsWith("خطا")) {
      throw new Error(dietText || "پاسخی از مدل‌های هوش مصنوعی دریافت نشد.");
    }

    // ۳. تولید بافر PDF
    const pdfBuffer = await generatePersianDietPdf(dietText);

    // ۴. ارسال فایل PDF به تلگرام
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    formData.append(
      "document",
      new Blob([pdfBuffer], { type: "application/pdf" }),
      "Diet-Plan-30Days.pdf",
    );
    formData.append("caption", "✅ برنامه غذایی ۳۰ روزه با موفقیت صادر شد.");
    formData.append("reply_to_message_id", originalMessageId.toString());

    const sendDocRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendDocument`,
      {
        method: "POST",
        body: formData,
      },
    );
    const sendDocData = await sendDocRes.json();

    if (!sendDocData.ok) {
      throw new Error(`خطای ارسال به تلگرام: ${sendDocData.description}`);
    }
  } catch (err) {
    console.error("❌ Pipeline Crash:", err);

    // ۵. ارسال پیام خطای کاربردی به کاربر در صورت شکست عملیات
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "⚠️ متأسفانه در ساخت فایل PDF خطایی رخ داد.\n\nعلت معمولاً ترافیک بالای سرورهای هوش مصنوعی است. لطفاً چند لحظه بعد مجدداً روی دکمه کلیک کنید.",
        reply_to_message_id: originalMessageId,
      }),
    }).catch(console.error);
  } finally {
    // ۶. حذف پیام وضعیت موقت
    if (statusMessageId) {
      fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: statusMessageId,
        }),
      }).catch(() => {});
    }
  }
}
