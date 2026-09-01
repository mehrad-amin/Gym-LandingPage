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

  const fullPrompt = `
شما یک مربی ارشد فیتنس و متخصص تغذیه بالینی هستید. وظیفه شما نوشتن یک برنامه غذایی ۳۰ روزه استاندارد، شفاف و کاربردی به زبان فارسی بر اساس مشخصات زیر است:

مشخصات متقاضی:
${studentDetailsText}

قوانین حیاتی (بسیار مهم):
۱. خروجی باید ۱۰۰٪ فارسی باشد. از نوشتن هرگونه تحلیل، پیش‌نویس انگلیسی یا تکرار کلمات اکیداً خودداری کن.
۲. حجم غذاها متناسب با هدف:
   - برای افزایش حجم/عضله‌سازی: سهم برنج ناهار ۱۰ تا ۱۲ قاشق غذاخوری، شام ۶ تا ۸ قاشق یا ۲ عدد سیب‌زمینی متوسط، همراه با روغن زیتون و مغزیجات.
   - برای کاهش وزن/کات: سهم برنج ناهار ۵ تا ۶ قاشق، شام ۳ تا ۴ قاشق و تمرکز بر سبزیجات فیبردار.
   - برای تثبیت وزن: سهم برنج ناهار ۷ تا ۸ قاشق و شام ۴ تا ۵ قاشق.
۳. مقیاس‌ها منحصراً خانگی و ساده باشند (کف دست، قاشق غذاخوری، عدد، پیاله/پیمانه). از تکرار نام واحدها یا استفاده از پرانتزهای بی‌مورد خودداری کن.
۴. در صورت وجود حساسیت غذایی (مثل حساسیت به گلوتن)، منابع گندم و جو معمولی را حذف و از برنج، سیب‌زمینی، کینوا، ذرت و نان فاقد گلوتن استفاده کن.

ساختار دقیق خروجی (دقیقاً با همین عناوین شروع شود):

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
- **گزینه ب:** [غذای جایگزین ایرانی متناسب با هدف]

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
    const textModels = availableModels.filter(
      (id) => !id.includes("whisper") && !id.includes("guard"),
    );

    for (const model of textModels) {
      try {
        console.log(`🤖 Requesting model: ${model}...`);
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.5,
          frequency_penalty: 0.8, // جریمه سنگین برای ریشه‌کن کردن تکرار کلمات
          presence_penalty: 0.4,
          max_tokens: 2200,
        });

        let rawText = completion.choices?.[0]?.message?.content || "";

        if (rawText) {
          let cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "");

          // برش دقیق از شروع بدنه فارسی
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

          // پایان‌بندی تمیز بعد از اصل سوم
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

          console.log(`✅ Perfectly formatted diet generated with: ${model}`);
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
