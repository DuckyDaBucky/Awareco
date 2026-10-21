import { expect, test } from "@playwright/test"

test("main demonstration path", async ({ page }) => {
  await page.goto("/go/ig-car-engine")
  await page.getByRole("link", { name: "Explore the car" }).click()
  await page.getByRole("button", { name: "Which engine powers the AMR26?" }).click()
  await expect(page.getByText("Honda RA626H")).toBeVisible()
  await page.getByRole("button", { name: "Aston Martin — AMR26 Engineering" }).click()
  await expect(page.getByRole("dialog", { name: "Aston Martin — AMR26 Engineering" })).toBeVisible()
  await expect(page.locator("[data-conversation] input")).toHaveCount(0)

  await page.goto("/car/energy_recovery")
  await page.getByRole("button", { name: "2025 AMR25" }).click()
  await expect(page.getByRole("strong").filter({ hasText: "120 kW" })).toBeVisible()

  await page.goto("/people/paddle-uk")
  await page.getByRole("button", { name: "What difference has the programme made?" }).click()
  await expect(page.getByText("three prototypes")).toBeVisible()

  await page.goto("/partners?programme=aleto")
  await expect(page.getByText("Charity partner demo · aleto")).toBeVisible()
  await expect(page.getByRole("combobox").nth(1)).toHaveValue("aleto")

  await page.goto("/partners/simulate")
  await page.getByRole("button", { name: "Explore outreach capacity" }).click()
  await expect(page.getByText("293")).toBeVisible()
})
