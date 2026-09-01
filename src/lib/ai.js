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
    timeout: 35000,
  });

  const systemInstruction = `
You are an expert sports nutritionist and fitness coach.
CRITICAL RULES:
1. Output MUST be ONLY in Persian (Farsi).
2. DO NOT output any English thinking process, reasoning, planning steps, or intros like "Here's a thinking process".
3. Start IMMEDIATELY with the first markdown heading "## 🎯 اهداف و استراتژی تغذیه".
4. Absolutely NO markdown backticks at the beginning/end (\`\`\`markdown or \`\`\`).
5. Strictly use household units (کف دست، قاشق غذاخوری، لیوان، پیاله) instead of grams or calorie numbers.
6. Consider all dietary notes and allergies (like gluten allergy) carefully.
`;

  const userPrompt = `
بر اساس مشخصات زیر، برنامه غذایی ۳۰ روزه را دقیقاً طبق ساختار مشخص‌شده تنظیم کن:

مشخصات متقاضی:
${studentDetailsText}

قالب دقیق خروجی (دقیقاً با همین عناوین مارک‌داون شروع و پر شود):

## 🎯 اهداف و استراتژی تغذیه
- **هدف اصلی:** [هدف متقاضی]
- **رویکرد تغذیه‌ای:** [توضیح کوتاه ۱ الی ۲ جمله‌ای متناسب با شرایط و حساسیت‌های غذایی]

## 🍳 وعده‌های اصلی و میان‌وعده‌ها

### ۱. صبحانه (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [آیتم‌های ساده با مقیاس خانگی]
- **گزینه ب:** [آیتم‌های جایگزین با مقیاس خانگی]

### ۲. میان‌وعده اول (ساعت ۱۰ تا ۱۱ صبح)
- [گزینه سبک و مقوی]

### ۳. ناهار (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [غذای اصلی + منبع کربوهیدرات + سالاد با مقیاس خانگی]
- **گزینه ب:** [غذای جایگزین با مقیاس خانگی]

### ۴. میان‌وعده عصر (قبل تمرین / عصرانه)
- [سوخت مناسب تمرین با مقیاس خانگی]

### ۵. شام (سبک و زودهنگام)
- **گزینه الف:** [شام پروتئینی و متناسب با شرایط متقاضی]
- **گزینه ب:** [شام جایگزین ساده]

## 🔄 راهنمای جایگزینی سریع
- **پروتئین‌ها:** ۱ کف دست سینه مرغ/گوشت = ۲ عدد تخم‌مرغ = ۱ قوطی کبریت پنیر = ۱ پیاله ماست پرپروتئین
- **کربوهیدرات‌ها:** ۵ قاشق غذاخوری برنج = ۱ عدد سیب‌زمینی متوسط = ۱ پیاله ذرت آبپز = ۱ کف دست نان مناسب

## 💡 ۳ اصل کلیدی برای نتیجه‌گیری حداکثری
۱. **مصرف آب:** حداقل ۸ تا ۱۰ لیوان در طول روز.
۲. **خواب و ریکاوری:** حداقل ۷ تا ۸ ساعت خواب شبانه.
۳. **زمان‌بندی شام:** صرف آخرین وعده ۲ الی ۳ ساعت پیش از خواب.
`;

  try {
    const modelsList = await openai.models.list();
    const availableModels = modelsList.data.map((m) => m.id);
    const textModels = availableModels.filter(
      (id) => !id.includes("whisper") && !id.includes("guard"),
    );

    for (const model of textModels) {
      try {
        console.log(`🤖 Requesting model: ${model}...`);
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2, // حداقل دما برای جلوگیری از پرحرفی و حفظ ساختار
        });

        let text = completion.choices?.[0]?.message?.content;

        if (text) {
          // ۱. پاکسازی تگ‌های Thinking و متون تحلیلی انگلیسی
          text = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
          text = text.replace(/^[\s\S]*?(?=## 🎯)/i, ""); // حذف هر متن انگلیسی قبل از شروع تیتر اول
          text = text
            .replace(/```markdown/gi, "")
            .replace(/```/g, "")
            .trim();

          console.log(`✅ Clean response generated with model: ${model}`);
          return text;
        }
      } catch (err) {
        console.warn(`⚠️ Model ${model} failed, trying next...`);
      }
    }
  } catch (err) {
    console.error("❌ Failed AI Execution:", err);
  }

  return "خطا در تدوین برنامه غذایی. لطفاً مجدداً تلاش کنید.";
}
