import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
  weight: ["300", "400", "500", "700", "800", "900"],
});
export const metadata = {
  title: "کوچینگ اختصاصی و برنامه‌ریزی فیتنس | تحول فیزیک بدنی",
  description:
    "طراحی تخصصی برنامه‌های تمرینی، تغذیه علمی و مربیگری حرفه‌ای بدنسازی با نتایج تضمین‌شده و پشتیبانی مستمر.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen font-sans bg-fitness-bg text-fitness-text selection:bg-fitness-primary selection:text-black">
        {children}
      </body>
    </html>
  );
}
