const prisma = require("../../lib/prisma");

// ──────────────────────────────────────────────────────────────
// Enums — exactly as defined in schema.prisma
// ──────────────────────────────────────────────────────────────

const VALID_MAINTENANCE_TYPES = [
  "PREVENTIVE",
  "CORRECTIVE",
  "INSPECTION",
  "TIRE_CHANGE",
  "OTHER",
];
const VALID_MAINTENANCE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const VALID_MAINTENANCE_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];
const VALID_EXPENSE_CATEGORIES = [
  "FUEL",
  "MAINTENANCE",
  "TOLL",
  "INSURANCE",
  "PARKING",
  "FINE",
  "OTHER",
];

// ──────────────────────────────────────────────────────────────
// Maintenance Status Transition Rules
//
//   SCHEDULED   → IN_PROGRESS, CANCELLED
//   IN_PROGRESS → COMPLETED, CANCELLED
//   COMPLETED   → (terminal)
//   CANCELLED   → (terminal)
// ──────────────────────────────────────────────────────────────

const STATUS_TRANSITIONS = {
  SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

// ──────────────────────────────────────────────────────────────
// Select — every scalar field on MaintenanceLog, no relations
// Maps 1-to-1 to Prisma model fields, nothing added or removed
// ──────────────────────────────────────────────────────────────

const MAINTENANCE_SELECT = {
  id: true,
  vehicleId: true,
  type: true,
  priority: true,
  status: true,
  description: true,
  odometerAtServiceKm: true,
  laborCost: true,
  partsCost: true,
  scheduledDate: true,
  startedAt: true,
  completedAt: true,
  vendorName: true,
  invoiceNumber: true,
  notes: true,
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
// Validation — create MaintenanceLog
// ──────────────────────────────────────────────────────────────

function validateCreateInput(data) {
  const {
    vehicleId,
    type,
    description,
    scheduledDate,
    priority,
    odometerAtServiceKm,
    laborCost,
    partsCost,
    vendorName,
    invoiceNumber,
  } = data;

  if (!vehicleId || typeof vehicleId !== "string") {
    fail("vehicleId is required", 400);
  }

  if (!type || !VALID_MAINTENANCE_TYPES.includes(type)) {
    fail(`type must be one of: ${VALID_MAINTENANCE_TYPES.join(", ")}`, 400);
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    fail("description is required", 400);
  }

  if (!scheduledDate) {
    fail("scheduledDate is required", 400);
  }
  const sched = new Date(scheduledDate);
  if (isNaN(sched.getTime())) {
    fail("scheduledDate must be a valid date", 400);
  }

  if (priority !== undefined) {
    if (!VALID_MAINTENANCE_PRIORITIES.includes(priority)) {
      fail(
        `priority must be one of: ${VALID_MAINTENANCE_PRIORITIES.join(", ")}`,
        400,
      );
    }
  }

  if (odometerAtServiceKm !== undefined && odometerAtServiceKm !== null) {
    const odo = Number(odometerAtServiceKm);
    if (isNaN(odo) || odo < 0) {
      fail("odometerAtServiceKm must be >= 0", 400);
    }
  }

  if (laborCost !== undefined) {
    const lc = Number(laborCost);
    if (isNaN(lc) || lc < 0) {
      fail("laborCost must be >= 0", 400);
    }
  }

  if (partsCost !== undefined) {
    const pc = Number(partsCost);
    if (isNaN(pc) || pc < 0) {
      fail("partsCost must be >= 0", 400);
    }
  }

  if (vendorName !== undefined && vendorName !== null) {
    if (typeof vendorName !== "string" || vendorName.trim().length > 200) {
      fail("vendorName must be at most 200 characters", 400);
    }
  }

  if (invoiceNumber !== undefined && invoiceNumber !== null) {
    if (
      typeof invoiceNumber !== "string" ||
      invoiceNumber.trim().length > 100
    ) {
      fail("invoiceNumber must be at most 100 characters", 400);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Validation — update MaintenanceLog
// ──────────────────────────────────────────────────────────────

function validateUpdateInput(data) {
  const {
    type,
    priority,
    description,
    odometerAtServiceKm,
    laborCost,
    partsCost,
    scheduledDate,
    vendorName,
    invoiceNumber,
  } = data;

  if (type !== undefined) {
    if (!VALID_MAINTENANCE_TYPES.includes(type)) {
      fail(`type must be one of: ${VALID_MAINTENANCE_TYPES.join(", ")}`, 400);
    }
  }

  if (priority !== undefined) {
    if (!VALID_MAINTENANCE_PRIORITIES.includes(priority)) {
      fail(
        `priority must be one of: ${VALID_MAINTENANCE_PRIORITIES.join(", ")}`,
        400,
      );
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length === 0) {
      fail("description must be a non-empty string", 400);
    }
  }

  if (odometerAtServiceKm !== undefined && odometerAtServiceKm !== null) {
    const odo = Number(odometerAtServiceKm);
    if (isNaN(odo) || odo < 0) {
      fail("odometerAtServiceKm must be >= 0", 400);
    }
  }

  if (laborCost !== undefined) {
    const lc = Number(laborCost);
    if (isNaN(lc) || lc < 0) fail("laborCost must be >= 0", 400);
  }

  if (partsCost !== undefined) {
    const pc = Number(partsCost);
    if (isNaN(pc) || pc < 0) fail("partsCost must be >= 0", 400);
  }

  if (scheduledDate !== undefined) {
    const d = new Date(scheduledDate);
    if (isNaN(d.getTime())) fail("scheduledDate must be a valid date", 400);
  }

  if (vendorName !== undefined && vendorName !== null) {
    if (typeof vendorName !== "string" || vendorName.trim().length > 200) {
      fail("vendorName must be at most 200 characters", 400);
    }
  }

  if (invoiceNumber !== undefined && invoiceNumber !== null) {
    if (
      typeof invoiceNumber !== "string" ||
      invoiceNumber.trim().length > 100
    ) {
      fail("invoiceNumber must be at most 100 characters", 400);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Validation — Expense on MaintenanceLog
// ──────────────────────────────────────────────────────────────

function validateExpenseInput(data) {
  const { category, description, amount, incurredAt, receiptUrl } = data;

  if (!category || !VALID_EXPENSE_CATEGORIES.includes(category)) {
    fail(
      `category must be one of: ${VALID_EXPENSE_CATEGORIES.join(", ")}`,
      400,
    );
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    fail("description is required", 400);
  }
  if (description.trim().length > 500) {
    fail("description must be at most 500 characters", 400);
  }

  if (amount == null) {
    fail("amount is required", 400);
  }
  const amt = Number(amount);
  if (isNaN(amt) || amt < 0) {
    fail("amount must be >= 0", 400);
  }

  if (incurredAt !== undefined && incurredAt !== null) {
    const d = new Date(incurredAt);
    if (isNaN(d.getTime())) fail("incurredAt must be a valid date", 400);
  }

  if (receiptUrl !== undefined && receiptUrl !== null) {
    if (typeof receiptUrl !== "string")
      fail("receiptUrl must be a string", 400);
  }
}

// ──────────────────────────────────────────────────────────────
// Service: createMaintenanceLog
//
// $transaction:
//   - Validate vehicle exists
//   - Vehicle.status must be AVAILABLE or IN_SHOP
//   - Create MaintenanceLog (status defaults to SCHEDULED)
//   - Vehicle.status → IN_SHOP
// ──────────────────────────────────────────────────────────────

async function createMaintenanceLog(data) {
  validateCreateInput(data);

  const result = await prisma.$transaction(async (tx) => {
    // ── Fetch Vehicle ──
    const vehicle = await tx.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { id: true, status: true, odometerKm: true },
    });

    if (!vehicle) fail("Vehicle not found", 404);

    if (vehicle.status !== "AVAILABLE" && vehicle.status !== "IN_SHOP") {
      fail(
        `Vehicle cannot enter maintenance (current status: ${vehicle.status}). Must be AVAILABLE or IN_SHOP`,
        400,
      );
    }

    // ── Build create payload ──
    const createData = {
      vehicleId: data.vehicleId,
      type: data.type,
      description: data.description.trim(),
      scheduledDate: new Date(data.scheduledDate),
    };

    // Optional fields — only set when provided
    if (data.priority !== undefined) createData.priority = data.priority;
    if (data.odometerAtServiceKm != null)
      createData.odometerAtServiceKm = data.odometerAtServiceKm;
    if (data.laborCost !== undefined) createData.laborCost = data.laborCost;
    if (data.partsCost !== undefined) createData.partsCost = data.partsCost;
    if (data.vendorName != null) createData.vendorName = data.vendorName.trim();
    if (data.invoiceNumber != null)
      createData.invoiceNumber = data.invoiceNumber.trim();
    if (data.notes != null) createData.notes = data.notes;

    // status defaults to SCHEDULED (schema default)

    // 1. Create MaintenanceLog
    const log = await tx.maintenanceLog.create({
      data: createData,
      select: MAINTENANCE_SELECT,
    });

    // 2. Vehicle → IN_SHOP
    await tx.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: "IN_SHOP" },
    });

    return log;
  });

  return result;
}

// ──────────────────────────────────────────────────────────────
// Service: startMaintenance
//
// SCHEDULED → IN_PROGRESS
// Sets startedAt = now
// ──────────────────────────────────────────────────────────────

async function startMaintenance(id) {
  const existing = await prisma.maintenanceLog.findUnique({
    where: { id },
    select: MAINTENANCE_SELECT,
  });

  if (!existing) fail("MaintenanceLog not found", 404);

  if (existing.status !== "SCHEDULED") {
    fail(`Cannot start: status is ${existing.status} (must be SCHEDULED)`, 400);
  }

  const log = await prisma.maintenanceLog.update({
    where: { id },
    data: {
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
    select: MAINTENANCE_SELECT,
  });

  return log;
}

// ──────────────────────────────────────────────────────────────
// Service: completeMaintenance
//
// $transaction:
//   - MaintenanceLog.status IN_PROGRESS → COMPLETED
//   - completedAt = now
//   - Vehicle.status → AVAILABLE
//     (only if vehicle has no other active maintenance logs)
// ──────────────────────────────────────────────────────────────

async function completeMaintenance(id, data) {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.maintenanceLog.findUnique({
      where: { id },
      select: { ...MAINTENANCE_SELECT, vehicleId: true },
    });

    if (!existing) fail("MaintenanceLog not found", 404);

    if (existing.status !== "IN_PROGRESS") {
      fail(
        `Cannot complete: status is ${existing.status} (must be IN_PROGRESS)`,
        400,
      );
    }

    // ── Build update payload ──
    const updateData = {
      status: "COMPLETED",
      completedAt: new Date(),
    };

    // Allow updating costs and vendor info at completion time
    if (data && data.laborCost !== undefined) {
      const lc = Number(data.laborCost);
      if (isNaN(lc) || lc < 0) fail("laborCost must be >= 0", 400);
      updateData.laborCost = data.laborCost;
    }
    if (data && data.partsCost !== undefined) {
      const pc = Number(data.partsCost);
      if (isNaN(pc) || pc < 0) fail("partsCost must be >= 0", 400);
      updateData.partsCost = data.partsCost;
    }
    if (data && data.vendorName != null)
      updateData.vendorName = data.vendorName.trim();
    if (data && data.invoiceNumber != null)
      updateData.invoiceNumber = data.invoiceNumber.trim();
    if (data && data.notes != null) updateData.notes = data.notes;

    // 1. MaintenanceLog → COMPLETED
    const log = await tx.maintenanceLog.update({
      where: { id },
      data: updateData,
      select: MAINTENANCE_SELECT,
    });

    // 2. Check if vehicle has other non-terminal maintenance logs
    const otherActive = await tx.maintenanceLog.count({
      where: {
        vehicleId: existing.vehicleId,
        id: { not: id },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    });

    // 3. Vehicle → AVAILABLE only if no other active maintenance
    if (otherActive === 0) {
      await tx.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    return log;
  });

  return result;
}

// ──────────────────────────────────────────────────────────────
// Service: cancelMaintenance
//
// $transaction:
//   - MaintenanceLog.status SCHEDULED|IN_PROGRESS → CANCELLED
//   - Vehicle.status → AVAILABLE
//     (only if vehicle has no other active maintenance logs)
// ──────────────────────────────────────────────────────────────

async function cancelMaintenance(id) {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.maintenanceLog.findUnique({
      where: { id },
      select: { ...MAINTENANCE_SELECT, vehicleId: true },
    });

    if (!existing) fail("MaintenanceLog not found", 404);

    if (existing.status !== "SCHEDULED" && existing.status !== "IN_PROGRESS") {
      fail(
        `Cannot cancel: status is ${existing.status} (must be SCHEDULED or IN_PROGRESS)`,
        400,
      );
    }

    // 1. MaintenanceLog → CANCELLED
    const log = await tx.maintenanceLog.update({
      where: { id },
      data: { status: "CANCELLED" },
      select: MAINTENANCE_SELECT,
    });

    // 2. Check if vehicle has other non-terminal maintenance logs
    const otherActive = await tx.maintenanceLog.count({
      where: {
        vehicleId: existing.vehicleId,
        id: { not: id },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    });

    // 3. Vehicle → AVAILABLE only if no other active maintenance
    if (otherActive === 0) {
      await tx.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    return log;
  });

  return result;
}

// ──────────────────────────────────────────────────────────────
// Service: updateMaintenanceLog
//
// Partial update on non-status fields.
// Only allowed when status is SCHEDULED or IN_PROGRESS.
// ──────────────────────────────────────────────────────────────

async function updateMaintenanceLog(id, data) {
  const existing = await prisma.maintenanceLog.findUnique({
    where: { id },
    select: MAINTENANCE_SELECT,
  });

  if (!existing) fail("MaintenanceLog not found", 404);

  if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
    fail(`Cannot update: maintenance log is ${existing.status}`, 400);
  }

  validateUpdateInput(data);

  const updateData = {};

  if (data.type !== undefined) updateData.type = data.type;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.description !== undefined)
    updateData.description = data.description.trim();
  if (data.odometerAtServiceKm !== undefined) {
    updateData.odometerAtServiceKm = data.odometerAtServiceKm;
  }
  if (data.laborCost !== undefined) updateData.laborCost = data.laborCost;
  if (data.partsCost !== undefined) updateData.partsCost = data.partsCost;
  if (data.scheduledDate !== undefined)
    updateData.scheduledDate = new Date(data.scheduledDate);
  if (data.vendorName !== undefined) {
    updateData.vendorName =
      data.vendorName === null ? null : data.vendorName.trim();
  }
  if (data.invoiceNumber !== undefined) {
    updateData.invoiceNumber =
      data.invoiceNumber === null ? null : data.invoiceNumber.trim();
  }
  if (data.notes !== undefined) updateData.notes = data.notes;

  if (Object.keys(updateData).length === 0) {
    fail("No valid fields provided for update", 400);
  }

  const log = await prisma.maintenanceLog.update({
    where: { id },
    data: updateData,
    select: MAINTENANCE_SELECT,
  });

  return log;
}

// ──────────────────────────────────────────────────────────────
// Service: getMaintenanceLogById
// ──────────────────────────────────────────────────────────────

async function getMaintenanceLogById(id) {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    select: MAINTENANCE_SELECT,
  });

  if (!log) fail("MaintenanceLog not found", 404);

  return log;
}

