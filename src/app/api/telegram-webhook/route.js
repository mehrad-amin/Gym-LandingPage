import { NextResponse } from "next/server";
import { fetchDietFromAI } from "@/lib/ai";
import { generatePersianDietPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  try {
    const update = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // لاگ دقیق برای دیدن آبجکت دریافتی از تلگرام
    console.log(
      "📥 [Telegram Incoming Payload]:",
      JSON.stringify(update, null, 2),
    );

    if (!botToken) {
      console.error(
        "❌ TELEGRAM_BOT_TOKEN is missing in Vercel Environment Variables!",
      );
      return NextResponse.json({ ok: true });
    }

    // بررسی کلیک روی اینلاین کیبورد
    const callbackQuery = update?.callback_query;
    if (callbackQuery) {
      const { id: callbackQueryId, data, message } = callbackQuery;
      console.log(
        `🔘 Callback Query Clicked: data="${data}" | ChatID=${message?.chat?.id}`,
      );

      if (data === "generate_ai_diet" && message) {
        const chatId = message.chat.id;
        const originalMessageId = message.message_id;
        const originalText = message.text || message.caption || "";

        console.log("🚀 Starting Diet Pipeline for Chat:", chatId);

        // ۱. بستن لودینگ دکمه تلگرام
        await fetch(
          `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: callbackQueryId,
              text: "⏳ در حال پردازش و تولید فایل PDF...",
            }),
          },
        ).catch((err) => console.error("Error answering callback:", err));

        // ۲. اجرای مراحل و ارسال PDF
        await processDietAndSendPdf(
          botToken,
          chatId,
          originalMessageId,
          originalText,
        );
      } else {
        console.warn(
          `⚠️ Callback data mismatch or missing message. data received: "${data}"`,
        );
      }
    } else {
      console.log("ℹ️ Request received but it is not a callback_query.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Webhook Fatal Catch Error:", error);
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
    // ارسال پیام وضعیت به تلگرام
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
    console.log("⏳ 1/3: Calling AI Model...");
    const dietText = await fetchDietFromAI(originalText);
    console.log("✅ AI Text Received (length):", dietText?.length);

    // ۲. تولید بافر PDF
    console.log("⏳ 2/3: Launching Chromium and generating PDF...");
    const pdfBuffer = await generatePersianDietPdf(dietText);
    console.log("✅ PDF Buffer Generated successfully.");

    // ۳. ارسال فایل PDF به تلگرام
    console.log("⏳ 3/3: Uploading PDF Document to Telegram...");
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    formData.append(
      "document",
      new Blob([pdfBuffer], { type: "application/pdf" }),
      "Diet-Plan-30Days.pdf",
    );
    formData.append(
      "caption",
      "✅ برنامه غذایی ۳۰ روزه با هوش مصنوعی آماده شد.",
    );
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
      console.error(
        "❌ Telegram sendDocument failed:",
        JSON.stringify(sendDocData, null, 2),
      );
    } else {
      console.log("🎉 PDF successfully delivered to Telegram!");
    }
  } catch (err) {
    console.error("❌ Pipeline execution crashed:", err);
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
