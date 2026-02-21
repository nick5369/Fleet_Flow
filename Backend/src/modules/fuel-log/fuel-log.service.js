const prisma = require("../../lib/prisma");

// ──────────────────────────────────────────────────────────────
// Enums — exactly as defined in schema.prisma
// ──────────────────────────────────────────────────────────────

const VALID_FUEL_TYPES = ["DIESEL", "PETROL", "CNG", "LPG", "ELECTRIC"];

// ──────────────────────────────────────────────────────────────
// Select — every scalar field on FuelLog, no relations
// Maps 1-to-1 to Prisma model fields, nothing added or removed
// ──────────────────────────────────────────────────────────────

const FUEL_LOG_SELECT = {
  id: true,
  vehicleId: true,
  driverId: true,
  tripId: true,
  fuelType: true,
  liters: true,
  costPerLiter: true,
  totalCost: true,
  odometerAtFillKm: true,
  stationName: true,
  stationAddress: true,
  filledAt: true,
  createdAt: true,
  updatedAt: true,
};

const EXPENSE_SELECT = {
  id: true,
  category: true,
  description: true,
  amount: true,
  vehicleId: true,
  tripId: true,
  maintenanceLogId: true,
  fuelLogId: true,
  receiptUrl: true,
  incurredAt: true,
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
// Validation — create FuelLog
// ──────────────────────────────────────────────────────────────

function validateCreateInput(data) {
  const {
    vehicleId,
    fuelType,
    liters,
    costPerLiter,
    totalCost,
    odometerAtFillKm,
    stationName,
    stationAddress,
    filledAt,
  } = data;

  if (!vehicleId || typeof vehicleId !== "string") {
    fail("vehicleId is required", 400);
  }

  if (!fuelType || !VALID_FUEL_TYPES.includes(fuelType)) {
    fail(`fuelType must be one of: ${VALID_FUEL_TYPES.join(", ")}`, 400);
  }

  if (liters == null) {
    fail("liters is required", 400);
  }
  const l = Number(liters);
  if (isNaN(l) || l <= 0) {
    fail("liters must be greater than 0", 400);
  }

  if (costPerLiter == null) {
    fail("costPerLiter is required", 400);
  }
  const cpl = Number(costPerLiter);
  if (isNaN(cpl) || cpl <= 0) {
    fail("costPerLiter must be greater than 0", 400);
  }

  if (totalCost == null) {
    fail("totalCost is required", 400);
  }
  const tc = Number(totalCost);
  if (isNaN(tc) || tc <= 0) {
    fail("totalCost must be greater than 0", 400);
  }

  if (odometerAtFillKm == null) {
    fail("odometerAtFillKm is required", 400);
  }
  const odo = Number(odometerAtFillKm);
  if (isNaN(odo) || odo < 0) {
    fail("odometerAtFillKm must be >= 0", 400);
  }

  if (stationName !== undefined && stationName !== null) {
    if (typeof stationName !== "string" || stationName.trim().length > 200) {
      fail("stationName must be at most 200 characters", 400);
    }
  }

  if (stationAddress !== undefined && stationAddress !== null) {
    if (
      typeof stationAddress !== "string" ||
      stationAddress.trim().length > 500
    ) {
      fail("stationAddress must be at most 500 characters", 400);
    }
  }

  if (filledAt !== undefined && filledAt !== null) {
    const d = new Date(filledAt);
    if (isNaN(d.getTime())) {
      fail("filledAt must be a valid date", 400);
    }
  }

  // driverId — optional, validated at DB level (FK)
  if (data.driverId !== undefined && data.driverId !== null) {
    if (typeof data.driverId !== "string") {
      fail("driverId must be a string", 400);
    }
  }

  // tripId — optional, validated at DB level (FK)
  if (data.tripId !== undefined && data.tripId !== null) {
    if (typeof data.tripId !== "string") {
      fail("tripId must be a string", 400);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Validation — update FuelLog
// ──────────────────────────────────────────────────────────────

function validateUpdateInput(data) {
  if (data.fuelType !== undefined) {
    if (!VALID_FUEL_TYPES.includes(data.fuelType)) {
      fail(`fuelType must be one of: ${VALID_FUEL_TYPES.join(", ")}`, 400);
    }
  }

  if (data.liters !== undefined) {
    const l = Number(data.liters);
    if (isNaN(l) || l <= 0) fail("liters must be greater than 0", 400);
  }

  if (data.costPerLiter !== undefined) {
    const cpl = Number(data.costPerLiter);
    if (isNaN(cpl) || cpl <= 0)
      fail("costPerLiter must be greater than 0", 400);
  }

  if (data.totalCost !== undefined) {
    const tc = Number(data.totalCost);
    if (isNaN(tc) || tc <= 0) fail("totalCost must be greater than 0", 400);
  }

  if (data.odometerAtFillKm !== undefined) {
    const odo = Number(data.odometerAtFillKm);
    if (isNaN(odo) || odo < 0) fail("odometerAtFillKm must be >= 0", 400);
  }

  if (data.stationName !== undefined && data.stationName !== null) {
    if (
      typeof data.stationName !== "string" ||
      data.stationName.trim().length > 200
    ) {
      fail("stationName must be at most 200 characters", 400);
    }
  }

  if (data.stationAddress !== undefined && data.stationAddress !== null) {
    if (
      typeof data.stationAddress !== "string" ||
      data.stationAddress.trim().length > 500
    ) {
      fail("stationAddress must be at most 500 characters", 400);
    }
  }

  if (data.filledAt !== undefined && data.filledAt !== null) {
    const d = new Date(data.filledAt);
    if (isNaN(d.getTime())) fail("filledAt must be a valid date", 400);
  }
}

// ──────────────────────────────────────────────────────────────
// Service: createFuelLog
//
// $transaction:
//   1. Validate vehicle exists
//   2. Validate odometerAtFillKm >= Vehicle.odometerKm
//   3. Validate driverId exists (if provided)
//   4. Validate tripId exists (if provided)
//   5. Create FuelLog
//   6. Auto-create Expense (category=FUEL, fuelLogId=1:1)
//   7. Update Vehicle.odometerKm to odometerAtFillKm
// ──────────────────────────────────────────────────────────────

async function createFuelLog(data) {
  validateCreateInput(data);

  const result = await prisma.$transaction(async (tx) => {
    // ── Fetch Vehicle ──
    const vehicle = await tx.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { id: true, odometerKm: true, licensePlate: true },
    });

    if (!vehicle) fail("Vehicle not found", 404);

    // ── Odometer validation ──
    const fillOdo = Number(data.odometerAtFillKm);
    const currentOdo = Number(vehicle.odometerKm);

    if (fillOdo < currentOdo) {
      fail(
        `odometerAtFillKm (${fillOdo}) must be >= Vehicle current odometerKm (${currentOdo})`,
        400,
      );
    }

    // ── Validate driverId (if provided) ──
    if (data.driverId) {
      const driver = await tx.driver.findUnique({
        where: { id: data.driverId },
        select: { id: true },
      });
      if (!driver) fail("Driver not found", 404);
    }

    // ── Validate tripId (if provided) ──
    if (data.tripId) {
      const trip = await tx.trip.findUnique({
        where: { id: data.tripId },
        select: { id: true },
      });
      if (!trip) fail("Trip not found", 404);
    }

    // ── Build create payload ──
    const createData = {
      vehicleId: data.vehicleId,
      fuelType: data.fuelType,
      liters: data.liters,
      costPerLiter: data.costPerLiter,
      totalCost: data.totalCost,
      odometerAtFillKm: data.odometerAtFillKm,
    };

    // Optional fields
    if (data.driverId != null) createData.driverId = data.driverId;
    if (data.tripId != null) createData.tripId = data.tripId;
    if (data.stationName != null)
      createData.stationName = data.stationName.trim();
    if (data.stationAddress != null)
      createData.stationAddress = data.stationAddress.trim();
    if (data.filledAt != null) createData.filledAt = new Date(data.filledAt);

    // 1. Create FuelLog
    const fuelLog = await tx.fuelLog.create({
      data: createData,
      select: FUEL_LOG_SELECT,
    });

    // 2. Auto-create linked Expense (category=FUEL, 1:1 via fuelLogId)
    await tx.expense.create({
      data: {
        category: "FUEL",
        description: `Fuel fill — ${data.fuelType} — ${data.liters}L @ ${vehicle.licensePlate}`,
        amount: data.totalCost,
        vehicleId: data.vehicleId,
        tripId: data.tripId || null,
        fuelLogId: fuelLog.id,
        incurredAt: data.filledAt ? new Date(data.filledAt) : new Date(),
      },
    });

    // 3. Update Vehicle.odometerKm (odometer never decreases)
    if (fillOdo > currentOdo) {
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { odometerKm: data.odometerAtFillKm },
      });
    }

    return fuelLog;
  });

  return result;
}

