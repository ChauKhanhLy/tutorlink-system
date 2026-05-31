import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  History,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { walletApi } from "../api/walletApi";
import { useAuth } from "../context/AuthContext";

export function WalletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [showDeposit, setShowDeposit] = React.useState(false);
  
  const [walletData, setWalletData] = React.useState({
    balance: 0,
    frozen_balance: 0,
    total_deposited: 0,
    total_spent: 0,
    total_settled: 0,
    pending_settlements: 0,
    last_deposit: null
  });
  
  const [transactions, setTransactions] = React.useState([]);
  const [settlements, setSettlements] = React.useState([]);
  const [depositAmount, setDepositAmount] = React.useState(100000);
  const [pagination, setPagination] = React.useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  React.useEffect(() => {
    loadWalletData();
    loadTransactions();
    loadSettlements();
  }, []);

  const loadWalletData = async () => {
    try {
      const res = await walletApi.getStats();
      setWalletData(res.data.data);
    } catch (error) {
      toast.error("Không thể tải thông tin ví");
    }
  };

  const loadTransactions = async (page = 1) => {
    try {
      const res = await walletApi.getTransactions(page, 20);
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Không thể tải lịch sử giao dịch");
    }
  };

  const loadSettlements = async () => {
    try {
      const res = await walletApi.getSettlements();
      setSettlements(res.data.data);
    } catch (error) {
      toast.error("Không thể tải thông tin settlement");
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await walletApi.deposit(depositAmount, "VNPay");
      toast.success("Nạp tiền thành công!");
      setShowDeposit(false);
      setDepositAmount(100000);
      loadWalletData();
      loadTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Nạp tiền thất bại");
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount || 0) + "đ";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const tabs = [
    { id: "overview", name: "Tổng quan", icon: Wallet },
    { id: "transactions", name: "Giao dịch", icon: History },
    { id: "settlements", name: "Settlements", icon: Calendar },
  ];

  if (!user) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Vui lòng đăng nhập để quản lý ví
        </h2>
        <button 
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Ví của tôi
          </h1>
          <p className="text-slate-500">
            Quản lý số dư, nạp tiền và xem lịch sử giao dịch
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-indigo-100 text-sm font-medium mb-1">Số dư khả dụng</p>
                  <div className="text-5xl font-extrabold">
                    {formatVND(walletData.balance)}
                  </div>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Wallet className="h-8 w-8" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-indigo-100 text-xs font-medium mb-1">Tổng đã nạp</p>
                  <p className="text-xl font-bold">{formatVND(walletData.total_deposited)}</p>
                </div>
                <div>
                  <p className="text-indigo-100 text-xs font-medium mb-1">Tổng đã chi</p>
                  <p className="text-xl font-bold">{formatVND(walletData.total_spent)}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-indigo-500/20">
                <button
                  onClick={() => setShowDeposit(!showDeposit)}
                  className="w-full px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all"
                >
                  Nạp tiền vào ví
                </button>
              </div>

              {/* Deposit Form */}
              {showDeposit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 pt-6 border-t border-indigo-500/20"
                >
                  <h4 className="font-bold mb-4 text-white">Chọn số tiền cần nạp</h4>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {[50000, 100000, 200000, 500000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
                          depositAmount === amount
                            ? "bg-white text-indigo-600"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {formatVND(amount)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="flex-1 px-4 py-3 bg-white/10 rounded-xl text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Nhập số tiền khác"
                    />
                    <button
                      onClick={handleDeposit}
                      disabled={loading}
                      className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50"
                    >
                      {loading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Stats Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
                Thống kê
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Số dư đang đóng băng</span>
                  <span className="font-bold text-slate-900">
                    {formatVND(walletData.frozen_balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Tổng đã settlement</span>
                  <span className="font-bold text-emerald-600">
                    {formatVND(walletData.total_settled)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Đang chờ settlement</span>
                  <span className="font-bold text-amber-600">
                    {formatVND(walletData.pending_settlements)}
                  </span>
                </div>
              </div>
            </div>

            {walletData.last_deposit && (
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                <div className="flex items-center text-emerald-700 mb-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-bold text-sm">Nạp tiền gần nhất</span>
                </div>
                <p className="text-emerald-800 font-bold">
                  {formatDate(walletData.last_deposit)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-2xl p-1 border border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <History className="h-5 w-5 text-indigo-600 mr-2" />
                Giao dịch gần đây
              </h3>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{tx.description}</p>
                      <div className="flex items-center text-xs text-slate-400 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(tx.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${
                        tx.type === 'deposit' ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {tx.type === 'deposit' ? "+" : "-"}
                        {formatVND(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                Settlements hàng tuần
              </h3>
              <div className="space-y-4">
                {settlements.slice(0, 5).map((settlement) => (
                  <div key={settlement.id} className="pb-3 border-b border-slate-100 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-900 text-sm">
                        Tuần {formatDate(settlement.week_start)} - {formatDate(settlement.week_end)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        settlement.status === 'completed' 
                          ? "bg-emerald-100 text-emerald-700"
                          : settlement.status === 'pending'
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {settlement.status === 'completed' ? "Đã xử lý" : 
                         settlement.status === 'pending' ? "Đang chờ" : "Lỗi"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Tổng thanh toán</span>
                      <span className="font-bold text-emerald-600">
                        {formatVND(settlement.settled_amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Lịch sử giao dịch</h3>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{tx.description}</p>
                    <div className="flex items-center text-xs text-slate-400 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(tx.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${
                      tx.type === 'deposit' ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {tx.type === 'deposit' ? "+" : "-"}
                      {formatVND(tx.amount)}
                    </span>
                    <div className="flex items-center text-[10px] text-slate-400 mt-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500 mr-1" />
                      {tx.status === 'completed' ? 'Hoàn thành' : tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => loadTransactions(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-slate-200 rounded-lg disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-3 py-2">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => loadTransactions(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 border border-slate-200 rounded-lg disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "settlements" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Settlements hàng tuần</h3>
            <div className="space-y-4">
              {settlements.map((settlement) => (
                <div key={settlement.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        Tuần {formatDate(settlement.week_start)} - {formatDate(settlement.week_end)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Tổng giao dịch: {formatVND(settlement.total_amount)}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                      settlement.status === 'completed' 
                        ? "bg-emerald-100 text-emerald-700"
                        : settlement.status === 'pending'
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}>
                      {settlement.status === 'completed' ? "Đã xử lý" : 
                       settlement.status === 'pending' ? "Đang chờ" : "Lỗi"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-slate-600">Số tiền đã settlement</span>
                      <p className="font-bold text-emerald-600">
                        {formatVND(settlement.settled_amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Đang chờ xử lý</span>
                      <p className="font-bold text-amber-600">
                        {formatVND(settlement.pending_amount)}
                      </p>
                    </div>
                  </div>
                  {settlement.processed_date && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="text-xs text-slate-400">
                        Đã xử lý vào: {formatDate(settlement.processed_date)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Alert */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-5 border border-blue-100 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-800">Thông tin thanh toán theo tuần</p>
            <p className="text-sm text-blue-700 mt-1">
              • Tiền nạp vào ví sẽ được giữ trong 7 ngày trước khi settlement<br/>
              • Admin sẽ xử lý settlement hàng tuần vào Chủ nhật<br/>
              • Các giao dịch đã settlement sẽ được chuyển cho admin<br/>
              • Bạn có thể xem lịch sử giao dịch và settlements ở đây
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
