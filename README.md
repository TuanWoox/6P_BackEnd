# 6P Bank Backend

A comprehensive backend system for a banking application with features including checking accounts, saving accounts, loan management, and secure transactions.

## Features

- **Authentication System**

  - JWT-based authentication with refresh tokens
  - Secure password handling
  - Email verification with OTP

- **Account Management**

  - Checking accounts with transaction limits
  - Saving accounts with various interest rates
  - Loan accounts with payment schedules

- **Transaction Processing**

  - Money transfers between accounts
  - Transaction history tracking
  - Daily transaction limits

- **Customer Management**
  - User profile management
  - Password reset and change

## Tech Stack

- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- Nodemailer for email services
- bcrypt for password hashing

## Project Structure

- `/models` - Database schemas and models
- `/controllers` - Request handlers
- `/routes` - API routes
- `/middleware` - Authentication and request processing middleware
- `/DAO` - Data Access Objects for database operations
- `/utils` - Utility functions
- `/config` - Configuration files

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

3. **Environment Configuration**

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
