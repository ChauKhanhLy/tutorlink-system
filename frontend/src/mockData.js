// mockData.js
export const sessions = [
  {
    id: 1,
    subject: "Toán cao cấp",
    date: "25/03",
    time: "10:00",
    tutorId: 1,
  },
  {
    id: 2,
    subject: "Lập trình Java",
    date: "27/03",
    time: "14:00",
    tutorId: 2,
  },
];

export const tutors = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?u=1",
    subjects: ["Toán", "Toán cao cấp"],
    rating: 4.8,
    hourlyRate: 25,
    verified: true,
    reviewCount: 42,
    lessonsTaught: 180,
    languages: ["Tiếng Việt", "Tiếng Anh"],
    bio: "Thạc sĩ Toán học, 8 năm kinh nghiệm giảng dạy đại học. Phương pháp dễ hiểu, tận tâm.",
    education: "Thạc sĩ Toán học - Đại học Khoa học Tự nhiên",
    experience: "8 năm giảng dạy Toán cao cấp tại các trường đại học",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?u=2",
    subjects: ["Lập trình", "Java", "Python"],
    rating: 4.9,
    hourlyRate: 30,
    verified: true,
    reviewCount: 38,
    lessonsTaught: 210,
    languages: ["Tiếng Việt", "Tiếng Anh"],
    bio: "Kỹ sư phần mềm với hơn 5 năm kinh nghiệm làm việc tại các công ty công nghệ. Đam mê giảng dạy lập trình.",
    education: "Kỹ sư Công nghệ thông tin - Đại học Bách Khoa",
    experience: "5 năm phát triển phần mềm, 2 năm hướng dẫn lập trình",
  },
];