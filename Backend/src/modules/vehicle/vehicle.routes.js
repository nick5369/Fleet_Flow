const { Router } = require("express");
const vehicleController = require("./vehicle.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = Router();

// All vehicle routes require authentication
router.use(authMiddleware);

// ── Read endpoints — any authenticated user ──────────────────

// GET /api/vehicles
// Query params: status, vehicleType, page, limit
router.get("/", vehicleController.list);

// GET /api/vehicles/:id
router.get("/:id", vehicleController.getById);

// ── Write endpoints — MANAGER only ──────────────────────────

// POST /api/vehicles
// Body: { licensePlate, vehicleType, make, model, year, vin?, maxLoadKg, acquisitionCost, acquisitionDate? }
router.post("/", requireRoles("MANAGER"), vehicleController.create);

// PATCH /api/vehicles/:id
// Body: partial update (any writable field including status and odometerKm)
router.patch("/:id", requireRoles("MANAGER"), vehicleController.update);

module.exports = router;
