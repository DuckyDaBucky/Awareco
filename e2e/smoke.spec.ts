import { expect, test } from "@playwright/test"

test("main demonstration path", async ({ page }) => {
  await page.goto("/go/ig-car-engine")
  await page.getByRole("link", { name: "Explore the car" }).click()
  await expect(page.getByRole("heading", { name: "Tap a part. See its story." })).toBeVisible()
  await expect(page).toHaveURL(/\/car\/power_unit$/)
  await expect(page.getByRole("link", { name: "Power Unit / Engine", exact: true })).toHaveAttribute("aria-current", "page")

  await page.goto("/car/energy_recovery")
  await page.getByRole("button", { name: "2025 AMR25" }).click()
  await expect(page.getByRole("strong").filter({ hasText: "120 kW" })).toBeVisible()

  await page.goto("/people/paddle-uk")
  await page.getByRole("button", { name: "What difference has the programme made?" }).click()
  await expect(page.locator(".bubble.guide").filter({ hasText: "three prototypes" })).toBeVisible()

  await page.goto("/partners?programme=aleto")
  await expect(page.getByLabel("Demonstration role")).toHaveValue("charity")
  await expect(page.locator(".partner-sidebar-foot small")).toHaveText("aleto")

  await page.goto("/partners/scenarios")
  await page.getByRole("button", { name: "Explore outreach capacity" }).click()
  await expect(page.locator(".scenario-workspace strong").filter({ hasText: "293" })).toBeVisible()
})

test("community evidence profiles handle measured and narrative programmes", async ({ page }) => {
  await page.goto("/people")
  await expect(page.getByRole("heading", { name: "Every programme deserves more than a card and a number." })).toBeVisible()
  await page.getByLabel("Evidence coverage").selectOption("narrative")
  await expect(page.locator(".programme-card")).toHaveCount(3)

  await page.goto("/people/racing-pride")
  await expect(page.getByRole("heading", { name: "A story is published; a quantified outcome is not." })).toBeVisible()
  await expect(page.getByText("No numerical outcome is reported in the loaded evidence.")).toBeVisible()

  await page.goto("/people/aleto")
  await expect(page.locator(".evidence-metric")).toHaveCount(3)
  await expect(page.getByText("The report contains a disclosed cohort-count discrepancy.")).toBeVisible()
})

test("partner roles guard leadership routes and preserve role while switching programmes", async ({ page }) => {
  await page.goto("/partners/inclusion")
  await expect(page.getByRole("heading", { name: "This view is not available to the selected role." })).toBeVisible()
  await page.getByRole("button", { name: "Switch to leadership demo" }).click()
  await expect(page.getByRole("heading", { name: "Inclusion evidence with privacy boundaries intact." })).toBeVisible()

  await page.goto("/partners/programmes/aleto")
  await page.getByLabel("Switch programme").selectOption("make-a-mark-day")
  await expect(page).toHaveURL(/\/partners\/programmes\/make-a-mark-day$/)
  await expect(page.getByLabel("Demonstration role")).toHaveValue("leadership")
  await expect(page.getByRole("heading", { name: "Make A Mark Day", exact: true })).toBeVisible()
  await page.getByLabel("Local review status").selectOption("approved")
  await page.goto("/partners/reports")
  await expect(page.locator(".report-draft")).toContainText("Approved for demo")
})

test("saved scenarios and edited gap status flow into the report", async ({ page }) => {
  await page.goto("/partners/scenarios")
  await page.getByRole("button", { name: "Explore outreach capacity" }).click()
  await page.getByRole("button", { name: "Save and include in report" }).click()
  await expect(page.getByText("Scenario saved with its inputs, outputs and assumptions.")).toBeVisible()

  await page.goto("/partners/data-quality")
  const careerGap = page.locator(".gap-card").filter({ hasText: "Long-term career outcomes" })
  await careerGap.getByRole("combobox").selectOption("resolved")

  await page.goto("/partners/reports")
  await expect(page.locator(".report-scenario").getByRole("heading", { name: "Explore outreach capacity" })).toBeVisible()
  await expect(page.locator(".report-scenario").getByText("Funding change percent")).toBeVisible()
  const gapRow = page.locator(".report-gap-table tr").filter({ hasText: "Long-term career outcomes" })
  await expect(gapRow).toContainText("Resolved")
})

test("community and partner layouts remain usable on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  await page.goto("/people")
  await expect(page.getByRole("heading", { name: "Every programme deserves more than a card and a number." })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)

  await page.goto("/people/aleto")
  await expect(page.getByRole("heading", { name: "Aleto leadership programme", exact: true, level: 1 })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)

  await page.goto("/partners")
  await expect(page.getByRole("heading", { name: "Evidence you can use, not just numbers you can view." })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
})
