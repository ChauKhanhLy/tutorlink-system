import React from "react";

import {
  Users,
  GraduationCap,
  School,
  Target,
} from "lucide-react";

import { bookingApi } from "../api/bookingApi";

import { ImageWithFallback } from "../components/Image/ImageWithFallback";

export function TutorStudentsPage() {

  const [students, setStudents] =
    React.useState([]);

  const fetchStudents = async () => {

    try {

      const res =
        await bookingApi.getTutorBookings();

      setStudents(
        res.data || []
      );

    } catch (err) {

      console.error(err);

    }
  };

  React.useEffect(() => {

    fetchStudents();

  }, []);

  return (
    <div className="pt-24 min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto px-4">

        <div className="mb-8">

          <h1 className="text-3xl font-extrabold text-slate-900">
            Học viên của tôi
          </h1>

        </div>

        <div className="space-y-6">

          {
            students.map((student) => (

              <div
                key={student.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
              >

                <div className="flex items-start gap-5">

                  <div className="w-20 h-20 rounded-2xl overflow-hidden">

                    <ImageWithFallback
                      src={
                        student.studentAvatar ||
                        `https://i.pravatar.cc/150?u=${student.learner_id}`
                      }
                    />

                  </div>

                  <div className="flex-1">

                    <div className="flex items-center gap-3 mb-4">

                      <h2 className="text-xl font-bold">
                        {student.studentName}
                      </h2>

                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                        {
                          student.type === "trial"
                            ? "Học thử"
                            : "Học thật"
                        }
                      </span>

                    </div>

                    <div className="grid md:grid-cols-2 gap-4">

                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-sm text-slate-500">
                          Trình độ hiện tại
                        </p>

                        <p className="font-bold">
                          {student.current_level || "Chưa cập nhật"}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-sm text-slate-500">
                          Trường học
                        </p>

                        <p className="font-bold">
                          {student.school || "Chưa cập nhật"}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-sm text-slate-500">
                          Mục tiêu
                        </p>

                        <p className="font-bold">
                          {student.target || "Chưa cập nhật"}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-sm text-slate-500">
                          Nhu cầu học
                        </p>

                        <p className="font-bold">
                          {student.learning_goal || "Chưa cập nhật"}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            ))
          }

        </div>

      </div>

    </div>
  );
}