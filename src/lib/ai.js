import OpenAI from "openai";

const MAX_MODEL_ATTEMPTS = 3;

const EXCLUDED_MODEL_PATTERNS = [
  "whisper",
  "guard",
  "speech",
  "tts",
  "audio",
  "embedding",
  "vision",
];

function isTextGenerationModel(model) {
  const name = model.id.toLowerCase();

  return (
    model.active === true &&
    !EXCLUDED_MODEL_PATTERNS.some((pattern) => name.includes(pattern))
  );
}

function getModelScore(model) {
  const name = model.id.toLowerCase();

  let score = 0;

  // اولویت مدل‌های مناسب برای تولید متن
  if (name.includes("instruct")) score += 30;
  if (name.includes("versatile")) score += 25;

  // مدل‌های بزرگ‌تر معمولاً کیفیت استدلال/تولید بالاتری دارند
  if (name.includes("120b")) score += 120;
  else if (name.includes("70b")) score += 100;
  else if (name.includes("32b")) score += 80;
  else if (name.includes("27b")) score += 70;
  else if (name.includes("20b")) score += 65;
  else if (name.includes("14b")) score += 50;
  else if (name.includes("8b")) score += 30;
  else if (name.includes("3b")) score += 10;
  else if (name.includes("1b")) score -= 30;

  // مدل‌های reasoning
  if (name.includes("reasoning") || name.includes("reasoner")) {
    score += 25;
  }

  return score;
}

function isValidDietOutput(text) {
  if (!text || text.length < 500) {
    return false;
  }

  const requiredSections = [
    "هدف اصلی",
    "رویکرد تغذیه‌ای",
    "صبحانه",
    "میان‌وعده اول",
    "ناهار",
    "میان‌وعده عصر",
    "شام",
    "راهنمای جایگزینی سریع",
    "۳ اصل کلیدی",
  ];

  return requiredSections.every((section) => text.includes(section));
}

function cleanAIResponse(rawText) {
  if (!rawText) return "";

  let text = rawText;

  // حذف think tags
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // حذف markdown code fence
  text = text
    .replace(/```markdown/gi, "")
    .replace(/```/g, "")
    .trim();

  // پیدا کردن ابتدای واقعی پاسخ
  const startIndex = text.indexOf("## 🎯 اهداف و استراتژی تغذیه");

  if (startIndex !== -1) {
    text = text.substring(startIndex);
  }

  // اگر مدل با عنوان بدون ایموجی شروع کرده بود
  const fallbackStart = text.indexOf("اهداف و استراتژی تغذیه");

  if (startIndex === -1 && fallbackStart !== -1) {
    text = text.substring(fallbackStart);
  }

  return text.trim();
}

