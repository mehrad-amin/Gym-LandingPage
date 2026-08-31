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

  // لیست مدل‌های رسمی و فعال حال حاضر Groq
  const activeGroqModels = [
    "llama-3.1-8b-instant",
    "llama-3.2-11b-vision-preview",
    "llama-3.2-3b-preview",
    "llama-3.2-1b-preview",
  ];

  for (const model of activeGroqModels) {
    try {
      console.log(`🤖 Requesting active Groq model: ${model}...`);

      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      });

      const text = completion.choices?.[0]?.message?.content;
      if (text) {
        console.log(`✅ Success with Groq model: ${model}`);
        return text;
      }
    } catch (err) {
      console.warn(
        `⚠️ Groq model ${model} failed, switching to next...`,
        err.message || err,
      );
    }
  }

  return "خطا در اتصال به هوش مصنوعی رایگان. لطفاً مجدداً تلاش کنید.";
}
