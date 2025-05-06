const COOKIE_OPTIONS = {
  normal: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  },
  otp: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1 * 120 * 1000, // 2 minutes expiration
    path: "/",
  },
};

module.exports = COOKIE_OPTIONS;
