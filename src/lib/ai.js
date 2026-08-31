import OpenAI from "openai";

export async function fetchDietFromAI(studentDetailsText) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("❌ OPENROUTER_API_KEY is missing!");
    return "خطا: کلید API تعریف نشده است.";
  }

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Gym Coaching App",
    },
  });

  const prompt = `
تو یک متخصص تغذیه ورزشی بالینی و مربی ارشد فیتنس هستی.
بر اساس مشخصات زیر، یک «پکیج برنامه غذایی ۳۰ روزه منعطف» با منوی انتخابی و جدول جایگزینی مواد غذایی به زبان فارسی و با لحن حرفه‌ای بنویس:

${studentDetailsText}

دستورالعمل‌ها:
۱. برای هر وعده اصلی (صبحانه، ناهار، شام) و میان‌وعده‌ها دو گزینه انتخابی (گزینه الف و گزینه ب) با کالری و ارزش غذایی هم‌ارز بنویس.
۲. وزن دقیق اقلام غذایی به گرم یا پیمانه و کالری مشخص باشد.
۳. جدول جایگزینی مواد پروتئینی و کربوهیدراتی برای طول ماه درج شود.
۴. در پایان، جمع کل کالری روزانه و تفکیک تقریبی پروتئین، کربوهیدرات و چربی مشخص شود.
`;

  // لیست مدل‌ها به ترتیب اولویت فراخوانی
  const fallbackModels = [
    "google/gemini-3.5-flash", // اولویت اول: مدل جمینای فلش
    "deepseek/deepseek-chat", // اولویت سوم: دیپ‌سیک
    "meta-llama/llama-3.3-70b-instruct", // اولویت چهارم: لاما
    "openai/gpt-4o-mini", // اولویت پنجم: اوپن‌ای‌آی
  ];

  for (const model of fallbackModels) {
    try {
      console.log(`🤖 Trying model: ${model}...`);

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
      console.warn(`⚠️ Model ${model} failed:`, err.message || err);
      // رفتن سراغ مدل بعدی در صورت بروز خطا، قطعی یا ترافیک بالا
    }
  }

  return "خطا: هیچ‌کدام از مدل‌های هوش مصنوعی در دسترس نبودند. لطفاً چند لحظه بعد مجدداً امتحان کنید.";
}
