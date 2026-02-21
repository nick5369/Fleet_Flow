import { X } from "lucide-react";
import StatusPill from "./StatusPill";
import "./TripDetailModal.css";

function Row({ label, value }) {
  return (
    <div className="tdm-row">
      <span className="tdm-label">{label}</span>
      <span className="tdm-value">{value ?? "-"}</span>
    </div>
  );
}

export default function TripDetailModal({
  trip,
  loading,
  onClose,
  getVehicleLabel,
  getDriverLabel,
}) {
  return (
    <div className="tdm-overlay" onClick={onClose}>
      <div className="tdm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tdm-header">
          <h2>Trip Details</h2>
          <button className="tdm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading || !trip ? (
          <div className="tdm-loading">
            <span className="spinner" />
          </div>
        ) : (
          <div className="tdm-body">
            <div className="tdm-section">
              <h3>General</h3>
              <Row label="Trip Number" value={trip.tripNumber} />
              <Row label="Status" value={<StatusPill status={trip.status} />} />
              <Row label="Vehicle" value={getVehicleLabel(trip.vehicleId)} />
              <Row label="Driver" value={getDriverLabel(trip.driverId)} />
            </div>

            <div className="tdm-section">
              <h3>Route</h3>
              <Row label="Origin" value={trip.originAddress} />
              <Row label="Destination" value={trip.destinationAddress} />
              {trip.distanceKm && (
                <Row
                  label="Distance"
                  value={`${Number(trip.distanceKm).toLocaleString()} km`}
                />
              )}
            </div>

            <div className="tdm-section">
              <h3>Cargo</h3>
              <Row
                label="Weight"
                value={`${Number(trip.cargoWeightKg).toLocaleString()} kg`}
              />
              <Row label="Description" value={trip.cargoDescription} />
            </div>

            <div className="tdm-section">
              <h3>Odometer</h3>
              <Row
                label="Start"
                value={
                  trip.odometerStartKm
                    ? `${Number(trip.odometerStartKm).toLocaleString()} km`
                    : null
                }
              />
              <Row
                label="End"
                value={
                  trip.odometerEndKm
                    ? `${Number(trip.odometerEndKm).toLocaleString()} km`
                    : null
                }
              />
            </div>

            <div className="tdm-section">
              <h3>Timeline</h3>
              <Row
                label="Scheduled"
                value={
                  trip.scheduledAt
                    ? new Date(trip.scheduledAt).toLocaleString()
                    : null
                }
              />
              <Row
                label="Created"
                value={new Date(trip.createdAt).toLocaleString()}
              />
              {trip.dispatchedAt && (
                <Row
                  label="Dispatched"
                  value={new Date(trip.dispatchedAt).toLocaleString()}
                />
              )}
              {trip.completedAt && (
                <Row
                  label="Completed"
                  value={new Date(trip.completedAt).toLocaleString()}
                />
              )}
              {trip.cancelledAt && (
                <Row
                  label="Cancelled"
                  value={new Date(trip.cancelledAt).toLocaleString()}
                />
              )}
            </div>

            {trip.notes && (
              <div className="tdm-section">
                <h3>Notes</h3>
                <p className="tdm-notes">{trip.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
