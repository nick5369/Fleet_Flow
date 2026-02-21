const driverService = require("./driver.service");

// POST /api/drivers
async function create(req, res, next) {
  try {
    const driver = await driverService.createDriver(req.body);

    return res.status(201).json({
      success: true,
      data: driver,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/drivers
async function list(req, res, next) {
  try {
    const result = await driverService.listDrivers(req.query);

    return res.status(200).json({
      success: true,
      data: result.drivers,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/drivers/:id
async function getById(req, res, next) {
  try {
    const driver = await driverService.getDriverById(req.params.id);

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/drivers/:id
async function update(req, res, next) {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/drivers/:id/assignable
async function checkAssignable(req, res, next) {
  try {
    await driverService.assertAssignable(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Driver is eligible for assignment",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, update, checkAssignable };
