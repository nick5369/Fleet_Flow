import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./VehicleFormModal.css";

const VEHICLE_TYPES = [
  { value: "TRUCK", label: "Truck" },
  { value: "VAN", label: "Van" },
  { value: "BIKE", label: "Bike" },
];

const VEHICLE_STATUSES = [
  { value: "AVAILABLE", label: "Available" },
  { value: "ON_TRIP", label: "On Trip" },
  { value: "IN_SHOP", label: "In Shop" },
  { value: "RETIRED", label: "Retired" },
];

const STATUS_TRANSITIONS = {
  AVAILABLE: ["ON_TRIP", "IN_SHOP", "RETIRED"],
  ON_TRIP: ["AVAILABLE"],
  IN_SHOP: ["AVAILABLE"],
  RETIRED: [],
};

const EMPTY_FORM = {
  licensePlate: "",
  vehicleType: "",
  make: "",
  model: "",
  year: "",
  vin: "",
  maxLoadKg: "",
  acquisitionCost: "",
  acquisitionDate: "",
  odometerKm: "",
  status: "",
};

export default function VehicleFormModal({ vehicle, onClose, onSubmit }) {
  const isEdit = Boolean(vehicle);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setForm({
        licensePlate: vehicle.licensePlate || "",
        vehicleType: vehicle.vehicleType || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year ?? "",
        vin: vehicle.vin || "",
        maxLoadKg: vehicle.maxLoadKg ?? "",
        acquisitionCost: vehicle.acquisitionCost ?? "",
        acquisitionDate: vehicle.acquisitionDate
          ? vehicle.acquisitionDate.split("T")[0]
          : "",
        odometerKm: vehicle.odometerKm ?? "",
        status: vehicle.status || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [vehicle]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.licensePlate || !form.vehicleType || !form.make || !form.model || !form.year || !form.maxLoadKg || !form.acquisitionCost) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {};
      if (isEdit) {
        if (form.licensePlate !== vehicle.licensePlate) payload.licensePlate = form.licensePlate;
        if (form.vehicleType !== vehicle.vehicleType) payload.vehicleType = form.vehicleType;
        if (form.make !== vehicle.make) payload.make = form.make;
        if (form.model !== vehicle.model) payload.model = form.model;
        if (Number(form.year) !== vehicle.year) payload.year = Number(form.year);
        if (form.vin !== (vehicle.vin || "")) payload.vin = form.vin || null;
        if (Number(form.maxLoadKg) !== Number(vehicle.maxLoadKg)) payload.maxLoadKg = Number(form.maxLoadKg);
        if (Number(form.acquisitionCost) !== Number(vehicle.acquisitionCost)) payload.acquisitionCost = Number(form.acquisitionCost);
        if (form.acquisitionDate !== (vehicle.acquisitionDate ? vehicle.acquisitionDate.split("T")[0] : "")) {
          payload.acquisitionDate = form.acquisitionDate || null;
        }
        if (Number(form.odometerKm) !== Number(vehicle.odometerKm)) payload.odometerKm = Number(form.odometerKm);
        if (form.status && form.status !== vehicle.status) payload.status = form.status;
        if (Object.keys(payload).length === 0) {
          setError("No changes detected");
          setSubmitting(false);
          return;
        }
      } else {
        payload.licensePlate = form.licensePlate;
        payload.vehicleType = form.vehicleType;
        payload.make = form.make;
        payload.model = form.model;
        payload.year = Number(form.year);
        payload.maxLoadKg = Number(form.maxLoadKg);
        payload.acquisitionCost = Number(form.acquisitionCost);
        if (form.vin) payload.vin = form.vin;
        if (form.acquisitionDate) payload.acquisitionDate = form.acquisitionDate;
      }
      await onSubmit(payload, vehicle?.id);
    } catch (err) {
      setError(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  }

  const allowedStatuses = isEdit
    ? [vehicle.status, ...(STATUS_TRANSITIONS[vehicle.status] || [])]
    : [];

  return (
    <div className="vfm-overlay" onClick={onClose}>
      <div className="vfm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vfm-header">
          <h2>{isEdit ? "Edit Vehicle" : "New Vehicle Registration"}</h2>
          <button className="vfm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="vfm-error">{error}</div>}

        <form onSubmit={handleSubmit} className="vfm-form">
          <div className="vfm-row">
            <div className="vfm-field">
              <label htmlFor="vf-plate">License Plate *</label>
              <input id="vf-plate" name="licensePlate" value={form.licensePlate} onChange={handleChange} placeholder="MH 00 AB 1234" />
            </div>
            <div className="vfm-field">
              <label htmlFor="vf-type">Type *</label>
              <select id="vf-type" name="vehicleType" value={form.vehicleType} onChange={handleChange}>
                <option value="" disabled>Select type</option>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="vfm-row">
            <div className="vfm-field">
              <label htmlFor="vf-make">Make *</label>
              <input id="vf-make" name="make" value={form.make} onChange={handleChange} placeholder="Tata" />
            </div>
            <div className="vfm-field">
              <label htmlFor="vf-model">Model *</label>
              <input id="vf-model" name="model" value={form.model} onChange={handleChange} placeholder="Ace Gold" />
            </div>
          </div>

          <div className="vfm-row">
            <div className="vfm-field">
              <label htmlFor="vf-year">Year *</label>
              <input id="vf-year" name="year" type="number" value={form.year} onChange={handleChange} placeholder="2024" />
            </div>
            <div className="vfm-field">
              <label htmlFor="vf-vin">VIN</label>
              <input id="vf-vin" name="vin" value={form.vin} onChange={handleChange} placeholder="Optional" />
            </div>
          </div>

          <div className="vfm-row">
            <div className="vfm-field">
              <label htmlFor="vf-maxload">Max Load (kg) *</label>
              <input id="vf-maxload" name="maxLoadKg" type="number" step="0.01" value={form.maxLoadKg} onChange={handleChange} placeholder="5000" />
            </div>
            <div className="vfm-field">
              <label htmlFor="vf-cost">Acquisition Cost *</label>
              <input id="vf-cost" name="acquisitionCost" type="number" step="0.01" value={form.acquisitionCost} onChange={handleChange} placeholder="750000" />
            </div>
          </div>

          <div className="vfm-row">
            <div className="vfm-field">
              <label htmlFor="vf-date">Acquisition Date</label>
              <input id="vf-date" name="acquisitionDate" type="date" value={form.acquisitionDate} onChange={handleChange} />
            </div>
            {isEdit && (
              <div className="vfm-field">
                <label htmlFor="vf-odo">Odometer (km)</label>
                <input id="vf-odo" name="odometerKm" type="number" step="0.01" value={form.odometerKm} onChange={handleChange} />
              </div>
            )}
          </div>

          {isEdit && allowedStatuses.length > 0 && (
            <div className="vfm-row">
              <div className="vfm-field">
                <label htmlFor="vf-status">Status</label>
                <select id="vf-status" name="status" value={form.status} onChange={handleChange}>
                  {allowedStatuses.map((s) => (
                    <option key={s} value={s}>
                      {VEHICLE_STATUSES.find((vs) => vs.value === s)?.label || s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="vfm-field" />
            </div>
          )}

          <div className="vfm-actions">
            <button type="button" className="vfm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="vfm-btn-save" disabled={submitting}>
              {submitting ? <span className="spinner" /> : isEdit ? "Save Changes" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
