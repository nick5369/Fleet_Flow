const { Router } = require("express");
const driverController = require("./driver.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = Router();

// All driver routes require authentication
router.use(authMiddleware);

// ── Read endpoints — any authenticated user ──────────────────

// GET /api/drivers
// Query params: status, licenseCategory, page, limit
router.get("/", driverController.list);

// GET /api/drivers/:id
router.get("/:id", driverController.getById);

// GET /api/drivers/:id/assignable
// Checks whether a driver can be assigned (license valid + status not SUSPENDED/ON_TRIP)
router.get("/:id/assignable", driverController.checkAssignable);

// ── Write endpoints — MANAGER only ──────────────────────────

// POST /api/drivers
// Body: { employeeId, firstName, lastName, phone, email, licenseNumber, licenseCategory, licenseExpiryDate, hireDate? }
router.post("/", requireRoles("MANAGER"), driverController.create);

// PATCH /api/drivers/:id
// Body: partial update (any writable field including status and safetyScore)
router.patch("/:id", requireRoles("MANAGER"), driverController.update);

module.exports = router;
