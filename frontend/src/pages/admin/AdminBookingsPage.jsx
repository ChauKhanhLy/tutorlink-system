import React from "react";
import adminApi from "../../api/adminApi";
import { Link } from "react-router-dom";
export function AdminBookingsPage() {
  const [search, setSearch] = React.useState("");
const [statusFilter, setStatusFilter] = React.useState("all");
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
   const [selectedBooking, setSelectedBooking] =
  React.useState(null);
  const handleCancelBooking = async (id) => {
  if (
    !window.confirm(
      "Bạn có chắc muốn hủy lịch này?"
    )
  )
    return;

  try {
    await adminApi.cancelBooking(id);

    toast.success("Đã hủy lịch");

    fetchBookings();
  } catch (err) {
    toast.error("Không thể hủy lịch");
  }
};
const filteredBookings = bookings.filter((booking) => {
  const matchSearch =
    booking.learner_name
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||
    booking.tutor_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

  const matchStatus =
    statusFilter === "all" ||
    booking.status === statusFilter;

  return matchSearch && matchStatus;
});
  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Quản lý lịch học
      </h1>
          <div className="flex flex-col md:flex-row gap-4 mb-6">

            <input
              type="text"
              placeholder="Tìm học viên hoặc gia sư..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="flex-1 px-4 py-3 border rounded-xl"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="px-4 py-3 border rounded-xl"
            >
              <option value="all">
                Tất cả trạng thái
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

          </div>
      <div className="bg-white rounded-2xl overflow-hidden border">
          <p className="text-sm text-slate-500 mb-4">
                Tìm thấy {filteredBookings.length} lịch học
              </p>
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
               <th className="p-4 text-left">
               Thao tác
                </th>
            </tr>
          </thead>

           
            <tbody>
            {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-t">

                <td className="p-4">
                    {booking.learner_name}
                </td>

                <td className="p-4">
                    {booking.tutor_name}
                </td>

                <td className="p-4">
                    {booking.subject}
                </td>

                <td className="p-4">
                    {new Date(
                    booking.datetime
                    ).toLocaleString("vi-VN")}
                </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold
                        ${
                          booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "confirmed"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                <td className="p-4">
                    <div className="flex gap-2">

                    <button
                        onClick={() =>
                        setSelectedBooking(booking)
                        }
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg"
                    >
                        Chi tiết
                    </button>

                          {booking.room_id ? (
                            <Link
                              to={`/room/${booking.room_id}`}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg"
                            >
                              Xem phòng
                            </Link>
                          ) : booking.status === "pending" ? (
                            <span className="text-amber-600 text-sm">
                              Chờ gia sư nhận lớp
                            </span>
                          ) : booking.status === "cancelled" ? (
                            <span className="text-red-500 text-sm">
                              Đã hủy
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">
                              Không có phòng
                            </span>
                          )}

                    </div>
                </td>

                </tr>
            ))}
            </tbody>

        </table>

      </div>
{selectedBooking && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setSelectedBooking(null)}
  >
    <div
      className="bg-white p-6 rounded-3xl w-full max-w-lg relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Nút X */}
      <button
        onClick={() => setSelectedBooking(null)}
        className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 font-bold"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-6">
        Chi tiết lịch học
      </h2>

      <div className="space-y-3">
        <p>
          <b>Học viên:</b> {selectedBooking.learner_name}
        </p>

        <p>
          <b>Gia sư:</b> {selectedBooking.tutor_name}
        </p>

        <p>
          <b>Môn học:</b> {selectedBooking.subject}
        </p>

        <p>
          <b>Ngày học:</b>{" "}
          {new Date(
            selectedBooking.datetime
          ).toLocaleString("vi-VN")}
        </p>

        <p>
          <b>Trạng thái:</b> {selectedBooking.status}
        </p>

        <p>
          <b>Học phí:</b>{" "}
          {selectedBooking.fee?.toLocaleString("vi-VN")} ₫
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={() => setSelectedBooking(null)}
          className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          Đóng
        </button>

        <button
          onClick={() =>
            handleCancelBooking(selectedBooking.id)
          }
          className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
        >
          Hủy lịch
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}