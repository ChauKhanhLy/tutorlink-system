
import React from "react";
import {
  CreditCard,
  Wallet,
  History,
  Plus,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function PaymentPage() {
  const [balance, setBalance] = React.useState(245.5);
  const [transactions, setTransactions] = React.useState([
    { id: 1, date: "2026-03-10", amount: -35, description: "Thanh toán buổi học - Toán cao cấp", status: "completed" },
    { id: 2, date: "2026-03-05", amount: 100, description: "Nạp tiền vào ví", status: "completed" },
    { id: 3, date: "2026-02-28", amount: -35, description: "Thanh toán buổi học - Giải tích", status: "completed" },
    { id: 4, date: "2026-02-20", amount: -70, description: "Thanh toán 2 buổi học - Vật lý", status: "completed" },
    { id: 5, date: "2026-02-15", amount: 200, description: "Nạp tiền vào ví", status: "completed" },
  ]);
  const [showAddFunds, setShowAddFunds] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState(50);

  const handleDeposit = () => {
    toast.success(`Đã nạp $${depositAmount} thành công!`);
    setBalance(prev => prev + depositAmount);
    setShowAddFunds(false);
    // Thêm transaction mới
    setTransactions(prev => [
      {
        id: Date.now(),
        date: new Date().toISOString().split("T")[0],
        amount: depositAmount,
        description: "Nạp tiền vào ví",
        status: "completed",
      },
      ...prev,
    ]);
  };

  const savedCards = [
    { id: 1, last4: "4242", brand: "Visa", expiry: "12/28", isDefault: true },
    { id: 2, last4: "8888", brand: "Mastercard", expiry: "06/29", isDefault: false },
  ];

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Thanh toán & Ví</h1>
          <p className="text-slate-500">Quản lý số dư ví, lịch sử giao dịch và phương thức thanh toán</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet & Cards */}
          <div className="lg:col-span-2 space-y-8">
            {/* Wallet Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Số dư ví hiện tại</p>
                  <div className="text-5xl font-extrabold">${balance.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Wallet className="h-8 w-8" />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAddFunds(!showAddFunds)}
                  className="px-6 py-3 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Nạp tiền vào ví
                </button>
                <button className="px-6 py-3 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">
                  Lịch sử giao dịch
                </button>
              </div>

              {/* Deposit Form */}
              {showAddFunds && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 pt-6 border-t border-white/20"
                >
                  <h4 className="font-bold mb-4">Chọn số tiền cần nạp</h4>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {[20, 50, 100, 200].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount)}
                        className={`px-5 py-2 rounded-xl font-bold transition-all ${
                          depositAmount === amount
                            ? "bg-indigo-600 text-white"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="flex-1 px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nhập số tiền khác"
                    />
                    <button
                      onClick={handleDeposit}
                      className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all"
                    >
                      Xác nhận
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Saved Payment Methods */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <CreditCard className="h-5 w-5 text-indigo-600 mr-2" /> Phương thức thanh toán
                </h3>
                <button className="text-indigo-600 text-sm font-bold flex items-center hover:underline">
                  <Plus className="h-4 w-4 mr-1" /> Thêm mới
                </button>
              </div>
              <div className="space-y-4">
                {savedCards.map(card => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-slate-200 rounded-md flex items-center justify-center text-xs font-bold">
                        {card.brand === "Visa" ? "VISA" : "MC"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">•••• •••• •••• {card.last4}</p>
                        <p className="text-xs text-slate-400">Hết hạn {card.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {card.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-1 bg-indigo-100 text-indigo-600 rounded-md">MẶC ĐỊNH</span>
                      )}
                      <button className="text-slate-400 text-sm hover:text-indigo-600">Sửa</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Transactions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <History className="h-5 w-5 text-indigo-600 mr-2" /> Giao dịch gần đây
            </h3>
            <div className="space-y-4">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{tx.description}</p>
                    <div className="flex items-center text-xs text-slate-400 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {tx.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toFixed(2)} USD
                    </span>
                    <div className="flex items-center text-[10px] text-slate-400 mt-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500 mr-1" /> Hoàn thành
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 text-center text-indigo-600 font-bold text-sm hover:underline">
              Xem tất cả giao dịch
            </button>
          </div>
        </div>

        {/* Invoicing Info */}
        <div className="mt-8 bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Thông tin thanh toán</p>
            <p className="text-sm text-amber-700">
              Mọi giao dịch đều được bảo mật. Hóa đơn sẽ được gửi qua email sau mỗi buổi học hoàn thành.
              Nếu có thắc mắc, vui lòng liên hệ support@tutorlink.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}