import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { driverAPI } from "../../services/api";
import { Plus, Eye, Edit } from "lucide-react";
import DriverToolbar from "./DriverToolbar";
import DriverTable from "./DriverTable";
import DriverFormModal from "./DriverFormModal";
import DriverDetailModal from "./DriverDetailModal";
import DriverStatusPill from "./DriverStatusPill";
import CompliancePill from "./CompliancePill";
import "./DriversPage.css";

function isLicenseExpired(expiryDate) {
  if (!expiryDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry < today;
}

function isEligible(driver) {
  return (
    driver.status === "ON_DUTY" && !isLicenseExpired(driver.licenseExpiryDate)
  );
}

export default function DriversPage() {
  const { user } = useAuth();
  const isManager = user?.role === "MANAGER";
  const isSafetyOfficer = user?.role === "SAFETY_OFFICER";
  const canEdit = isManager || isSafetyOfficer;

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [detailDriver, setDetailDriver] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.licenseCategory = filterCategory;
      const res = await driverAPI.list(params);
      setDrivers(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load drivers");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterCategory]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterCategory]);

  const filtered = search
    ? drivers.filter((d) => {
        const term = search.toLowerCase();
        return (
          d.firstName?.toLowerCase().includes(term) ||
          d.lastName?.toLowerCase().includes(term) ||
          d.employeeId?.toLowerCase().includes(term) ||
          d.email?.toLowerCase().includes(term) ||
          d.licenseNumber?.toLowerCase().includes(term)
        );
      })
    : drivers;

  function openCreate() {
    setEditDriver(null);
    setModalOpen(true);
  }

  async function openEdit(driver) {
    try {
      const res = await driverAPI.getById(driver.id);
      setEditDriver(res.data);
    } catch {
      setEditDriver(driver);
    }
    setModalOpen(true);
  }

  async function viewDetail(driver) {
    setDetailLoading(true);
    try {
      const res = await driverAPI.getById(driver.id);
      setDetailDriver(res.data);
    } catch {
      setDetailDriver(driver);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setEditDriver(null);
  }

  function closeDetail() {
    setDetailDriver(null);
  }

  async function handleSubmit(payload, driverId) {
    if (driverId) {
      await driverAPI.update(driverId, payload);
    } else {
      await driverAPI.create(payload);
    }
    closeModal();
    fetchDrivers();
  }

  return (
    <div className="dp-container">
      <div className="dp-header">
        <div>
          <h1 className="dp-title">Driver Management</h1>
          <p className="dp-subtitle">Monitor compliance and performance</p>
        </div>
        {isManager && (
          <button className="dp-add-btn" onClick={openCreate}>
            <Plus size={18} />
            Add Driver
          </button>
        )}
      </div>

      <DriverToolbar
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
      />

      {error && <div className="dp-error">{error}</div>}

      <div className="dp-desktop-table">
        <DriverTable
          drivers={filtered}
          loading={loading}
          pagination={{ page, totalPages, total, limit: 10 }}
          onPageChange={setPage}
          onEdit={canEdit ? openEdit : null}
          onView={viewDetail}
          canEdit={canEdit}
          isLicenseExpired={isLicenseExpired}
          isEligible={isEligible}
        />
      </div>

      <div className="dp-cards">
        {loading && (
          <div className="vt-empty">
            <span className="spinner" />
          </div>
        )}
        {!loading && !filtered.length && (
          <div className="vt-empty">No drivers found.</div>
        )}
        {!loading &&
          filtered.map((d) => (
            <div key={d.id} className="dp-card">
              <div className="dp-card-header">
                <span className="dp-card-name">
                  {d.firstName} {d.lastName}
                </span>
                <DriverStatusPill status={d.status} />
              </div>
              <div className="dp-card-body">
                <div>
                  <div className="dp-card-label">Employee ID</div>
                  <div className="dp-card-value">{d.employeeId}</div>
                </div>
                <div>
                  <div className="dp-card-label">License</div>
                  <div className="dp-card-value">{d.licenseCategory}</div>
                </div>
                <div>
                  <div className="dp-card-label">Safety Score</div>
                  <div className="dp-card-value">
                    {Number(d.safetyScore).toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="dp-card-label">Compliance</div>
                  <div className="dp-card-value">
                    <CompliancePill
                      expired={isLicenseExpired(d.licenseExpiryDate)}
                    />
                  </div>
                </div>
                <div>
                  <div className="dp-card-label">Eligible</div>
                  <div className="dp-card-value">
                    {isEligible(d) ? "Eligible" : "Not Eligible"}
                  </div>
                </div>
                <div>
                  <div className="dp-card-label">License Expiry</div>
                  <div className="dp-card-value">
                    {d.licenseExpiryDate
                      ? new Date(d.licenseExpiryDate).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              </div>
              <div className="dp-card-actions">
                <button onClick={() => viewDetail(d)}>
                  <Eye size={14} /> View
                </button>
                {canEdit && (
                  <button onClick={() => openEdit(d)}>
                    <Edit size={14} /> Edit
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {modalOpen && (
        <DriverFormModal
          driver={editDriver}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isManager={isManager}
          isSafetyOfficer={isSafetyOfficer}
        />
      )}

      {(detailDriver || detailLoading) && (
        <DriverDetailModal
          driver={detailDriver}
          loading={detailLoading}
          onClose={closeDetail}
          onEdit={
            canEdit
              ? (d) => {
                  closeDetail();
                  openEdit(d);
                }
              : null
          }
          isLicenseExpired={isLicenseExpired}
          isEligible={isEligible}
        />
      )}
    </div>
  );
}
