const tripService = require("./trip.service");

// POST /api/trips
async function create(req, res, next) {
  try {
    const trip = await tripService.createTrip(req.body, req.user.userId);

    return res.status(201).json({
      success: true,
      data: trip,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/trips
async function list(req, res, next) {
  try {
    const result = await tripService.listTrips(req.query);

    return res.status(200).json({
      success: true,
      data: result.trips,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/trips/:id
async function getById(req, res, next) {
  try {
    const trip = await tripService.getTripById(req.params.id);

    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/trips/:id/dispatch
async function dispatch(req, res, next) {
  try {
    const trip = await tripService.dispatchTrip(req.params.id, req.user.userId);

    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/trips/:id/complete
async function complete(req, res, next) {
  try {
    const trip = await tripService.completeTrip(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/trips/:id/cancel
async function cancel(req, res, next) {
  try {
    const trip = await tripService.cancelTrip(req.params.id);

    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, dispatch, complete, cancel };
