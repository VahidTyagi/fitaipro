import { test, expect } from "@playwright/test";

const BASE_URL = "https://fitaipro-five.vercel.app";
const EMAIL = "vahidtyagi007007@gmail.com";
const PASSWORD = "Mlpqaz@23";

test.describe("FitAI Pro — Full Flow Test", () => {
  test("Landing page loads correctly", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator("text=FitAIPro")).toBeVisible();
    await expect(page.locator("text=Start For Free")).toBeVisible();
    await expect(page.locator("text=Features")).toBeVisible();
    console.log("✅ Landing page OK");
  });

  test("Sign in works", async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForSelector("input[name='identifier']", { timeout: 10000 });
    await page.fill("input[name='identifier']", EMAIL);
    await page.click("button[type='submit']");
    await page.waitForSelector("input[name='password']", { timeout: 5000 });
    await page.fill("input[name='password']", PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
    console.log("✅ Sign in OK");
  });

  test("Dashboard loads with correct user name", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    const header = page.locator("header");
    await expect(header).toContainText("Vahid");
    console.log("✅ User name display OK");
  });

  test("Workout page generates workout", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/workout`);
    await page.click("text=Home Workout");
    await page.waitForSelector("text=Start Workout", { timeout: 20000 });
    console.log("✅ Workout generation OK");
  });

  test("Nutrition page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/nutrition`);
    await page.waitForLoadState("networkidle");
    const hasContent = await page.locator("text=AI Nutrition Plan").isVisible();
    expect(hasContent).toBeTruthy();
    console.log("✅ Nutrition page OK");
  });

  test("Chat page works", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/chat`);
    await page.fill("input[placeholder*='Ask']", "What should I eat for breakfast?");
    await page.keyboard.press("Enter");
    await page.waitForSelector("text=AI Coach", { timeout: 15000 });
    console.log("✅ Chat OK");
  });

  test("Progress page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/progress`);
    await expect(page.locator("text=Progress Tracker")).toBeVisible();
    console.log("✅ Progress page OK");
  });

  test("Pricing page loads with early bird", async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await expect(page.locator("text=Free to Start")).toBeVisible();
    console.log("✅ Pricing page OK");
  });
});