// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { ImageWithFallback } from "../components/Image/ImageWithFallback";
import api from "../api/axiosClient";

export function ProfilePage() {
  const {
  user,
  setUser
} = useAuth()
 const [
  isEditingProfile,
  setIsEditingProfile
] = useState(false);

const [
  isEditingLearning,
  setIsEditingLearning
] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    
    current_level: "",
    school: "",
    grade: "",
    target: "",
    learning_goal: "",
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
       
        current_level: user.current_level || "",
        school: user.school || "",
        grade:user.grade || "",
        target:user.target || "",
        learning_goal:
          user.learning_goal || "",
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSaveProfile = async () => {
  try {

    const res = await api.put(
      "/users/me/profile",
      {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
      }
    );

    setUser(res.data.user);

    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

    toast.success(
      "Cập nhật hồ sơ thành công"
    );

    setIsEditingProfile(false);

  } catch (err) {

    console.error(err);

    toast.error(
      err.response?.data?.message ||
      "Cập nhật thất bại"
    );

  }
};
const handleSaveLearning = async () => {
  try {

    const res = await api.put(
      "/users/me/learning",
      {
        current_level:
          formData.current_level,

        school:
          formData.school,

        grade:
          formData.grade,

        target:
          formData.target,

        learning_goal:
          formData.learning_goal,
      }
    );
    const updatedUser = {
      ...user,
      ...res.data.user
    };

    setUser(res.data.user);

    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

    toast.success(
      "Cập nhật thông tin học tập thành công"
    );

    setIsEditingLearning(false);

  } catch (err) {

    console.error(err);

    toast.error(
      err.response?.data?.message ||
      "Cập nhật thất bại"
    );

  }
};

  const handleAvatarChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await api.post("/users/avatar", formData);

      ;
      toast.success("Cập nhật avatar thành công");
    } catch (err) {
      console.error(err);
      toast.error("Upload avatar thất bại");
    }
  };
   const [showPasswordModal, setShowPasswordModal] =
  useState(false);

const [passwordData, setPasswordData] =
  useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
});

