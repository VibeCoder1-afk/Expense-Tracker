# Expense Tracker

A full-stack MERN application for logging, categorizing, and visualizing personal income and expenses.

## Tech Stack

- **Frontend:** React (Create React App), Recharts, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)

## Features

- User authentication (signup/login) with protected routes
- Add income/expense transactions with category, amount, note, and date
- View total income, total expense, and running balance, with month-over-month trend indicators
- Donut chart breakdown of spending by category (Recharts), with category icons
- Monthly analytics page with balance trend (line chart) and income vs. expense comparison (bar chart)
- Weekday spending heatmap
- Budget goal tracking with progress indicator
- Search, sort, and filter transactions (by type, this month, last month, or free-text search)
- Export transactions to CSV
- Light/Dark mode toggle (persisted across sessions)
- Toast notifications for user feedback
- Full transaction history with delete support
- Fully responsive layout for mobile
- REST API with clean separation of routes/controllers/models

## Project Structure

```
expense-tracker/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   └── transactionController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Budget.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── budgetRoutes.js
│   │   └── transactions.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/index.html
    └── src/
        ├── components/
        │   ├── AllInsights.jsx
        │   ├── AnalyticsPage.jsx
        │   ├── AuthLayout.jsx
        │   ├── BudgetGoal.jsx
        │   ├── CategoryChart.jsx
        │   ├── categoryIcons.js
        │   ├── Login.jsx
        │   ├── PasswordInput.jsx
        │   ├── Signup.jsx
        │   ├── SummaryCards.jsx
        │   ├── ThemeToggle.jsx
        │   ├── Toast.jsx
        │   ├── TransactionForm.jsx
        │   ├── TransactionList.jsx
        │   ├── useCountUp.js
        │   └── WeekdayHeatmap.jsx
        ├── App.jsx
        ├── api.js
        ├── index.js
        └── index.css
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

### Backend

```
cd backend
npm install
cp .env.example .env   # edit MONGO_URI if using Atlas
npm run dev             # starts on http://localhost:5000
```

### Frontend

```
cd frontend
npm install
npm start                # starts on http://localhost:3000
```

## API Endpoints

| Method | Endpoint                     | Description                                             |
|--------|-------------------------------|----------------------------------------------------------|
| POST   | /api/auth/signup              | Create a new user account                                 |
| POST   | /api/auth/login                | Log in and receive an auth token                           |
| GET    | /api/transactions             | List transactions (filter by month/year/category)         |
| GET    | /api/transactions/summary     | Totals + category breakdown + month-over-month trends     |
| GET    | /api/transactions/trends      | Monthly income/expense/balance trends (for Analytics page) |
| POST   | /api/transactions             | Create a transaction                                       |
| PUT    | /api/transactions/:id         | Update a transaction                                        |
| DELETE | /api/transactions/:id         | Delete a transaction                                         |
| GET    | /api/budget                   | Get current monthly budget goal                             |
| PUT    | /api/budget                   | Set the monthly budget goal                                  |

> Note: the exact auth endpoint paths above are a standard-convention guess (`/api/auth/signup`, `/api/auth/login`) — double check these against your actual `routes/auth.js` and adjust if they differ.

## Possible Extensions

- Recurring transactions
- Multi-currency support
- Export to PDF
- Shared/multi-user household budgets
