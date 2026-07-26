# Expense Tracker

A full-stack MERN application for logging, categorizing, and visualizing personal income and expenses.

## Tech Stack
- **Frontend:** React (Create React App), Recharts, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)

## Features
- Add income/expense transactions with category, amount, note, and date
- View total income, total expense, and running balance
- Pie chart breakdown of spending by category (Recharts)
- Full transaction history with delete support
- REST API with clean separation of routes/controllers/models

## Project Structure
```
expense-tracker/
├── backend/
│   ├── controllers/transactionController.js
│   ├── models/Transaction.js
│   ├── routes/transactions.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── components/
    │   │   ├── SummaryCards.jsx
    │   │   ├── CategoryChart.jsx
    │   │   ├── TransactionForm.jsx
    │   │   └── TransactionList.jsx
    │   ├── App.jsx
    │   ├── api.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

### Backend
```bash
cd backend
npm install
cp .env.example .env   # edit MONGO_URI if using Atlas
npm run dev             # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start                # starts on http://localhost:3000
```

## API Endpoints
| Method | Endpoint                   | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | /api/transactions            | List transactions (filter by month/year/category) |
| GET    | /api/transactions/summary    | Totals + category breakdown          |
| POST   | /api/transactions            | Create a transaction                 |
| PUT    | /api/transactions/:id        | Update a transaction                 |
| DELETE | /api/transactions/:id        | Delete a transaction                 |

## Possible Extensions
- User authentication (per-user transactions)
- Monthly/yearly filtering UI
- Budget limits with alerts
- Export to CSV
