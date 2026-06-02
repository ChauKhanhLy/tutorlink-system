export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Chưa đăng nhập",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập",
      });
    }

    next();
  };
};

export default roleMiddleware

/*module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" })
    }

    next()
  }
}*/