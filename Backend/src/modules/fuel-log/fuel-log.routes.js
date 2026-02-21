const { Router } = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");
const ctrl = require("./fuel-log.controller");

const router = Router();

// All fuel-log routes require authentication
router.use(authMiddleware);

// ── Writes — MANAGER, DISPATCHER ────────────────────────────
router.post("/", requireRoles("MANAGER", "DISPATCHER"), ctrl.create);
router.patch("/:id", requireRoles("MANAGER", "DISPATCHER"), ctrl.update);

// ── Reads — any authenticated user ──────────────────────────
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.get("/:id/expense", ctrl.getExpense);

module.exports = router;
