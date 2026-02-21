const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");

/**
 * Prisma query: find User by email (only fields needed for auth)
 * Fields read: id, email, password, role, isActive
 * Fields excluded from response: password (stripped before returning)
 */
async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

/**
 * Prisma query: find User by id — used for /me endpoint
 * Password is intentionally excluded.
 */
async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Login service
 * Enforces:
 *   1. User must exist
 *   2. User.isActive must be true
 *   3. Password must match bcrypt hash stored in User.password
 *   4. JWT payload contains ONLY { userId: User.id, role: User.role }
 */
async function login(email, password) {
  if (!email || typeof email !== "string") {
    const err = new Error("Email is required");
    err.status = 400;
    throw err;
  }

  if (!password || typeof password !== "string") {
    const err = new Error("Password is required");
    err.status = 400;
    throw err;
  }

  const user = await findUserByEmail(email.toLowerCase().trim());

  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("Account is deactivated");
    err.status = 403;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  // JWT payload — exactly userId and role, nothing else
  const payload = {
    userId: user.id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

/**
 * Get current authenticated user by id injected from JWT middleware
 */
async function getMe(userId) {
  const user = await findUserById(userId);

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("Account is deactivated");
    err.status = 403;
    throw err;
  }

  return user;
}

const VALID_ROLES = ["MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCE_ANALYST"];

async function register(data) {
  const { email, password, name, role } = data;

  if (!email || typeof email !== "string") {
    const err = new Error("Email is required");
    err.status = 400;
    throw err;
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    const err = new Error("Password is required and must be at least 8 characters");
    err.status = 400;
    throw err;
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    const err = new Error("Name is required");
    err.status = 400;
    throw err;
  }

  if (!role || !VALID_ROLES.includes(role)) {
    const err = new Error("Role must be one of: " + VALID_ROLES.join(", "));
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      name: name.trim(),
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

module.exports = { login, getMe, register };
