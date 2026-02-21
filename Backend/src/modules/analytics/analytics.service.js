const prisma = require("../../lib/prisma");

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

function parseDateRange(query) {
  const range = {};
  if (query.from) {
    const d = new Date(query.from);
    if (isNaN(d.getTime())) fail("'from' must be a valid date", 400);
    range.gte = d;
  }
  if (query.to) {
    const d = new Date(query.to);
    if (isNaN(d.getTime())) fail("'to' must be a valid date", 400);
    range.lte = d;
  }
  return Object.keys(range).length ? range : undefined;
}

// ──────────────────────────────────────────────────────────────
// 1. Fleet Utilization
//
// Real-time snapshot — counts vehicles by status.
// Uses Vehicle.status only (schema field).
//
// Returns:
//   { total, available, onTrip, inShop, retired, utilizationRate }
//   utilizationRate = ON_TRIP / (total - RETIRED)
// ──────────────────────────────────────────────────────────────

async function fleetUtilization() {
  const groups = await prisma.vehicle.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const counts = { AVAILABLE: 0, ON_TRIP: 0, IN_SHOP: 0, RETIRED: 0 };
  for (const g of groups) {
    counts[g.status] = g._count.id;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const active = total - counts.RETIRED;
  const utilizationRate =
    active > 0 ? Number(((counts.ON_TRIP / active) * 100).toFixed(2)) : 0;

  return {
    total,
    available: counts.AVAILABLE,
    onTrip: counts.ON_TRIP,
    inShop: counts.IN_SHOP,
    retired: counts.RETIRED,
    activeFleet: active,
    utilizationRate,
  };
}

// ──────────────────────────────────────────────────────────────
// 2. Fuel Efficiency (per vehicle)
//
// Uses FuelLog fields: vehicleId, liters, odometerAtFillKm
// Calculates km driven between consecutive fills ÷ liters.
//
// Query params: vehicleId (optional — all vehicles if omitted)
//               from, to (filter on filledAt)
// ──────────────────────────────────────────────────────────────

async function fuelEfficiency(query) {
  const where = {};
  if (query.vehicleId) where.vehicleId = query.vehicleId;

  const dateRange = parseDateRange(query);
  if (dateRange) where.filledAt = dateRange;

  // Fetch fuel logs ordered by vehicle + odometer
  const logs = await prisma.fuelLog.findMany({
    where,
    select: {
      vehicleId: true,
      liters: true,
      odometerAtFillKm: true,
      totalCost: true,
      filledAt: true,
    },
    orderBy: [{ vehicleId: "asc" }, { odometerAtFillKm: "asc" }],
  });

  // Group by vehicle, compute km/L from consecutive fills
  const vehicleMap = {};
  for (const log of logs) {
    if (!vehicleMap[log.vehicleId]) {
      vehicleMap[log.vehicleId] = [];
    }
    vehicleMap[log.vehicleId].push(log);
  }

  const results = [];

  for (const [vehicleId, fills] of Object.entries(vehicleMap)) {
    let totalKm = 0;
    let totalLiters = 0;
    let totalFuelCost = 0;
    let segments = 0;

    for (let i = 1; i < fills.length; i++) {
      const kmDriven =
        Number(fills[i].odometerAtFillKm) -
        Number(fills[i - 1].odometerAtFillKm);

      if (kmDriven > 0) {
        totalKm += kmDriven;
        totalLiters += Number(fills[i].liters);
        segments++;
      }
      totalFuelCost += Number(fills[i].totalCost);
    }

    // Include the first fill's cost
    if (fills.length > 0) {
      totalFuelCost += Number(fills[0].totalCost);
    }

    const kmPerLiter =
      totalLiters > 0 ? Number((totalKm / totalLiters).toFixed(2)) : null;

    const costPerKm =
      totalKm > 0 ? Number((totalFuelCost / totalKm).toFixed(2)) : null;

    results.push({
      vehicleId,
      fillCount: fills.length,
      segments,
      totalKm: Number(totalKm.toFixed(2)),
      totalLiters: Number(totalLiters.toFixed(2)),
      totalFuelCost: Number(totalFuelCost.toFixed(2)),
      kmPerLiter,
      fuelCostPerKm: costPerKm,
    });
  }

  return results;
}

// ──────────────────────────────────────────────────────────────
// 3. Cost Per Km (per vehicle)
//
// Uses: Expense.amount (summed per vehicleId), Vehicle.odometerKm
// Formula: totalExpenses / odometerKm
//
// Query params: vehicleId (optional), from, to (filter on incurredAt)
// ──────────────────────────────────────────────────────────────

async function costPerKm(query) {
  const expenseWhere = {};
  if (query.vehicleId) expenseWhere.vehicleId = query.vehicleId;

  const dateRange = parseDateRange(query);
  if (dateRange) expenseWhere.incurredAt = dateRange;

  // Only expenses linked to a vehicle
  expenseWhere.vehicleId = expenseWhere.vehicleId || { not: null };

  const expenseGroups = await prisma.expense.groupBy({
    by: ["vehicleId"],
    where: expenseWhere,
    _sum: { amount: true },
    _count: { id: true },
  });

  if (expenseGroups.length === 0) return [];

  // Fetch vehicle odometers for those vehicles
  const vehicleIds = expenseGroups.map((g) => g.vehicleId).filter(Boolean);

  const vehicles = await prisma.vehicle.findMany({
    where: { id: { in: vehicleIds } },
    select: { id: true, licensePlate: true, odometerKm: true },
  });

  const vehicleMap = {};
  for (const v of vehicles) {
    vehicleMap[v.id] = v;
  }

  return expenseGroups
    .filter((g) => g.vehicleId)
    .map((g) => {
      const vehicle = vehicleMap[g.vehicleId];
      const odo = vehicle ? Number(vehicle.odometerKm) : 0;
      const totalExpense = Number(g._sum.amount || 0);

      return {
        vehicleId: g.vehicleId,
        licensePlate: vehicle?.licensePlate || null,
        odometerKm: odo,
        totalExpenses: totalExpense,
        expenseCount: g._count.id,
        costPerKm: odo > 0 ? Number((totalExpense / odo).toFixed(4)) : null,
      };
    });
}

// ──────────────────────────────────────────────────────────────
// 4. Vehicle ROI
//
// Uses: Vehicle.acquisitionCost, Vehicle.odometerKm
//       Expense.amount (total costs for this vehicle)
//       Trip count + Trip.distanceKm (completed trips)
//
// ROI is presented as cost-efficiency metrics:
//   - totalRevenue proxy: completed trip count × distanceKm
//   - totalCost: acquisitionCost + all expenses
//   - costRecoveryRatio: totalDistanceKm / totalCost (km per ₹ spent)
//
// Query params: vehicleId (optional)
// ──────────────────────────────────────────────────────────────

async function vehicleROI(query) {
  const vehicleWhere = {};
  if (query.vehicleId) vehicleWhere.id = query.vehicleId;

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    select: {
      id: true,
      licensePlate: true,
      vehicleType: true,
      acquisitionCost: true,
      odometerKm: true,
      acquisitionDate: true,
    },
  });

  if (vehicles.length === 0) return [];

  const vehicleIds = vehicles.map((v) => v.id);

  // Parallel: expense totals + completed trip aggregates
  const [expenseGroups, tripGroups] = await Promise.all([
    prisma.expense.groupBy({
      by: ["vehicleId"],
      where: { vehicleId: { in: vehicleIds } },
      _sum: { amount: true },
    }),
    prisma.trip.groupBy({
      by: ["vehicleId"],
      where: { vehicleId: { in: vehicleIds }, status: "COMPLETED" },
      _count: { id: true },
      _sum: { distanceKm: true },
    }),
  ]);

  const expenseMap = {};
  for (const g of expenseGroups) {
    expenseMap[g.vehicleId] = Number(g._sum.amount || 0);
  }

  const tripMap = {};
  for (const g of tripGroups) {
    tripMap[g.vehicleId] = {
      completedTrips: g._count.id,
      totalDistanceKm: Number(g._sum.distanceKm || 0),
    };
  }

  return vehicles.map((v) => {
    const acqCost = Number(v.acquisitionCost);
    const opExpenses = expenseMap[v.id] || 0;
    const totalCost = acqCost + opExpenses;
    const trips = tripMap[v.id] || { completedTrips: 0, totalDistanceKm: 0 };

    return {
      vehicleId: v.id,
      licensePlate: v.licensePlate,
      vehicleType: v.vehicleType,
      acquisitionCost: acqCost,
      acquisitionDate: v.acquisitionDate,
      operationalExpenses: opExpenses,
      totalCost,
      odometerKm: Number(v.odometerKm),
      completedTrips: trips.completedTrips,
      totalDistanceKm: trips.totalDistanceKm,
      costPerKm:
        trips.totalDistanceKm > 0
          ? Number((totalCost / trips.totalDistanceKm).toFixed(4))
          : null,
    };
  });
}

