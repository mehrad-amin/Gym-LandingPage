import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
  preload: true,
  weight: ["400", "700", "900"], // استفاده از وزن‌های اصلی برای کاهش حجم دانلود اولیه فونت
});

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "کوچینگ اختصاصی و برنامه‌ریزی فیتنس | تحول فیزیک بدنی",
  description:
    "طراحی تخصصی برنامه‌های تمرینی، تغذیه علمی و مربیگری حرفه‌ای بدنسازی با نتایج تضمین‌شده و پشتیبانی مستمر.",
  keywords: [
    "کوچینگ فیتنس",
    "برنامه تمرینی بدنسازی",
    "محاسبه کالری TDEE",
    "رژیم آنلاین",
    "مربی خصوصی",
  ],
  authors: [{ name: "مربی و آکادمی فیتنس" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "کوچینگ اختصاصی و برنامه‌ریزی فیتنس | تحول فیزیک بدنی",
    description:
      "طراحی تخصصی برنامه‌های تمرینی، تغذیه علمی و مربیگری حرفه‌ای بدنسازی با نتایج تضمین‌شده.",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "کوچینگ اختصاصی و برنامه‌ریزی فیتنس",
    description:
      "طراحی تخصصی برنامه‌های تمرینی و تغذیه علمی با پشتیبانی مستمر.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazirmatn.variable}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-fitness-bg font-sans text-fitness-text selection:bg-fitness-primary selection:text-black antialiased">
        {children}
      </body>
    </html>
  );
}
