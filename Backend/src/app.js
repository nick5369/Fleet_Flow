const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");
const vehicleRoutes = require("./modules/vehicle/vehicle.routes");
const driverRoutes = require("./modules/driver/driver.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);

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
