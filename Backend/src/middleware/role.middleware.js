// Valid UserRole values from Prisma schema — do NOT change
const VALID_ROLES = ["MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCE_ANALYST"];

/**
 * requireRoles(...roles) — factory that returns middleware
 * which blocks any user whose role is not in the allowed list.
 *
 * Usage:
 *   router.get("/protected", authMiddleware, requireRoles("MANAGER"), handler)
 *   router.get("/multi",     authMiddleware, requireRoles("MANAGER", "DISPATCHER"), handler)
 */
function requireRoles(...allowedRoles) {
  allowedRoles.forEach((r) => {
    if (!VALID_ROLES.includes(r)) {
      throw new Error(`requireRoles: "${r}" is not a valid UserRole`);
    }
  });

  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
}

module.exports = { requireRoles };