// ──────────────────────────────────────────────────────────────
// 5. Monthly Expense Breakdown
//
// Uses: Expense.category, Expense.amount, Expense.incurredAt
// Groups by year-month + category using raw SQL (Prisma groupBy
// doesn't support date_trunc), falling back to in-memory grouping
// from Prisma results.
//
// Query params: vehicleId (optional), year (optional, defaults current)
// ──────────────────────────────────────────────────────────────

async function monthlyExpenseBreakdown(query) {
  const where = {};
  if (query.vehicleId) where.vehicleId = query.vehicleId;

  const year = parseInt(query.year, 10) || new Date().getFullYear();
  where.incurredAt = {
    gte: new Date(`${year}-01-01T00:00:00.000Z`),
    lte: new Date(`${year}-12-31T23:59:59.999Z`),
  };

  const expenses = await prisma.expense.findMany({
    where,
    select: {
      category: true,
      amount: true,
      incurredAt: true,
    },
    orderBy: { incurredAt: "asc" },
  });

  // In-memory group: { "2026-01": { FUEL: 1234, MAINTENANCE: 500, ... } }
  const months = {};

  for (const e of expenses) {
    const d = new Date(e.incurredAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!months[key]) months[key] = {};
    if (!months[key][e.category]) months[key][e.category] = 0;

    months[key][e.category] += Number(e.amount);
  }

  // Shape into array sorted by month
  const result = Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, categories]) => {
      const total = Object.values(categories).reduce((s, v) => s + v, 0);
      return {
        month,
        total: Number(total.toFixed(2)),
        categories: Object.entries(categories)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, amount]) => ({
            category,
            amount: Number(amount.toFixed(2)),
          })),
      };
    });

  return { year, months: result };
}

