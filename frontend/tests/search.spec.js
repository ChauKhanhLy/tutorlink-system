import { test, expect } from "@playwright/test";

test.describe("Search Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/search");
  });

  test("hiển thị tiêu đề trang", async ({ page }) => {
    await expect(
      page.getByText("Tìm gia sư phù hợp với bạn")
    ).toBeVisible();
  });

  test("hiển thị ô tìm kiếm", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      "Tìm kiếm theo môn học, kỹ năng hoặc tên gia sư..."
    );

    await expect(searchInput).toBeVisible();
  });

  test("người dùng có thể nhập từ khóa", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      "Tìm kiếm theo môn học, kỹ năng hoặc tên gia sư..."
    );

    await searchInput.fill("Toán");

    await expect(searchInput).toHaveValue("Toán");
  });

  test("chọn môn học Toán học", async ({ page }) => {
    const radio = page.locator('input[type="radio"]').nth(1);

    await radio.check();

    await expect(radio).toBeChecked();
  });

  test("thay đổi thanh giá", async ({ page }) => {
    const slider = page.locator('input[type="range"]');

    await slider.fill("50");

    await expect(slider).toHaveValue("50");
  });

  test("chọn thời gian rảnh", async ({ page }) => {
    await page.getByRole("button", {
      name: "Sáng",
    }).click();

    await expect(
      page.getByRole("button", {
        name: "Sáng",
      })
    ).toBeVisible();
  });

  test("reset bộ lọc", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      "Tìm kiếm theo môn học, kỹ năng hoặc tên gia sư..."
    );

    await searchInput.fill("Java");

    await page.getByText("Đặt lại").click();

    await expect(searchInput).toHaveValue("");
  });

  test("hiển thị dropdown sắp xếp", async ({ page }) => {
    const select = page.locator("select");

    await expect(select).toBeVisible();
  });

  test("thay đổi kiểu sắp xếp", async ({ page }) => {
    const select = page.locator("select");

    await select.selectOption("price_asc");

    await expect(select).toHaveValue("price_asc");
  });

  test("hiển thị nút áp dụng bộ lọc", async ({ page }) => {
    await expect(
      page.getByRole("button", {
        name: "Áp dụng bộ lọc",
      })
    ).toBeVisible();
  });
});