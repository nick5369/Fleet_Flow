import { useState, useMemo } from "react";
import { X } from "lucide-react";
import "./FuelModal.css";

const FUEL_TYPES = [
  { value: "DIESEL", label: "Diesel" },
  { value: "PETROL", label: "Petrol" },
  { value: "CNG", label: "CNG" },
  { value: "LPG", label: "LPG" },
  { value: "ELECTRIC", label: "Electric" },
];

function buildInitial(log) {
  if (!log) {
    return {
      vehicleId: "",
      fuelType: "",
      liters: "",
      costPerLiter: "",
      totalCost: "",
      odometerAtFillKm: "",
      stationName: "",
      stationAddress: "",
      filledAt: "",
    };
  }
  return {
    vehicleId: log.vehicleId || "",
    fuelType: log.fuelType || "",
    liters: log.liters != null ? String(log.liters) : "",
    costPerLiter: log.costPerLiter != null ? String(log.costPerLiter) : "",
    totalCost: log.totalCost != null ? String(log.totalCost) : "",
    odometerAtFillKm:
      log.odometerAtFillKm != null ? String(log.odometerAtFillKm) : "",
    stationName: log.stationName || "",
    stationAddress: log.stationAddress || "",
    filledAt: log.filledAt
      ? new Date(log.filledAt).toISOString().slice(0, 16)
      : "",
  };
}

export default function FuelModal({ vehicles, log, onClose, onSubmit }) {
  const isEdit = !!log;
  const [form, setForm] = useState(() => buildInitial(log));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableVehicles = useMemo(
    () =>
      isEdit ? vehicles : vehicles.filter((v) => v.status !== "DECOMMISSIONED"),
    [vehicles, isEdit],
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (
        (name === "liters" || name === "costPerLiter") &&
        next.liters &&
        next.costPerLiter
      ) {
        next.totalCost = (
          Number(next.liters) * Number(next.costPerLiter)
        ).toFixed(2);
      }
      return next;
    });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isEdit && !form.vehicleId) {
      setError("Please select a vehicle");
      return;
    }
    if (!form.fuelType) {
      setError("Fuel type is required");
      return;
    }
    if (!form.liters || Number(form.liters) <= 0) {
      setError("Liters must be greater than 0");
      return;
    }
    if (!form.costPerLiter || Number(form.costPerLiter) <= 0) {
      setError("Cost per liter must be greater than 0");
      return;
    }
    if (!form.totalCost || Number(form.totalCost) <= 0) {
      setError("Total cost must be greater than 0");
      return;
    }
    if (!form.odometerAtFillKm || Number(form.odometerAtFillKm) < 0) {
      setError("Odometer reading is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {};

      if (!isEdit) {
        payload.vehicleId = form.vehicleId;
      }

      payload.fuelType = form.fuelType;
      payload.liters = Number(form.liters);
      payload.costPerLiter = Number(form.costPerLiter);
      payload.totalCost = Number(form.totalCost);
      payload.odometerAtFillKm = Number(form.odometerAtFillKm);

      if (form.stationName.trim())
        payload.stationName = form.stationName.trim();
      if (form.stationAddress.trim())
        payload.stationAddress = form.stationAddress.trim();
      if (form.filledAt)
        payload.filledAt = new Date(form.filledAt).toISOString();

      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Failed to save fuel log");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flm-overlay" onClick={onClose}>
      <div className="flm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flm-header">
          <h2>{isEdit ? "Edit Fuel Log" : "Add Fuel Log"}</h2>
          <button className="flm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="flm-error">{error}</div>}

        <form onSubmit={handleSubmit} className="flm-form">
          <div className="flm-row">
            <div className="flm-field">
              <label htmlFor="fl-vehicle">Vehicle {!isEdit && "*"}</label>
              {isEdit ? (
                <input
                  id="fl-vehicle"
                  value={
                    vehicles.find((v) => v.id === form.vehicleId)
                      ? `${vehicles.find((v) => v.id === form.vehicleId).licensePlate} - ${vehicles.find((v) => v.id === form.vehicleId).make} ${vehicles.find((v) => v.id === form.vehicleId).model}`
                      : form.vehicleId.slice(0, 8)
                  }
                  disabled
                />
              ) : (
                <select
                  id="fl-vehicle"
                  name="vehicleId"
                  value={form.vehicleId}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select vehicle
                  </option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} - {v.make} {v.model}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flm-field">
              <label htmlFor="fl-fueltype">Fuel Type *</label>
              <select
                id="fl-fueltype"
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select type
                </option>
                {FUEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flm-row">
            <div className="flm-field">
              <label htmlFor="fl-liters">Liters *</label>
              <input
                id="fl-liters"
                name="liters"
                type="number"
                min="0.01"
                step="0.01"
                value={form.liters}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="flm-field">
              <label htmlFor="fl-cpl">Cost per Liter ($) *</label>
              <input
                id="fl-cpl"
                name="costPerLiter"
                type="number"
                min="0.01"
                step="0.01"
                value={form.costPerLiter}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flm-row">
            <div className="flm-field">
              <label htmlFor="fl-total">Total Cost ($) *</label>
              <input
                id="fl-total"
                name="totalCost"
                type="number"
                min="0.01"
                step="0.01"
                value={form.totalCost}
                onChange={handleChange}
                placeholder="Auto-calculated"
              />
              <span className="flm-hint">
                Auto-calculated from liters x cost/L
              </span>
            </div>
            <div className="flm-field">
              <label htmlFor="fl-odo">Odometer (km) *</label>
              <input
                id="fl-odo"
                name="odometerAtFillKm"
                type="number"
                min="0"
                step="1"
                value={form.odometerAtFillKm}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flm-row">
            <div className="flm-field">
              <label htmlFor="fl-station">Station Name</label>
              <input
                id="fl-station"
                name="stationName"
                value={form.stationName}
                onChange={handleChange}
                placeholder="Gas station name"
              />
            </div>
            <div className="flm-field">
              <label htmlFor="fl-filled">Fill Date/Time</label>
              <input
                id="fl-filled"
                name="filledAt"
                type="datetime-local"
                value={form.filledAt}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flm-field flm-field--full">
            <label htmlFor="fl-address">Station Address</label>
            <input
              id="fl-address"
              name="stationAddress"
              value={form.stationAddress}
              onChange={handleChange}
              placeholder="Station address"
            />
          </div>

          <div className="flm-actions">
            <button type="button" className="flm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="flm-btn-save"
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner" />
              ) : isEdit ? (
                "Update Log"
              ) : (
                "Add Fuel Log"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
