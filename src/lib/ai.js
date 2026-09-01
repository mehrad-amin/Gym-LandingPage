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
You are an expert sports nutritionist.
RULES:
1. Output MUST be ONLY in fluent Persian (Farsi).
2. DO NOT output any English thinking process, notes, or codeblocks.
3. Start IMMEDIATELY with "## 🎯 اهداف و استراتژی تغذیه".
4. DYNAMIC PORTION SIZING (MUST STRICTLY MATCH THE STUDENT'S GOAL):
   - IF GOAL IS "افزایش حجم / عضله‌سازی" (Bulking / High Calorie):
     * Lunch: 10-14 tbsp rice/quinoa or 2-3 medium potatoes + 2 palms meat/chicken.
     * Dinner: 6-8 tbsp rice/quinoa or 2 medium potatoes + 1-2 palms protein.
     * Include dense calorie sources: nuts, peanut butter, olive oil.
   - IF GOAL IS "کاهش وزن / چربی‌سوزی / کات" (Cutting / Calorie Deficit):
     * Lunch: 5-6 tbsp rice/quinoa or 1 medium potato + 1-2 palms lean protein + generous salad.
     * Dinner: 3-4 tbsp rice/quinoa or 1 small potato (or carb-free option) + lean protein + fibrous vegetables.
     * Limit fats: 1 tsp olive oil, light yogurt, fruits in moderation.
   - IF GOAL IS "تثبیت وزن / سلامتی" (Maintenance):
     * Balanced moderate portions (7-8 tbsp rice for lunch, 4-5 tbsp for dinner).
   - IF GOAL IS "آماده‌سازی مسابقات / کات عمیق":
     * Focus on ultra-lean proteins (tilapia, chicken breast, egg whites), zero simple sugars, strict complex carbs (oats/rice/sweet potato), high fibrous greens (broccoli/asparagus), and elimination of dense calorie dressings.
5. WRITING STYLE:
   - Write cleanly and naturally (e.g., "۱۲ قاشق غذاخوری برنج" or "۱ کف دست سینه مرغ").
   - NEVER duplicate words (DO NOT write "برنج برنجی" or repeated parentheses).
6. ALLERGIES: Strictly follow dietary restrictions (e.g., Gluten-free: strictly use rice, potato, quinoa, certified gluten-free options).
`;

  const userPrompt = `
مشخصات متقاضی:
${studentDetailsText}

با توجه به هدف و کالری مشخص‌شده در بالا، برنامه غذایی ۳۰ روزه را در قالب زیر تدوین کن:

## 🎯 اهداف و استراتژی تغذیه
- **هدف اصلی:** [هدف دقیق متقاضی]
- **رویکرد تغذیه‌ای:** [توضیح ۱ الی ۲ جمله‌ای متناسب با کالری، ماکروها و حساسیت‌های متقاضی]

## 🍳 وعده‌های اصلی و میان‌وعده‌ها

### ۱. صبحانه (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [ترکیب پروتئین + کربوهیدرات مناسب با هدف و مقیاس خانگی]
- **گزینه ب:** [گزینه جایگزین با مقیاس خانگی]

### ۲. میان‌وعده اول (ساعت ۱۰ تا ۱۱ صبح)
- [میوه + مغزیجات متناسب با هدف کالری]

### ۳. ناهار (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [پروتئین + کربوهیدرات دقیق متناسب با هدف حجم/کات + سالاد با روغن زیتون]
- **گزینه ب:** [غذای جایگزین متناسب با هدف]

### ۴. میان‌وعده عصر (قبل تمرین / عصرانه)
- [سوخت مناسب تمرین متناسب با هدف]

### ۵. شام (سبک و زودهنگام)
- **گزینه الف:** [پروتئین باکیفیت + سهم کربوهیدرات متناسب با هدف + سبزیجات]
- **گزینه ب:** [شام جایگزین ساده]

## 🔄 راهنمای جایگزینی سریع
- **پروتئین‌ها:** ۱ کف دست سینه مرغ/گوشت = ۲ عدد تخم‌مرغ کامل = ۱ قوطی کبریت پنیر = ۱ پیاله ماست پرپروتئین
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
          temperature: 0.35,
          max_tokens: 2200,
        });

        let rawText = completion.choices?.[0]?.message?.content || "";

        if (rawText) {
          let cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "");

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

          const endAnchor = cleanText.indexOf("۳. **زمان‌بندی شام:**");
          if (endAnchor !== -1) {
            const nextLineIndex = cleanText.indexOf("\n", endAnchor);
            if (nextLineIndex !== -1) {
              cleanText = cleanText.substring(0, nextLineIndex);
            }
          }

          cleanText = cleanText
            .replace(/```markdown/gi, "")
            .replace(/```/g, "")
            .trim();

          console.log(
            `✅ Clean adaptive Persian diet generated with model: ${model}`,
          );
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
