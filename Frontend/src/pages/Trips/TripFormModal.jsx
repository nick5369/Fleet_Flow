import { useState, useMemo } from "react";
import { X } from "lucide-react";
import "./TripFormModal.css";

const EMPTY_FORM = {
  vehicleId: "",
  driverId: "",
  cargoWeightKg: "",
  originAddress: "",
  destinationAddress: "",
  cargoDescription: "",
  scheduledAt: "",
  notes: "",
};

export default function TripFormModal({
  vehicles,
  drivers,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "AVAILABLE"),
    [vehicles],
  );

  const availableDrivers = useMemo(
    () =>
      drivers.filter((d) => {
        if (d.status !== "ON_DUTY" && d.status !== "OFF_DUTY") return false;
        if (d.status === "SUSPENDED") return false;
        const expiry = new Date(d.licenseExpiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);
        if (expiry < today) return false;
        return true;
      }),
    [drivers],
  );

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === form.vehicleId),
    [vehicles, form.vehicleId],
  );

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.vehicleId) {
      setError("Please select a vehicle");
      return;
    }
    if (!form.driverId) {
      setError("Please select a driver");
      return;
    }
    if (!form.cargoWeightKg || Number(form.cargoWeightKg) < 0) {
      setError("Cargo weight must be a positive number");
      return;
    }
    if (!form.originAddress.trim()) {
      setError("Origin address is required");
      return;
    }
    if (!form.destinationAddress.trim()) {
      setError("Destination address is required");
      return;
    }
    if (!form.scheduledAt) {
      setError("Scheduled date/time is required");
      return;
    }

    if (selectedVehicle) {
      const maxLoad = Number(selectedVehicle.maxLoadKg);
      const cargo = Number(form.cargoWeightKg);
      if (cargo > maxLoad) {
        setError(
          `Cargo weight exceeds vehicle capacity. Maximum: ${maxLoad.toLocaleString()} kg`,
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        vehicleId: form.vehicleId,
        driverId: form.driverId,
        cargoWeightKg: Number(form.cargoWeightKg),
        originAddress: form.originAddress.trim(),
        destinationAddress: form.destinationAddress.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      };

      if (form.cargoDescription.trim()) {
        payload.cargoDescription = form.cargoDescription.trim();
      }
      if (form.notes.trim()) {
        payload.notes = form.notes.trim();
      }

      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Failed to create trip");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="tfm-overlay" onClick={onClose}>
      <div className="tfm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tfm-header">
          <h2>Create New Trip</h2>
          <button className="tfm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="tfm-error">{error}</div>}

        <form onSubmit={handleSubmit} className="tfm-form">
          <div className="tfm-row">
            <div className="tfm-field">
              <label htmlFor="tf-vehicle">Vehicle *</label>
              <select
                id="tf-vehicle"
                name="vehicleId"
                value={form.vehicleId}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select available vehicle
                </option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} - {v.make} {v.model} (Max:{" "}
                    {Number(v.maxLoadKg).toLocaleString()} kg)
                  </option>
                ))}
              </select>
              {!availableVehicles.length && (
                <span className="tfm-hint">No available vehicles</span>
              )}
            </div>
            <div className="tfm-field">
              <label htmlFor="tf-driver">Driver *</label>
              <select
                id="tf-driver"
                name="driverId"
                value={form.driverId}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select available driver
                </option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.firstName} {d.lastName} ({d.employeeId})
                  </option>
                ))}
              </select>
              {!availableDrivers.length && (
                <span className="tfm-hint">No available drivers</span>
              )}
            </div>
          </div>

          <div className="tfm-row">
            <div className="tfm-field">
              <label htmlFor="tf-cargo">Cargo Weight (kg) *</label>
              <input
                id="tf-cargo"
                name="cargoWeightKg"
                type="number"
                step="0.01"
                min="0"
                value={form.cargoWeightKg}
                onChange={handleChange}
                placeholder="0.00"
              />
              {selectedVehicle && (
                <span className="tfm-hint">
                  Vehicle capacity:{" "}
                  {Number(selectedVehicle.maxLoadKg).toLocaleString()} kg
                </span>
              )}
            </div>
            <div className="tfm-field">
              <label htmlFor="tf-scheduled">Scheduled At *</label>
              <input
                id="tf-scheduled"
                name="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="tfm-row">
            <div className="tfm-field">
              <label htmlFor="tf-origin">Origin *</label>
              <input
                id="tf-origin"
                name="originAddress"
                value={form.originAddress}
                onChange={handleChange}
                placeholder="Origin address"
              />
            </div>
            <div className="tfm-field">
              <label htmlFor="tf-destination">Destination *</label>
              <input
                id="tf-destination"
                name="destinationAddress"
                value={form.destinationAddress}
                onChange={handleChange}
                placeholder="Destination address"
              />
            </div>
          </div>

          <div className="tfm-field tfm-field--full">
            <label htmlFor="tf-cargo-desc">Cargo Description</label>
            <input
              id="tf-cargo-desc"
              name="cargoDescription"
              value={form.cargoDescription}
              onChange={handleChange}
              placeholder="Optional cargo description"
            />
          </div>

          <div className="tfm-field tfm-field--full">
            <label htmlFor="tf-notes">Notes</label>
            <textarea
              id="tf-notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Optional notes"
            />
          </div>

          <div className="tfm-actions">
            <button type="button" className="tfm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="tfm-btn-save"
              disabled={submitting}
            >
              {submitting ? <span className="spinner" /> : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
