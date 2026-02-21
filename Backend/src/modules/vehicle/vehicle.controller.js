const vehicleService = require("./vehicle.service");

// POST /api/vehicles
async function create(req, res, next) {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);

    return res.status(201).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/vehicles
async function list(req, res, next) {
  try {
    const result = await vehicleService.listVehicles(req.query);

    return res.status(200).json({
      success: true,
      data: result.vehicles,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/vehicles/:id
async function getById(req, res, next) {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/vehicles/:id
async function update(req, res, next) {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, update };
