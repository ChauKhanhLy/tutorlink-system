import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { walletApi } from "../api/walletApi";

export function QRConfirmPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  const handleConfirm = async () => {
    try {
      setStatus("processing");
      const res = await walletApi.confirmQRPayment(transactionId);
      
      if (res.data && res.data.success) {
        setStatus("success");
        setMessage("Thanh toán thành công! Hệ thống gốc đã ghi nhận.");
      } else {
        setStatus("error");
        setMessage(res.data?.message || "Xác nhận thất bại");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Xác nhận thanh toán</h2>

        {status === "loading" && (
          <div className="py-8">
            <p className="text-slate-500 mb-8">
              Mã giao dịch: <br />
              <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                {transactionId}
              </span>
            </p>
            <button
              onClick={handleConfirm}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Xác nhận thanh toán
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-colors mt-4"
            >
              Hủy
            </button>
          </div>
        )}

        {status === "processing" && (
          <div className="py-12 flex flex-col items-center">
            <Loader className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Đang xử lý giao dịch...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Thành công!</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Thất bại</h3>
            <p className="text-slate-500 mb-8">{message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