const [showPasswords, setShowPasswords] =
  useState({
    current: false,
    new: false,
    confirm: false,
});
const handleChangePassword = async () => {

  if (
    !passwordData.currentPassword ||
    !passwordData.newPassword ||
    !passwordData.confirmPassword
  ) {
    return toast.error(
      "Vui lòng nhập đầy đủ thông tin"
    );
  }

  if (
    passwordData.newPassword !==
    passwordData.confirmPassword
  ) {
    return toast.error(
      "Mật khẩu xác nhận không khớp"
    );
  }

  if (
    passwordData.newPassword.length < 8
  ) {
    return toast.error(
      "Mật khẩu mới tối thiểu 8 ký tự"
    );
  }

  try {

  const res = await api.put(
    "/auth/change-password",
    {
      currentPassword:
        passwordData.currentPassword,

      newPassword:
        passwordData.newPassword,
    }
  );

  toast.success(res.data.message);

  setShowPasswordModal(false);

  setPasswordData({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

} catch (err) {

  console.error(err);

  toast.error(
    err.response?.data?.message ||
    "Đổi mật khẩu thất bại"
  );
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
    <>
    <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Hồ sơ của tôi
          </h1>
          <p className="text-slate-500">
            Quản lý thông tin cá nhân và tài khoản
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center sticky top-28">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-indigo-100 shadow-lg">
                  <ImageWithFallback
                    src={
                      user?.avatar
                        ? `http://localhost:3000${user.avatar}`
                        : "https://i.pravatar.cc/150"
                    }
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700 transition-all shadow-lg">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
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
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="w-full mt-6 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-all"
              >
                {isEditingProfile ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
              </button>
            </div>
          </div>

          {/* Profile Info Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <User className="h-5 w-5 text-indigo-600 mr-2" /> Thông tin cá
                  nhân
                </h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-indigo-600 text-sm font-bold hover:underline"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Họ và tên
                  </label>
                  {isEditingProfile? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">
                      {user?.name || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Địa chỉ email
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-slate-400 mr-3" />
                    <p className="text-slate-900 font-medium">{user?.email}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Email không thể thay đổi
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Chưa có số điện thoại"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">
                      {user?.phone || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Địa điểm
                  </label>
                  {isEditingProfile? (
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
                      <p className="text-slate-900 font-medium">
                        {user?.location || "Chưa cập nhật"}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Giới thiệu bản thân
                  </label>
                  {isEditingProfile? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Chia sẻ đôi chút về bạn..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  ) : (
                    <p className="text-slate-600">
                      {user?.bio || "Chưa có giới thiệu"}
                    </p>
                  )}
                </div>

                {isEditingProfile&& (
                  <button
                    onClick={handleSaveProfile}
                    className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" /> Lưu thay đôi
                  </button>
                )}
              </div>
            </div>
            {
  user?.role === "learner" && (
<div className="mt-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">

 <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">

  <h2 className="text-xl font-bold text-slate-900 flex items-center">
    <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
    Thông tin học tập
  </h2>

  {
    !isEditingLearning && (
      <button
        onClick={() =>
          setIsEditingLearning(true)
        }
        className="text-indigo-600 text-sm font-bold hover:underline"
      >
        Chỉnh sửa
      </button>
    )
  }

</div>

  <div className="space-y-5">

    {/* Trình độ hiện tại */}
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">
        Trình độ hiện tại
      </label>

      {
        isEditingLearning? (
          <input
            type="text"
            name="current_level"
            value={formData.current_level}
            onChange={handleInputChange}
            placeholder="Ví dụ: N3, IELTS 5.5..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
          />
        ) : (
          <p className="text-slate-900 font-medium">
            {
              user?.current_level ||
              "Chưa cập nhật"
            }
          </p>
        )
      }
    </div>

    {/* Trường học */}
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">
        Trường học
      </label>

      {
        isEditingLearning ? (
          <input
            type="text"
            name="school"
            value={formData.school}
            onChange={handleInputChange}
            placeholder="Tên trường học"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
          />
        ) : (
          <p className="text-slate-900 font-medium">
            {
              user?.school ||
              "Chưa cập nhật"
            }
          </p>
        )
      }
    </div>

    {/* Lớp / năm học */}
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">
        Lớp / Năm học
      </label>

      {
        isEditingLearning ? (
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            placeholder="Ví dụ: Lớp 12, Năm 2..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
          />
        ) : (
          <p className="text-slate-900 font-medium">
            {
              user?.grade ||
              "Chưa cập nhật"
            }
          </p>
        )
      }
    </div>

    {/* Mục tiêu học tập */}
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">
        Mục tiêu học tập
      </label>

      {
        isEditingLearning ? (
          <input
            type="text"
            name="target"
            value={formData.target}
            onChange={handleInputChange}
            placeholder="Ví dụ: JLPT N2, IELTS 7.0..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
          />
        ) : (
          <p className="text-slate-900 font-medium">
            {
              user?.target ||
              "Chưa cập nhật"
            }
          </p>
        )
      }
    </div>

    {/* Nhu cầu học */}
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">
        Giới thiệu nhu cầu học
      </label>

      {
        isEditingLearning ? (
          <textarea
            name="learning_goal"
            value={formData.learning_goal}
            onChange={handleInputChange}
            rows={4}
            placeholder="Ví dụ: Muốn cải thiện giao tiếp..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
          />
        ) : (
          <p className="text-slate-600">
            {
              user?.learning_goal ||
              "Chưa cập nhật"
            }
          </p>
        )
      }
    </div>
{isEditingLearning&& (
                  <button
                    onClick={handleSaveLearning}
                    className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" /> Lưu thay đôi
                  </button>
                )}
  </div>
</div>
)
}
            <div className="mt-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <Lock className="h-5 w-5 text-indigo-600 mr-2" /> Bảo mật
              </h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900">Đổi mật khẩu</p>
                  <p className="text-sm text-slate-500">
                    Cập nhật mật khẩu định kỳ để bảo vệ tài khoản
                  </p>
                </div>
                  <button
                    onClick={() =>
                      setShowPasswordModal(true)
                    }
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Đổi mật khẩu
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {
  showPasswordModal && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl">

        <h2 className="text-2xl font-bold mb-6">
          Đổi mật khẩu
        </h2>

        <div className="space-y-4">

          {/* Current password */}
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Mật khẩu hiện tại
          </label>
          <div className="relative">

            <input
              type={
                showPasswords.current
                  ? "text"
                  : "password"
              }
              placeholder="Mật khẩu hiện tại"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword:
                    e.target.value
                })
              }
              className="w-full px-4 py-3 border rounded-xl pr-12"
            />

            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  current:
                    !showPasswords.current
                })
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {
                showPasswords.current
                  ? <EyeOff size={20} />
                  : <Eye size={20} />
              }
            </button>

          </div>

          {/* New password */}
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Mật khẩu mới
          </label>
          <div className="relative">

            <input
              type={
                showPasswords.new
                  ? "text"
                  : "password"
              }
              placeholder="Mật khẩu mới"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword:
                    e.target.value
                })
              }
              className="w-full px-4 py-3 border rounded-xl pr-12"
            />

            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  new:
                    !showPasswords.new
                })
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {
                showPasswords.new
                  ? <EyeOff size={20} />
                  : <Eye size={20} />
              }
            </button>

          </div>

          {/* Confirm password */}
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Mật khẩu mới
          </label>
          <div className="relative">

            <input
              type={
                showPasswords.confirm
                  ? "text"
                  : "password"
              }
              placeholder="Xác nhận mật khẩu mới"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword:
                    e.target.value
                })
              }
              className="w-full px-4 py-3 border rounded-xl pr-12"
            />

            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  confirm:
                    !showPasswords.confirm
                })
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {
                showPasswords.confirm
                  ? <EyeOff size={20} />
                  : <Eye size={20} />
              }
            </button>

          </div>

          <div className="flex gap-3 pt-2">

            <button
              onClick={handleChangePassword}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
            >
              Xác nhận
            </button>

            <button
              onClick={() =>
                setShowPasswordModal(false)
              }
              className="flex-1 py-3 border rounded-xl font-bold"
            >
              Hủy
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

    </>
  );
 
}
