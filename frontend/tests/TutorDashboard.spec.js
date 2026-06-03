// tests/TutorDashboard.spec.js

import { test, expect } from "@playwright/test";

test.describe("Tutor Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth
    await page.addInitScript(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "tutor-1",
          name: "Nguyễn Văn A",
          role: "tutor",
          verified: true,
        }),
      );

      localStorage.setItem(
        "token",
        "fake-token",
      );
    });

    // Mock stats
    await page.route("**/tutors/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            todaySessions: 3,
            totalStudents: 12,
            monthlyEarnings: 5000000,
            avgRating: 4.8,
          },
        }),
      });
    });

    // Mock bookings
    await page.route("**/bookings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [],
        }),
      });
    });

    // Mock availability
    await page.route(
      "**/tutors/tutor-1/availability",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            availableSlots: [],
          }),
        });
      },
    );

    await page.goto("/tutor/dashboard");
  });


  
  test("link lịch dạy đúng", async ({ page }) => {
    const scheduleLink = page.getByRole("link", {
      name: /Lịch dạy/,
    });

    await expect(scheduleLink).toHaveAttribute(
      "href",
      "/tutor/schedule",
    );
  });

  test("link học viên đúng", async ({ page }) => {
    const studentsLink = page.getByRole("link", {
      name: /Học viên/,
    });

    await expect(studentsLink).toHaveAttribute(
      "href",
      "/tutor/students",
    );
  });

  test("link ví đúng", async ({ page }) => {
    const walletLink = page.getByRole("link", {
      name: /Ví của tôi/,
    });

    await expect(walletLink).toHaveAttribute(
      "href",
      "/wallet",
    );
  });
});

test.describe("Tutor Dashboard - Pending Tutor", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "tutor-1",
          name: "Nguyễn Văn A",
          role: "tutor",
          verified: false,
        }),
      );
    });

    await page.goto("/tutor/dashboard");
  });

  test("nút đăng ký gia sư hoạt động", async ({
    page,
  }) => {
    await page
      .getByRole("button", {
        name: "Đăng ký gia sư chính thức",
      })
      .click();

    await expect(page).toHaveURL(
      /become-tutor/,
    );
  });
});