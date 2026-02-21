import { X, Edit } from "lucide-react";
import DriverStatusPill from "./DriverStatusPill";
import CompliancePill from "./CompliancePill";
import "./DriverDetailModal.css";

const CATEGORY_LABELS = { TRUCK: "Truck", VAN: "Van", BIKE: "Bike" };

function Row({ label, value }) {
  return (
    <div className="ddm-row">
      <span className="ddm-label">{label}</span>
      <span className="ddm-value">{value ?? "-"}</span>
    </div>
  );
}

export default function DriverDetailModal({
  driver,
  loading,
  onClose,
  onEdit,
  isLicenseExpired,
  isEligible,
}) {
  return (
    <div className="ddm-overlay" onClick={onClose}>
      <div className="ddm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ddm-header">
          <h2>Driver Details</h2>
          <div className="ddm-header-actions">
            {onEdit && driver && (
              <button className="ddm-edit-btn" onClick={() => onEdit(driver)}>
                <Edit size={16} />
                Edit
              </button>
            )}
            <button className="ddm-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {loading || !driver ? (
          <div className="ddm-loading">
            <span className="spinner" />
          </div>
        ) : (
          <div className="ddm-body">
            <div className="ddm-section">
              <h3>Personal</h3>
              <Row
                label="Name"
                value={`${driver.firstName} ${driver.lastName}`}
              />
              <Row label="Employee ID" value={driver.employeeId} />
              <Row label="Email" value={driver.email} />
              <Row label="Phone" value={driver.phone} />
            </div>

            <div className="ddm-section">
              <h3>License</h3>
              <Row label="License Number" value={driver.licenseNumber} />
              <Row
                label="Category"
                value={
                  CATEGORY_LABELS[driver.licenseCategory] ||
                  driver.licenseCategory
                }
              />
              <Row
                label="Expiry Date"
                value={
                  driver.licenseExpiryDate
                    ? new Date(driver.licenseExpiryDate).toLocaleDateString()
                    : null
                }
              />
              <Row
                label="Compliance"
                value={
                  <CompliancePill
                    expired={isLicenseExpired(driver.licenseExpiryDate)}
                  />
                }
              />
            </div>

            <div className="ddm-section">
              <h3>Performance</h3>
              <Row
                label="Status"
                value={<DriverStatusPill status={driver.status} />}
              />
              <Row
                label="Safety Score"
                value={Number(driver.safetyScore).toFixed(1)}
              />
              <Row
                label="Assignment Eligible"
                value={
                  <span
                    className={
                      isEligible(driver)
                        ? "ddm-eligible--yes"
                        : "ddm-eligible--no"
                    }
                  >
                    {isEligible(driver) ? "Eligible" : "Not Eligible"}
                  </span>
                }
              />
            </div>

            <div className="ddm-section">
              <h3>Record</h3>
              <Row
                label="Hire Date"
                value={
                  driver.hireDate
                    ? new Date(driver.hireDate).toLocaleDateString()
                    : null
                }
              />
              <Row
                label="Created"
                value={new Date(driver.createdAt).toLocaleString()}
              />
              <Row
                label="Updated"
                value={new Date(driver.updatedAt).toLocaleString()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
