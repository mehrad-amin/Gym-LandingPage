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

  const prompt = `
شما یک مربی ارشد فیتنس و متخصص تغذیه بالینی هستید. وظیفه شما تنظیم یک برنامه غذایی استاندارد، کاربردی  به زبان فارسی بر اساس مشخصات زیر است:

مشخصات متقاضی:
${studentDetailsText}

قوانین نگارش:
۱. خروجی باید ۱۰۰٪ فارسی روان و منسجم باشد. از درج هرگونه یادداشت، انگلیسی یا جدول روزشمار ۳۰ روزه اکیداً خودداری کن. برنامه باید یک الگوی ۵ وعده‌ای ثابت با گزینه‌های الف و ب باشد.
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
    // ۱. دریافت زنده تمام مدل‌های موجود از سرور
    const modelsResponse = await openai.models.list();
    const allModels = modelsResponse.data.map((m) => m.id);

    // ۲. حذف مدل‌های نامرتبط با تولید متن رژیم
    const textModels = allModels.filter((id) => {
      const lower = id.toLowerCase();
      return (
        !lower.includes("whisper") &&
        !lower.includes("guard") &&
        !lower.includes("vision") &&
        !lower.includes("tool")
      );
    });

    // ۳. رتبه‌بندی پویا بر اساس قدرت مدل (بدون هاردکد کردن نام مدل خاص)
    textModels.sort((a, b) => {
      const getScore = (name) => {
        let score = 0;
        const n = name.toLowerCase();
        if (n.includes("70b") || n.includes("larger")) score += 100;
        if (n.includes("versatile") || n.includes("instruct")) score += 50;
        if (n.includes("8x7b") || n.includes("32b")) score += 40;
        if (n.includes("8b") || n.includes("9b")) score += 10;
        if (n.includes("1b") || n.includes("3b")) score -= 50;
        return score;
      };
      return getScore(b) - getScore(a);
    });

    console.log("📋 Dynamically ranked text models:", textModels);

    // ۴. حلقه هوشمند: تلاش روی مدل‌ها به ترتیب قدرت
    for (const model of textModels) {
      try {
        console.log(`🤖 Requesting dynamically selected model: ${model}...`);
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
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

          // اعتبارسنجی کیفیت: اگر متن ناقص یا بدون ساختار بود به سراغ مدل بعدی برود
          const isValidOutput =
            (cleanText.includes("هدف اصلی") || cleanText.includes("## 🎯")) &&
            cleanText.includes("صبحانه") &&
            cleanText.length > 300;

          if (isValidOutput) {
            console.log(`✅ High quality response from model: ${model}`);
            return cleanText;
          } else {
            console.warn(
              `⚠️ Model ${model} generated invalid structure, switching to next...`,
            );
          }
        }
      } catch (err) {
        console.warn(
          `⚠️ Model ${model} failed, trying next available...`,
          err.message || err,
        );
      }
    }
  } catch (err) {
    console.error("❌ Failed AI Execution:", err);
  }

  return "خطا در تدوین برنامه غذایی. لطفاً مجدداً تلاش کنید.";
}
