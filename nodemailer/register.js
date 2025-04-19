const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  auth: {
    user: process.env.NODEMAILER_ACCOUNT,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

module.exports = async function sendMail(to, otp) {
  const message = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f7fc;
          color: #333;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 0 auto;
        }
        h2 {
          color: #2c3e50;
          text-align: center;
        }
        p {
          font-size: 16px;
          line-height: 1.6;
        }
        .otp {
          background-color: #2ecc71;
          color: white;
          font-size: 24px;
          font-weight: bold;
          padding: 10px 20px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 15px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #888;
        }
        .footer a {
          color: #3498db;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Xác Thực Đăng Ký Tài Khoản</h2>
        <p>Chào bạn,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>6P Bank</strong>. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới để xác thực tài khoản của bạn:</p>
        <h3 class="otp">${otp}</h3>
        <p><strong>Mã OTP có hiệu lực trong vòng 2 phút. Vui lòng sử dụng ngay để hoàn tất đăng ký.</strong></p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
        <div class="footer">
          <p>Trân trọng,</p>
          <p><strong>6P Bank</strong></p>
        </div>
      </div>
    </body>
  </html>
  `;

  const sub = "Xác thực đăng ký tài khoản - 6P Bank";

  try {
    await transporter.sendMail({
      to: to,
      subject: sub,
      html: message,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
