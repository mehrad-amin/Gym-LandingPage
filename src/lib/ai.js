import OpenAI from "openai";

export async function fetchDietFromAI(studentDetailsText) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("❌ OPENROUTER_API_KEY is missing!");
    return "خطا: کلید API یافت نشد.";
  }

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    timeout: 30000,
    defaultHeaders: {
      "HTTP-Referer": "https://gym-my-landing-page.vercel.app",
      "X-Title": "Gym Coaching App",
    },
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

  // اولویت ۱ تا ۴: مدل‌های فعال رایگان | اولویت ۵: مدل فوق‌ارزان تجاری به عنوان پشتیبان
  const candidateModels = [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "qwen/qwen-2.5-coder-32b-instruct:free",
    "deepseek/deepseek-chat", // پشتیبان تجاری (هزینه ناچیز)
  ];

  for (const model of candidateModels) {
    try {
      console.log(`🤖 Requesting model: ${model}...`);

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
        `⚠️ Model ${model} failed, switching to next...`,
        err.message || err,
      );
    }
  }

  return "خطا در برقراری ارتباط با مدل‌های هوش مصنوعی. لطفاً دوباره تلاش کنید.";
}
