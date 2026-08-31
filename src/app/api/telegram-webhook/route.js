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

      // ۱. بستن لودینگ دکمه تلگرام
      fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: "⏳ در حال تنظیم برنامه و صدور PDF...",
        }),
      }).catch(console.error);

      // ۲. اجرای پردازش در بک‌گراند ورسل
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
    // ۱. ارسال پیام موقت وضعیت
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

    // ۲. دریافت متن هوش مصنوعی
    const dietText = await fetchDietFromAI(originalText);
    if (!dietText || dietText.startsWith("خطا")) {
      throw new Error(dietText || "خطا در دریافت متن از مدل هوش مصنوعی");
    }

    // ۳. ساخت بافر PDF
    const pdfBuffer = await generatePersianDietPdf(dietText);

    // ۴. ارسال فایل PDF
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

    // ۵. ارسال کارت مخاطب متقاضی (دقیقاً در این قسمت)
    const phoneMatch = originalText.match(/09\d{9}/);
    const nameMatch = originalText.match(/نام:\s*([^\n]+)/);

    if (phoneMatch) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendContact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          phone_number: phoneMatch[0],
          first_name: nameMatch ? nameMatch[1].trim() : "متقاضی کوچینگ",
          reply_to_message_id: originalMessageId,
        }),
      });
    }
  } catch (err) {
    console.error("❌ Pipeline Crash:", err);

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "⚠️ متأسفانه در ساخت فایل PDF خطایی رخ داد. لطفاً لحظاتی بعد مجدداً تلاش کنید.",
        reply_to_message_id: originalMessageId,
      }),
    }).catch(console.error);
  } finally {
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
