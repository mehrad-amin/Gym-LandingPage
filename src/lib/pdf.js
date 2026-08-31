import fs from "fs";

export async function generatePersianDietPdf(
  dietMarkdownText,
  studentData = {},
) {
  const formattedHtmlContent = (dietMarkdownText || "")
    .replace(/^### (.*$)/gim, '<h3 class="diet-h3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="diet-h2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="diet-h1">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/^- (.*$)/gim, '<li class="diet-li">$1</li>')
    .replace(/^\d+\.\s+(.*$)/gim, '<li class="diet-num-li">$1</li>')
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/misc/Farsi-Digits/Vazirmatn-FD-font-face.css">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Vazirmatn FD', 'Vazirmatn', -apple-system, BlinkMacSystemFont, Tahoma, sans-serif;
    }
    body {
      background-color: #ffffff;
      color: #0f172a;
      padding: 36px 40px;
      direction: rtl;
      text-align: right;
      font-size: 13px;
      line-height: 2.2;
    }
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 20px;
      font-weight: 900;
      color: #0369a1;
    }
    .badge {
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #0369a1;
    }
    .diet-h1 {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 20px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .diet-h2 {
      font-size: 14px;
      font-weight: 700;
      color: #0284c7;
      margin-top: 16px;
      margin-bottom: 6px;
    }
    .diet-h3 {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin-top: 12px;
      margin-bottom: 4px;
    }
    .diet-li, .diet-num-li {
      margin-right: 18px;
      margin-bottom: 4px;
      color: #334155;
    }
    strong {
      color: #0f172a;
      font-weight: 700;
    }
    .footer {
      margin-top: 36px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">📋 برنامه غذایی اختصاصی ۳۰ روزه</div>
    <div class="badge">تنظیم‌شده با مربی هوشمند</div>
  </div>
  <div class="content">${formattedHtmlContent}</div>
  <div class="footer">طراحی‌شده اختصاصی برای مربی ورزشی • رعایت تنوع غذایی و مصرف منظم آب الزامی است.</div>
</body>
</html>
  `;

  let browser;

  if (process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteerCore = (await import("puppeteer-core")).default;

    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar",
    );

    browser = await puppeteerCore.launch({
      args: [
        ...chromium.args,
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-sandbox",
        "--font-render-hinting=none",
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
  await page.setContent(htmlTemplate, { waitUntil: "load", timeout: 20000 });
  await page.evaluateHandle("document.fonts.ready");

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "24px", bottom: "24px", left: "24px", right: "24px" },
  });

  await browser.close();
  return pdfBuffer;
}
