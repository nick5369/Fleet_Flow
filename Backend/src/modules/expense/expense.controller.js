const expenseService = require("./expense.service");

// ──────────────────────────────────────────────────────────────
// GET /api/expenses/:id — single expense
// ──────────────────────────────────────────────────────────────

async function getById(req, res, next) {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    res.json({ expense });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/expenses — list with filters & pagination
// ──────────────────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const result = await expenseService.listExpenses(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/expenses/summary — read-time aggregation by category
// ──────────────────────────────────────────────────────────────

async function summary(req, res, next) {
  try {
    const categories = await expenseService.summaryByCategory(req.query);
    res.json({ summary: categories });
  } catch (err) {
    next(err);
  }
}

module.exports = { getById, list, summary };
