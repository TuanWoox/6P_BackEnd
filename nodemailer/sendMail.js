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
    case "createNewLoan":
      subject = "Tạo khoản vay mới & Xác thực OTP - 6P Bank";
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
              .details, .otp-box {
                background-color: #ecf0f1;
                padding: 15px;
                border-radius: 4px;
                margin-top: 15px;
              }
              .details p, .otp-box p {
                margin: 5px 0;
              }
              .otp-code {
                background-color: #9b59b6;
                color: white;
                font-size: 24px;
                font-weight: bold;
                padding: 10px 20px;
                border-radius: 4px;
                display: inline-block;
                margin-top: 10px;
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
              <h2>Khoản Vay Mới & Xác Thực OTP</h2>
              <p>Chào bạn,</p>
              <p>Khoản vay của bạn tại <strong>6P Bank</strong> đã được tạo thành công. Chi tiết khoản vay:</p>
      
              <p>Để hoàn tất và xác thực giao dịch, vui lòng nhập mã OTP bên dưới:</p>
              <div class="otp-box">
                <p class="otp-code">${data.otp}</p>
              </div>
              <p><strong>Mã OTP có hiệu lực trong vòng 2 phút.</strong></p>
              <p>Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức.</p>
      
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

    case "change-password":
      subject = "Xác nhận thay đổi mật khẩu - 6P Bank";
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
                background-color: #27ae60;
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
              <h2>Xác Nhận Thay Đổi Mật Khẩu</h2>
              <p>Chào bạn,</p>
              <p>Chúng tôi đã nhận được yêu cầu thay đổi mật khẩu cho tài khoản <strong>6P Bank</strong> của bạn. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình thay đổi mật khẩu:</p>
              <h3 class="otp">${data.otp}</h3>
              <p><strong>Mã OTP có hiệu lực trong vòng 2 phút.</strong></p>
              <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và liên hệ ngay với bộ phận bảo mật của chúng tôi.</p>
              <div class="footer">
                <p>Trân trọng,</p>
                <p><strong>6P Bank</strong></p>
              </div>
            </div>
          </body>
        </html>
        `;
      break;
    case "createSavingAccount":
      subject = "Xác nhận tạo tài khoản tiết kiệm - 6P Bank";
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
                background-color: #2980b9;
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
              <h2>Xác Nhận Tạo Tài Khoản Tiết Kiệm</h2>
              <p>Chào bạn,</p>
              <p>Bạn đang thực hiện yêu cầu tạo tài khoản tiết kiệm tại <strong>6P Bank</strong>. Vui lòng sử dụng mã OTP dưới đây để xác thực:</p>
              <h3 class="otp">${data.otp}</h3>
              <p><strong>Mã OTP có hiệu lực trong vòng 2 phút.</strong></p>
              <p>Nếu bạn không yêu cầu tạo tài khoản tiết kiệm, vui lòng bỏ qua email này và liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
              <div class="footer">
                <p>Trân trọng,</p>
                <p><strong>6P Bank</strong></p>
              </div>
            </div>
          </body>
        </html>
        `;
      break;

    case "withdrawSaving":
      subject = "Xác nhận tất toán tài khoản tiết kiệm - 6P Bank";
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
                  background-color: #d35400;
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
                <h2>Xác Nhận Tất Toán Tài Khoản Tiết Kiệm</h2>
                <p>Chào bạn,</p>
                <p>Bạn đang yêu cầu tất toán tài khoản tiết kiệm tại <strong>6P Bank</strong>. Vui lòng sử dụng mã OTP sau để xác nhận:</p>
                <h3 class="otp">${data.otp}</h3>
                <p><strong>Mã OTP có hiệu lực trong vòng 2 phút.</strong></p>
                <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và liên hệ ngay với bộ phận hỗ trợ của chúng tôi.</p>
                <div class="footer">
                  <p>Trân trọng,</p>
                  <p><strong>6P Bank</strong></p>
                </div>
              </div>
            </body>
          </html>
        `;
      break;

    case "updateInfo":
      subject = "Xác nhận cập nhật thông tin - 6P Bank";
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
                background-color: #16a085;
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
              <h2>Xác Nhận Cập Nhật Thông Tin</h2>
              <p>Chào bạn,</p>
              <p>Bạn vừa yêu cầu cập nhật thông tin cá nhân cho tài khoản <strong>6P Bank</strong>. Vui lòng sử dụng mã OTP bên dưới để xác nhận thay đổi:</p>
              <h3 class="otp">${data.otp}</h3>
              <p><strong>Mã OTP có hiệu lực trong vòng 2 phút.</strong></p>
              <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và liên hệ ngay với bộ phận hỗ trợ của chúng tôi.</p>
              <div class="footer">
                <p>Trân trọng,</p>
                <p><strong>6P Bank</strong></p>
              </div>
            </div>
          </body>
        </html>
      `;
      break;

    case "loan-payment":
      subject = "Xác nhận thanh toán khoản vay - 6P Bank";
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
                background-color: #27ae60;
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
              <h2>Xác nhận thanh toán khoản vay</h2>
              <p>Chào bạn,</p>
              <p>Chúng tôi đã nhận được yêu cầu thanh toán khoản vay cho tài khoản <strong>6P Bank</strong> của bạn. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình thay đổi mật khẩu:</p>
              <h3 class="otp">${data.otp}</h3>
              <p><strong>Mã OTP có hiệu lực trong vòng 2 phút.</strong></p>
              <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và liên hệ ngay với bộ phận bảo mật của chúng tôi.</p>
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
