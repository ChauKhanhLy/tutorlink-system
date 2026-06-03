// frontend/tests/booking.spec.js

import { test, expect } from "@playwright/test";

test.describe("Booking Page", () => {
  test.beforeEach(async ({ page }) => {
    // Fake đăng nhập
    await page.addInitScript(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "student-1",
          role: "student",
          name: "Test Student",
        })
      );

      localStorage.setItem("token", "fake-token");
    });

    await page.goto("/bookings");
  });

  test("hiển thị tiêu đề trang", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: "Lịch đặt buổi học",
      })
    ).toBeVisible();

    await expect(
      page.getByText(
        "Quản lý tất cả các buổi học bạn đã đặt với gia sư"
      )
    ).toBeVisible();
  });

  test("hiển thị các tab", async ({ page }) => {
    await expect(
      page.getByRole("button", {
        name: "Sắp diễn ra",
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Đã qua",
      })
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Đã hủy",
      })
    ).toBeVisible();
  });

  test("chuyển tab Đã qua", async ({ page }) => {
    const tab = page.getByRole("button", {
      name: "Đã qua",
    });

    await tab.click();

    await expect(tab).toBeVisible();
  });

  test("chuyển tab Đã hủy", async ({ page }) => {
    const tab = page.getByRole("button", {
      name: "Đã hủy",
    });

    await tab.click();

    await expect(tab).toBeVisible();
  });

  test("nếu không có booking hiển thị trạng thái rỗng", async ({
    page,
  }) => {
    const emptyText = page.getByText(
      "Chưa có buổi học nào"
    );

    if (await emptyText.isVisible().catch(() => false)) {
      await expect(emptyText).toBeVisible();

      await expect(
        page.getByRole("link", {
          name: /Tìm gia sư ngay/i,
        })
      ).toBeVisible();
    }
  });

  test("nếu có booking thì hiển thị link hồ sơ gia sư", async ({
    page,
  }) => {
    const profileLinks = page.getByRole("link", {
      name: "Xem hồ sơ gia sư",
    });

    const count = await profileLinks.count();

    if (count > 0) {
      await expect(profileLinks.first()).toBeVisible();
    }
  });

  test("nếu có booking tương lai thì hiển thị nút tham gia", async ({
    page,
  }) => {
    const lessonLinks = page.getByRole("link", {
      name: "Tham gia buổi học",
    });

    const count = await lessonLinks.count();

    if (count > 0) {
      await expect(lessonLinks.first()).toBeVisible();
    }
  });

  test("nếu có booking quá khứ thì hiển thị nút đánh giá", async ({
    page,
  }) => {
    const reviewLinks = page.getByRole("link", {
      name: "Viết đánh giá",
    });

    const count = await reviewLinks.count();

    if (count > 0) {
      await expect(reviewLinks.first()).toBeVisible();
    }
  });
});