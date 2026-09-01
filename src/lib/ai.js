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
    timeout: 45000,
  });

  const systemInstruction = `
You are an expert sports nutritionist and clinical fitness coach.
CRITICAL RULES:
1. Output MUST be ONLY in fluent Persian (Farsi).
2. DO NOT output any English thinking process, reasoning, planning steps, or intros like "Here's a thinking process".
3. Start IMMEDIATELY with the first markdown heading "## 🎯 اهداف و استراتژی تغذیه".
4. Absolutely NO markdown codeblocks (\`\`\`markdown or \`\`\`).
5. STRICT UNIT RULES:
   - Use "کف دست" ONLY for bread, chicken breast, meat, and fish. NEVER use "کف دست" for rice or liquids.
   - Use "قاشق غذاخوری" for rice, quinoa, and oats.
   - Use "عدد" for eggs, potatoes, and fruits.
   - Use "پیاله" for salad and yogurt.
6. CALORIE & PORTION SCALING:
   - If the goal is "افزایش حجم / عضله‌سازی" (Bulking / >2400 kcal): Carbohydrate and protein portions MUST be generous (e.g., 10-14 tbsp rice for lunch, 6-8 tbsp for dinner, 2 medium potatoes, plus healthy fats like nuts/olive oil). DO NOT give tiny portions like 2-5 tbsp rice for bulking.
   - If the goal is "کاهش وزن / کات" (Cutting): Moderate carbs (5-6 tbsp rice) and higher fibrous vegetables.
7. Strictly respect all allergies and notes (e.g., Gluten allergy -> no wheat, barley, standard bread, or regular pasta. Use rice, potatoes, corn, quinoa, or certified gluten-free options).
`;

  const userPrompt = `
بر اساس مشخصات زیر، برنامه غذایی ۳۰ روزه را با رعایت دقیق سهم‌ها متناسب با هدف (حجم یا کات) و با مقیاس‌های خانگی صحیح تنظیم کن:

مشخصات متقاضی:
${studentDetailsText}

قالب دقیق خروجی (دقیقاً با همین عناوین مارک‌داون شروع و تکمیل شود):

## 🎯 اهداف و استراتژی تغذیه
- **هدف اصلی:** [هدف متقاضی]
- **رویکرد تغذیه‌ای:** [توضیح کوتاه ۱ الی ۲ جمله‌ای متناسب با شرایط، تارگت کالری و حساسیت‌های غذایی]

## 🍳 وعده‌های اصلی و میان‌وعده‌ها

### ۱. صبحانه (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [ترکیب پروتئین + کربوهیدرات مناسب با مقیاس خانگی]
- **گزینه ب:** [گزینه جایگزین با مقیاس خانگی]

### ۲. میان‌وعده اول (ساعت ۱۰ تا ۱۱ صبح)
- [میوه + منبع چربی سالم یا مغزیجات]

### ۳. ناهار (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [پروتئین + کربوهیدرات کافی متناسب با تارگت کالری + سالاد با روغن زیتون]
- **گزینه ب:** [غذای جایگزین ایرانی و در دسترس]

### ۴. میان‌وعده عصر (قبل تمرین / عصرانه)
- [سوخت مناسب تمرین متناسب با هدف]

### ۵. شام (سبک و زودهنگام)
- **گزینه الف:** [پروتئین باکیفیت + کربوهیدرات متناسب با هدف + سبزیجات]
- **گزینه ب:** [شام جایگزین ساده]

## 🔄 راهنمای جایگزینی سریع
- **پروتئین‌ها:** ۱ کف دست سینه مرغ/گوشت = ۲ عدد تخم‌مرغ کامل = ۱ قوطی کبریت پنیر = ۱ پیاله ماست پرپروتئین
- **کربوهیدرات‌ها:** ۱۰ قاشق غذاخوری برنج = ۲ عدد سیب‌زمینی متوسط = ۱ پیاله ذرت آبپز = ۱ کف دست نان مناسب

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
          temperature: 0.2,
          max_tokens: 3500,
        });

        let rawText = completion.choices?.[0]?.message?.content || "";

        if (rawText) {
          // ۱. حذف تگ‌های تفکر سیستمی
          let cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "");

          // ۲. پیدا کردن آخرین وقوع عنوان شروع برنامه برای حذف قطعی چرک‌نویس‌های انگلیسی
          const farsiAnchor = cleanText.lastIndexOf("- **هدف اصلی:**");
          const altAnchor = cleanText.lastIndexOf("هدف اصلی");

          if (farsiAnchor !== -1) {
            const headerIndex = cleanText.lastIndexOf("##", farsiAnchor);
            cleanText = cleanText.substring(
              headerIndex !== -1 ? headerIndex : farsiAnchor,
            );
          } else if (altAnchor !== -1) {
            const headerIndex = cleanText.lastIndexOf("##", altAnchor);
            cleanText = cleanText.substring(
              headerIndex !== -1 ? headerIndex : altAnchor,
            );
          }

          // ۳. حذف بک‌تیک‌ها و فاصله‌های اضافی
          cleanText = cleanText
            .replace(/```markdown/gi, "")
            .replace(/```/g, "")
            .trim();

          console.log(`✅ Clean Persian diet generated with model: ${model}`);
          return cleanText;
        }
      } catch (err) {
        console.warn(
          `⚠️ Model ${model} failed, switching to next...`,
          err.message || err,
        );
      }
    }
  } catch (err) {
    console.error("❌ Failed AI Execution:", err);
  }

  return "خطا در تدوین برنامه غذایی. لطفاً مجدداً تلاش کنید.";
}
