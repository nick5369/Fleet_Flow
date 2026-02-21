import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./DriverFormModal.css";

const LICENSE_CATEGORIES = [
  { value: "TRUCK", label: "Truck" },
  { value: "VAN", label: "Van" },
  { value: "BIKE", label: "Bike" },
];

const DRIVER_STATUSES = [
  { value: "ON_DUTY", label: "On Duty" },
  { value: "OFF_DUTY", label: "Off Duty" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "ON_TRIP", label: "On Trip" },
];

const STATUS_TRANSITIONS = {
  OFF_DUTY: ["ON_DUTY", "SUSPENDED"],
  ON_DUTY: ["OFF_DUTY", "ON_TRIP", "SUSPENDED"],
  ON_TRIP: ["ON_DUTY"],
  SUSPENDED: ["OFF_DUTY"],
};

const EMPTY_FORM = {
  employeeId: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  licenseNumber: "",
  licenseCategory: "",
  licenseExpiryDate: "",
  hireDate: "",
  safetyScore: "",
  status: "",
};

export default function DriverFormModal({
  driver,
  onClose,
  onSubmit,
  isManager,
  isSafetyOfficer,
}) {
  const isEdit = Boolean(driver);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (driver) {
      setForm({
        employeeId: driver.employeeId || "",
        firstName: driver.firstName || "",
        lastName: driver.lastName || "",
        phone: driver.phone || "",
        email: driver.email || "",
        licenseNumber: driver.licenseNumber || "",
        licenseCategory: driver.licenseCategory || "",
        licenseExpiryDate: driver.licenseExpiryDate
          ? driver.licenseExpiryDate.split("T")[0]
          : "",
        hireDate: driver.hireDate ? driver.hireDate.split("T")[0] : "",
        safetyScore: driver.safetyScore ?? "",
        status: driver.status || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [driver]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (isManager && !isEdit) {
      if (
        !form.employeeId ||
        !form.firstName ||
        !form.lastName ||
        !form.phone ||
        !form.email ||
        !form.licenseNumber ||
        !form.licenseCategory ||
        !form.licenseExpiryDate
      ) {
        setError("Please fill all required fields");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setError("Please enter a valid email address");
        return;
      }
    }

    if (form.safetyScore !== "" && form.safetyScore !== undefined) {
      const score = Number(form.safetyScore);
      if (isNaN(score) || score < 0 || score > 100) {
        setError("Safety score must be between 0 and 100");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {};

      if (isEdit) {
        if (isManager) {
          if (form.employeeId !== driver.employeeId)
            payload.employeeId = form.employeeId;
          if (form.firstName !== driver.firstName)
            payload.firstName = form.firstName;
          if (form.lastName !== driver.lastName)
            payload.lastName = form.lastName;
          if (form.phone !== driver.phone) payload.phone = form.phone;
          if (form.email !== driver.email) payload.email = form.email;
          if (form.licenseNumber !== driver.licenseNumber)
            payload.licenseNumber = form.licenseNumber;
          if (form.licenseCategory !== driver.licenseCategory)
            payload.licenseCategory = form.licenseCategory;
          if (
            form.licenseExpiryDate !==
            (driver.licenseExpiryDate
              ? driver.licenseExpiryDate.split("T")[0]
              : "")
          ) {
            payload.licenseExpiryDate = form.licenseExpiryDate || null;
          }
          if (
            form.hireDate !==
            (driver.hireDate ? driver.hireDate.split("T")[0] : "")
          ) {
            payload.hireDate = form.hireDate || null;
          }
        }

        if (
          form.safetyScore !== "" &&
          Number(form.safetyScore) !== Number(driver.safetyScore)
        ) {
          payload.safetyScore = Number(form.safetyScore);
        }

        if (form.status && form.status !== driver.status) {
          payload.status = form.status;
        }

        if (Object.keys(payload).length === 0) {
          setError("No changes detected");
          setSubmitting(false);
          return;
        }
      } else {
        payload.employeeId = form.employeeId;
        payload.firstName = form.firstName;
        payload.lastName = form.lastName;
        payload.phone = form.phone;
        payload.email = form.email;
        payload.licenseNumber = form.licenseNumber;
        payload.licenseCategory = form.licenseCategory;
        payload.licenseExpiryDate = form.licenseExpiryDate;
        if (form.hireDate) payload.hireDate = form.hireDate;
      }

      await onSubmit(payload, driver?.id);
    } catch (err) {
      setError(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  }

  const allowedStatuses = isEdit
    ? [driver.status, ...(STATUS_TRANSITIONS[driver.status] || [])]
    : [];

  return (
    <div className="dfm-overlay" onClick={onClose}>
      <div className="dfm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dfm-header">
          <h2>{isEdit ? "Edit Driver" : "Add New Driver"}</h2>
          <button className="dfm-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="dfm-error">{error}</div>}

        <form onSubmit={handleSubmit} className="dfm-form">
          {isManager && (
            <>
              <div className="dfm-row">
                <div className="dfm-field">
                  <label htmlFor="df-empid">Employee ID *</label>
                  <input
                    id="df-empid"
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    placeholder="EMP-001"
                    disabled={isEdit && !isManager}
                  />
                </div>
                <div className="dfm-field">
                  <label htmlFor="df-email">Email *</label>
                  <input
                    id="df-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="driver@company.com"
                  />
                </div>
              </div>

              <div className="dfm-row">
                <div className="dfm-field">
                  <label htmlFor="df-fname">First Name *</label>
                  <input
                    id="df-fname"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                  />
                </div>
                <div className="dfm-field">
                  <label htmlFor="df-lname">Last Name *</label>
                  <input
                    id="df-lname"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="dfm-row">
                <div className="dfm-field">
                  <label htmlFor="df-phone">Phone *</label>
                  <input
                    id="df-phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="dfm-field">
                  <label htmlFor="df-license">License Number *</label>
                  <input
                    id="df-license"
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    placeholder="DL-1234567890"
                  />
                </div>
              </div>

              <div className="dfm-row">
                <div className="dfm-field">
                  <label htmlFor="df-category">License Category *</label>
                  <select
                    id="df-category"
                    name="licenseCategory"
                    value={form.licenseCategory}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {LICENSE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="dfm-field">
                  <label htmlFor="df-expiry">License Expiry *</label>
                  <input
                    id="df-expiry"
                    name="licenseExpiryDate"
                    type="date"
                    value={form.licenseExpiryDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="dfm-row">
                <div className="dfm-field">
                  <label htmlFor="df-hire">Hire Date</label>
                  <input
                    id="df-hire"
                    name="hireDate"
                    type="date"
                    value={form.hireDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="dfm-field" />
              </div>
            </>
          )}

          {(isManager || isSafetyOfficer) && (
            <div className="dfm-row">
              <div className="dfm-field">
                <label htmlFor="df-score">Safety Score (0-100)</label>
                <input
                  id="df-score"
                  name="safetyScore"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.safetyScore}
                  onChange={handleChange}
                  placeholder="100.00"
                />
              </div>
              {isEdit && allowedStatuses.length > 0 && (
                <div className="dfm-field">
                  <label htmlFor="df-status">Status</label>
                  <select
                    id="df-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {allowedStatuses.map((s) => (
                      <option key={s} value={s}>
                        {DRIVER_STATUSES.find((ds) => ds.value === s)?.label ||
                          s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {(!isEdit || !allowedStatuses.length) && (
                <div className="dfm-field" />
              )}
            </div>
          )}

          <div className="dfm-actions">
            <button type="button" className="dfm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="dfm-btn-save"
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Driver"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
