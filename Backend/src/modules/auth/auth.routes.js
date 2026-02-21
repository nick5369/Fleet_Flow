const { Router } = require("express");
const authController = require("./auth.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = Router();

// POST /api/auth/register
// Public — no auth required
// Body: { email, password, name, role }
router.post("/register", authController.register);

// POST /api/auth/login
// Public — no auth required
// Body: { email: string, password: string }
router.post("/login", authController.login);

// GET /api/auth/me
// Protected — requires valid JWT
// Returns current user (password excluded)
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
