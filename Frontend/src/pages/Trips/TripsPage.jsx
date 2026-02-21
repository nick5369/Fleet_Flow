import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { tripAPI, vehicleAPI, driverAPI } from "../../services/api";
import { Plus, Eye, Send, CheckCircle, XCircle } from "lucide-react";
import TripToolbar from "./TripToolbar";
import TripTable from "./TripTable";
import TripFormModal from "./TripFormModal";
import TripDetailModal from "./TripDetailModal";
import TripCompleteModal from "./TripCompleteModal";
import StatusPill from "./StatusPill";
import "./TripsPage.css";

const WRITE_ROLES = ["MANAGER", "DISPATCHER"];

export default function TripsPage() {
  const { user } = useAuth();
  const canWrite = WRITE_ROLES.includes(user?.role);

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTrip, setDetailTrip] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [completeTrip, setCompleteTrip] = useState(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      const res = await tripAPI.list(params);
      setTrips(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  const fetchResources = useCallback(async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        vehicleAPI.list({ limit: 100 }),
        driverAPI.list({ limit: 100 }),
      ]);
      setVehicles(vRes.data || []);
      setDrivers(dRes.data || []);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  const filtered = search
    ? trips.filter((t) => {
        const term = search.toLowerCase();
        return (
          t.tripNumber?.toLowerCase().includes(term) ||
          t.originAddress?.toLowerCase().includes(term) ||
          t.destinationAddress?.toLowerCase().includes(term)
        );
      })
    : trips;

  function getVehicleLabel(id) {
    const v = vehicles.find((v) => v.id === id);
    return v ? `${v.licensePlate} (${v.make} ${v.model})` : id?.slice(0, 8);
  }

  function getDriverLabel(id) {
    const d = drivers.find((d) => d.id === id);
    return d ? `${d.firstName} ${d.lastName}` : id?.slice(0, 8);
  }

  async function viewDetail(trip) {
    setDetailLoading(true);
    try {
      const res = await tripAPI.getById(trip.id);
      setDetailTrip(res.data);
    } catch {
      setDetailTrip(trip);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreate(payload) {
    await tripAPI.create(payload);
    setCreateOpen(false);
    fetchTrips();
    fetchResources();
  }

  async function handleDispatch(trip) {
    try {
      await tripAPI.dispatch(trip.id);
      fetchTrips();
      fetchResources();
    } catch (err) {
      setError(err.message || "Failed to dispatch trip");
    }
  }

  async function handleComplete(tripId, payload) {
    await tripAPI.complete(tripId, payload);
    setCompleteTrip(null);
    fetchTrips();
    fetchResources();
  }

  async function handleCancel(trip) {
    try {
      await tripAPI.cancel(trip.id);
      fetchTrips();
      fetchResources();
    } catch (err) {
      setError(err.message || "Failed to cancel trip");
    }
  }

  return (
    <div className="tp-container">
      <div className="tp-header">
        <div>
          <h1 className="tp-title">Trip Dispatcher</h1>
          <p className="tp-subtitle">Create and manage trip lifecycle</p>
        </div>
        {canWrite && (
          <button className="tp-add-btn" onClick={() => setCreateOpen(true)}>
            <Plus size={18} />
            Create Trip
          </button>
        )}
      </div>

      <TripToolbar
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />

      {error && <div className="tp-error">{error}</div>}

      <div className="tp-desktop-table">
        <TripTable
          trips={filtered}
          loading={loading}
          pagination={{ page, totalPages, total, limit: 10 }}
          onPageChange={setPage}
          onView={viewDetail}
          onDispatch={canWrite ? handleDispatch : null}
          onComplete={canWrite ? (t) => setCompleteTrip(t) : null}
          onCancel={canWrite ? handleCancel : null}
          getVehicleLabel={getVehicleLabel}
          getDriverLabel={getDriverLabel}
          canWrite={canWrite}
        />
      </div>

      <div className="tp-cards">
        {loading && (
          <div className="vt-empty">
            <span className="spinner" />
          </div>
        )}
        {!loading && !filtered.length && (
          <div className="vt-empty">No trips found.</div>
        )}
        {!loading &&
          filtered.map((t) => (
            <div key={t.id} className="tp-card">
              <div className="tp-card-header">
                <span className="tp-card-trip-number">{t.tripNumber}</span>
                <StatusPill status={t.status} />
              </div>
              <div className="tp-card-body">
                <div>
                  <div className="tp-card-label">Vehicle</div>
                  <div className="tp-card-value">
                    {getVehicleLabel(t.vehicleId)}
                  </div>
                </div>
                <div>
                  <div className="tp-card-label">Driver</div>
                  <div className="tp-card-value">
                    {getDriverLabel(t.driverId)}
                  </div>
                </div>
                <div>
                  <div className="tp-card-label">Cargo</div>
                  <div className="tp-card-value">
                    {Number(t.cargoWeightKg).toLocaleString()} kg
                  </div>
                </div>
                <div>
                  <div className="tp-card-label">Date</div>
                  <div className="tp-card-value">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="tp-card-route">
                  <span>{t.originAddress}</span>
                  <span className="tp-card-route-arrow">→</span>
                  <span>{t.destinationAddress}</span>
                </div>
              </div>
              <div className="tp-card-actions">
                <button onClick={() => viewDetail(t)}>
                  <Eye size={14} /> View
                </button>
                {canWrite && t.status === "DRAFT" && (
                  <button
                    className="tp-card-dispatch-btn"
                    onClick={() => handleDispatch(t)}
                  >
                    <Send size={14} /> Dispatch
                  </button>
                )}
                {canWrite && t.status === "DISPATCHED" && (
                  <button onClick={() => setCompleteTrip(t)}>
                    <CheckCircle size={14} /> Complete
                  </button>
                )}
                {canWrite &&
                  (t.status === "DRAFT" || t.status === "DISPATCHED") && (
                    <button onClick={() => handleCancel(t)}>
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
              </div>
            </div>
          ))}
      </div>

      {createOpen && (
        <TripFormModal
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {(detailTrip || detailLoading) && (
        <TripDetailModal
          trip={detailTrip}
          loading={detailLoading}
          onClose={() => setDetailTrip(null)}
          getVehicleLabel={getVehicleLabel}
          getDriverLabel={getDriverLabel}
        />
      )}

      {completeTrip && (
        <TripCompleteModal
          trip={completeTrip}
          onClose={() => setCompleteTrip(null)}
          onSubmit={handleComplete}
        />
      )}
    </div>
  );
}
