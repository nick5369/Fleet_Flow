const prisma = require("../../lib/prisma");

// ──────────────────────────────────────────────────────────────
// Enums — exactly as defined in schema.prisma
// ──────────────────────────────────────────────────────────────

const VALID_VEHICLE_TYPES = ["TRUCK", "VAN", "BIKE"];
const VALID_VEHICLE_STATUSES = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"];

// ──────────────────────────────────────────────────────────────
// Status Transition Rules
//
//   AVAILABLE  → ON_TRIP, IN_SHOP, RETIRED
//   ON_TRIP    → AVAILABLE
//   IN_SHOP    → AVAILABLE
//   RETIRED    → (terminal — no outbound transitions)
// ──────────────────────────────────────────────────────────────

const STATUS_TRANSITIONS = {
  AVAILABLE: ["ON_TRIP", "IN_SHOP", "RETIRED"],
  ON_TRIP: ["AVAILABLE"],
  IN_SHOP: ["AVAILABLE"],
  RETIRED: [],
};

// ──────────────────────────────────────────────────────────────
// Select — every scalar field on Vehicle, no relations
// Maps 1-to-1 to Prisma model fields, nothing added or removed
// ──────────────────────────────────────────────────────────────

const VEHICLE_SELECT = {
  id: true,
  licensePlate: true,
  vehicleType: true,
  make: true,
  model: true,
  year: true,
  vin: true,
  status: true,
  maxLoadKg: true,
  odometerKm: true,
  acquisitionCost: true,
  acquisitionDate: true,
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
    licensePlate,
    vehicleType,
    make,
    model,
    year,
    vin,
    maxLoadKg,
    acquisitionCost,
    acquisitionDate,
  } = data;

  if (
    !licensePlate ||
    typeof licensePlate !== "string" ||
    licensePlate.trim().length === 0
  ) {
    fail("licensePlate is required", 400);
  }
  if (licensePlate.trim().length > 20) {
    fail("licensePlate must be at most 20 characters", 400);
  }

  if (!vehicleType || !VALID_VEHICLE_TYPES.includes(vehicleType)) {
    fail(`vehicleType must be one of: ${VALID_VEHICLE_TYPES.join(", ")}`, 400);
  }

  if (!make || typeof make !== "string" || make.trim().length === 0) {
    fail("make is required", 400);
  }
  if (make.trim().length > 100) {
    fail("make must be at most 100 characters", 400);
  }

  if (!model || typeof model !== "string" || model.trim().length === 0) {
    fail("model is required", 400);
  }
  if (model.trim().length > 100) {
    fail("model must be at most 100 characters", 400);
  }

  if (year == null || !Number.isInteger(year)) {
    fail("year must be an integer", 400);
  }
  if (year < 1900 || year > new Date().getFullYear() + 1) {
    fail(`year must be between 1900 and ${new Date().getFullYear() + 1}`, 400);
  }

  if (vin !== undefined && vin !== null) {
    if (typeof vin !== "string" || vin.trim().length === 0) {
      fail("vin must be a non-empty string when provided", 400);
    }
    if (vin.trim().length > 17) {
      fail("vin must be at most 17 characters", 400);
    }
  }

  if (maxLoadKg == null) {
    fail("maxLoadKg is required", 400);
  }
  const maxLoad = Number(maxLoadKg);
  if (isNaN(maxLoad) || maxLoad <= 0) {
    fail("maxLoadKg must be greater than 0", 400);
  }

  if (acquisitionCost == null) {
    fail("acquisitionCost is required", 400);
  }
  const acqCost = Number(acquisitionCost);
  if (isNaN(acqCost) || acqCost < 0) {
    fail("acquisitionCost must be >= 0", 400);
  }

  if (acquisitionDate !== undefined && acquisitionDate !== null) {
    const d = new Date(acquisitionDate);
    if (isNaN(d.getTime())) {
      fail("acquisitionDate must be a valid date", 400);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Validation — update
// ──────────────────────────────────────────────────────────────

function validateUpdate(data, existing) {
  const {
    licensePlate,
    vehicleType,
    make,
    model,
    year,
    vin,
    status,
    maxLoadKg,
    odometerKm,
    acquisitionCost,
    acquisitionDate,
  } = data;

  if (licensePlate !== undefined) {
    if (typeof licensePlate !== "string" || licensePlate.trim().length === 0) {
      fail("licensePlate must be a non-empty string", 400);
    }
    if (licensePlate.trim().length > 20) {
      fail("licensePlate must be at most 20 characters", 400);
    }
  }

  if (vehicleType !== undefined) {
    if (!VALID_VEHICLE_TYPES.includes(vehicleType)) {
      fail(
        `vehicleType must be one of: ${VALID_VEHICLE_TYPES.join(", ")}`,
        400,
      );
    }
  }

  if (make !== undefined) {
    if (typeof make !== "string" || make.trim().length === 0) {
      fail("make must be a non-empty string", 400);
    }
    if (make.trim().length > 100) {
      fail("make must be at most 100 characters", 400);
    }
  }

  if (model !== undefined) {
    if (typeof model !== "string" || model.trim().length === 0) {
      fail("model must be a non-empty string", 400);
    }
    if (model.trim().length > 100) {
      fail("model must be at most 100 characters", 400);
    }
  }

  if (year !== undefined) {
    if (!Number.isInteger(year)) {
      fail("year must be an integer", 400);
    }
    if (year < 1900 || year > new Date().getFullYear() + 1) {
      fail(
        `year must be between 1900 and ${new Date().getFullYear() + 1}`,
        400,
      );
    }
  }

  if (vin !== undefined && vin !== null) {
    if (typeof vin !== "string" || vin.trim().length === 0) {
      fail("vin must be a non-empty string when provided", 400);
    }
    if (vin.trim().length > 17) {
      fail("vin must be at most 17 characters", 400);
    }
  }

  if (maxLoadKg !== undefined) {
    const maxLoad = Number(maxLoadKg);
    if (isNaN(maxLoad) || maxLoad <= 0) {
      fail("maxLoadKg must be greater than 0", 400);
    }
  }

  if (acquisitionCost !== undefined) {
    const acqCost = Number(acquisitionCost);
    if (isNaN(acqCost) || acqCost < 0) {
      fail("acquisitionCost must be >= 0", 400);
    }
  }

  if (acquisitionDate !== undefined && acquisitionDate !== null) {
    const d = new Date(acquisitionDate);
    if (isNaN(d.getTime())) {
      fail("acquisitionDate must be a valid date", 400);
    }
  }

  // ── Odometer monotonicity: odometerKm must never decrease ──
  if (odometerKm !== undefined) {
    const newOdo = Number(odometerKm);
    if (isNaN(newOdo) || newOdo < 0) {
      fail("odometerKm must be >= 0", 400);
    }
    const currentOdo = Number(existing.odometerKm);
    if (newOdo < currentOdo) {
      fail(
        `odometerKm cannot decrease (current: ${currentOdo}, provided: ${newOdo})`,
        400,
      );
    }
  }

  // ── Status transition enforcement ──
  if (status !== undefined) {
    if (!VALID_VEHICLE_STATUSES.includes(status)) {
      fail(`status must be one of: ${VALID_VEHICLE_STATUSES.join(", ")}`, 400);
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
// Service: createVehicle
// ──────────────────────────────────────────────────────────────

async function createVehicle(data) {
  validateCreate(data);

  // Check unique licensePlate
  const existingPlate = await prisma.vehicle.findUnique({
    where: { licensePlate: data.licensePlate.trim() },
  });
  if (existingPlate) {
    fail("A vehicle with this licensePlate already exists", 409);
  }

  // Check unique vin (if provided)
  if (data.vin) {
    const existingVin = await prisma.vehicle.findUnique({
      where: { vin: data.vin.trim() },
    });
    if (existingVin) {
      fail("A vehicle with this VIN already exists", 409);
    }
  }

  const createData = {
    licensePlate: data.licensePlate.trim(),
    vehicleType: data.vehicleType,
    make: data.make.trim(),
    model: data.model.trim(),
    year: data.year,
    maxLoadKg: data.maxLoadKg,
    acquisitionCost: data.acquisitionCost,
  };

  // Optional fields — only set when explicitly provided
  if (data.vin != null) {
    createData.vin = data.vin.trim();
  }
  if (data.acquisitionDate != null) {
    createData.acquisitionDate = new Date(data.acquisitionDate);
  }

  // status defaults to AVAILABLE (schema default)
  // odometerKm defaults to 0 (schema default)

  const vehicle = await prisma.vehicle.create({
    data: createData,
    select: VEHICLE_SELECT,
  });

  return vehicle;
}

// ──────────────────────────────────────────────────────────────
// Service: getVehicleById
// ──────────────────────────────────────────────────────────────

async function getVehicleById(id) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: VEHICLE_SELECT,
  });

  if (!vehicle) {
    fail("Vehicle not found", 404);
  }

  return vehicle;
}

// ──────────────────────────────────────────────────────────────
// Service: listVehicles
//
// Filters (all optional, from query string):
//   status       — exact match on VehicleStatus
//   vehicleType  — exact match on VehicleType
//   page         — 1-based page number (default 1)
//   limit        — items per page (default 20, max 100)
// ──────────────────────────────────────────────────────────────

async function listVehicles(query) {
  const where = {};

  if (query.status) {
    if (!VALID_VEHICLE_STATUSES.includes(query.status)) {
      fail(
        `Invalid status filter. Must be one of: ${VALID_VEHICLE_STATUSES.join(", ")}`,
        400,
      );
    }
    where.status = query.status;
  }

  if (query.vehicleType) {
    if (!VALID_VEHICLE_TYPES.includes(query.vehicleType)) {
      fail(
        `Invalid vehicleType filter. Must be one of: ${VALID_VEHICLE_TYPES.join(", ")}`,
        400,
      );
    }
    where.vehicleType = query.vehicleType;
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      select: VEHICLE_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  return {
    vehicles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ──────────────────────────────────────────────────────────────
// Service: updateVehicle
//
// Accepts a partial payload. Only provided fields are updated.
// Enforces:
//   - odometerKm never decreases
//   - status follows transition rules
//   - unique licensePlate / vin
// ──────────────────────────────────────────────────────────────

async function updateVehicle(id, data) {
  const existing = await prisma.vehicle.findUnique({
    where: { id },
    select: VEHICLE_SELECT,
  });

  if (!existing) {
    fail("Vehicle not found", 404);
  }

  validateUpdate(data, existing);

  const updateData = {};

  if (data.licensePlate !== undefined) {
    const trimmed = data.licensePlate.trim();
    // Check uniqueness only when value actually changes
    if (trimmed !== existing.licensePlate) {
      const conflict = await prisma.vehicle.findUnique({
        where: { licensePlate: trimmed },
      });
      if (conflict) {
        fail("A vehicle with this licensePlate already exists", 409);
      }
    }
    updateData.licensePlate = trimmed;
  }

  if (data.vin !== undefined) {
    if (data.vin === null) {
      updateData.vin = null;
    } else {
      const trimmed = data.vin.trim();
      if (trimmed !== existing.vin) {
        const conflict = await prisma.vehicle.findUnique({
          where: { vin: trimmed },
        });
        if (conflict) {
          fail("A vehicle with this VIN already exists", 409);
        }
      }
      updateData.vin = trimmed;
    }
  }

  if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType;
  if (data.make !== undefined) updateData.make = data.make.trim();
  if (data.model !== undefined) updateData.model = data.model.trim();
  if (data.year !== undefined) updateData.year = data.year;
  if (data.maxLoadKg !== undefined) updateData.maxLoadKg = data.maxLoadKg;
  if (data.odometerKm !== undefined) updateData.odometerKm = data.odometerKm;
  if (data.acquisitionCost !== undefined)
    updateData.acquisitionCost = data.acquisitionCost;
  if (data.status !== undefined) updateData.status = data.status;

  if (data.acquisitionDate !== undefined) {
    updateData.acquisitionDate =
      data.acquisitionDate === null ? null : new Date(data.acquisitionDate);
  }

  if (Object.keys(updateData).length === 0) {
    fail("No valid fields provided for update", 400);
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: updateData,
    select: VEHICLE_SELECT,
  });

  return vehicle;
}

module.exports = {
  createVehicle,
  getVehicleById,
  listVehicles,
  updateVehicle,
  STATUS_TRANSITIONS,
};
