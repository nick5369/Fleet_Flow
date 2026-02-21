const prisma = require("../../lib/prisma");

// ──────────────────────────────────────────────────────────────
// Enums — exactly as defined in schema.prisma
// ──────────────────────────────────────────────────────────────

const VALID_LICENSE_CATEGORIES = ["TRUCK", "VAN", "BIKE"];
const VALID_DRIVER_STATUSES = ["ON_DUTY", "OFF_DUTY", "SUSPENDED", "ON_TRIP"];

// ──────────────────────────────────────────────────────────────
// Status Transition Rules
//
//   OFF_DUTY   → ON_DUTY, SUSPENDED
//   ON_DUTY    → OFF_DUTY, ON_TRIP, SUSPENDED
//   ON_TRIP    → ON_DUTY
//   SUSPENDED  → OFF_DUTY
// ──────────────────────────────────────────────────────────────

const STATUS_TRANSITIONS = {
  OFF_DUTY: ["ON_DUTY", "SUSPENDED"],
  ON_DUTY: ["OFF_DUTY", "ON_TRIP", "SUSPENDED"],
  ON_TRIP: ["ON_DUTY"],
  SUSPENDED: ["OFF_DUTY"],
};

// ──────────────────────────────────────────────────────────────
// Select — every scalar field on Driver, no relations
// Maps 1-to-1 to Prisma model fields, nothing added or removed
// ──────────────────────────────────────────────────────────────

