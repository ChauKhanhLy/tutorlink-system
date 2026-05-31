import React from "react";
import adminApi from "../../api/adminApi";

export function AdminBookingsPage() {
  const [bookings, setBookings] =
    React.useState([]);

  React.useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res =
        await adminApi.getAllBookings();

      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Quản lý lịch học
      </h1>

      <div className="bg-white rounded-2xl overflow-hidden border">

        <table className="w-full">

          <thead>
            <tr className="bg-slate-50">

              <th className="p-4 text-left">
                Học viên
              </th>

              <th className="p-4 text-left">
                Gia sư
              </th>

              <th className="p-4 text-left">
                Môn học
              </th>

              <th className="p-4 text-left">
                Ngày học
              </th>

              <th className="p-4 text-left">
                Trạng thái
              </th>

            </tr>
          </thead>

            <tbody>
            {bookings.map((booking) => (
                <tr key={booking.id}>
                <td>{booking.learner_name}</td>

                <td>{booking.tutor_name}</td>

                <td>{booking.subject}</td>

                <td>
                    {new Date(
                    booking.datetime
                    ).toLocaleString("vi-VN")}
                </td>

                <td>{booking.status}</td>
                </tr>
            ))}
            </tbody>

        </table>

      </div>

    </div>
  );
}