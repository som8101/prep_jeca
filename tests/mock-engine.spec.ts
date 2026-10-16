import { test, expect } from "@playwright/test";

test.describe("JECA Mock Test Engine E2E Tests", () => {
  let attemptId = "";

  test("1. Start exam & verify client question sanitization", async ({ request, page }) => {
    // Start attempt via API
    const res = await request.post("/api/mock/attempts/start", {
      data: {
        examConfigId: "jeca-2026-full-mock-1",
        userId: "playwright-test-user",
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.questions.length).toBe(100);

    // Verify client questions are strictly sanitized (NO LEAKS)
    for (const q of data.questions) {
      expect(q).not.toHaveProperty("answer");
      expect(q).not.toHaveProperty("explanation");
    }

    attemptId = data.attemptId;
    expect(attemptId).toBeTruthy();

    // Navigate to exam page in browser
    await page.goto(`/mock/exam/${attemptId}`);
    await page.waitForLoadState("networkidle");

    // Verify CBT UI elements
    await expect(page.locator("text=Question 1 of 100")).toBeVisible();
    await expect(page.locator("text=Category-I")).toBeVisible();
    await expect(page.locator("button:has-text('Save & Next')")).toBeVisible();
  });

  test("2. Select options, navigate & verify palette status", async ({ page }) => {
    await page.goto(`/mock/exam/${attemptId}`);
    await page.waitForLoadState("networkidle");

    // Select first option for Question 1
    const optionButtons = page.locator("div.space-y-3 button");
    await expect(optionButtons.first()).toBeVisible();
    await optionButtons.first().click();

    // Verify palette tile 1 reflects answered status
    const tile1 = page.locator("button[title*='Question 1']");
    await expect(tile1).toHaveClass(/bg-emerald-500/);

    // Click "Save & Next" to advance to Question 2
    await page.click("button:has-text('Save & Next')");
    await expect(page.locator("text=Question 2 of 100")).toBeVisible();

    // Mark Question 2 for review
    await page.click("button:has-text('Mark for Review')");
    const tile2 = page.locator("button[title*='Question 2']");
    await expect(tile2).toHaveClass(/bg-purple-600/);
  });

  test("3. Refresh and resume: verify crash recovery", async ({ page }) => {
    await page.goto(`/mock/exam/${attemptId}`);
    await page.waitForLoadState("networkidle");

    // Force page reload simulating browser crash or refresh
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify Question 1 is still answered (green in palette)
    const tile1 = page.locator("button[title*='Question 1']");
    await expect(tile1).toHaveClass(/bg-emerald-500/);

    // Verify Question 2 is still marked for review (purple in palette)
    const tile2 = page.locator("button[title*='Question 2']");
    await expect(tile2).toHaveClass(/bg-purple-600/);
  });

  test("4. Submit exam and verify results scorecard and solutions", async ({ page }) => {
    await page.goto(`/mock/exam/${attemptId}`);
    await page.waitForLoadState("networkidle");

    // Click Submit in Header
    await page.click("header button:has-text('Submit')");

    // Submission confirmation modal should appear
    await expect(page.locator("text=Submit Examination")).toBeVisible();
    await expect(page.locator("text=Answered Questions")).toBeVisible();

    // Confirm submission
    await page.click("button:has-text('Yes, Submit Exam')");

    // Should redirect to /mock/results/...
    await page.waitForURL(/\/mock\/results\/result-att-/);
    await page.waitForLoadState("networkidle");

    // Verify Results Scorecard
    await expect(page.locator("text=Evaluation Complete")).toBeVisible();
    await expect(page.locator("text=Solutions & Review")).toBeVisible();

    // Verify explanations are visible on results page
    await expect(page.locator("text=Explanation & Working:")).toBeVisible();
  });

  test("5. Practice mode: instant feedback and explanation", async ({ page }) => {
    await page.goto("/mock/practice");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Topic-Wise Practice Mode")).toBeVisible();

    // Select an option
    const option = page.locator("button:has-text('A.')").first();
    await option.click();

    // Click Check Answer
    await page.click("button:has-text('Check Answer')");

    // Answer explanation should appear
    await expect(
      page.locator("text=Correct Answer!").or(page.locator("text=Incorrect Response"))
    ).toBeVisible();

    // "Next Question" should now be visible
    await expect(page.locator("button:has-text('Next Question')")).toBeVisible();
  });
});
