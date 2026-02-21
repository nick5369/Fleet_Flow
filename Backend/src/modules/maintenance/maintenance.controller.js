const maintenanceService = require("./maintenance.service");

// POST /api/maintenance
async function create(req, res, next) {
  try {
    const log = await maintenanceService.createMaintenanceLog(req.body);

    return res.status(201).json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/maintenance
async function list(req, res, next) {
  try {
    const result = await maintenanceService.listMaintenanceLogs(req.query);

    return res.status(200).json({
      success: true,
      data: result.maintenanceLogs,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/maintenance/:id
async function getById(req, res, next) {
  try {
    const log = await maintenanceService.getMaintenanceLogById(req.params.id);

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/maintenance/:id
async function update(req, res, next) {
  try {
    const log = await maintenanceService.updateMaintenanceLog(
      req.params.id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/maintenance/:id/start
async function start(req, res, next) {
  try {
    const log = await maintenanceService.startMaintenance(req.params.id);

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/maintenance/:id/complete
async function complete(req, res, next) {
  try {
    const log = await maintenanceService.completeMaintenance(
      req.params.id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/maintenance/:id/cancel
async function cancel(req, res, next) {
  try {
    const log = await maintenanceService.cancelMaintenance(req.params.id);

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/maintenance/:id/expenses
async function addExpense(req, res, next) {
  try {
    const expense = await maintenanceService.addExpense(
      req.params.id,
      req.body,
    );

    return res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/maintenance/:id/expenses
async function listExpenses(req, res, next) {
  try {
    const expenses = await maintenanceService.listExpenses(req.params.id);

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  start,
  complete,
  cancel,
  addExpense,
  listExpenses,
};
