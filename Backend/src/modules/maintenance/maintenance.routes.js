const { Router } = require("express");
const maintenanceController = require("./maintenance.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = Router();

// All maintenance routes require authentication
router.use(authMiddleware);

// ── Read endpoints — any authenticated user ──────────────────

// GET /api/maintenance
// Query params: vehicleId, status, type, priority, page, limit
router.get("/", maintenanceController.list);

// GET /api/maintenance/:id
router.get("/:id", maintenanceController.getById);

// GET /api/maintenance/:id/expenses
router.get("/:id/expenses", maintenanceController.listExpenses);

// ── Write endpoints — MANAGER only ──────────────────────────

// POST /api/maintenance
// Body: { vehicleId, type, description, scheduledDate, priority?, odometerAtServiceKm?, laborCost?, partsCost?, vendorName?, invoiceNumber?, notes? }
router.post("/", requireRoles("MANAGER"), maintenanceController.create);

// PATCH /api/maintenance/:id
// Partial update on non-status fields (only when SCHEDULED or IN_PROGRESS)
router.patch("/:id", requireRoles("MANAGER"), maintenanceController.update);

// PATCH /api/maintenance/:id/start
// SCHEDULED → IN_PROGRESS
router.patch(
  "/:id/start",
  requireRoles("MANAGER"),
  maintenanceController.start,
);

// PATCH /api/maintenance/:id/complete
// IN_PROGRESS → COMPLETED, Vehicle → AVAILABLE
// Body (optional): { laborCost?, partsCost?, vendorName?, invoiceNumber?, notes? }
router.patch(
  "/:id/complete",
  requireRoles("MANAGER"),
  maintenanceController.complete,
);

// PATCH /api/maintenance/:id/cancel
// SCHEDULED|IN_PROGRESS → CANCELLED, Vehicle → AVAILABLE (if no other active logs)
router.patch(
  "/:id/cancel",
  requireRoles("MANAGER"),
  maintenanceController.cancel,
);

// POST /api/maintenance/:id/expenses
// Body: { category, description, amount, incurredAt?, receiptUrl? }
router.post(
  "/:id/expenses",
  requireRoles("MANAGER"),
  maintenanceController.addExpense,
);

module.exports = router;
