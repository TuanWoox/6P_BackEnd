<div align="center">
  <h1>6P Bank Backend</h1>
  <p>A modern, secure banking system API built with Node.js</p>
  
  <p>
    <img src="https://img.shields.io/badge/-NODE.JS-6DA55F?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/-EXPRESS.JS-2E2E2E?style=flat-square&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/-MONGODB-449A45?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/-BOOTSTRAP-7952B3?style=flat-square&logo=bootstrap&logoColor=white" alt="Bootstrap" />
  </p>
</div>

---

## ✨ Features

<table>
  <tr>
    <td>
      <h3>🔐 Authentication System</h3>
      <ul>
        <li>JWT-based authentication with refresh tokens</li>
        <li>Secure password handling</li>
        <li>Email verification with OTP</li>
      </ul>
    </td>
    <td>
      <h3>💳 Account Management</h3>
      <ul>
        <li>Checking accounts with transaction limits</li>
        <li>Saving accounts with various interest rates</li>
        <li>Loan accounts with payment schedules</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h3>💸 Transaction Processing</h3>
      <ul>
        <li>Money transfers between accounts</li>
        <li>Transaction history tracking</li>
        <li>Daily transaction limits</li>
      </ul>
    </td>
    <td>
      <h3>👤 Customer Management</h3>
      <ul>
        <li>User profile management</li>
        <li>Password reset and change</li>
        <li>Account statements and history</li>
      </ul>
    </td>
  </tr>
</table>

## 📁 Project Structure

```
6P_BackEnd/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── DAO/             # Data Access Objects
├── middleware/      # Express middleware
├── models/          # Mongoose schemas
├── routes/          # API routes
├── utils/           # Utility functions
├── .env             # Environment variables
├── main.js          # Application entry point
└── README.md        # Project documentation
```

## API Endpoints

### Authentication

- `POST /auth/logIn` - User login
- `POST /auth/refreshToken` - Refresh access token
- `POST /auth/signUp` - Register new user
- `POST /auth/logOut` - User logout
- `POST /auth/validateJWT` - Validate JWT token

### OTP

- `POST /otp/create` - Generate OTP for verification
- `GET /otp/verify` - Verify OTP

### Customer

- `GET /customer/getPersonalInfor` - Get customer profile
- `POST /customer/updatePersonalInfor` - Update customer profile
- `POST /customer/changePassword` - Change password
- `POST /customer/resetPassword` - Reset password

### Checking Account

- `GET /checkingAccount/getAllCheckingAccount` - Get all checking accounts
- `POST /checkingAccount/transferMoney` - Transfer money between accounts
- `POST /checkingAccount/setLimitTransaction` - Set transaction limits

### Saving Account

- `GET /savingAccount/getSavingAccounts` - Get all saving accounts
- `POST /savingAccount/createSavingAccount` - Create new saving account
- `POST /savingAccount/withdrawSaving/:accountId` - Withdraw from saving account

### Loan Account

- `POST /loanAccount/getAllLoanAccount` - Get all loan accounts
- `POST /loanAccount/createNewLoan` - Create new loan
- `POST /loanAccount/loanPayment/confirm` - Confirm loan payment

## 🚀 Setup and Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/TuanWoox/6P_BackEnd.git
   cd 6P_BackEnd
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**W

   Create a `.env` file in the root directory with the following variables:

   | Variable                 | Description                      |
   | ------------------------ | -------------------------------- |
   | `PORT`                   | Server port (default: 5000)      |
   | `MONGO_URI`              | MongoDB connection string        |
   | `JWT_SECRET_KEY`         | Secret for access tokens         |
   | `JWT_REFRESH_SECRET_KEY` | Secret for refresh tokens        |
   | `JWT_OTP_SECRET_KEY`     | Secret for OTP tokens            |
   | `BCRYPT_SALT`            | Salt rounds for password hashing |
   | `FRONT_END_URI`          | Frontend URL for CORS            |

4. **Start the server**

   ```bash
   node main.js
   ```

   For development with auto-restart:

   ```bash
   npm install nodemon -g
   nodemon main.js
   ```

## 💾 Database Schema

The application uses MongoDB with these collections:

<table>
  <tr>
    <th align="center">Collection</th>
    <th align="center">Description</th>
  </tr>
  <tr>
    <td align="center">Users</td>
    <td>Base user model with customer-specific extensions</td>
  </tr>
  <tr>
    <td align="center">Accounts</td>
    <td>Base account with checking, saving and loan extensions</td>
  </tr>
  <tr>
    <td align="center">Transactions</td>
    <td>Record of all financial transactions</td>
  </tr>
  <tr>
    <td align="center">RefreshTokens</td>
    <td>JWT token storage for authentication</td>
  </tr>
  <tr>
    <td align="center">OTPs</td>
    <td>One-time password records for verification</td>
  </tr>
  <tr>
    <td align="center">Loan/Saving Types</td>
    <td>Templates for different financial products with interest rates</td>
  </tr>
</table>

## 🔒 Security Features

- **Secure Password Storage** - Passwords hashed with bcrypt
- **Token-based Authentication** - JWT with short-lived access tokens
- **Two-factor Verification** - Email OTP for sensitive operations
- **Protected Communications** - CORS configured for specific origins
- **HTTP-only Cookies** - Prevents client-side script access to tokens
