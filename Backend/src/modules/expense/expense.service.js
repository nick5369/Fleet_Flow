const prisma = require("../../lib/prisma");

// ──────────────────────────────────────────────────────────────
// Enums — exactly as defined in schema.prisma
// ──────────────────────────────────────────────────────────────

const VALID_EXPENSE_CATEGORIES = [
  "FUEL",
  "MAINTENANCE",
  "TOLL",
  "INSURANCE",
  "PARKING",
  "FINE",
  "OTHER",
];

// ──────────────────────────────────────────────────────────────
// Select — every scalar field on Expense, nothing added/removed
// ──────────────────────────────────────────────────────────────

const EXPENSE_SELECT = {
  id: true,
  category: true,
  description: true,
  amount: true,
  vehicleId: true,
  tripId: true,
  maintenanceLogId: true,
  fuelLogId: true,
  receiptUrl: true,
  incurredAt: true,
  createdAt: true,
  updatedAt: true,
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

// ──────────────────────────────────────────────────────────────
// Service: getExpenseById
// ──────────────────────────────────────────────────────────────

async function getExpenseById(id) {
  const expense = await prisma.expense.findUnique({
    where: { id },
    select: EXPENSE_SELECT,
  });

  if (!expense) fail("Expense not found", 404);

  return expense;
}

// ──────────────────────────────────────────────────────────────
// Service: listExpenses
//
// Filters (all optional):
//   category    — exact match on ExpenseCategory
//   vehicleId   — exact match
//   tripId      — exact match
//   maintenanceLogId — exact match
//   fuelLogId   — exact match (unique 1:1)
//   from        — incurredAt >= (ISO date string)
//   to          — incurredAt <= (ISO date string)
//   page        — 1-based (default 1)
//   limit       — items per page (default 20, max 100)
// ──────────────────────────────────────────────────────────────

async function listExpenses(query) {
  const where = {};

  // ── category filter ──
  if (query.category) {
    if (!VALID_EXPENSE_CATEGORIES.includes(query.category)) {
      fail(
        `Invalid category. Must be one of: ${VALID_EXPENSE_CATEGORIES.join(", ")}`,
        400,
      );
    }
    where.category = query.category;
  }

  // ── FK filters ──
  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.tripId) where.tripId = query.tripId;
  if (query.maintenanceLogId) where.maintenanceLogId = query.maintenanceLogId;
  if (query.fuelLogId) where.fuelLogId = query.fuelLogId;

  // ── incurredAt date-range filter ──
  if (query.from || query.to) {
    where.incurredAt = {};

    if (query.from) {
      const from = new Date(query.from);
      if (isNaN(from.getTime())) fail("'from' must be a valid date", 400);
      where.incurredAt.gte = from;
    }

    if (query.to) {
      const to = new Date(query.to);
      if (isNaN(to.getTime())) fail("'to' must be a valid date", 400);
      where.incurredAt.lte = to;
    }
  }

  // ── Pagination ──
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      select: EXPENSE_SELECT,
      orderBy: { incurredAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ──────────────────────────────────────────────────────────────
// Service: summaryByCategory
//
// Returns a read-time aggregation grouped by category.
// Does NOT store or derive any values — pure DB groupBy.
//
// Optional filters: vehicleId, tripId, from, to
// ──────────────────────────────────────────────────────────────

async function summaryByCategory(query) {
  const where = {};

  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.tripId) where.tripId = query.tripId;

  if (query.from || query.to) {
    where.incurredAt = {};
    if (query.from) {
      const from = new Date(query.from);
      if (isNaN(from.getTime())) fail("'from' must be a valid date", 400);
      where.incurredAt.gte = from;
    }
    if (query.to) {
      const to = new Date(query.to);
      if (isNaN(to.getTime())) fail("'to' must be a valid date", 400);
      where.incurredAt.lte = to;
    }
  }

  const groups = await prisma.expense.groupBy({
    by: ["category"],
    where,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { category: "asc" },
  });

  return groups.map((g) => ({
    category: g.category,
    totalAmount: g._sum.amount,
    count: g._count.id,
  }));
}

module.exports = {
  getExpenseById,
  listExpenses,
  summaryByCategory,
};
