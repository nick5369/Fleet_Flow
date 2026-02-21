const analyticsService = require("./analytics.service");

// ──────────────────────────────────────────────────────────────
// GET /api/analytics/fleet-utilization
// ──────────────────────────────────────────────────────────────

async function fleetUtilization(req, res, next) {
  try {
    const data = await analyticsService.fleetUtilization();
    res.json({ fleetUtilization: data });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/analytics/fuel-efficiency
// ──────────────────────────────────────────────────────────────

async function fuelEfficiency(req, res, next) {
  try {
    const data = await analyticsService.fuelEfficiency(req.query);
    res.json({ fuelEfficiency: data });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/analytics/cost-per-km
// ──────────────────────────────────────────────────────────────

async function costPerKm(req, res, next) {
  try {
    const data = await analyticsService.costPerKm(req.query);
    res.json({ costPerKm: data });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/analytics/vehicle-roi
// ──────────────────────────────────────────────────────────────

async function vehicleROI(req, res, next) {
  try {
    const data = await analyticsService.vehicleROI(req.query);
    res.json({ vehicleROI: data });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/analytics/monthly-expenses
// ──────────────────────────────────────────────────────────────

async function monthlyExpenses(req, res, next) {
  try {
    const data = await analyticsService.monthlyExpenseBreakdown(req.query);
    res.json({ monthlyExpenses: data });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/analytics/trips
// ──────────────────────────────────────────────────────────────

async function trips(req, res, next) {
  try {
    const data = await analyticsService.tripAnalytics(req.query);
    res.json({ tripAnalytics: data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  fleetUtilization,
  fuelEfficiency,
  costPerKm,
  vehicleROI,
  monthlyExpenses,
  trips,
};
