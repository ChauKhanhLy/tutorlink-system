// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Shield, Camera, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    toast.success("Cập nhật thông tin thành công");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatar: reader.result });
        toast.success("Ảnh đại diện đã được cập nhật");
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Hồ sơ của tôi</h1>
          <p className="text-slate-500">Quản lý thông tin cá nhân và tài khoản</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center sticky top-28">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-indigo-100 shadow-lg">
                  <ImageWithFallback
                    src={user?.avatar || "https://i.pravatar.cc/150"}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700 transition-all shadow-lg">
                  <Camera className="h-4 w-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <h3 className="font-bold text-xl text-slate-900">{user?.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-center text-sm text-slate-500">
                  <Shield className="h-4 w-4 text-indigo-600 mr-2" />
                  <span>Tài khoản đã xác thực</span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full mt-6 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-all"
              >
                {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
              </button>
            </div>
          </div>

          {/* Profile Info Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <User className="h-5 w-5 text-indigo-600 mr-2" /> Thông tin cá nhân
                </h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-indigo-600 text-sm font-bold hover:underline">
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{user?.name || "Chưa cập nhật"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Địa chỉ email</label>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-slate-400 mr-3" />
                    <p className="text-slate-900 font-medium">{user?.email}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Email không thể thay đổi</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Số điện thoại</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Chưa có số điện thoại"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{user?.phone || "Chưa cập nhật"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Địa điểm</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Thành phố, Quốc gia"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-slate-400 mr-3" />
                      <p className="text-slate-900 font-medium">{user?.location || "Chưa cập nhật"}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Giới thiệu bản thân</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Chia sẻ đôi chút về bạn..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  ) : (
                    <p className="text-slate-600">{user?.bio || "Chưa có giới thiệu"}</p>
                  )}
                </div>

                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" /> Lưu thay đổi
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <Lock className="h-5 w-5 text-indigo-600 mr-2" /> Bảo mật
              </h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900">Đổi mật khẩu</p>
                  <p className="text-sm text-slate-500">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</p>
                </div>
                <button className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}