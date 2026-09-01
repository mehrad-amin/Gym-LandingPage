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
    timeout: 40000,
  });

  const fullPrompt = `
شما یک مربی ارشد فیتنس و متخصص تغذیه بالینی هستید. وظیفه شما نوشتن یک برنامه غذایی ۳۰ روزه استاندارد، کاربردی و بدون گلوتن به زبان فارسی بر اساس مشخصات زیر است:

مشخصات متقاضی:
${studentDetailsText}

قوانین نگارش:
۱. خروجی باید ۱۰۰٪ فارسی روان و منسجم باشد. از درج هرگونه یادداشت، انگلیسی یا تکرار کلمات خودداری کن.
۲. تنظیم حجم غذاها بر اساس هدف:
   - برای افزایش حجم/عضله‌سازی: ناهار ۱۰ تا ۱۲ قاشق غذاخوری برنج، شام ۶ تا ۸ قاشق یا ۲ عدد سیب‌زمینی متوسط، همراه با روغن زیتون و مغزیجات.
   - برای کاهش وزن/کات: ناهار ۵ تا ۶ قاشق برنج، شام ۳ تا ۴ قاشق و تأکید بر سبزیجات.
   - برای تثبیت وزن: ناهار ۷ تا ۸ قاشق و شام ۴ تا ۵ قاشق.
۳. مقیاس‌ها منحصراً خانگی و ساده باشند (کف دست، قاشق غذاخوری، عدد، پیاله/لیوان).
۴. با توجه به حساسیت به گلوتن، از گندم و جو استفاده نکن و فقط برنج، سیب‌زمینی، کینوا، ذرت و نان بدون گلوتن پیشنهاد بده.

قالب دقیق خروجی (دقیقاً با همین عناوین شروع و تکمیل شود):

## 🎯 اهداف و استراتژی تغذیه
- **هدف اصلی:** [هدف متقاضی]
- **رویکرد تغذیه‌ای:** [۱ الی ۲ جمله رویکرد متناسب با کالری و شرایط شاگرد]

## 🍳 وعده‌های اصلی و میان‌وعده‌ها

### ۱. صبحانه (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [ترکیب پروتئین و کربوهیدرات ساده با مقیاس خانگی]
- **گزینه ب:** [گزینه جایگزین با مقیاس خانگی]

### ۲. میان‌وعده اول (ساعت ۱۰ تا ۱۱ صبح)
- [میوه + مغزیجات]

### ۳. ناهار (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [پروتئین + کربوهیدرات متناسب با هدف + سالاد با ۱ قاشق روغن زیتون]
- **گزینه ب:** [غذای جایگزین متناسب با هدف]

### ۴. میان‌وعده عصر (قبل تمرین / عصرانه)
- [میان‌وعده مقوی متناسب با هدف]

### ۵. شام (سبک و زودهنگام)
- **گزینه الف:** [پروتئین + سهم کربوهیدرات مشخص + سبزیجات]
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

    // فیلتر مدل‌های متنی
    const textModels = availableModels.filter(
      (id) => !id.includes("whisper") && !id.includes("guard"),
    );

    // مرتب‌سازی هوشمند: قرار دادن مدل‌های بزرگ (70b) در ابتدای صف
    textModels.sort((a, b) => {
      const aIs70b = a.includes("70b") || a.includes("llama-3.3");
      const bIs70b = b.includes("70b") || b.includes("llama-3.3");
      if (aIs70b && !bIs70b) return -1;
      if (!aIs70b && bIs70b) return 1;
      return 0;
    });

    for (const model of textModels) {
      try {
        console.log(`🤖 Requesting priority model: ${model}...`);
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.3,
          frequency_penalty: 0.1, // مقدار امن برای حفظ دستور زبان فارسی
          presence_penalty: 0.1,
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

          console.log(`✅ Robust diet generated with model: ${model}`);
          return cleanText;
        }
      } catch (err) {
        console.warn(
          `⚠️ Model ${model} failed, trying next...`,
          err.message || err,
        );
      }
    }
  } catch (err) {
    console.error("❌ Failed AI Execution:", err);
  }

  return "خطا در تدوین برنامه غذایی. لطفاً مجدداً تلاش کنید.";
}
