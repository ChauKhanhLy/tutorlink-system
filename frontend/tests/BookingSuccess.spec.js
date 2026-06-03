import { test, expect } from "@playwright/test";

test.describe("Booking Success Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/bookings/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "booking-123",
            tutorId: "tutor-1",
            tutorName: "Nguyễn Văn A",
            tutorAvatar: "/avatar.jpg",
            tutor_id: "tutor-1",

            subjectId: "subject-1",
            subject_id: "subject-1",
            subjectName: "Toán học",

            date: "2026-06-10T08:00:00.000Z",
            time: "08:00",
            fee: 200000,

            type: "regular",
            status: "confirmed",
          },
        }),
      });
    });

    await page.goto("/booking-success/booking-123");
  });

  test("hiển thị tiêu đề thành công", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: /Đặt lịch thành công/i,
      })
    ).toBeVisible();
  });

  test("hiển thị tên gia sư", async ({ page }) => {
    await expect(
      page.getByText("Nguyễn Văn A")
    ).toBeVisible();
  });

  test("hiển thị môn học", async ({ page }) => {
    await expect(
      page.getByText("Toán học")
    ).toBeVisible();
  });

  test("hiển thị học phí", async ({ page }) => {
    await expect(
      page.getByText(/200/)
    ).toBeVisible();
  });

  test("hiển thị trạng thái đã xác nhận", async ({ page }) => {
    await expect(
      page.getByText("Đã xác nhận")
    ).toBeVisible();
  });

  test("link Dashboard đúng", async ({ page }) => {
    const btn = page.getByRole("link", {
      name: "Về Dashboard",
    });

    await expect(btn).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });

  test("link nhắn tin đúng", async ({ page }) => {
    const btn = page.getByRole("link", {
      name: "Nhắn tin cho gia sư",
    });

    await expect(btn).toHaveAttribute(
      "href",
      "/messages?tutorId=tutor-1"
    );
  });

  test("link classroom đúng", async ({ page }) => {
    const classroomLink = page
      .locator('a[href*="/classroom/"]')
      .first();

    await expect(classroomLink).toHaveAttribute(
      "href",
      "/classroom/tutor-1/subject-1"
    );
  });
});