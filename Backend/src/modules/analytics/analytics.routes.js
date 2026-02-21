const { Router } = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const ctrl = require("./analytics.controller");

const router = Router();

// All analytics routes require authentication — READ ONLY
router.use(authMiddleware);

// GET /api/analytics/fleet-utilization
router.get("/fleet-utilization", ctrl.fleetUtilization);

// GET /api/analytics/fuel-efficiency?vehicleId=&from=&to=
router.get("/fuel-efficiency", ctrl.fuelEfficiency);

// GET /api/analytics/cost-per-km?vehicleId=&from=&to=
router.get("/cost-per-km", ctrl.costPerKm);

// GET /api/analytics/vehicle-roi?vehicleId=
router.get("/vehicle-roi", ctrl.vehicleROI);

// GET /api/analytics/monthly-expenses?vehicleId=&year=
router.get("/monthly-expenses", ctrl.monthlyExpenses);

// GET /api/analytics/trips?vehicleId=&driverId=&from=&to=
router.get("/trips", ctrl.trips);

module.exports = router;
