import { NextResponse } from "next/server";
import { fetchDietFromAI } from "@/lib/ai";
import { generatePersianDietPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // افزایش زمان اجرای تابع روی ورسل تا ۶۰ ثانیه

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

      // ۱. ثبت پاسخ کلیک برای جلوگیری از لودینگ تلگرام
      fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: "⏳ در حال ساخت رژیم با هوش مصنوعی و صدور PDF...",
        }),
      }).catch(console.error);

      // ۲. اجرای کامل پروسه قبل از بستن فانکشن ورسل
      await processDietAndSendPdf(
        botToken,
        chatId,
        originalMessageId,
        originalText,
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
    // ارسال پیام وضعیت به چت
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

    // ۱. دریافت متن رژیم
    console.log("⏳ Fetching diet from AI...");
    const dietText = await fetchDietFromAI(originalText);

    // ۲. تولید بافر PDF
    console.log("⏳ Generating PDF via Chromium...");
    const pdfBuffer = await generatePersianDietPdf(dietText);

    // ۳. ارسال فایل به تلگرام
    console.log("⏳ Uploading PDF to Telegram...");
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    formData.append(
      "document",
      new Blob([pdfBuffer], { type: "application/pdf" }),
      "Diet-Plan-30Days.pdf",
    );
    formData.append("caption", "✅ برنامه غذایی ۳۰ روزه با موفقیت صادر شد.");
    formData.append("reply_to_message_id", originalMessageId.toString());

    await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: "POST",
      body: formData,
    });
    console.log("✅ PDF sent successfully!");
  } catch (err) {
    console.error("❌ Pipeline Failed:", err);
  } finally {
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
