// This script runs BEFORE Vercel builds
// If tests fail → exit code 1 → Vercel SKIPS the build
// If tests pass → exit code 0 → Vercel BUILDS and deploys

const { execSync } = require("child_process");

const BASE_URL = "https://fitaipro-five.vercel.app";

async function checkAPI(url, method = "GET") {
  const https = require("https");
  return new Promise((resolve) => {
    const options = {
      method,
      hostname: new URL(url).hostname,
      path: new URL(url).pathname,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FitAI-PreDeploy-Check/1.0",
      },
      timeout: 10000,
    };
    const req = https.request(options, (res) => {
      resolve(res.statusCode);
    });
    req.on("error", () => resolve(0));
    req.on("timeout", () => { req.destroy(); resolve(0); });
    if (method === "POST") req.write("{}");
    req.end();
  });
}

async function runChecks() {
  console.log("🔍 Running pre-deploy checks...");
  const failures = [];

  // Check 1: Landing page accessible
  const landingStatus = await checkAPI(BASE_URL);
  if (landingStatus !== 200) {
    failures.push(`Landing page returned ${landingStatus} (expected 200)`);
  } else {
    console.log("✅ Landing page: OK");
  }

  // Check 2: Stats API protected
  const statsStatus = await checkAPI(`${BASE_URL}/api/stats`);
  if (statsStatus === 200) {
    failures.push(`/api/stats returned 200 without auth — SECURITY BUG`);
  } else {
    console.log("✅ /api/stats protected: OK");
  }

  // Check 3: Workout API protected
  const workoutStatus = await checkAPI(`${BASE_URL}/api/workout/generate`, "POST");
  if (workoutStatus === 200) {
    failures.push(`/api/workout/generate returned 200 without auth — SECURITY BUG`);
  } else {
    console.log("✅ /api/workout/generate protected: OK");
  }

  // Check 4: Nutrition API protected
  const nutritionStatus = await checkAPI(`${BASE_URL}/api/nutrition/generate`, "POST");
  if (nutritionStatus === 200) {
    failures.push(`/api/nutrition/generate returned 200 without auth — SECURITY BUG`);
  } else {
    console.log("✅ /api/nutrition/generate protected: OK");
  }

  if (failures.length > 0) {
    console.error("\n════════════════════════════════════════");
    console.error("  🚫 PRE-DEPLOY CHECKS FAILED");
    console.error("════════════════════════════════════════");
    failures.forEach((f) => console.error(`  ❌ ${f}`));
    console.error("\n  Fix these issues before deploying.");
    console.error("════════════════════════════════════════\n");
    process.exit(1); // ← Vercel sees this and SKIPS build
  }

  console.log("\n✅ All pre-deploy checks passed — deploying...\n");
  process.exit(0);
}

runChecks();