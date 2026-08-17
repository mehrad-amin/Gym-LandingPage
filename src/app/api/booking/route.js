import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, goal, experience, notes } = body;

    if (!name || !phone || !goal) {
      return NextResponse.json(
        { error: "لطفاً اطلاعات الزامی (نام، شماره تماس و هدف) را وارد کنید." },
        { status: 400 },
      );
    }

    const messageText = `🏋️‍♂️ *درخواست جدید مشاوره کوچینگ بدنسازی*
━━━━━━━━━━━━━━
👤 *نام شاگرد:* ${name}
📞 *شماره تماس:* ${phone}
🎯 *هدف تمرینی:* ${goal}
📊 *سابقه تمرین:* ${experience || "ذکر نشده"}
📝 *توضیحات تکمیلی:* ${notes || "ندارد"}
⏰ *زمان ثبت:* ${new Date().toLocaleDateString("fa-IR")}`;

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const baleToken = process.env.BALE_BOT_TOKEN;
    const baleChatId = process.env.BALE_CHAT_ID;

    const notificationPromises = [];

    // نوتیفیکیشن تلگرام
    if (telegramToken && telegramChatId) {
      notificationPromises.push(
        fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: messageText,
            parse_mode: "Markdown",
          }),
        }).catch((err) => console.error("Telegram API Error:", err)),
      );
    }

    // نوتیفیکیشن بله
    if (baleToken && baleChatId) {
      notificationPromises.push(
        fetch(`https://tapi.bale.ai/bot${baleToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: baleChatId,
            text: messageText,
          }),
        }).catch((err) => console.error("Bale API Error:", err)),
      );
    }

    await Promise.allSettled(notificationPromises);

    return NextResponse.json(
      { success: true, message: "اطلاعات با موفقیت ثبت شد." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Booking API Error:", error);
    return NextResponse.json(
      { error: "خطایی در پردازش درخواست رخ داد." },
      { status: 500 },
    );
  }
}
