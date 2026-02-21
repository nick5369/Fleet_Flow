import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { maintenanceAPI, vehicleAPI } from "../../services/api";
import {
  Plus,
  Eye,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  Wrench,
} from "lucide-react";
import MaintenanceToolbar from "./MaintenanceToolbar";
import MaintenanceTable from "./MaintenanceTable";
import MaintenanceFormModal from "./MaintenanceFormModal";
import MaintenanceDetailModal from "./MaintenanceDetailModal";
import MaintenanceStatusPill from "./MaintenanceStatusPill";
import PriorityPill from "./PriorityPill";
import "./MaintenancePage.css";

const WRITE_ROLES = ["MANAGER"];

const TYPE_LABELS = {
  PREVENTIVE: "Preventive",
  CORRECTIVE: "Corrective",
  INSPECTION: "Inspection",
  TIRE_CHANGE: "Tire Change",
  OTHER: "Other",
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const canWrite = WRITE_ROLES.includes(user?.role);

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [detailLog, setDetailLog] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      if (filterPriority) params.priority = filterPriority;
      const res = await maintenanceAPI.list(params);
      setLogs(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load maintenance logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterType, filterPriority]);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await vehicleAPI.list({ limit: 100 });
      setVehicles(res.data || []);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterType, filterPriority]);

  const filtered = search
    ? logs.filter((l) => {
        const term = search.toLowerCase();
        return (
          l.description?.toLowerCase().includes(term) ||
          l.vendorName?.toLowerCase().includes(term) ||
          l.invoiceNumber?.toLowerCase().includes(term) ||
          l.id?.toLowerCase().includes(term)
        );
      })
    : logs;

  function getVehicleLabel(id) {
    const v = vehicles.find((v) => v.id === id);
    return v ? `${v.licensePlate} (${v.make} ${v.model})` : id?.slice(0, 8);
  }

  async function viewDetail(log) {
    setDetailLoading(true);
    try {
      const res = await maintenanceAPI.getById(log.id);
      setDetailLog(res.data);
    } catch {
      setDetailLog(log);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreate(payload) {
    await maintenanceAPI.create(payload);
    setCreateOpen(false);
    fetchLogs();
    fetchVehicles();
  }

  async function handleUpdate(payload) {
    await maintenanceAPI.update(editLog.id, payload);
    setEditLog(null);
    fetchLogs();
    fetchVehicles();
  }

  async function handleStart(log) {
    try {
      await maintenanceAPI.start(log.id);
      fetchLogs();
    } catch (err) {
      setError(err.message || "Failed to start maintenance");
    }
  }

  async function handleComplete(log) {
    try {
      await maintenanceAPI.complete(log.id, {});
      fetchLogs();
      fetchVehicles();
    } catch (err) {
      setError(err.message || "Failed to complete maintenance");
    }
  }

  async function handleCancel(log) {
    try {
      await maintenanceAPI.cancel(log.id);
      fetchLogs();
      fetchVehicles();
    } catch (err) {
      setError(err.message || "Failed to cancel maintenance");
    }
  }

  function formatCost(labor, parts) {
    const t = (Number(labor) || 0) + (Number(parts) || 0);
    return t > 0 ? `$${t.toLocaleString()}` : "-";
  }

  return (
    <div className="mp-container">
      <div className="mp-header">
        <div>
          <h1 className="mp-title">Maintenance & Service Logs</h1>
          <p className="mp-subtitle">Track fleet health and repair history</p>
        </div>
        {canWrite && (
          <button className="mp-add-btn" onClick={() => setCreateOpen(true)}>
            <Plus size={18} />
            Schedule Maintenance
          </button>
        )}
      </div>

      <MaintenanceToolbar
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterPriority={filterPriority}
        onFilterPriorityChange={setFilterPriority}
      />

      {error && <div className="mp-error">{error}</div>}

      <div className="mp-desktop-table">
        <MaintenanceTable
          logs={filtered}
          loading={loading}
          pagination={{ page, totalPages, total, limit: 10 }}
          onPageChange={setPage}
          onView={viewDetail}
          onEdit={canWrite ? (l) => setEditLog(l) : null}
          onStart={canWrite ? handleStart : null}
          onComplete={canWrite ? handleComplete : null}
          onCancel={canWrite ? handleCancel : null}
          getVehicleLabel={getVehicleLabel}
          canWrite={canWrite}
        />
      </div>

      <div className="mp-cards">
        {loading && (
          <div className="mnt-empty">
            <span className="spinner" />
          </div>
        )}
        {!loading && !filtered.length && (
          <div className="mnt-empty">No maintenance logs found.</div>
        )}
        {!loading &&
          filtered.map((l) => (
            <div key={l.id} className="mp-card">
              <div className="mp-card-header">
                <span className="mp-card-id">{l.id.slice(0, 8)}</span>
                <MaintenanceStatusPill status={l.status} />
              </div>
              <div className="mp-card-body">
                <div>
                  <div className="mp-card-label">Vehicle</div>
                  <div className="mp-card-value">
                    {getVehicleLabel(l.vehicleId)}
                  </div>
                </div>
                <div>
                  <div className="mp-card-label">Type</div>
                  <div className="mp-card-value">
                    {TYPE_LABELS[l.type] || l.type}
                  </div>
                </div>
                <div>
                  <div className="mp-card-label">Priority</div>
                  <div className="mp-card-value">
                    <PriorityPill priority={l.priority} />
                  </div>
                </div>
                <div>
                  <div className="mp-card-label">Cost</div>
                  <div className="mp-card-value">
                    {formatCost(l.laborCost, l.partsCost)}
                  </div>
                </div>
                <div className="mp-card-desc">
                  <div className="mp-card-label">Description</div>
                  <div className="mp-card-value">{l.description}</div>
                </div>
              </div>
              <div className="mp-card-actions">
                <button onClick={() => viewDetail(l)}>
                  <Eye size={14} /> View
                </button>
                {canWrite &&
                  (l.status === "SCHEDULED" || l.status === "IN_PROGRESS") && (
                    <button onClick={() => setEditLog(l)}>
                      <Edit size={14} /> Edit
                    </button>
                  )}
                {canWrite && l.status === "SCHEDULED" && (
                  <button
                    className="mp-card-start-btn"
                    onClick={() => handleStart(l)}
                  >
                    <Play size={14} /> Start
                  </button>
                )}
                {canWrite && l.status === "IN_PROGRESS" && (
                  <button onClick={() => handleComplete(l)}>
                    <CheckCircle size={14} /> Complete
                  </button>
                )}
                {canWrite &&
                  (l.status === "SCHEDULED" || l.status === "IN_PROGRESS") && (
                    <button onClick={() => handleCancel(l)}>
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
              </div>
            </div>
          ))}
      </div>

      {createOpen && (
        <MaintenanceFormModal
          vehicles={vehicles}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {editLog && (
        <MaintenanceFormModal
          vehicles={vehicles}
          log={editLog}
          onClose={() => setEditLog(null)}
          onSubmit={handleUpdate}
        />
      )}

      {(detailLog || detailLoading) && (
        <MaintenanceDetailModal
          log={detailLog}
          loading={detailLoading}
          onClose={() => setDetailLog(null)}
          getVehicleLabel={getVehicleLabel}
          canWrite={canWrite}
          onRefresh={fetchLogs}
        />
      )}
    </div>
  );
}
