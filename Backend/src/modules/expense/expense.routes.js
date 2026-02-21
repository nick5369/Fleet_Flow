const { Router } = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const ctrl = require("./expense.controller");

const router = Router();

// All expense routes require authentication — READ ONLY
router.use(authMiddleware);

// GET /api/expenses/summary — aggregation by category (must be BEFORE /:id)
router.get("/summary", ctrl.summary);

// GET /api/expenses — list with filters & pagination
router.get("/", ctrl.list);

// GET /api/expenses/:id — single expense
router.get("/:id", ctrl.getById);

module.exports = router;
