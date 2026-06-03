import { test, expect } from "@playwright/test";

test.describe("Auth Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("Hiển thị form đăng nhập", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Đăng nhập" })
    ).toBeVisible();

    await expect(
      page.getByPlaceholder("Địa chỉ email")
    ).toBeVisible();

    await expect(
      page.getByPlaceholder("Mật khẩu")
    ).toBeVisible();
  });

  test("Chuyển sang trang đăng ký", async ({ page }) => {
    await page.getByRole("link", {
      name: "Đăng ký",
    }).click();

    await expect(
      page.getByRole("button", {
        name: "Tạo tài khoản",
      })
    ).toBeVisible();
  });

  test("Validate email sai định dạng", async ({ page }) => {
    await page.goto("/signup");

    await page
      .locator('input[name="email"]')
      .fill("abc");

    await page
      .locator('input[name="password"]')
      .click();

    await expect(
      page.getByText("Email không đúng định dạng")
    ).toBeVisible();
  });

  test("Validate password dưới 6 ký tự", async ({ page }) => {
    await page.goto("/signup");

    await page
      .locator('input[name="password"]')
      .fill("123");

    await expect(
      page.getByText("Mật khẩu phải có ít nhất 6 ký tự")
    ).toBeVisible();
  });

  test("Validate password thiếu chữ hoa", async ({ page }) => {
    await page.goto("/signup");

    await page
      .locator('input[name="password"]')
      .fill("abcdef");

    await expect(
      page.getByText("Mật khẩu phải có ít nhất 1 chữ hoa")
    ).toBeVisible();
  });

  test("Validate password thiếu chữ thường", async ({ page }) => {
    await page.goto("/signup");

    await page
      .locator('input[name="password"]')
      .fill("ABCDEF");

    await expect(
      page.getByText("Mật khẩu phải có ít nhất 1 chữ thường")
    ).toBeVisible();
  });

  test("Validate confirm password", async ({ page }) => {
    await page.goto("/signup");

    await page
      .locator('input[name="password"]')
      .fill("Abc123");

    await page
      .getByPlaceholder("Xác nhận mật khẩu")
      .fill("Abc456");

    await expect(
      page.getByText("Mật khẩu xác nhận không khớp")
    ).toBeVisible();
  });

  test("Password hợp lệ", async ({ page }) => {
    await page.goto("/signup");

    await page
      .locator('input[name="password"]')
      .fill("Abc123");

    await expect(
      page.getByText("Mật khẩu hợp lệ")
    ).toBeVisible();
  });

  test("Hiện / Ẩn password", async ({ page }) => {
    await page.goto("/login");

    const passwordInput =
      page.locator('input[name="password"]');

    await expect(passwordInput)
      .toHaveAttribute("type", "password");

    await page
      .locator('button[type="button"]')
      .nth(0)
      .click();

    await expect(passwordInput)
      .toHaveAttribute("type", "text");
  });

  test("Chuyển role Tutor", async ({ page }) => {
    await page.goto("/signup");

    await page
      .getByRole("button", {
        name: "Tôi là gia sư",
      })
      .click();

    await expect(
      page.getByText(
        "Biến kiến thức thành thu nhập và tạo ảnh hưởng."
      )
    ).toBeVisible();
  });

  test("Chuyển role Student", async ({ page }) => {
    await page.goto("/signup");

    await page
      .getByRole("button", {
        name: "Tôi là gia sư",
      })
      .click();

    await page
      .getByRole("button", {
        name: "Tôi là học sinh",
      })
      .click();

    await expect(
      page.getByText(
        "Nâng cao việc học của bạn với sự hướng dẫn 1-1 từ chuyên gia."
      )
    ).toBeVisible();
  });

  test("Mở màn hình quên mật khẩu", async ({ page }) => {
    await page.getByText("Quên mật khẩu?").click();

    await expect(
      page.getByText("Quên mật khẩu")
    ).toBeVisible();

    await expect(
      page.getByPlaceholder("Nhập email")
    ).toBeVisible();
  });

  test("Quay lại đăng nhập từ màn hình quên mật khẩu", async ({
    page,
  }) => {
    await page.getByText("Quên mật khẩu?").click();

    await page.getByText("Quay lại đăng nhập").click();

    await expect(
      page.getByRole("button", {
        name: "Đăng nhập",
      })
    ).toBeVisible();
  });
});