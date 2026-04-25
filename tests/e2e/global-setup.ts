import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🔍 FitAI Pro — Pre-Deploy Automation Test Suite");
  console.log("  📅 " + new Date().toLocaleString("en-IN"));
  console.log("  🌐 " + (process.env.PLAYWRIGHT_TEST_BASE_URL || "https://fitaipro-five.vercel.app"));
  console.log("═══════════════════════════════════════════════════════════\n");
}

export default globalSetup;