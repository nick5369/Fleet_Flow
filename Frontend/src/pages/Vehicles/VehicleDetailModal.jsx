import { X, Edit } from "lucide-react";
import "./VehicleDetailModal.css";

const STATUS_LABELS = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
};

const TYPE_LABELS = { TRUCK: "Truck", VAN: "Van", BIKE: "Bike" };

function Row({ label, value }) {
  return (
    <div className="vdm-row">
      <span className="vdm-label">{label}</span>
      <span className="vdm-value">{value ?? "-"}</span>
    </div>
  );
}

export default function VehicleDetailModal({ vehicle, loading, onClose, onEdit }) {
  return (
    <div className="vdm-overlay" onClick={onClose}>
      <div className="vdm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vdm-header">
          <h2>Vehicle Details</h2>
          <div className="vdm-header-actions">
            {onEdit && (
              <button className="vdm-edit-btn" onClick={() => onEdit(vehicle)}>
                <Edit size={16} />
                Edit
              </button>
            )}
            <button className="vdm-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {loading || !vehicle ? (
          <div className="vdm-loading"><span className="spinner" /></div>
        ) : (
          <div className="vdm-body">
            <div className="vdm-section">
              <h3>General</h3>
              <Row label="License Plate" value={vehicle.licensePlate} />
              <Row label="Make" value={vehicle.make} />
              <Row label="Model" value={vehicle.model} />
              <Row label="Year" value={vehicle.year} />
              <Row label="Type" value={TYPE_LABELS[vehicle.vehicleType] || vehicle.vehicleType} />
              <Row label="VIN" value={vehicle.vin} />
            </div>

            <div className="vdm-section">
              <h3>Operation</h3>
              <Row
                label="Status"
                value={
                  <span className={`vdm-status vdm-status--${vehicle.status?.toLowerCase().replace("_", "-")}`}>
                    {STATUS_LABELS[vehicle.status] || vehicle.status}
                  </span>
                }
              />
              <Row label="Odometer" value={`${Number(vehicle.odometerKm).toLocaleString()} km`} />
              <Row label="Max Load" value={`${Number(vehicle.maxLoadKg).toLocaleString()} kg`} />
            </div>

            <div className="vdm-section">
              <h3>Financials</h3>
              <Row label="Acquisition Cost" value={`${Number(vehicle.acquisitionCost).toLocaleString()}`} />
              <Row
                label="Acquisition Date"
                value={vehicle.acquisitionDate ? new Date(vehicle.acquisitionDate).toLocaleDateString() : null}
              />
            </div>

            <div className="vdm-section">
              <h3>Record</h3>
              <Row label="Created" value={new Date(vehicle.createdAt).toLocaleString()} />
              <Row label="Updated" value={new Date(vehicle.updatedAt).toLocaleString()} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
