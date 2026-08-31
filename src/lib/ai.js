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
تو یک متخصص تغذیه ورزشی بالینی و مربی ارشد فیتنس هستی.
بر اساس مشخصات زیر، یک «برنامه غذایی ۳۰ روزه منعطف و جامع» با منوی انتخابی و جدول جایگزینی مواد غذایی به زبان فارسی و با لحن کاملاً حرفه‌ای بنویس:

${studentDetailsText}

دستورالعمل‌ها:
۱. برای هر وعده اصلی (صبحانه، ناهار، شام) و میان‌وعده‌ها دو گزینه انتخابی (گزینه الف و گزینه ب) با کالری و ارزش غذایی هم‌ارز بنویس.
۲. وزن دقیق اقلام غذایی به گرم یا پیمانه و کالری مشخص باشد.
۳. جدول جایگزینی مواد پروتئینی و کربوهیدراتی برای طول ماه درج شود.
۴. در پایان، جمع کل کالری روزانه و تفکیک تقریبی پروتئین، کربوهیدرات و چربی مشخص شود.
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
