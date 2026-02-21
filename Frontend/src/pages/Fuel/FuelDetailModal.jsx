import { X } from "lucide-react";
import "./FuelDetailModal.css";

const FUEL_TYPE_LABELS = {
  DIESEL: "Diesel",
  PETROL: "Petrol",
  CNG: "CNG",
  LPG: "LPG",
  ELECTRIC: "Electric",
};

function Row({ label, value }) {
  return (
    <div className="fdm-row">
      <span className="fdm-label">{label}</span>
      <span className="fdm-value">{value ?? "-"}</span>
    </div>
  );
}

export default function FuelDetailModal({
  log,
  loading,
  onClose,
  getVehicleLabel,
}) {
  return (
    <div className="fdm-overlay" onClick={onClose}>
      <div className="fdm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fdm-header">
          <h2>Fuel Log Details</h2>
          <button className="fdm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading || !log ? (
          <div className="fdm-loading">
            <span className="spinner" />
          </div>
        ) : (
          <div className="fdm-body">
            <div className="fdm-section">
              <h3>General</h3>
              <Row label="Log ID" value={log.id.slice(0, 8)} />
              <Row label="Vehicle" value={getVehicleLabel(log.vehicleId)} />
              <Row
                label="Fuel Type"
                value={FUEL_TYPE_LABELS[log.fuelType] || log.fuelType}
              />
            </div>

            <div className="fdm-section">
              <h3>Fill Details</h3>
              <Row
                label="Liters"
                value={`${Number(log.liters).toLocaleString()} L`}
              />
              <Row
                label="Cost per Liter"
                value={`$${Number(log.costPerLiter).toFixed(2)}`}
              />
              <Row
                label="Total Cost"
                value={`$${Number(log.totalCost).toLocaleString()}`}
              />
              <Row
                label="Odometer"
                value={`${Number(log.odometerAtFillKm).toLocaleString()} km`}
              />
            </div>

            <div className="fdm-section">
              <h3>Station</h3>
              <Row label="Name" value={log.stationName} />
              <Row label="Address" value={log.stationAddress} />
            </div>

            <div className="fdm-section">
              <h3>Timeline</h3>
              <Row
                label="Filled At"
                value={
                  log.filledAt ? new Date(log.filledAt).toLocaleString() : null
                }
              />
              <Row
                label="Created"
                value={new Date(log.createdAt).toLocaleString()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
