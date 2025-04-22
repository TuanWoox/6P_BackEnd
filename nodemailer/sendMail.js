const nodemailer = require("nodemailer");

// Create reusable transporter
const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  auth: {
    user: process.env.NODEMAILER_ACCOUNT,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

/**
 * Sends email with appropriate template based on type
 * @param {string} to - Recipient email address
 * @param {string} type - Email type ('register', 'login', 'transfer', 'resetPassword')
 * @param {Object} data - Data for the template (otp for register/login, transaction details for transfer)
 */
async function sendMail(to, type, data) {
  let subject = "Thông báo từ 6P Bank";
  let html = "";

  // Generate email content based on type
  switch (type) {
    case "register":
      subject = "Xác thực đăng ký tài khoản - 6P Bank";
      html = `
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
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Xác Thực Đăng Ký Tài Khoản</h2>
            <p>Chào bạn,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>6P Bank</strong>. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới để xác thực tài khoản của bạn:</p>
            <h3 class="otp">${data.otp}</h3>
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
      break;

    case "logIn":
      subject = "Xác thực đăng nhập - 6P Bank";
      html = `
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
              background-color: #3498db;
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
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Xác Thực Đăng Nhập</h2>
            <p>Chào bạn,</p>
            <p>Chúng tôi đã nhận được yêu cầu đăng nhập vào tài khoản <strong>6P Bank</strong> của bạn. Vui lòng sử dụng mã OTP dưới đây để hoàn tất đăng nhập:</p>
            <h3 class="otp">${data.otp}</h3>
            <p><strong>Mã OTP có hiệu lực trong vòng 2 phút.</strong></p>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và liên hệ với bộ phận bảo mật của chúng tôi ngay lập tức.</p>
            <div class="footer">
              <p>Trân trọng,</p>
              <p><strong>6P Bank</strong></p>
            </div>
          </div>
        </body>
      </html>
      `;
      break;

    case "transfer":
      subject = "Xác nhận giao dịch chuyển tiền - 6P Bank";
      html = `
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
            .transaction {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
            }
            .transaction p {
              margin: 5px 0;
            }
            .otp {
              background-color: #e74c3c;
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
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Xác Nhận Giao Dịch Chuyển Tiền</h2>
            <p>Chào bạn,</p>
            <p>Chúng tôi đã nhận được yêu cầu chuyển tiền từ tài khoản của bạn. Chi tiết giao dịch như sau:</p>
            
            <div class="transaction">
              <p><strong>Từ tài khoản:</strong> ${data.fromAccount || "N/A"}</p>
              <p><strong>Đến tài khoản:</strong> ${data.toAccount || "N/A"}</p>
              <p><strong>Số tiền:</strong> ${data.amount || "N/A"} VND</p>
              <p><strong>Nội dung:</strong> ${data.message || "Không có"}</p>
              <p><strong>Thời gian:</strong> ${
                data.timestamp || new Date().toLocaleString("vi-VN")
              }</p>
            </div>
            
            <p>Để xác nhận giao dịch này, vui lòng sử dụng mã OTP sau:</p>
            <h3 class="otp">${data.otp}</h3>
            <p><strong>Mã OTP có hiệu lực trong vòng 2 phút.</strong></p>
            <p>Nếu bạn không thực hiện giao dịch này, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi ngay lập tức.</p>
            <div class="footer">
              <p>Trân trọng,</p>
              <p><strong>6P Bank</strong></p>
            </div>
          </div>
        </body>
      </html>
      `;
      break;

    case "resetPassword":
      subject = "Đặt lại mật khẩu - 6P Bank";
      html = `
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
              background-color: #9b59b6;
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
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Đặt Lại Mật Khẩu</h2>
            <p>Chào bạn,</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>6P Bank</strong> của bạn. Vui lòng sử dụng mã OTP dưới đây để xác thực:</p>
            <h3 class="otp">${data.otp}</h3>
            <p><strong>Mã OTP có hiệu lực trong vòng 2 phút.</strong></p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và liên hệ ngay với bộ phận bảo mật của chúng tôi.</p>
            <div class="footer">
              <p>Trân trọng,</p>
              <p><strong>6P Bank</strong></p>
            </div>
          </div>
        </body>
      </html>
      `;
      break;

    default:
      // Generic email
      html = `
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
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 14px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Thông Báo Từ 6P Bank</h2>
            <p>Chào bạn,</p>
            <p>${
              data.message || "Cảm ơn bạn đã sử dụng dịch vụ của 6P Bank."
            }</p>
            <div class="footer">
              <p>Trân trọng,</p>
              <p><strong>6P Bank</strong></p>
            </div>
          </div>
        </body>
      </html>
      `;
      break;
  }

  try {
    await transporter.sendMail({
      to: to,
      subject: subject,
      html: html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw to allow caller to handle
  }
}

module.exports = sendMail;
