const prisma = require("../../lib/prisma");

// ──────────────────────────────────────────────────────────────
// Enums — exactly as defined in schema.prisma
// ──────────────────────────────────────────────────────────────

const VALID_TRIP_STATUSES = ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"];

// ──────────────────────────────────────────────────────────────
// Trip Status Transition Rules
//
//   DRAFT      → DISPATCHED, CANCELLED
//   DISPATCHED → COMPLETED, CANCELLED
//   COMPLETED  → (terminal)
//   CANCELLED  → (terminal)
// ──────────────────────────────────────────────────────────────

const STATUS_TRANSITIONS = {
  DRAFT: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

// ──────────────────────────────────────────────────────────────
// Select — every scalar field on Trip, no relations
// Maps 1-to-1 to Prisma model fields, nothing added or removed
// ──────────────────────────────────────────────────────────────

const TRIP_SELECT = {
  id: true,
  tripNumber: true,
  status: true,
  vehicleId: true,
  driverId: true,
  originAddress: true,
  originLat: true,
  originLng: true,
  destinationAddress: true,
  destinationLat: true,
  destinationLng: true,
  distanceKm: true,
  cargoDescription: true,
  cargoWeightKg: true,
  odometerStartKm: true,
  odometerEndKm: true,
  scheduledAt: true,
  dispatchedAt: true,
  completedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  dispatchedById: true,
  notes: true,
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

/**
 * Generate a unique trip number: TRP-YYYYMMDD-NNNN
 * Uses today's date + a daily sequence count.
 */
async function generateTripNumber(tx) {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  const prefix = `TRP-${dateStr}-`;

  const lastTrip = await tx.trip.findFirst({
    where: { tripNumber: { startsWith: prefix } },
    orderBy: { tripNumber: "desc" },
    select: { tripNumber: true },
  });

  let seq = 1;
  if (lastTrip) {
    const lastSeq = parseInt(lastTrip.tripNumber.split("-")[2], 10);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  return `${prefix}${String(seq).padStart(4, "0")}`;
}

// ──────────────────────────────────────────────────────────────
// Validation — createTrip input
// ──────────────────────────────────────────────────────────────

function validateCreateInput(data) {
  const {
    vehicleId,
    driverId,
    originAddress,
    destinationAddress,
    cargoWeightKg,
    scheduledAt,
  } = data;

  if (!vehicleId || typeof vehicleId !== "string") {
    fail("vehicleId is required", 400);
  }

  if (!driverId || typeof driverId !== "string") {
    fail("driverId is required", 400);
  }

  if (
    !originAddress ||
    typeof originAddress !== "string" ||
    originAddress.trim().length === 0
  ) {
    fail("originAddress is required", 400);
  }
  if (originAddress.trim().length > 500) {
    fail("originAddress must be at most 500 characters", 400);
  }

  if (
    !destinationAddress ||
    typeof destinationAddress !== "string" ||
    destinationAddress.trim().length === 0
  ) {
    fail("destinationAddress is required", 400);
  }
  if (destinationAddress.trim().length > 500) {
    fail("destinationAddress must be at most 500 characters", 400);
  }

  if (cargoWeightKg == null) {
    fail("cargoWeightKg is required", 400);
  }
  const weight = Number(cargoWeightKg);
  if (isNaN(weight) || weight < 0) {
    fail("cargoWeightKg must be >= 0", 400);
  }

  if (!scheduledAt) {
    fail("scheduledAt is required", 400);
  }
  const sched = new Date(scheduledAt);
  if (isNaN(sched.getTime())) {
    fail("scheduledAt must be a valid date", 400);
  }

  // Optional coordinate validation
  if (data.originLat !== undefined && data.originLat !== null) {
    const lat = Number(data.originLat);
    if (isNaN(lat) || lat < -90 || lat > 90)
      fail("originLat must be between -90 and 90", 400);
  }
  if (data.originLng !== undefined && data.originLng !== null) {
    const lng = Number(data.originLng);
    if (isNaN(lng) || lng < -180 || lng > 180)
      fail("originLng must be between -180 and 180", 400);
  }
  if (data.destinationLat !== undefined && data.destinationLat !== null) {
    const lat = Number(data.destinationLat);
    if (isNaN(lat) || lat < -90 || lat > 90)
      fail("destinationLat must be between -90 and 90", 400);
  }
  if (data.destinationLng !== undefined && data.destinationLng !== null) {
    const lng = Number(data.destinationLng);
    if (isNaN(lng) || lng < -180 || lng > 180)
      fail("destinationLng must be between -180 and 180", 400);
  }

  if (data.distanceKm !== undefined && data.distanceKm !== null) {
    const d = Number(data.distanceKm);
    if (isNaN(d) || d < 0) fail("distanceKm must be >= 0", 400);
  }

  if (data.cargoDescription !== undefined && data.cargoDescription !== null) {
    if (
      typeof data.cargoDescription !== "string" ||
      data.cargoDescription.trim().length > 500
    ) {
      fail("cargoDescription must be at most 500 characters", 400);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// 1. CREATE TRIP (DRAFT)
//
// Validates within a $transaction (serializable reads):
//   - Vehicle exists and Vehicle.status = AVAILABLE
//   - Driver exists and Driver.status ∈ {ON_DUTY, OFF_DUTY}
//   - Driver license not expired
//   - cargoWeightKg ≤ Vehicle.maxLoadKg
//
// Sets createdById from JWT (userId).
// Trip.status defaults to DRAFT (schema default).
// ──────────────────────────────────────────────────────────────

async function createTrip(data, userId) {
  validateCreateInput(data);

  const trip = await prisma.$transaction(async (tx) => {
    // ── Fetch Vehicle ──
    const vehicle = await tx.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { id: true, status: true, maxLoadKg: true, odometerKm: true },
    });

    if (!vehicle) fail("Vehicle not found", 404);

    if (vehicle.status !== "AVAILABLE") {
      fail(`Vehicle is not AVAILABLE (current status: ${vehicle.status})`, 400);
    }

    // ── Fetch Driver ──
    const driver = await tx.driver.findUnique({
      where: { id: data.driverId },
      select: {
        id: true,
        status: true,
        firstName: true,
        lastName: true,
        licenseExpiryDate: true,
      },
    });

    if (!driver) fail("Driver not found", 404);

    if (driver.status !== "ON_DUTY" && driver.status !== "OFF_DUTY") {
      fail(
        `Driver ${driver.firstName} ${driver.lastName} is not available for assignment (current status: ${driver.status})`,
        400,
      );
    }

    // ── License expiry check ──
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

    // ── Cargo weight check ──
    const cargoWeight = Number(data.cargoWeightKg);
    const maxLoad = Number(vehicle.maxLoadKg);

    if (cargoWeight > maxLoad) {
      fail(
        `cargoWeightKg (${cargoWeight}) exceeds Vehicle maxLoadKg (${maxLoad})`,
        400,
      );
    }

    // ── Generate trip number ──
    const tripNumber = await generateTripNumber(tx);

    // ── Build create payload — only schema fields ──
    const createData = {
      tripNumber,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      originAddress: data.originAddress.trim(),
      destinationAddress: data.destinationAddress.trim(),
      cargoWeightKg: data.cargoWeightKg,
      scheduledAt: new Date(data.scheduledAt),
      createdById: userId,
    };

    // Optional fields
    if (data.originLat != null) createData.originLat = data.originLat;
    if (data.originLng != null) createData.originLng = data.originLng;
    if (data.destinationLat != null)
      createData.destinationLat = data.destinationLat;
    if (data.destinationLng != null)
      createData.destinationLng = data.destinationLng;
    if (data.distanceKm != null) createData.distanceKm = data.distanceKm;
    if (data.cargoDescription != null)
      createData.cargoDescription = data.cargoDescription.trim();
    if (data.notes != null) createData.notes = data.notes;

    // status defaults to DRAFT (schema default)

    return tx.trip.create({
      data: createData,
      select: TRIP_SELECT,
    });
  });

  return trip;
}

// ──────────────────────────────────────────────────────────────
// 2. DISPATCH TRIP
//
// Prisma $transaction:
//   - Trip.status DRAFT → DISPATCHED
//   - Trip.dispatchedAt = now
//   - Trip.dispatchedById = userId (from JWT)
//   - Trip.odometerStartKm = Vehicle.odometerKm (snapshot)
//   - Vehicle.status → ON_TRIP
//   - Driver.status → ON_TRIP
//
// Re-validates Vehicle.status = AVAILABLE and Driver eligibility
// inside the transaction (another dispatch could race).
// ──────────────────────────────────────────────────────────────

async function dispatchTrip(tripId, userId) {
  const trip = await prisma.$transaction(async (tx) => {
    // ── Fetch Trip ──
    const existing = await tx.trip.findUnique({
      where: { id: tripId },
      select: { ...TRIP_SELECT, vehicleId: true, driverId: true },
    });

    if (!existing) fail("Trip not found", 404);

    if (existing.status !== "DRAFT") {
      fail(
        `Cannot dispatch: trip status is ${existing.status} (must be DRAFT)`,
        400,
      );
    }

    // ── Re-validate Vehicle ──
    const vehicle = await tx.vehicle.findUnique({
      where: { id: existing.vehicleId },
      select: { id: true, status: true, odometerKm: true },
    });

    if (!vehicle) fail("Vehicle not found", 404);

    if (vehicle.status !== "AVAILABLE") {
      fail(
        `Cannot dispatch: vehicle is not AVAILABLE (current status: ${vehicle.status})`,
        400,
      );
    }

    // ── Re-validate Driver ──
    const driver = await tx.driver.findUnique({
      where: { id: existing.driverId },
      select: {
        id: true,
        status: true,
        firstName: true,
        lastName: true,
        licenseExpiryDate: true,
      },
    });

    if (!driver) fail("Driver not found", 404);

    // if (driver.status !== "ON_DUTY" && driver.status !== "OFF_DUTY") {
    if (driver.status !== "ON_DUTY") {
      fail(
        `Cannot dispatch: driver ${driver.firstName} ${driver.lastName} status is ${driver.status}`,
        400,
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(driver.licenseExpiryDate);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      fail(
        `Cannot dispatch: driver ${driver.firstName} ${driver.lastName} has an expired license`,
        400,
      );
    }

    // ── All valid — execute atomic state changes ──

    // 1. Trip → DISPATCHED
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: "DISPATCHED",
        dispatchedAt: new Date(),
        dispatchedById: userId,
        odometerStartKm: vehicle.odometerKm,
      },
      select: TRIP_SELECT,
    });

    // 2. Vehicle → ON_TRIP
    await tx.vehicle.update({
      where: { id: existing.vehicleId },
      data: { status: "ON_TRIP" },
    });

    // 3. Driver → ON_TRIP
    await tx.driver.update({
      where: { id: existing.driverId },
      data: { status: "ON_TRIP" },
    });

    return updatedTrip;
  });

  return trip;
}

// ──────────────────────────────────────────────────────────────
// 3. COMPLETE TRIP
//
// Prisma $transaction:
//   - Trip.status DISPATCHED → COMPLETED
//   - Trip.completedAt = now
//   - Trip.odometerEndKm set (required, must ≥ odometerStartKm)
//   - Vehicle.odometerKm updated to odometerEndKm
//   - Vehicle.status → AVAILABLE
//   - Driver.status → ON_DUTY
// ──────────────────────────────────────────────────────────────

async function completeTrip(tripId, data) {
  const { odometerEndKm } = data;

  if (odometerEndKm == null) {
    fail("odometerEndKm is required to complete a trip", 400);
  }

  const endOdo = Number(odometerEndKm);
  if (isNaN(endOdo) || endOdo < 0) {
    fail("odometerEndKm must be >= 0", 400);
  }

  const trip = await prisma.$transaction(async (tx) => {
    // ── Fetch Trip ──
    const existing = await tx.trip.findUnique({
      where: { id: tripId },
      select: { ...TRIP_SELECT, vehicleId: true, driverId: true },
    });

    if (!existing) fail("Trip not found", 404);

    if (existing.status !== "DISPATCHED") {
      fail(
        `Cannot complete: trip status is ${existing.status} (must be DISPATCHED)`,
        400,
      );
    }

    // ── Odometer monotonicity ──
    const startOdo = Number(existing.odometerStartKm);
    if (endOdo < startOdo) {
      fail(
        `odometerEndKm (${endOdo}) must be >= odometerStartKm (${startOdo})`,
        400,
      );
    }

    // ── All valid — execute atomic state changes ──

    // 1. Trip → COMPLETED
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        odometerEndKm: odometerEndKm,
        distanceKm: data.distanceKm != null ? data.distanceKm : undefined,
      },
      select: TRIP_SELECT,
    });

    // 2. Vehicle → AVAILABLE, update odometerKm
    await tx.vehicle.update({
      where: { id: existing.vehicleId },
      data: {
        status: "AVAILABLE",
        odometerKm: odometerEndKm,
      },
    });

    // 3. Driver → ON_DUTY
    await tx.driver.update({
      where: { id: existing.driverId },
      data: { status: "ON_DUTY" },
    });

    return updatedTrip;
  });

  return trip;
}

