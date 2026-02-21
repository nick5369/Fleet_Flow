const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");
const vehicleRoutes = require("./modules/vehicle/vehicle.routes");
const driverRoutes = require("./modules/driver/driver.routes");
const tripRoutes = require("./modules/trip/trip.routes");
const maintenanceRoutes = require("./modules/maintenance/maintenance.routes");
const fuelLogRoutes = require("./modules/fuel-log/fuel-log.routes");
const expenseRoutes = require("./modules/expense/expense.routes");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel-logs", fuelLogRoutes);
app.use("/api/expenses", expenseRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal server error" });
});

module.exports = app;