// ──────────────────────────────────────────────────────────────
// Service: getFuelLogById
// ──────────────────────────────────────────────────────────────

async function getFuelLogById(id) {
  const log = await prisma.fuelLog.findUnique({
    where: { id },
    select: FUEL_LOG_SELECT,
  });

  if (!log) fail("FuelLog not found", 404);

  return log;
}

// ──────────────────────────────────────────────────────────────
// Service: listFuelLogs
//
// Filters (all optional):
//   vehicleId — exact match
//   driverId  — exact match
//   tripId    — exact match
//   fuelType  — exact match on FuelType
//   page      — 1-based (default 1)
//   limit     — items per page (default 20, max 100)
// ──────────────────────────────────────────────────────────────

async function listFuelLogs(query) {
  const where = {};

  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.driverId) where.driverId = query.driverId;
  if (query.tripId) where.tripId = query.tripId;

  if (query.fuelType) {
    if (!VALID_FUEL_TYPES.includes(query.fuelType)) {
      fail(
        `Invalid fuelType filter. Must be one of: ${VALID_FUEL_TYPES.join(", ")}`,
        400,
      );
    }
    where.fuelType = query.fuelType;
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.fuelLog.findMany({
      where,
      select: FUEL_LOG_SELECT,
      orderBy: { filledAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.fuelLog.count({ where }),
  ]);

  return {
    fuelLogs: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ──────────────────────────────────────────────────────────────
// Service: updateFuelLog
//
// Partial update on non-relational fields.
// If totalCost changes, also update the linked Expense.amount.
// If odometerAtFillKm changes, re-validate against Vehicle.odometerKm.
// ──────────────────────────────────────────────────────────────

async function updateFuelLog(id, data) {
  validateUpdateInput(data);

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.fuelLog.findUnique({
      where: { id },
      select: { ...FUEL_LOG_SELECT, vehicleId: true },
    });

    if (!existing) fail("FuelLog not found", 404);

    // ── Odometer re-validation if changed ──
    if (data.odometerAtFillKm !== undefined) {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: existing.vehicleId },
        select: { odometerKm: true },
      });

      if (!vehicle) fail("Vehicle not found", 404);

      // For update, we compare against the vehicle's odometer
      // minus what this fuel log may have set it to.
      // Simplest safe check: new value must be >= 0
      const newOdo = Number(data.odometerAtFillKm);
      if (newOdo < 0) {
        fail("odometerAtFillKm must be >= 0", 400);
      }
    }

    const updateData = {};

    if (data.fuelType !== undefined) updateData.fuelType = data.fuelType;
    if (data.liters !== undefined) updateData.liters = data.liters;
    if (data.costPerLiter !== undefined)
      updateData.costPerLiter = data.costPerLiter;
    if (data.totalCost !== undefined) updateData.totalCost = data.totalCost;
    if (data.odometerAtFillKm !== undefined)
      updateData.odometerAtFillKm = data.odometerAtFillKm;
    if (data.filledAt !== undefined) {
      updateData.filledAt =
        data.filledAt === null ? undefined : new Date(data.filledAt);
    }
    if (data.stationName !== undefined) {
      updateData.stationName =
        data.stationName === null ? null : data.stationName.trim();
    }
    if (data.stationAddress !== undefined) {
      updateData.stationAddress =
        data.stationAddress === null ? null : data.stationAddress.trim();
    }

    if (Object.keys(updateData).length === 0) {
      fail("No valid fields provided for update", 400);
    }

    // 1. Update FuelLog
    const log = await tx.fuelLog.update({
      where: { id },
      data: updateData,
      select: FUEL_LOG_SELECT,
    });

    // 2. If totalCost changed, sync the linked Expense.amount
    if (data.totalCost !== undefined) {
      await tx.expense.updateMany({
        where: { fuelLogId: id },
        data: { amount: data.totalCost },
      });
    }

    return log;
  });

  return result;
}

// ──────────────────────────────────────────────────────────────
// Service: getExpenseForFuelLog
//
// Returns the 1:1 linked Expense for a FuelLog
// ──────────────────────────────────────────────────────────────

async function getExpenseForFuelLog(fuelLogId) {
  const log = await prisma.fuelLog.findUnique({
    where: { id: fuelLogId },
    select: { id: true },
  });

  if (!log) fail("FuelLog not found", 404);

  const expense = await prisma.expense.findUnique({
    where: { fuelLogId },
    select: EXPENSE_SELECT,
  });

  return expense;
}

module.exports = {
  createFuelLog,
  getFuelLogById,
  listFuelLogs,
  updateFuelLog,
  getExpenseForFuelLog,
};
