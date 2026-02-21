import { Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import DriverStatusPill from "./DriverStatusPill";
import CompliancePill from "./CompliancePill";
import "./DriverTable.css";

const CATEGORY_LABELS = { TRUCK: "Truck", VAN: "Van", BIKE: "Bike" };

export default function DriverTable({
  drivers,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onView,
  canEdit,
  isLicenseExpired,
  isEligible,
}) {
  if (loading) {
    return (
      <div className="drt-empty">
        <span className="spinner" />
      </div>
    );
  }

  if (!drivers.length) {
    return <div className="drt-empty">No drivers found.</div>;
  }

  return (
    <div className="drt-wrapper">
      <div className="drt-scroll">
        <table className="drt-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Employee ID</th>
              <th>License Category</th>
              <th>License Expiry</th>
              <th>Safety Score</th>
              <th>Status</th>
              <th>Compliance</th>
              <th>Eligible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const expired = isLicenseExpired(d.licenseExpiryDate);
              const eligible = isEligible(d);
              return (
                <tr key={d.id}>
                  <td className="drt-name">
                    {d.firstName} {d.lastName}
                  </td>
                  <td className="drt-emp-id">{d.employeeId}</td>
                  <td>
                    {CATEGORY_LABELS[d.licenseCategory] || d.licenseCategory}
                  </td>
                  <td
                    className={`drt-date ${expired ? "drt-date--expired" : ""}`}
                  >
                    {d.licenseExpiryDate
                      ? new Date(d.licenseExpiryDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="drt-score">
                    {Number(d.safetyScore).toFixed(1)}
                  </td>
                  <td>
                    <DriverStatusPill status={d.status} />
                  </td>
                  <td>
                    <CompliancePill expired={expired} />
                  </td>
                  <td>
                    <span
                      className={`drt-eligible ${eligible ? "drt-eligible--yes" : "drt-eligible--no"}`}
                    >
                      {eligible ? "Eligible" : "Not Eligible"}
                    </span>
                  </td>
                  <td>
                    <div className="drt-actions">
                      <button
                        className="drt-action-btn"
                        onClick={() => onView(d)}
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      {canEdit && onEdit && (
                        <button
                          className="drt-action-btn"
                          onClick={() => onEdit(d)}
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="drt-pagination">
          <span className="drt-page-info">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </span>
          <div className="drt-page-btns">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
