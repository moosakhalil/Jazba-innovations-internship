const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const transactionsRouter = require('./src/routes/transactions');
// const goalsRouter = require('./src/routes/goals'); // removed
const authRouter = require('./src/routes/auth');
// const budgetsRouter = require('./src/routes/budgets'); // removed
const subscriptionsRouter = require('./src/routes/subscriptions');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
// app.use('/api/goals', goalsRouter); // unmounted
// app.use('/api/budgets', budgetsRouter); // unmounted
app.use('/api/subscriptions', subscriptionsRouter);

// Fallback to index.html for any unknown route (SPA-like)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
