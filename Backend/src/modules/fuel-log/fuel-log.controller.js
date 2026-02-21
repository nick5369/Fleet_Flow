const fuelLogService = require("./fuel-log.service");

// ──────────────────────────────────────────────────────────────
// POST /api/fuel-logs — create fuel log + auto-create expense
// ──────────────────────────────────────────────────────────────

async function create(req, res, next) {
  try {
    const fuelLog = await fuelLogService.createFuelLog(req.body);
    res.status(201).json({ fuelLog });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/fuel-logs/:id — single fuel log
// ──────────────────────────────────────────────────────────────

async function getById(req, res, next) {
  try {
    const fuelLog = await fuelLogService.getFuelLogById(req.params.id);
    res.json({ fuelLog });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/fuel-logs — list with filters & pagination
// ──────────────────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const result = await fuelLogService.listFuelLogs(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// PATCH /api/fuel-logs/:id — partial update
// ──────────────────────────────────────────────────────────────

async function update(req, res, next) {
  try {
    const fuelLog = await fuelLogService.updateFuelLog(req.params.id, req.body);
    res.json({ fuelLog });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/fuel-logs/:id/expense — linked 1:1 expense
// ──────────────────────────────────────────────────────────────

async function getExpense(req, res, next) {
  try {
    const expense = await fuelLogService.getExpenseForFuelLog(req.params.id);
    res.json({ expense });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getById, list, update, getExpense };
