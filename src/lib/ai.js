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
[ROLE]
شما یک مربی ارشد فیتنس و متخصص تغذیه ورزشی بالینی هستید. وظیفه شما تدوین یک برنامه غذایی ۳۰ روزه استاندارد، شفاف و کاربردی بر اساس اطلاعات شاگرد است.

[STUDENT_DATA]
${studentDetailsText}

[STRICT_RULES]
۱. زبان پاسخ: ۱۰۰٪ فارسی روان و اصطلاحات متداول سفره ایرانی.
۲. فرمت مقیاس‌ها: از نوشتن گرم‌های گیج‌کننده و محاسبات ریاضی خودداری کن. حتماً از مقیاس‌های خانگی استفاده کن (مثلاً: کف دست بدون انگشت، قاشق غذاخوری، لیوان، پیاله ماست‌خوری، عدد).
۳. از آوردن مقدمه، سلام، احوالپرسی یا جملات اضافی در ابتدا و انتهای متن اکیداً خودداری کن. خروجی باید مستقیماً با تیتر شروع شود.
۴. ساختار خروجی باید «دقیقاً» طبق قالب مشخص‌شده زیر باشد و تمام تیترها با نشانه‌های مارک‌داون (## و ###) درج شوند.

[OUTPUT_FORMAT_TEMPLATE]
## 🎯 اهداف و استراتژی تغذیه
- **هدف اصلی:** [تعیین هدف بر اساس اطلاعات متقاضی]
- **رویکرد تغذیه‌ای:** [۱ الی ۲ جمله توضیح شفاف درباره استراتژی رژیم]

## 🍳 وعده‌های اصلی و میان‌وعده‌ها

### ۱. صبحانه (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [آیتم‌های ساده با مقیاس خانگی]
- **گزینه ب:** [آیتم‌های جایگزین با مقیاس خانگی]

### ۲. میان‌وعده اول (ساعت ۱۰ تا ۱۱ صبح)
- [یک گزینه سبک و انرژی‌بخش]

### ۳. ناهار (یکی از دو گزینه انتخاب شود)
- **گزینه الف:** [غذای اصلی + منبع کربوهیدرات + سالاد/سبزیجات با مقیاس خانگی]
- **گزینه ب:** [غذای جایگزین ایرانی و در دسترس با مقیاس خانگی]

### ۴. میان‌وعده عصر (قبل از تمرین یا غروب)
- [گزینه مقوی متناسب با سوخت تمرین]

### ۵. شام (سبک و زودهنگام)
- **گزینه الف:** [شام پروتئینی و سبک با مقیاس خانگی]
- **گزینه ب:** [شام جایگزین ساده و سریع]

## 🔄 راهنمای جایگزینی سریع
- **پروتئین‌ها:** ۱ کف دست سینه مرغ = ۱ عدد تخم‌مرغ کامل + ۲ سفیده = ۱ قوطی کبریت پنیر کم‌چرب = ۱ پیاله ماست یونانی
- **کربوهیدرات‌ها:** ۵ قاشق غذاخوری برنج = ۱ کف دست نان سنگک/جو = ۱ عدد سیب‌زمینی متوسط = ۴ قاشق جو دوسر

## 💡 ۳ اصل کلیدی برای نتیجه‌گیری حداکثری
۱. **مصرف آب:** حداقل ۸ تا ۱۰ لیوان در طول روز تقسیم شود.
۲. **خواب و ریکاوری:** حداقل ۷ ساعت خواب باکیفیت شبانه.
۳. **زمان‌بندی شام:** آخرین وعده حداقل ۲ تا ۳ ساعت قبل از خواب میل شود.`;

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
