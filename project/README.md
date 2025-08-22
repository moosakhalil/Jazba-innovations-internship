# Personal Finance Tracker

Node.js + Express backend with JSON persistence. Frontend uses Tailwind CSS (CDN) and Chart.js (CDN).

## Features
- Auth: signup/login with JWT (stored in localStorage)
- Transactions: add/list/delete (income/expense)
- Goals: add/list/update progress
- Charts: Income vs Expenses (bar), Spending by Category (pie)

## Project Structure
- `server.js` – Express app and static hosting from `public/`
- `src/models/` – `transaction.js`, `goal.js`, `user.js`
- `src/routes/` – `auth.js`, `transactions.js`, `goals.js`
- `src/utils/storage.js` – JSON read/write helpers to `data/`
- `data/` – `transactions.json`, `goals.json`, `users.json`
- `public/` – `index.html`, `styles.css`, `scripts.js`

## Setup
1. Install dependencies:
   ```bash
   npm install
   npm install express cors body-parser bcryptjs jsonwebtoken uuid
   npm install -D nodemon
   ```
2. (Optional) Create `.env` and set `JWT_SECRET`.
3. Run the server:
   ```bash
   npm run dev
   # or
   npm start
   ```
4. Open http://localhost:3000

## API Summary
- `POST /api/auth/signup` { username, password } -> { token }
- `POST /api/auth/login` { username, password } -> { token }
- `GET /api/transactions` (auth)
- `POST /api/transactions` (auth) { type, amount, category, description?, date }
- `DELETE /api/transactions/:id` (auth)
- `GET /api/goals` (auth)
- `POST /api/goals` (auth) { goal, goalAmount, amountSaved?, deadline }
- `PUT /api/goals/:id` (auth) { amountSaved?, goalAmount?, goal?, deadline? }

## Notes
- JSON files are created automatically under `data/`.
- This app is intentionally file-based storage for simplicity.
