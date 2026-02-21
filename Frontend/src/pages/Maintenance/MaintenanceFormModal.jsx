import { useState, useMemo } from "react";
import { X } from "lucide-react";
import "./MaintenanceFormModal.css";

const TYPES = [
  { value: "PREVENTIVE", label: "Preventive" },
  { value: "CORRECTIVE", label: "Corrective" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "TIRE_CHANGE", label: "Tire Change" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

function buildInitial(log) {
  if (!log) {
    return {
      vehicleId: "",
      type: "",
      priority: "MEDIUM",
      description: "",
      scheduledDate: "",
      odometerAtServiceKm: "",
      laborCost: "",
      partsCost: "",
      vendorName: "",
      invoiceNumber: "",
      notes: "",
    };
  }
  return {
    vehicleId: log.vehicleId || "",
    type: log.type || "",
    priority: log.priority || "MEDIUM",
    description: log.description || "",
    scheduledDate: log.scheduledDate
      ? new Date(log.scheduledDate).toISOString().slice(0, 10)
      : "",
    odometerAtServiceKm:
      log.odometerAtServiceKm != null ? String(log.odometerAtServiceKm) : "",
    laborCost: log.laborCost != null ? String(log.laborCost) : "",
    partsCost: log.partsCost != null ? String(log.partsCost) : "",
    vendorName: log.vendorName || "",
    invoiceNumber: log.invoiceNumber || "",
    notes: log.notes || "",
  };
}

export default function MaintenanceFormModal({
  vehicles,
  log,
  onClose,
  onSubmit,
}) {
  const isEdit = !!log;
  const [form, setForm] = useState(() => buildInitial(log));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const eligibleVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => v.status === "AVAILABLE" || v.status === "IN_SHOP",
      ),
    [vehicles],
  );

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isEdit && !form.vehicleId) {
      setError("Please select a vehicle");
      return;
    }
    if (!form.type) {
      setError("Service type is required");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!form.scheduledDate) {
      setError("Scheduled date is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {};

      if (!isEdit) {
        payload.vehicleId = form.vehicleId;
      }

      payload.type = form.type;
      payload.priority = form.priority;
      payload.description = form.description.trim();
      payload.scheduledDate = new Date(form.scheduledDate).toISOString();

      if (form.odometerAtServiceKm !== "") {
        payload.odometerAtServiceKm = Number(form.odometerAtServiceKm);
      }
      if (form.laborCost !== "") {
        payload.laborCost = Number(form.laborCost);
      }
      if (form.partsCost !== "") {
        payload.partsCost = Number(form.partsCost);
      }
      if (form.vendorName.trim()) {
        payload.vendorName = form.vendorName.trim();
      }
      if (form.invoiceNumber.trim()) {
        payload.invoiceNumber = form.invoiceNumber.trim();
      }
      if (form.notes.trim()) {
        payload.notes = form.notes.trim();
      }

      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Failed to save maintenance log");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mfm-overlay" onClick={onClose}>
      <div className="mfm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mfm-header">
          <h2>{isEdit ? "Edit Maintenance Log" : "Schedule Maintenance"}</h2>
          <button className="mfm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="mfm-error">{error}</div>}

        <form onSubmit={handleSubmit} className="mfm-form">
          <div className="mfm-row">
            <div className="mfm-field">
              <label htmlFor="mf-vehicle">Vehicle {!isEdit && "*"}</label>
              {isEdit ? (
                <input
                  id="mf-vehicle"
                  value={
                    vehicles.find((v) => v.id === form.vehicleId)
                      ? `${vehicles.find((v) => v.id === form.vehicleId).licensePlate} - ${vehicles.find((v) => v.id === form.vehicleId).make} ${vehicles.find((v) => v.id === form.vehicleId).model}`
                      : form.vehicleId.slice(0, 8)
                  }
                  disabled
                />
              ) : (
                <select
                  id="mf-vehicle"
                  name="vehicleId"
                  value={form.vehicleId}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select vehicle
                  </option>
                  {eligibleVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} - {v.make} {v.model}
                    </option>
                  ))}
                </select>
              )}
              {!isEdit && !eligibleVehicles.length && (
                <span className="mfm-hint">No eligible vehicles</span>
              )}
            </div>
            <div className="mfm-field">
              <label htmlFor="mf-type">Service Type *</label>
              <select
                id="mf-type"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select type
                </option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mfm-row">
            <div className="mfm-field">
              <label htmlFor="mf-priority">Priority</label>
              <select
                id="mf-priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mfm-field">
              <label htmlFor="mf-scheduled">Scheduled Date *</label>
              <input
                id="mf-scheduled"
                name="scheduledDate"
                type="date"
                value={form.scheduledDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mfm-field mfm-field--full">
            <label htmlFor="mf-desc">Description *</label>
            <textarea
              id="mf-desc"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the maintenance work"
            />
          </div>

          <div className="mfm-row">
            <div className="mfm-field">
              <label htmlFor="mf-odometer">Odometer (km)</label>
              <input
                id="mf-odometer"
                name="odometerAtServiceKm"
                type="number"
                min="0"
                step="1"
                value={form.odometerAtServiceKm}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="mfm-field">
              <label htmlFor="mf-vendor">Vendor Name</label>
              <input
                id="mf-vendor"
                name="vendorName"
                value={form.vendorName}
                onChange={handleChange}
                placeholder="Service provider"
              />
            </div>
          </div>

          <div className="mfm-row">
            <div className="mfm-field">
              <label htmlFor="mf-labor">Labor Cost ($)</label>
              <input
                id="mf-labor"
                name="laborCost"
                type="number"
                min="0"
                step="0.01"
                value={form.laborCost}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="mfm-field">
              <label htmlFor="mf-parts">Parts Cost ($)</label>
              <input
                id="mf-parts"
                name="partsCost"
                type="number"
                min="0"
                step="0.01"
                value={form.partsCost}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mfm-field mfm-field--full">
            <label htmlFor="mf-invoice">Invoice Number</label>
            <input
              id="mf-invoice"
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleChange}
              placeholder="Optional invoice reference"
            />
          </div>

          <div className="mfm-field mfm-field--full">
            <label htmlFor="mf-notes">Notes</label>
            <textarea
              id="mf-notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Optional notes"
            />
          </div>

          <div className="mfm-actions">
            <button type="button" className="mfm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="mfm-btn-save"
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner" />
              ) : isEdit ? (
                "Update Log"
              ) : (
                "Schedule Maintenance"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