// ──────────────────────────────────────────────────────────────
// 4. CANCEL TRIP
//
// Prisma $transaction:
//   - Trip.status DRAFT|DISPATCHED → CANCELLED
//   - Trip.cancelledAt = now
//   - If was DISPATCHED:
//       Vehicle.status → AVAILABLE
//       Driver.status → ON_DUTY  (restore to duty)
//   - If was DRAFT: no Vehicle/Driver side effects
// ──────────────────────────────────────────────────────────────

async function cancelTrip(tripId) {
  const trip = await prisma.$transaction(async (tx) => {
    // ── Fetch Trip ──
    const existing = await tx.trip.findUnique({
      where: { id: tripId },
      select: { ...TRIP_SELECT, vehicleId: true, driverId: true },
    });

    if (!existing) fail("Trip not found", 404);

    if (existing.status !== "DRAFT" && existing.status !== "DISPATCHED") {
      fail(
        `Cannot cancel: trip status is ${existing.status} (must be DRAFT or DISPATCHED)`,
        400,
      );
    }

    const wasPreviouslyDispatched = existing.status === "DISPATCHED";

    // 1. Trip → CANCELLED
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
      select: TRIP_SELECT,
    });

    // 2. Restore Vehicle & Driver only if trip was DISPATCHED
    if (wasPreviouslyDispatched) {
      await tx.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: "AVAILABLE" },
      });

      await tx.driver.update({
        where: { id: existing.driverId },
        data: { status: "ON_DUTY" },
      });
    }

    return updatedTrip;
  });

  return trip;
}

// ──────────────────────────────────────────────────────────────
// GET by ID
// ──────────────────────────────────────────────────────────────

async function getTripById(id) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    select: TRIP_SELECT,
  });

  if (!trip) fail("Trip not found", 404);

  return trip;
}

// ──────────────────────────────────────────────────────────────
// LIST with filters
//
// Filters (all optional):
//   status    — exact match on TripStatus
//   vehicleId — exact match
//   driverId  — exact match
//   page      — 1-based (default 1)
//   limit     — items per page (default 20, max 100)
// ──────────────────────────────────────────────────────────────

async function listTrips(query) {
  const where = {};

  if (query.status) {
    if (!VALID_TRIP_STATUSES.includes(query.status)) {
      fail(
        `Invalid status filter. Must be one of: ${VALID_TRIP_STATUSES.join(", ")}`,
        400,
      );
    }
    where.status = query.status;
  }

  if (query.vehicleId) {
    where.vehicleId = query.vehicleId;
  }

  if (query.driverId) {
    where.driverId = query.driverId;
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      select: TRIP_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.trip.count({ where }),
  ]);

  return {
    trips,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getTripById,
  listTrips,
  STATUS_TRANSITIONS,
};
