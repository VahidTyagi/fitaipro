const https = require("https");
const BASE = "https://fitaipro-five.vercel.app";

function fetchStatus(url, method = "GET") {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "FitAI-PreDeploy/1.0",
        },
      },
      (res) => {
        res.on("data", () => {});
        res.on("end", () => resolve(res.statusCode));
      }
    );
    req.on("error", () => resolve(0));
    req.on("timeout", () => { req.destroy(); resolve(0); });
    if (method === "POST") req.write("{}");
    req.end();
  });
}

async function run() {
  console.log("\n🔍 FitAI Pro Pre-Deploy Checks\n" + "─".repeat(40));
  const failures = [];

  const checks = [
    {
      name: "/api/stats — must require auth",
      test: async () => {
        const s = await fetchStatus(`${BASE}/api/stats`);
        return s !== 200; // 200 = unprotected = FAIL
      },
      fail: "/api/stats returns 200 without auth — SECURITY BUG",
    },
    {
      name: "/api/workout/generate — must require auth",
      test: async () => {
        const s = await fetchStatus(`${BASE}/api/workout/generate`, "POST");
        return s !== 200;
      },
      fail: "workout API unprotected",
    },
    {
      name: "/api/nutrition/generate — must require auth",
      test: async () => {
        const s = await fetchStatus(`${BASE}/api/nutrition/generate`, "POST");
        return s !== 200;
      },
      fail: "nutrition API unprotected",
    },
  ];

  for (const check of checks) {
    const passed = await check.test();
    console.log(`  ${passed ? "✅" : "❌"} ${check.name}`);
    if (!passed) failures.push(check.fail);
  }

  console.log("─".repeat(40));

  if (failures.length > 0) {
    console.log("\n🚫 Pre-deploy checks FAILED — build skipped\n");
    failures.forEach((f) => console.log(`   ❌ ${f}`));
    process.exit(1);
  }

  console.log("\n✅ All checks passed — building...\n");
  process.exit(0);
}



run().catch(() => process.exit(0));