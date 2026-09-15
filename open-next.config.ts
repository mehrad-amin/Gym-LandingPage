import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // اگر از قبل کانفیگی دارید داخل همین شیء قرار دهید
  buildCommand: "next build",
  server: {
    bundler: {
      externals: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],
    },
  },
});
