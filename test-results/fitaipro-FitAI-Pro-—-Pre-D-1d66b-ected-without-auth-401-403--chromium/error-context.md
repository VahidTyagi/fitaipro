# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fitaipro.spec.ts >> FitAI Pro — Pre-Deploy Suite >> T09 — All API routes protected without auth (401/403)
- Location: tests\e2e\fitaipro.spec.ts:132:5

# Error details

```
Error: ❌ SECURITY BUG: https://fitaipro-five.vercel.app/api/stats returned 200 — should be 401 or 403 when unauthenticated

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  56  |     await page.waitForURL(/dashboard/, { timeout: 25_000 });
  57  |   } catch {
  58  |     // Check if we're still on sign-in page with error
  59  |     const currentUrl = page.url();
  60  |     if (currentUrl.includes("sign-in")) {
  61  |       throw new Error(
  62  |         `Sign-in failed. Still on: ${currentUrl}. ` +
  63  |         `Make sure account ${TEST_EMAIL} exists with password ${TEST_PASSWORD}`
  64  |       );
  65  |     }
  66  |   }
  67  | }
  68  | 
  69  | // ════════════════════════════════════════════════════════════════════════════════
  70  | test.describe("FitAI Pro — Pre-Deploy Suite", () => {
  71  | 
  72  |   // ── T01 ──────────────────────────────────────────────────────────────────────
  73  |   test("T01 — Landing page loads with FitAI title", async ({ page }) => {
  74  |     await page.goto(BASE, { waitUntil: "domcontentloaded" });
  75  |     const title = await page.title();
  76  |     expect(title).toMatch(/FitAI/i);
  77  |   });
  78  | 
  79  |   // ── T02 ──────────────────────────────────────────────────────────────────────
  80  |   test("T02 — Landing page has Sign Up CTA button", async ({ page }) => {
  81  |     await page.goto(BASE, { waitUntil: "domcontentloaded" });
  82  |     const btn = page.locator("a[href='/sign-up']").first();
  83  |     await expect(btn).toBeVisible({ timeout: 10_000 });
  84  |   });
  85  | 
  86  |   // ── T03 ──────────────────────────────────────────────────────────────────────
  87  |   test("T03 — Sign-in page returns 200", async ({ page }) => {
  88  |     const res = await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded" });
  89  |     expect(res?.status()).toBe(200);
  90  |   });
  91  | 
  92  |   // ── T04 ──────────────────────────────────────────────────────────────────────
  93  |   test("T04 — Sign-up page returns 200", async ({ page }) => {
  94  |     const res = await page.goto(`${BASE}/sign-up`, { waitUntil: "domcontentloaded" });
  95  |     expect(res?.status()).toBe(200);
  96  |   });
  97  | 
  98  |   // ── T05 ──────────────────────────────────────────────────────────────────────
  99  |   test("T05 — Pricing page has Free and Pro plan names", async ({ page }) => {
  100 |     const res = await page.goto(`${BASE}/pricing`, { waitUntil: "domcontentloaded" });
  101 |     expect(res?.status()).toBe(200);
  102 |     const body = await page.textContent("body");
  103 |     expect(body).toMatch(/Pro/);
  104 |     expect(body).toMatch(/Free/);
  105 |     expect(body).toMatch(/₹/); // India pricing
  106 |   });
  107 | 
  108 |   // ── T06 ──────────────────────────────────────────────────────────────────────
  109 |   test("T06 — Privacy page loads with Privacy content", async ({ page }) => {
  110 |     const res = await page.goto(`${BASE}/privacy`, { waitUntil: "domcontentloaded" });
  111 |     expect(res?.status()).toBe(200);
  112 |     const body = await page.textContent("body");
  113 |     expect(body).toMatch(/Privacy/i);
  114 |   });
  115 | 
  116 |   // ── T07 ──────────────────────────────────────────────────────────────────────
  117 |   test("T07 — Terms page loads with Terms content", async ({ page }) => {
  118 |     const res = await page.goto(`${BASE}/terms`, { waitUntil: "domcontentloaded" });
  119 |     expect(res?.status()).toBe(200);
  120 |     const body = await page.textContent("body");
  121 |     expect(body).toMatch(/Terms/i);
  122 |   });
  123 | 
  124 |   // ── T08 ──────────────────────────────────────────────────────────────────────
  125 |   test("T08 — Dashboard redirects unauthenticated to sign-in", async ({ page }) => {
  126 |     await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  127 |     await page.waitForTimeout(4000);
  128 |     expect(page.url()).toMatch(/sign-in|sign-up/);
  129 |   });
  130 | 
  131 |   // In tests/e2e/fitaipro.spec.ts — T09 section:
  132 | test("T09 — All API routes protected without auth (401/403)", async ({ page }) => {
  133 |   const routes = [
  134 |     { url: `${BASE}/api/stats`,              method: "GET"  as const },
  135 |     { url: `${BASE}/api/workout/generate`,   method: "POST" as const },
  136 |     { url: `${BASE}/api/nutrition/generate`, method: "POST" as const },
  137 |     { url: `${BASE}/api/chat`,               method: "POST" as const },
  138 |     { url: `${BASE}/api/user/plan`,          method: "GET"  as const },
  139 |     { url: `${BASE}/api/onboarding`,         method: "POST" as const },
  140 |   ];
  141 | 
  142 |   for (const route of routes) {
  143 |     const res = await page.request.fetch(route.url, {
  144 |       method: route.method,
  145 |       headers: { "Content-Type": "application/json" },
  146 |       data: route.method === "POST" ? "{}" : undefined,
  147 |       failOnStatusCode: false,
  148 |     });
  149 | 
  150 |     const status = res.status();
  151 |     const isProtected = status === 401 || status === 403;
  152 | 
  153 |     expect(
  154 |       isProtected,
  155 |       `❌ SECURITY BUG: ${route.url} returned ${status} — should be 401 or 403 when unauthenticated`
> 156 |     ).toBe(true);
      |       ^ Error: ❌ SECURITY BUG: https://fitaipro-five.vercel.app/api/stats returned 200 — should be 401 or 403 when unauthenticated
  157 |   }
  158 | });
  159 | 
  160 |   // ── T10 ──────────────────────────────────────────────────────────────────────
  161 |   test("T10 — PWA manifest exists and is valid JSON", async ({ page }) => {
  162 |     const res = await page.request.get(`${BASE}/manifest.json`, {
  163 |       failOnStatusCode: false,
  164 |     });
  165 |     expect(res.status(), "manifest.json should return 200").toBe(200);
  166 |     const contentType = res.headers()["content-type"] || "";
  167 |     // Should be JSON, not HTML
  168 |     expect(contentType, "manifest.json should return JSON not HTML").not.toContain("text/html");
  169 |     const text = await res.text();
  170 |     let json: any;
  171 |     try {
  172 |       json = JSON.parse(text);
  173 |     } catch {
  174 |       throw new Error(`manifest.json is not valid JSON. Got: ${text.slice(0, 100)}`);
  175 |     }
  176 |     expect(json.name).toMatch(/FitAI/i);
  177 |   });
  178 | 
  179 |   // ── T11 ──────────────────────────────────────────────────────────────────────
  180 |   test("T11 — No critical JS errors on landing page", async ({ page }) => {
  181 |     const errors: string[] = [];
  182 |     page.on("console", (msg) => {
  183 |       if (msg.type() === "error") errors.push(msg.text());
  184 |     });
  185 |     await page.goto(BASE, { waitUntil: "networkidle" });
  186 |     const critical = errors.filter(
  187 |       (e) =>
  188 |         !e.includes("cdn") &&
  189 |         !e.includes("favicon") &&
  190 |         !e.includes("extension") &&
  191 |         !e.includes("clerk") &&
  192 |         !e.includes("third-party") &&
  193 |         !e.includes("hotjar") &&
  194 |         !e.includes("intercom")
  195 |     );
  196 |     expect(critical, `Critical JS errors found: ${critical.join(", ")}`).toHaveLength(0);
  197 |   });
  198 | 
  199 |   // ── T12 ──────────────────────────────────────────────────────────────────────
  200 |   test("T12 — Clerk webhook endpoint exists (not 404)", async ({ page }) => {
  201 |     const res = await page.request.post(`${BASE}/api/webhooks/clerk`, {
  202 |       data: "{}",
  203 |       headers: { "Content-Type": "application/json" },
  204 |       failOnStatusCode: false,
  205 |     });
  206 |     expect(res.status(), "Webhook route missing (404)").not.toBe(404);
  207 |     // 400 = bad signature = route exists and is working correctly
  208 |   });
  209 | 
  210 |   // ════════════════════════════════════════════════════════════════════════════
  211 |   // AUTHENTICATED TESTS — T13 to T20
  212 |   // Requires: vahidtyagi007+clerk_test@gmail.com account to exist in Clerk
  213 |   // Setup: Sign up manually once at /sign-up with OTP 424242
  214 |   // ════════════════════════════════════════════════════════════════════════════
  215 | 
  216 |   // ── T13 ──────────────────────────────────────────────────────────────────────
  217 |   test("T13 — Auth: Dashboard main page loads", async ({ page }) => {
  218 |     await signInTestUser(page);
  219 |     const body = await page.textContent("body");
  220 |     expect(body, "Dashboard body missing expected content").toMatch(
  221 |       /Dashboard|Welcome|Workout|workout/i
  222 |     );
  223 |   });
  224 | 
  225 |   // ── T14 ──────────────────────────────────────────────────────────────────────
  226 |   test("T14 — Auth: Workout page loads", async ({ page }) => {
  227 |     await signInTestUser(page);
  228 |     await page.goto(`${BASE}/dashboard/workout`, { waitUntil: "domcontentloaded" });
  229 |     await page.waitForTimeout(2000);
  230 |     const body = await page.textContent("body");
  231 |     expect(body).toMatch(/Workout|Exercise|Challenge|workout/i);
  232 |   });
  233 | 
  234 |   // ── T15 ──────────────────────────────────────────────────────────────────────
  235 |   test("T15 — Auth: Nutrition page loads", async ({ page }) => {
  236 |     await signInTestUser(page);
  237 |     await page.goto(`${BASE}/dashboard/nutrition`, { waitUntil: "domcontentloaded" });
  238 |     await page.waitForTimeout(2000);
  239 |     const body = await page.textContent("body");
  240 |     expect(body).toMatch(/Nutrition|Diet|Plan|meal|Meal/i);
  241 |   });
  242 | 
  243 |   // ── T16 ──────────────────────────────────────────────────────────────────────
  244 |   test("T16 — Auth: AI Coach chat page loads", async ({ page }) => {
  245 |     await signInTestUser(page);
  246 |     await page.goto(`${BASE}/dashboard/chat`, { waitUntil: "domcontentloaded" });
  247 |     await page.waitForTimeout(2000);
  248 |     const body = await page.textContent("body");
  249 |     expect(body).toMatch(/Coach|Chat|Ask|message|fitness/i);
  250 |   });
  251 | 
  252 |   // ── T17 ──────────────────────────────────────────────────────────────────────
  253 |   test("T17 — Auth: Progress page loads", async ({ page }) => {
  254 |     await signInTestUser(page);
  255 |     await page.goto(`${BASE}/dashboard/progress`, { waitUntil: "domcontentloaded" });
  256 |     await page.waitForTimeout(2000);
```