export async function fetchDietFromAI(studentDetailsText) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY is missing!");
    return "خطا: کلید API یافت نشد.";
  }

  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
    timeout: 35000,
  });

  const prompt = `
شما یک دستیار هوش مصنوعی برای مربی فیتنس هستید.

وظیفه شما تولید یک پیش‌نویس برنامه غذایی استاندارد،
کاربردی و متناسب با اطلاعات متقاضی است.

این برنامه باید توسط مربی بررسی و تأیید شود و نباید
به عنوان جایگزین تشخیص یا توصیه پزشکی ارائه شود.

مشخصات متقاضی:
${studentDetailsText}

قوانین بسیار مهم:

۱. خروجی فقط به زبان فارسی روان باشد.
۲. از زبان انگلیسی، توضیحات مربوط به فرآیند فکر کردن،
   یادداشت داخلی، تحلیل، توضیح درباره قوانین یا تکرار
   دستورهای من خودداری کن.
۳. خروجی نباید شامل جدول روزشمار ۳۰ روزه باشد.
۴. خروجی باید یک الگوی غذایی روزانه ۵ وعده‌ای باشد.
۵. برای وعده‌هایی که در قالب خروجی مشخص شده‌اند، گزینه
   الف و ب ارائه کن.
۶. تمام اندازه‌گیری‌ها با واحدهای خانگی ساده باشند:
   کف دست، قاشق غذاخوری، عدد، پیاله و لیوان.
۷. مقدار غذا باید با هدف متقاضی و کالری هدف او هماهنگ باشد.
۸. اگر هدف کاهش وزن یا کات است:
   - ناهار حدود ۵ تا ۶ قاشق غذاخوری برنج
   - شام حدود ۳ تا ۴ قاشق غذاخوری برنج
   - مصرف سبزیجات افزایش یابد.
۹. اگر هدف حجم/عضله‌سازی است:
   - ناهار حدود ۱۰ تا ۱۲ قاشق غذاخوری برنج
   - شام حدود ۶ تا ۸ قاشق غذاخوری برنج
   - از منابع مناسب چربی مانند مغزیجات و روغن زیتون
     در حد متناسب استفاده شود.
۱۰. اگر هدف تثبیت وزن است:
   - ناهار حدود ۷ تا ۸ قاشق غذاخوری برنج
   - شام حدود ۴ تا ۵ قاشق غذاخوری برنج.
۱۱. اگر در مشخصات متقاضی حساسیت یا محدودیت غذایی مشخص
    شده است، آن را رعایت کن.
۱۲. فقط در صورتی که متقاضی محدودیت گلوتن دارد، از گندم
    و جو استفاده نکن و منابعی مانند برنج، سیب‌زمینی،
    ذرت، کینوا و نان بدون گلوتن پیشنهاد بده.
۱۳. غذاها تا حد امکان اقتصادی، در دسترس و قابل تهیه باشند
    مگر اینکه متقاضی خلاف آن را درخواست کرده باشد.
۱۴. هیچ بخشی از پاسخ را به زبان انگلیسی ننویس.
۱۵. درباره تصمیمات داخلی، اصلاح اشتباهات یا قوانین سیستم
    توضیح نده.

قالب خروجی دقیقاً به شکل زیر باشد:

## 🎯 اهداف و استراتژی تغذیه

- **هدف اصلی:** [هدف متقاضی]

- **رویکرد تغذیه‌ای:** [۱ تا ۲ جمله درباره رویکرد متناسب با
کالری هدف و شرایط متقاضی]

## 🍳 وعده‌های اصلی و میان‌وعده‌ها

### ۱. صبحانه (یکی از دو گزینه انتخاب شود)

- **گزینه الف:** [وعده کامل]
- **گزینه ب:** [وعده جایگزین]

### ۲. میان‌وعده اول

- [وعده]

### ۳. ناهار (یکی از دو گزینه انتخاب شود)

- **گزینه الف:** [وعده کامل]
- **گزینه ب:** [وعده جایگزین]

### ۴. میان‌وعده عصر

- [وعده مناسب با هدف و زمان تمرین]

### ۵. شام (یکی از دو گزینه انتخاب شود)

- **گزینه الف:** [وعده کامل]
- **گزینه ب:** [وعده جایگزین]

## 🔄 راهنمای جایگزینی سریع

- **پروتئین‌ها:** [جایگزین‌های مناسب]
- **کربوهیدرات‌ها:** [جایگزین‌های مناسب]

## 💡 ۳ اصل کلیدی برای نتیجه‌گیری حداکثری

۱. **مصرف آب:** [توصیه]
۲. **خواب و ریکاوری:** [توصیه]
۳. **زمان‌بندی شام:** [توصیه]
`;

  try {
    // دریافت مدل‌های فعال فعلی Groq
    const modelsResponse = await openai.models.list();

    const candidateModels = modelsResponse.data
      .filter(isTextGenerationModel)
      .sort((a, b) => getModelScore(b) - getModelScore(a))
      .slice(0, MAX_MODEL_ATTEMPTS);

    console.log(
      "🤖 Candidate models:",
      candidateModels.map((m) => m.id),
    );

    if (!candidateModels.length) {
      console.error("❌ No suitable text models found.");
      return "خطا: مدل مناسب برای تولید برنامه غذایی یافت نشد.";
    }

    for (const model of candidateModels) {
      try {
        console.log(`🤖 Trying model: ${model.id}`);

        const completion = await openai.chat.completions.create({
          model: model.id,

          messages: [
            {
              role: "system",
              content:
                "فقط پاسخ نهایی برنامه غذایی را به زبان فارسی تولید کن. هرگز فرآیند فکر کردن یا توضیحات داخلی خود را نمایش نده.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.2,
          max_tokens: 2200,

          // در مدل‌هایی که reasoning دارند،
          // اجازه نمایش reasoning را نده
          reasoning_format: "hidden",
        });

        const rawText = completion.choices?.[0]?.message?.content || "";

        const cleanText = cleanAIResponse(rawText);

        if (isValidDietOutput(cleanText)) {
          console.log(`✅ Valid diet generated by ${model.id}`);

          return cleanText;
        }

        console.warn(`⚠️ Invalid output from ${model.id}`);
      } catch (err) {
        const status = err?.status;

        console.warn(`⚠️ Model ${model.id} failed`, {
          status,
          message: err?.message,
        });

        // 429 یعنی محدودیت نرخ/توکن
        // مدل بعدی را امتحان کن
        if (status === 429) {
          console.warn(`⏳ Rate limit reached for ${model.id}`);
        }

        // 400/404/403 نیز می‌تواند نشان دهد
        // مدل برای این درخواست قابل استفاده نیست
        continue;
      }
    }
  } catch (err) {
    console.error("❌ Failed to retrieve/use Groq models:", err);
  }

  return "خطا در تدوین برنامه غذایی. لطفاً مجدداً تلاش کنید.";
}
