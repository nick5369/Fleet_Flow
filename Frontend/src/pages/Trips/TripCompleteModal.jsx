import { useState } from "react";
import { X } from "lucide-react";
import "./TripCompleteModal.css";

export default function TripCompleteModal({ trip, onClose, onSubmit }) {
  const [odometerEndKm, setOdometerEndKm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!odometerEndKm || Number(odometerEndKm) < 0) {
      setError("Final odometer reading is required and must be positive");
      return;
    }

    if (
      trip.odometerStartKm &&
      Number(odometerEndKm) < Number(trip.odometerStartKm)
    ) {
      setError(
        `Odometer end (${odometerEndKm}) must be >= start (${Number(trip.odometerStartKm).toLocaleString()})`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(trip.id, { odometerEndKm: Number(odometerEndKm) });
    } catch (err) {
      setError(err.message || "Failed to complete trip");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="tcm-overlay" onClick={onClose}>
      <div className="tcm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tcm-header">
          <h2>Complete Trip</h2>
          <button className="tcm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="tcm-body">
          <div className="tcm-info">
            <div className="tcm-info-row">
              <span className="tcm-info-label">Trip</span>
              <span className="tcm-info-value">{trip.tripNumber}</span>
            </div>
            {trip.odometerStartKm && (
              <div className="tcm-info-row">
                <span className="tcm-info-label">Odometer Start</span>
                <span className="tcm-info-value">
                  {Number(trip.odometerStartKm).toLocaleString()} km
                </span>
              </div>
            )}
          </div>

          {error && <div className="tcm-error">{error}</div>}

          <form onSubmit={handleSubmit} className="tcm-form">
            <div className="tcm-field">
              <label htmlFor="tc-odometer">Final Odometer (km) *</label>
              <input
                id="tc-odometer"
                type="number"
                step="0.01"
                min="0"
                value={odometerEndKm}
                onChange={(e) => {
                  setOdometerEndKm(e.target.value);
                  setError("");
                }}
                placeholder="Enter final odometer reading"
              />
            </div>

            <div className="tcm-actions">
              <button
                type="button"
                className="tcm-btn-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tcm-btn-save"
                disabled={submitting}
              >
                {submitting ? <span className="spinner" /> : "Mark Completed"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
