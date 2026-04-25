import { test, expect, Page, BrowserContext } from "@playwright/test";

const BASE =
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  "https://fitaipro-five.vercel.app";

// ─── Test Account ─────────────────────────────────────────────────────────────
// Uses Clerk +clerk_test magic — OTP is always 424242
// This is a FIXED account — never deleted, just reused
const TEST_EMAIL = "vahidtyagi007+clerk_test@gmail.com";
const TEST_PASSWORD = "Mlpqaz@23";
const TEST_OTP = "424242";

// ─── Auth Helper ──────────────────────────────────────────────────────────────
async function signInTestUser(page: Page): Promise<void> {
  await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000); // Wait for Clerk JS to fully load

  // Step 1: Fill email and press Enter (avoids aria-hidden button issue)
  const emailInput = page.locator(
    "input[name='identifier'], input[type='email'], input[autocomplete='email']"
  ).first();
  await emailInput.waitFor({ state: "visible", timeout: 20_000 });
  await emailInput.fill(TEST_EMAIL);

  // Press Enter instead of clicking the hidden button
  await emailInput.press("Enter");
  await page.waitForTimeout(2000);

  // Step 2: Fill password and press Enter
  const passwordInput = page.locator(
    "input[name='password'], input[type='password']"
  ).first();
  await passwordInput.waitFor({ state: "visible", timeout: 15_000 });
  await passwordInput.fill(TEST_PASSWORD);
  await passwordInput.press("Enter");
  await page.waitForTimeout(2000);

  // Step 3: Handle OTP if it appears (clerk_test accounts use 424242)
  try {
    const otpInput = page.locator(
      "input[name='code'], input[aria-label*='digit'], input[aria-label*='code'], input[autocomplete='one-time-code']"
    ).first();
    const otpVisible = await otpInput.isVisible({ timeout: 3000 });
    if (otpVisible) {
      await otpInput.fill(TEST_OTP);
      await otpInput.press("Enter");
      await page.waitForTimeout(2000);
    }
  } catch {
    // OTP not required — continue
  }

  // Step 4: Wait for dashboard redirect
  try {
    await page.waitForURL(/dashboard/, { timeout: 25_000 });
  } catch {
    // Check if we're still on sign-in page with error
    const currentUrl = page.url();
    if (currentUrl.includes("sign-in")) {
      throw new Error(
        `Sign-in failed. Still on: ${currentUrl}. ` +
        `Make sure account ${TEST_EMAIL} exists with password ${TEST_PASSWORD}`
      );
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
test.describe("FitAI Pro — Pre-Deploy Suite", () => {

  // ── T01 ──────────────────────────────────────────────────────────────────────
  test("T01 — Landing page loads with FitAI title", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    const title = await page.title();
    expect(title).toMatch(/FitAI/i);
  });

  // ── T02 ──────────────────────────────────────────────────────────────────────
  test("T02 — Landing page has Sign Up CTA button", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    const btn = page.locator("a[href='/sign-up']").first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
  });

  // ── T03 ──────────────────────────────────────────────────────────────────────
  test("T03 — Sign-in page returns 200", async ({ page }) => {
    const res = await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
  });

  // ── T04 ──────────────────────────────────────────────────────────────────────
  test("T04 — Sign-up page returns 200", async ({ page }) => {
    const res = await page.goto(`${BASE}/sign-up`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
  });

  // ── T05 ──────────────────────────────────────────────────────────────────────
  test("T05 — Pricing page has Free and Pro plan names", async ({ page }) => {
    const res = await page.goto(`${BASE}/pricing`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    const body = await page.textContent("body");
    expect(body).toMatch(/Pro/);
    expect(body).toMatch(/Free/);
    expect(body).toMatch(/₹/); // India pricing
  });

  // ── T06 ──────────────────────────────────────────────────────────────────────
  test("T06 — Privacy page loads with Privacy content", async ({ page }) => {
    const res = await page.goto(`${BASE}/privacy`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    const body = await page.textContent("body");
    expect(body).toMatch(/Privacy/i);
  });

  // ── T07 ──────────────────────────────────────────────────────────────────────
  test("T07 — Terms page loads with Terms content", async ({ page }) => {
    const res = await page.goto(`${BASE}/terms`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
    const body = await page.textContent("body");
    expect(body).toMatch(/Terms/i);
  });

  // ── T08 ──────────────────────────────────────────────────────────────────────
  test("T08 — Dashboard redirects unauthenticated to sign-in", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4000);
    expect(page.url()).toMatch(/sign-in|sign-up/);
  });

  // In tests/e2e/fitaipro.spec.ts — T09 section:
test("T09 — All API routes protected without auth (401/403)", async ({ page }) => {
  const routes = [
    { url: `${BASE}/api/stats`,              method: "GET"  as const },
    { url: `${BASE}/api/workout/generate`,   method: "POST" as const },
    { url: `${BASE}/api/nutrition/generate`, method: "POST" as const },
    { url: `${BASE}/api/chat`,               method: "POST" as const },
    { url: `${BASE}/api/user/plan`,          method: "GET"  as const },
    { url: `${BASE}/api/onboarding`,         method: "POST" as const },
  ];

  for (const route of routes) {
    const res = await page.request.fetch(route.url, {
      method: route.method,
      headers: { "Content-Type": "application/json" },
      data: route.method === "POST" ? "{}" : undefined,
      failOnStatusCode: false,
    });

    const status = res.status();
    const isProtected = status === 401 || status === 403;

    expect(
      isProtected,
      `❌ SECURITY BUG: ${route.url} returned ${status} — should be 401 or 403 when unauthenticated`
    ).toBe(true);
  }
});

  // ── T10 ──────────────────────────────────────────────────────────────────────
  test("T10 — PWA manifest exists and is valid JSON", async ({ page }) => {
    const res = await page.request.get(`${BASE}/manifest.json`, {
      failOnStatusCode: false,
    });
    expect(res.status(), "manifest.json should return 200").toBe(200);
    const contentType = res.headers()["content-type"] || "";
    // Should be JSON, not HTML
    expect(contentType, "manifest.json should return JSON not HTML").not.toContain("text/html");
    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`manifest.json is not valid JSON. Got: ${text.slice(0, 100)}`);
    }
    expect(json.name).toMatch(/FitAI/i);
  });

  // ── T11 ──────────────────────────────────────────────────────────────────────
  test("T11 — No critical JS errors on landing page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(BASE, { waitUntil: "networkidle" });
    const critical = errors.filter(
      (e) =>
        !e.includes("cdn") &&
        !e.includes("favicon") &&
        !e.includes("extension") &&
        !e.includes("clerk") &&
        !e.includes("third-party") &&
        !e.includes("hotjar") &&
        !e.includes("intercom")
    );
    expect(critical, `Critical JS errors found: ${critical.join(", ")}`).toHaveLength(0);
  });

  // ── T12 ──────────────────────────────────────────────────────────────────────
  test("T12 — Clerk webhook endpoint exists (not 404)", async ({ page }) => {
    const res = await page.request.post(`${BASE}/api/webhooks/clerk`, {
      data: "{}",
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    });
    expect(res.status(), "Webhook route missing (404)").not.toBe(404);
    // 400 = bad signature = route exists and is working correctly
  });

  // ════════════════════════════════════════════════════════════════════════════
  // AUTHENTICATED TESTS — T13 to T20
  // Requires: vahidtyagi007+clerk_test@gmail.com account to exist in Clerk
  // Setup: Sign up manually once at /sign-up with OTP 424242
  // ════════════════════════════════════════════════════════════════════════════

  // ── T13 ──────────────────────────────────────────────────────────────────────
  test("T13 — Auth: Dashboard main page loads", async ({ page }) => {
    await signInTestUser(page);
    const body = await page.textContent("body");
    expect(body, "Dashboard body missing expected content").toMatch(
      /Dashboard|Welcome|Workout|workout/i
    );
  });

  // ── T14 ──────────────────────────────────────────────────────────────────────
  test("T14 — Auth: Workout page loads", async ({ page }) => {
    await signInTestUser(page);
    await page.goto(`${BASE}/dashboard/workout`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body).toMatch(/Workout|Exercise|Challenge|workout/i);
  });

  // ── T15 ──────────────────────────────────────────────────────────────────────
  test("T15 — Auth: Nutrition page loads", async ({ page }) => {
    await signInTestUser(page);
    await page.goto(`${BASE}/dashboard/nutrition`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body).toMatch(/Nutrition|Diet|Plan|meal|Meal/i);
  });

  // ── T16 ──────────────────────────────────────────────────────────────────────
  test("T16 — Auth: AI Coach chat page loads", async ({ page }) => {
    await signInTestUser(page);
    await page.goto(`${BASE}/dashboard/chat`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body).toMatch(/Coach|Chat|Ask|message|fitness/i);
  });

  // ── T17 ──────────────────────────────────────────────────────────────────────
  test("T17 — Auth: Progress page loads", async ({ page }) => {
    await signInTestUser(page);
    await page.goto(`${BASE}/dashboard/progress`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body).toMatch(/Progress|Weight|Track|Log/i);
  });

  // ── T18 ──────────────────────────────────────────────────────────────────────
  test("T18 — Auth: Settings page loads", async ({ page }) => {
    await signInTestUser(page);
    await page.goto(`${BASE}/dashboard/settings`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body).toMatch(/Settings|Profile|subscription|Subscription/i);
  });

  // ── T19 ──────────────────────────────────────────────────────────────────────
  test("T19 — Auth: All sidebar dashboard links return content", async ({ page }) => {
    await signInTestUser(page);

    const dashboardLinks = [
      { path: "/dashboard",           expect: /Dashboard|Welcome|Workout/i },
      { path: "/dashboard/workout",   expect: /Workout|Exercise|Challenge/i },
      { path: "/dashboard/nutrition", expect: /Nutrition|Diet|Plan/i },
      { path: "/dashboard/chat",      expect: /Coach|Chat|Ask/i },
      { path: "/dashboard/progress",  expect: /Progress|Weight|Track/i },
      { path: "/dashboard/settings",  expect: /Settings|Profile/i },
    ];

    for (const link of dashboardLinks) {
      await page.goto(`${BASE}${link.path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      const body = await page.textContent("body");
      expect(
        body,
        `❌ Page ${link.path} is missing expected content`
      ).toMatch(link.expect);
    }
  });

  // ── T20 ──────────────────────────────────────────────────────────────────────
  test("T20 — Auth: Stats API returns 200 when authenticated", async ({ page }) => {
    await signInTestUser(page);

    // Use page context to make authenticated request
    const res = await page.request.get(`${BASE}/api/stats`, {
      failOnStatusCode: false,
    });
    expect(
      res.status(),
      `Stats API should return 200 when logged in, got ${res.status()}`
    ).toBe(200);
  });
});