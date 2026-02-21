const { Router } = require("express");
const tripController = require("./trip.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = Router();

// All trip routes require authentication
router.use(authMiddleware);

// ── Read endpoints — any authenticated user ──────────────────

// GET /api/trips
// Query params: status, vehicleId, driverId, page, limit
router.get("/", tripController.list);

// GET /api/trips/:id
router.get("/:id", tripController.getById);

// ── Write endpoints ─────────────────────────────────────────

// POST /api/trips
// Creates a DRAFT trip. MANAGER or DISPATCHER.
// Body: { vehicleId, driverId, originAddress, destinationAddress, cargoWeightKg, scheduledAt, ... }
router.post("/", requireRoles("MANAGER", "DISPATCHER"), tripController.create);

// PATCH /api/trips/:id/dispatch
// DRAFT → DISPATCHED. MANAGER or DISPATCHER.
router.patch(
  "/:id/dispatch",
  requireRoles("MANAGER", "DISPATCHER"),
  tripController.dispatch,
);

// PATCH /api/trips/:id/complete
// DISPATCHED → COMPLETED. MANAGER or DISPATCHER.
// Body: { odometerEndKm }
router.patch(
  "/:id/complete",
  requireRoles("MANAGER", "DISPATCHER"),
  tripController.complete,
);

// PATCH /api/trips/:id/cancel
// DRAFT|DISPATCHED → CANCELLED. MANAGER or DISPATCHER.
router.patch(
  "/:id/cancel",
  requireRoles("MANAGER", "DISPATCHER"),
  tripController.cancel,
);

module.exports = router;