// ──────────────────────────────────────────────────────────────
// Service: listMaintenanceLogs
//
// Filters (all optional):
//   vehicleId — exact match
//   status    — exact match on MaintenanceStatus
//   type      — exact match on MaintenanceType
//   priority  — exact match on MaintenancePriority
//   page      — 1-based (default 1)
//   limit     — items per page (default 20, max 100)
// ──────────────────────────────────────────────────────────────

async function listMaintenanceLogs(query) {
  const where = {};

  if (query.vehicleId) {
    where.vehicleId = query.vehicleId;
  }

  if (query.status) {
    if (!VALID_MAINTENANCE_STATUSES.includes(query.status)) {
      fail(
        `Invalid status filter. Must be one of: ${VALID_MAINTENANCE_STATUSES.join(", ")}`,
        400,
      );
    }
    where.status = query.status;
  }

  if (query.type) {
    if (!VALID_MAINTENANCE_TYPES.includes(query.type)) {
      fail(
        `Invalid type filter. Must be one of: ${VALID_MAINTENANCE_TYPES.join(", ")}`,
        400,
      );
    }
    where.type = query.type;
  }

  if (query.priority) {
    if (!VALID_MAINTENANCE_PRIORITIES.includes(query.priority)) {
      fail(
        `Invalid priority filter. Must be one of: ${VALID_MAINTENANCE_PRIORITIES.join(", ")}`,
        400,
      );
    }
    where.priority = query.priority;
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.maintenanceLog.findMany({
      where,
      select: MAINTENANCE_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.maintenanceLog.count({ where }),
  ]);

  return {
    maintenanceLogs: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ──────────────────────────────────────────────────────────────
// Service: addExpense
//
// Create an Expense linked to a MaintenanceLog via maintenanceLogId.
// Also links to the same vehicleId for the expense ledger.
// ──────────────────────────────────────────────────────────────

async function addExpense(maintenanceLogId, data) {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id: maintenanceLogId },
    select: { id: true, vehicleId: true, status: true },
  });

  if (!log) fail("MaintenanceLog not found", 404);

  validateExpenseInput(data);

  const createData = {
    category: data.category,
    description: data.description.trim(),
    amount: data.amount,
    maintenanceLogId: maintenanceLogId,
    vehicleId: log.vehicleId,
  };

  if (data.incurredAt != null)
    createData.incurredAt = new Date(data.incurredAt);
  if (data.receiptUrl != null) createData.receiptUrl = data.receiptUrl;

  const expense = await prisma.expense.create({
    data: createData,
    select: EXPENSE_SELECT,
  });

  return expense;
}

// ──────────────────────────────────────────────────────────────
// Service: listExpenses for a MaintenanceLog
// ──────────────────────────────────────────────────────────────

async function listExpenses(maintenanceLogId) {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id: maintenanceLogId },
    select: { id: true },
  });

  if (!log) fail("MaintenanceLog not found", 404);

  const expenses = await prisma.expense.findMany({
    where: { maintenanceLogId },
    select: EXPENSE_SELECT,
    orderBy: { incurredAt: "desc" },
  });

  return expenses;
}

module.exports = {
  createMaintenanceLog,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance,
  updateMaintenanceLog,
  getMaintenanceLogById,
  listMaintenanceLogs,
  addExpense,
  listExpenses,
  STATUS_TRANSITIONS,
};