// ──────────────────────────────────────────────────────────────
// 6. Trip Analytics
//
// Uses: Trip.status, Trip.distanceKm, Trip.completedAt
// Aggregate counts + distance for completed trips.
//
// Query params: vehicleId (optional), driverId (optional),
//               from, to (filter on completedAt)
// ──────────────────────────────────────────────────────────────

async function tripAnalytics(query) {
  const where = {};
  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.driverId) where.driverId = query.driverId;

  // Status counts (all statuses)
  const statusGroups = await prisma.trip.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
  });

  const statusCounts = { DRAFT: 0, DISPATCHED: 0, COMPLETED: 0, CANCELLED: 0 };
  for (const g of statusGroups) {
    statusCounts[g.status] = g._count.id;
  }
  const totalTrips = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // Completed trip distance aggregation (with optional date filter)
  const completedWhere = { ...where, status: "COMPLETED" };
  const dateRange = parseDateRange(query);
  if (dateRange) completedWhere.completedAt = dateRange;

  const completedAgg = await prisma.trip.aggregate({
    where: completedWhere,
    _sum: { distanceKm: true },
    _avg: { distanceKm: true },
    _count: { id: true },
  });

  return {
    totalTrips,
    statusCounts,
    completed: {
      count: completedAgg._count.id,
      totalDistanceKm: Number(completedAgg._sum.distanceKm || 0),
      avgDistanceKm: completedAgg._avg.distanceKm
        ? Number(Number(completedAgg._avg.distanceKm).toFixed(2))
        : null,
    },
    completionRate:
      totalTrips > 0
        ? Number(((statusCounts.COMPLETED / totalTrips) * 100).toFixed(2))
        : 0,
  };
}

module.exports = {
  fleetUtilization,
  fuelEfficiency,
  costPerKm,
  vehicleROI,
  monthlyExpenseBreakdown,
  tripAnalytics,
};
