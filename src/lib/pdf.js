import fs from "fs";

export async function generatePersianDietPdf(
  dietMarkdownText,
  studentData = {},
) {
  const formattedContent = dietMarkdownText
    ? dietMarkdownText
        .replace(/\n\n/g, "<br/><br/>")
        .replace(/\n/g, "<br/>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    : "برنامه غذایی تدوین نشد.";

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/misc/Farsi-Digits/Vazirmatn-FD-font-face.css');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Vazirmatn FD', 'Vazirmatn', Tahoma, sans-serif;
    }
    body {
      background-color: #ffffff;
      color: #0f172a;
      padding: 30px;
      direction: rtl;
      text-align: right;
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 18px;
      font-weight: 800;
      color: #0284c7;
    }
    .badge {
      background: #f1f5f9;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #475569;
    }
    .content {
      font-size: 12px;
      line-height: 2.2;
      color: #334155;
    }
    .footer {
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">📋 برنامه غذایی اختصاصی ۳۰ روزه</div>
    <div class="badge">تنظیم‌شده توسط مربی هوشمند</div>
  </div>
  <div class="content">${formattedContent}</div>
  <div class="footer">طراحی‌شده برای مربی ورزشی • رعایت تنوع غذایی و مصرف آب کافی الزامی است.</div>
</body>
</html>
  `;

  let browser;

  if (process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteerCore = (await import("puppeteer-core")).default;

    // لود باینری کرومیوم از پکیج ریموت تارگت برای حل مشکل مسیر سرورلس ورسل
    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
    );

    browser = await puppeteerCore.launch({
      args: [
        ...chromium.args,
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-sandbox",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  } else {
    const puppeteer = (await import("puppeteer")).default;
    const localChromePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ];
    const executablePath = localChromePaths.find((p) => fs.existsSync(p));

    browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  const page = await browser.newPage();
  await page.setContent(htmlTemplate, {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
  });

  await browser.close();
  return pdfBuffer;
}