const DRIVER_SELECT = {
  id: true,
  employeeId: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  licenseNumber: true,
  licenseCategory: true,
  licenseExpiryDate: true,
  safetyScore: true,
  status: true,
  hireDate: true,
  createdAt: true,
  updatedAt: true,
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

// ──────────────────────────────────────────────────────────────
// Validation — create
// ──────────────────────────────────────────────────────────────

function validateCreate(data) {
  const {
    employeeId,
    firstName,
    lastName,
    phone,
    email,
    licenseNumber,
    licenseCategory,
    licenseExpiryDate,
    hireDate,
  } = data;

  if (
    !employeeId ||
    typeof employeeId !== "string" ||
    employeeId.trim().length === 0
  ) {
    fail("employeeId is required", 400);
  }
  if (employeeId.trim().length > 30) {
    fail("employeeId must be at most 30 characters", 400);
  }

  if (
    !firstName ||
    typeof firstName !== "string" ||
    firstName.trim().length === 0
  ) {
    fail("firstName is required", 400);
  }
  if (firstName.trim().length > 100) {
    fail("firstName must be at most 100 characters", 400);
  }

  if (
    !lastName ||
    typeof lastName !== "string" ||
    lastName.trim().length === 0
  ) {
    fail("lastName is required", 400);
  }
  if (lastName.trim().length > 100) {
    fail("lastName must be at most 100 characters", 400);
  }

  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    fail("phone is required", 400);
  }
  if (phone.trim().length > 20) {
    fail("phone must be at most 20 characters", 400);
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    fail("email is required", 400);
  }

  if (
    !licenseNumber ||
    typeof licenseNumber !== "string" ||
    licenseNumber.trim().length === 0
  ) {
    fail("licenseNumber is required", 400);
  }
  if (licenseNumber.trim().length > 50) {
    fail("licenseNumber must be at most 50 characters", 400);
  }

  if (!licenseCategory || !VALID_LICENSE_CATEGORIES.includes(licenseCategory)) {
    fail(
      `licenseCategory must be one of: ${VALID_LICENSE_CATEGORIES.join(", ")}`,
      400,
    );
  }

  if (!licenseExpiryDate) {
    fail("licenseExpiryDate is required", 400);
  }
  const expiry = new Date(licenseExpiryDate);
  if (isNaN(expiry.getTime())) {
    fail("licenseExpiryDate must be a valid date", 400);
  }

  if (hireDate !== undefined && hireDate !== null) {
    const h = new Date(hireDate);
    if (isNaN(h.getTime())) {
      fail("hireDate must be a valid date", 400);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Validation — update
// ──────────────────────────────────────────────────────────────

function validateUpdate(data, existing) {
  const {
    employeeId,
    firstName,
    lastName,
    phone,
    email,
    licenseNumber,
    licenseCategory,
    licenseExpiryDate,
    safetyScore,
    status,
    hireDate,
  } = data;

  if (employeeId !== undefined) {
    if (typeof employeeId !== "string" || employeeId.trim().length === 0) {
      fail("employeeId must be a non-empty string", 400);
    }
    if (employeeId.trim().length > 30) {
      fail("employeeId must be at most 30 characters", 400);
    }
  }

  if (firstName !== undefined) {
    if (typeof firstName !== "string" || firstName.trim().length === 0) {
      fail("firstName must be a non-empty string", 400);
    }
    if (firstName.trim().length > 100) {
      fail("firstName must be at most 100 characters", 400);
    }
  }

  if (lastName !== undefined) {
    if (typeof lastName !== "string" || lastName.trim().length === 0) {
      fail("lastName must be a non-empty string", 400);
    }
    if (lastName.trim().length > 100) {
      fail("lastName must be at most 100 characters", 400);
    }
  }

  if (phone !== undefined) {
    if (typeof phone !== "string" || phone.trim().length === 0) {
      fail("phone must be a non-empty string", 400);
    }
    if (phone.trim().length > 20) {
      fail("phone must be at most 20 characters", 400);
    }
  }

  if (email !== undefined) {
    if (typeof email !== "string" || email.trim().length === 0) {
      fail("email must be a non-empty string", 400);
    }
  }

  if (licenseNumber !== undefined) {
    if (
      typeof licenseNumber !== "string" ||
      licenseNumber.trim().length === 0
    ) {
      fail("licenseNumber must be a non-empty string", 400);
    }
    if (licenseNumber.trim().length > 50) {
      fail("licenseNumber must be at most 50 characters", 400);
    }
  }

  if (licenseCategory !== undefined) {
    if (!VALID_LICENSE_CATEGORIES.includes(licenseCategory)) {
      fail(
        `licenseCategory must be one of: ${VALID_LICENSE_CATEGORIES.join(", ")}`,
        400,
      );
    }
  }

  if (licenseExpiryDate !== undefined) {
    const expiry = new Date(licenseExpiryDate);
    if (isNaN(expiry.getTime())) {
      fail("licenseExpiryDate must be a valid date", 400);
    }
  }

  if (safetyScore !== undefined) {
    const score = Number(safetyScore);
    if (isNaN(score) || score < 0 || score > 100) {
      fail("safetyScore must be between 0.00 and 100.00", 400);
    }
  }

  if (hireDate !== undefined && hireDate !== null) {
    const h = new Date(hireDate);
    if (isNaN(h.getTime())) {
      fail("hireDate must be a valid date", 400);
    }
  }

  // ── Status transition enforcement ──
  if (status !== undefined) {
    if (!VALID_DRIVER_STATUSES.includes(status)) {
      fail(`status must be one of: ${VALID_DRIVER_STATUSES.join(", ")}`, 400);
    }
    const allowed = STATUS_TRANSITIONS[existing.status];
    if (!allowed.includes(status)) {
      fail(
        `Invalid status transition: ${existing.status} → ${status}. Allowed: [${allowed.join(", ")}]`,
        400,
      );
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Assignment eligibility check
//
// Block assignment if:
//   - licenseExpiryDate < today
//   - status = SUSPENDED or ON_TRIP
//
// Called externally (e.g. by the Trip module) before assigning
// a driver. Returns nothing on success, throws on failure.
// ──────────────────────────────────────────────────────────────

async function assertAssignable(driverId) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    select: {
      id: true,
      status: true,
      licenseExpiryDate: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!driver) {
    fail("Driver not found", 404);
  }

  if (driver.status === "SUSPENDED") {
    fail(
      `Driver ${driver.firstName} ${driver.lastName} is SUSPENDED and cannot be assigned`,
      400,
    );
  }

  if (driver.status === "ON_TRIP") {
    fail(
      `Driver ${driver.firstName} ${driver.lastName} is already ON_TRIP and cannot be assigned`,
      400,
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(driver.licenseExpiryDate);
  expiry.setHours(0, 0, 0, 0);

  if (expiry < today) {
    fail(
      `Driver ${driver.firstName} ${driver.lastName} has an expired license (expired ${expiry.toISOString().split("T")[0]})`,
      400,
    );
  }
}

// ──────────────────────────────────────────────────────────────
// Service: createDriver
// ──────────────────────────────────────────────────────────────

async function createDriver(data) {
  validateCreate(data);

  // Check unique constraints: employeeId, phone, email, licenseNumber
  const [byEmployeeId, byPhone, byEmail, byLicense] = await Promise.all([
    prisma.driver.findUnique({ where: { employeeId: data.employeeId.trim() } }),
    prisma.driver.findUnique({ where: { phone: data.phone.trim() } }),
    prisma.driver.findUnique({
      where: { email: data.email.trim().toLowerCase() },
    }),
    prisma.driver.findUnique({
      where: { licenseNumber: data.licenseNumber.trim() },
    }),
  ]);

  if (byEmployeeId) fail("A driver with this employeeId already exists", 409);
  if (byPhone) fail("A driver with this phone already exists", 409);
  if (byEmail) fail("A driver with this email already exists", 409);
  if (byLicense) fail("A driver with this licenseNumber already exists", 409);

  const createData = {
    employeeId: data.employeeId.trim(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    licenseNumber: data.licenseNumber.trim(),
    licenseCategory: data.licenseCategory,
    licenseExpiryDate: new Date(data.licenseExpiryDate),
  };

  // Optional: hireDate (schema defaults to now())
  if (data.hireDate != null) {
    createData.hireDate = new Date(data.hireDate);
  }

  // status defaults to OFF_DUTY (schema default)
  // safetyScore defaults to 100 (schema default)

  const driver = await prisma.driver.create({
    data: createData,
    select: DRIVER_SELECT,
  });

  return driver;
}

// ──────────────────────────────────────────────────────────────
// Service: getDriverById
// ──────────────────────────────────────────────────────────────

async function getDriverById(id) {
  const driver = await prisma.driver.findUnique({
    where: { id },
    select: DRIVER_SELECT,
  });

  if (!driver) {
    fail("Driver not found", 404);
  }

  return driver;
}

// ──────────────────────────────────────────────────────────────
// Service: listDrivers
//
// Filters (all optional, from query string):
//   status          — exact match on DriverStatus
//   licenseCategory — exact match on LicenseCategory
//   page            — 1-based page number (default 1)
//   limit           — items per page (default 20, max 100)
// ──────────────────────────────────────────────────────────────

async function listDrivers(query) {
  const where = {};

  if (query.status) {
    if (!VALID_DRIVER_STATUSES.includes(query.status)) {
      fail(
        `Invalid status filter. Must be one of: ${VALID_DRIVER_STATUSES.join(", ")}`,
        400,
      );
    }
    where.status = query.status;
  }

  if (query.licenseCategory) {
    if (!VALID_LICENSE_CATEGORIES.includes(query.licenseCategory)) {
      fail(
        `Invalid licenseCategory filter. Must be one of: ${VALID_LICENSE_CATEGORIES.join(", ")}`,
        400,
      );
    }
    where.licenseCategory = query.licenseCategory;
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      select: DRIVER_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.driver.count({ where }),
  ]);

  return {
    drivers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ──────────────────────────────────────────────────────────────
// Service: updateDriver
//
// Accepts a partial payload. Only provided fields are updated.
// Enforces:
//   - status follows transition rules
//   - unique employeeId / phone / email / licenseNumber
// ──────────────────────────────────────────────────────────────

async function updateDriver(id, data) {
  const existing = await prisma.driver.findUnique({
    where: { id },
    select: DRIVER_SELECT,
  });

  if (!existing) {
    fail("Driver not found", 404);
  }

  validateUpdate(data, existing);

  const updateData = {};

  // ── Unique-constrained string fields — check before write ──

  if (data.employeeId !== undefined) {
    const trimmed = data.employeeId.trim();
    if (trimmed !== existing.employeeId) {
      const conflict = await prisma.driver.findUnique({
        where: { employeeId: trimmed },
      });
      if (conflict) fail("A driver with this employeeId already exists", 409);
    }
    updateData.employeeId = trimmed;
  }

  if (data.phone !== undefined) {
    const trimmed = data.phone.trim();
    if (trimmed !== existing.phone) {
      const conflict = await prisma.driver.findUnique({
        where: { phone: trimmed },
      });
      if (conflict) fail("A driver with this phone already exists", 409);
    }
    updateData.phone = trimmed;
  }

  if (data.email !== undefined) {
    const trimmed = data.email.trim().toLowerCase();
    if (trimmed !== existing.email) {
      const conflict = await prisma.driver.findUnique({
        where: { email: trimmed },
      });
      if (conflict) fail("A driver with this email already exists", 409);
    }
    updateData.email = trimmed;
  }

  if (data.licenseNumber !== undefined) {
    const trimmed = data.licenseNumber.trim();
    if (trimmed !== existing.licenseNumber) {
      const conflict = await prisma.driver.findUnique({
        where: { licenseNumber: trimmed },
      });
      if (conflict)
        fail("A driver with this licenseNumber already exists", 409);
    }
    updateData.licenseNumber = trimmed;
  }

  // ── Non-unique fields ──

  if (data.firstName !== undefined)
    updateData.firstName = data.firstName.trim();
  if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
  if (data.licenseCategory !== undefined)
    updateData.licenseCategory = data.licenseCategory;
  if (data.safetyScore !== undefined) updateData.safetyScore = data.safetyScore;
  if (data.status !== undefined) updateData.status = data.status;

  if (data.licenseExpiryDate !== undefined) {
    updateData.licenseExpiryDate = new Date(data.licenseExpiryDate);
  }

  if (data.hireDate !== undefined) {
    updateData.hireDate =
      data.hireDate === null ? null : new Date(data.hireDate);
  }

  if (Object.keys(updateData).length === 0) {
    fail("No valid fields provided for update", 400);
  }

  const driver = await prisma.driver.update({
    where: { id },
    data: updateData,
    select: DRIVER_SELECT,
  });

  return driver;
}

module.exports = {
  createDriver,
  getDriverById,
  listDrivers,
  updateDriver,
  assertAssignable,
  STATUS_TRANSITIONS,
};
