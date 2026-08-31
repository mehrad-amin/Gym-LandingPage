import OpenAI from "openai";

export async function fetchDietFromAI(studentDetailsText) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY is missing!");
    return "خطا: کلید API یافت نشد.";
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: apiKey,
    timeout: 30000,
  });

  const prompt = `
تو یک مربی ارشد فیتنس و متخصص تغذیه کاربردی هستی.
بر اساس مشخصات شاگرد زیر، یک «برنامه غذایی ۳۰ روزه کاربردی، ساده و کاملاً قابل فهم» به زبان فارسی تنظیم کن:

${studentDetailsText}

قوانین نگارش برنامه (بسیار مهم):
۱. از نوشتن اعداد ریز کالری، جدول‌های پیچیده ریاضی و گرم‌های گیج‌کننده برای تک‌تک غذاها خودداری کن.
۲. حجم غذاها را با «واحدهای روزمره و ملموس خانگی» بنویس (مانند: کف دست، قاشق غذاخوری، پیاله، عدد، لیوان).
۳. ساختار برنامه شامل ۴ بخش مجزا باشد:
   - 🍳 صبحانه (۲ گزینه انتخابی ساده)
   - 🥗 ناهار (۲ گزینه انتخابی ساده و ایرانی)
   - 🍎 میان‌وعده (عصرانه سبک و کاربردی)
   - 🍲 شام (۲ گزینه سبک و پروتئینی)
۴. در انتهای برنامه فقط ۲ تا ۳ نکته طلایی برای پایبندی به رژیم (نوشیدن آب، خواب و ادویه‌ها) بنویس.
۵. لحن متن کاملاً انگیزشی، شفاف و خوانا باشد و از به کاربردن اصطلاحات پیچیده خودداری شود.
`;

  try {
    // ۱. دریافت زنده لیست تمام مدل‌های فعال حال حاضر در سرور
    const modelsList = await openai.models.list();
    const availableModels = modelsList.data.map((m) => m.id);
    console.log("📋 Currently Active Models on Groq:", availableModels);

    // ۲. فیلتر کردن مدل‌های متنی (صرف‌نظر از مدل‌های صرفاً صوتی مانند whisper)
    const textModels = availableModels.filter(
      (id) => !id.includes("whisper") && !id.includes("guard"),
    );

    if (textModels.length === 0) {
      throw new Error("هیچ مدل متنی فعالی یافت نشد.");
    }

    // ۳. ارسال درخواست به اولین مدل فعال
    for (const model of textModels) {
      try {
        console.log(`🤖 Requesting dynamically discovered model: ${model}...`);
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
        });

        const text = completion.choices?.[0]?.message?.content;
        if (text) {
          console.log(`✅ Success with model: ${model}`);
          return text;
        }
      } catch (err) {
        console.warn(
          `⚠️ Model ${model} failed, trying next available...`,
          err.message || err,
        );
      }
    }
  } catch (err) {
    console.error("❌ Failed to fetch active models:", err);
  }

  return "خطا در برقراری ارتباط با مدل‌های هوش مصنوعی. لطفاً دوباره تلاش کنید.";
}
