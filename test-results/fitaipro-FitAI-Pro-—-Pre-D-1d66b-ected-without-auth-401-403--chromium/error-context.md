# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fitaipro.spec.ts >> FitAI Pro — Pre-Deploy Suite >> T09 — All API routes protected without auth (401/403)
- Location: tests\e2e\fitaipro.spec.ts:132:7

# Error details

```
Error: ❌ https://fitaipro-five.vercel.app/api/stats should be protected but returned 200

expect(received).toContain(expected) // indexOf

Expected value: 200
Received array: [401, 403]
```

# Test source

```ts
  52  |   }
  53  | 
  54  |   // Step 4: Wait for dashboard redirect
  55  |   try {
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
  131 |   // ── T09 ──────────────────────────────────────────────────────────────────────
  132 |   test("T09 — All API routes protected without auth (401/403)", async ({ page }) => {
  133 |     const routes = [
  134 |       { url: `${BASE}/api/stats`,              method: "GET"  as const },
  135 |       { url: `${BASE}/api/workout/generate`,   method: "POST" as const },
  136 |       { url: `${BASE}/api/nutrition/generate`, method: "POST" as const },
  137 |       { url: `${BASE}/api/chat`,               method: "POST" as const },
  138 |       { url: `${BASE}/api/user/plan`,          method: "GET"  as const },
  139 |       { url: `${BASE}/api/onboarding`,         method: "POST" as const },
  140 |     ];
  141 | 
  142 |     for (const route of routes) {
  143 |       const res = await page.request.fetch(route.url, {
  144 |         method: route.method,
  145 |         headers: { "Content-Type": "application/json" },
  146 |         data: route.method === "POST" ? "{}" : undefined,
  147 |         failOnStatusCode: false,
  148 |       });
  149 |       expect(
  150 |         [401, 403],
  151 |         `❌ ${route.url} should be protected but returned ${res.status()}`
> 152 |       ).toContain(res.status());
      |         ^ Error: ❌ https://fitaipro-five.vercel.app/api/stats should be protected but returned 200
  153 |     }
  154 |   });
  155 | 
  156 |   // ── T10 ──────────────────────────────────────────────────────────────────────
  157 |   test("T10 — PWA manifest exists and is valid JSON", async ({ page }) => {
  158 |     const res = await page.request.get(`${BASE}/manifest.json`, {
  159 |       failOnStatusCode: false,
  160 |     });
  161 |     expect(res.status(), "manifest.json should return 200").toBe(200);
  162 |     const contentType = res.headers()["content-type"] || "";
  163 |     // Should be JSON, not HTML
  164 |     expect(contentType, "manifest.json should return JSON not HTML").not.toContain("text/html");
  165 |     const text = await res.text();
  166 |     let json: any;
  167 |     try {
  168 |       json = JSON.parse(text);
  169 |     } catch {
  170 |       throw new Error(`manifest.json is not valid JSON. Got: ${text.slice(0, 100)}`);
  171 |     }
  172 |     expect(json.name).toMatch(/FitAI/i);
  173 |   });
  174 | 
  175 |   // ── T11 ──────────────────────────────────────────────────────────────────────
  176 |   test("T11 — No critical JS errors on landing page", async ({ page }) => {
  177 |     const errors: string[] = [];
  178 |     page.on("console", (msg) => {
  179 |       if (msg.type() === "error") errors.push(msg.text());
  180 |     });
  181 |     await page.goto(BASE, { waitUntil: "networkidle" });
  182 |     const critical = errors.filter(
  183 |       (e) =>
  184 |         !e.includes("cdn") &&
  185 |         !e.includes("favicon") &&
  186 |         !e.includes("extension") &&
  187 |         !e.includes("clerk") &&
  188 |         !e.includes("third-party") &&
  189 |         !e.includes("hotjar") &&
  190 |         !e.includes("intercom")
  191 |     );
  192 |     expect(critical, `Critical JS errors found: ${critical.join(", ")}`).toHaveLength(0);
  193 |   });
  194 | 
  195 |   // ── T12 ──────────────────────────────────────────────────────────────────────
  196 |   test("T12 — Clerk webhook endpoint exists (not 404)", async ({ page }) => {
  197 |     const res = await page.request.post(`${BASE}/api/webhooks/clerk`, {
  198 |       data: "{}",
  199 |       headers: { "Content-Type": "application/json" },
  200 |       failOnStatusCode: false,
  201 |     });
  202 |     expect(res.status(), "Webhook route missing (404)").not.toBe(404);
  203 |     // 400 = bad signature = route exists and is working correctly
  204 |   });
  205 | 
  206 |   // ════════════════════════════════════════════════════════════════════════════
  207 |   // AUTHENTICATED TESTS — T13 to T20
  208 |   // Requires: vahidtyagi007+clerk_test@gmail.com account to exist in Clerk
  209 |   // Setup: Sign up manually once at /sign-up with OTP 424242
  210 |   // ════════════════════════════════════════════════════════════════════════════
  211 | 
  212 |   // ── T13 ──────────────────────────────────────────────────────────────────────
  213 |   test("T13 — Auth: Dashboard main page loads", async ({ page }) => {
  214 |     await signInTestUser(page);
  215 |     const body = await page.textContent("body");
  216 |     expect(body, "Dashboard body missing expected content").toMatch(
  217 |       /Dashboard|Welcome|Workout|workout/i
  218 |     );
  219 |   });
  220 | 
  221 |   // ── T14 ──────────────────────────────────────────────────────────────────────
  222 |   test("T14 — Auth: Workout page loads", async ({ page }) => {
  223 |     await signInTestUser(page);
  224 |     await page.goto(`${BASE}/dashboard/workout`, { waitUntil: "domcontentloaded" });
  225 |     await page.waitForTimeout(2000);
  226 |     const body = await page.textContent("body");
  227 |     expect(body).toMatch(/Workout|Exercise|Challenge|workout/i);
  228 |   });
  229 | 
  230 |   // ── T15 ──────────────────────────────────────────────────────────────────────
  231 |   test("T15 — Auth: Nutrition page loads", async ({ page }) => {
  232 |     await signInTestUser(page);
  233 |     await page.goto(`${BASE}/dashboard/nutrition`, { waitUntil: "domcontentloaded" });
  234 |     await page.waitForTimeout(2000);
  235 |     const body = await page.textContent("body");
  236 |     expect(body).toMatch(/Nutrition|Diet|Plan|meal|Meal/i);
  237 |   });
  238 | 
  239 |   // ── T16 ──────────────────────────────────────────────────────────────────────
  240 |   test("T16 — Auth: AI Coach chat page loads", async ({ page }) => {
  241 |     await signInTestUser(page);
  242 |     await page.goto(`${BASE}/dashboard/chat`, { waitUntil: "domcontentloaded" });
  243 |     await page.waitForTimeout(2000);
  244 |     const body = await page.textContent("body");
  245 |     expect(body).toMatch(/Coach|Chat|Ask|message|fitness/i);
  246 |   });
  247 | 
  248 |   // ── T17 ──────────────────────────────────────────────────────────────────────
  249 |   test("T17 — Auth: Progress page loads", async ({ page }) => {
  250 |     await signInTestUser(page);
  251 |     await page.goto(`${BASE}/dashboard/progress`, { waitUntil: "domcontentloaded" });
  252 |     await page.waitForTimeout(2000);
```