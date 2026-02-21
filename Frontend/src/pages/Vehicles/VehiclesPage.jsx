import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { vehicleAPI } from "../../services/api";
import { Plus } from "lucide-react";
import VehicleToolbar from "./VehicleToolbar";
import VehicleTable from "./VehicleTable";
import VehicleFormModal from "./VehicleFormModal";
import VehicleDetailModal from "./VehicleDetailModal";
import "./VehiclesPage.css";

export default function VehiclesPage() {
  const { user } = useAuth();
  const isManager = user?.role === "MANAGER";

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10, sortBy: sortField, sortOrder: "desc" };
      if (filterType) params.vehicleType = filterType;
      if (filterStatus) params.status = filterStatus;
      const data = await vehicleAPI.list(params);
      setVehicles(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load vehicles");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterStatus, sortField]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    setPage(1);
  }, [filterType, filterStatus, sortField]);

  const filtered = search
    ? vehicles.filter((v) => {
        const term = search.toLowerCase();
        return (
          v.licensePlate?.toLowerCase().includes(term) ||
          v.make?.toLowerCase().includes(term) ||
          v.model?.toLowerCase().includes(term)
        );
      })
    : vehicles;

  function openCreate() {
    setEditVehicle(null);
    setModalOpen(true);
  }

  async function openEdit(vehicle) {
    try {
      const res = await vehicleAPI.getById(vehicle.id);
      setEditVehicle(res.data);
    } catch {
      setEditVehicle(vehicle);
    }
    setModalOpen(true);
  }

  async function viewDetail(vehicle) {
    setDetailLoading(true);
    try {
      const res = await vehicleAPI.getById(vehicle.id);
      setDetailVehicle(res.data);
    } catch {
      setDetailVehicle(vehicle);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setEditVehicle(null);
  }

  function closeDetail() {
    setDetailVehicle(null);
  }

  async function handleSubmit(payload, vehicleId) {
    if (vehicleId) {
      await vehicleAPI.update(vehicleId, payload);
    } else {
      await vehicleAPI.create(payload);
    }
    closeModal();
    fetchVehicles();
  }

  return (
    <div className="vp-container">
      <div className="vp-header">
        <div>
          <h1 className="vp-title">Vehicles</h1>
          <p className="vp-subtitle">Manage your fleet inventory</p>
        </div>
        {isManager && (
          <button className="vp-add-btn" onClick={openCreate}>
            <Plus size={18} />
            New Vehicle
          </button>
        )}
      </div>

      <VehicleToolbar
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        sortField={sortField}
        onSortFieldChange={setSortField}
      />

      {error && <div className="vp-error">{error}</div>}

      <VehicleTable
        vehicles={filtered}
        loading={loading}
        pagination={{ page, totalPages, total: filtered.length, limit: 10 }}
        onPageChange={setPage}
        onEdit={openEdit}
        onView={viewDetail}
        isManager={isManager}
      />

      {modalOpen && (
        <VehicleFormModal
          vehicle={editVehicle}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}

      {(detailVehicle || detailLoading) && (
        <VehicleDetailModal
          vehicle={detailVehicle}
          loading={detailLoading}
          onClose={closeDetail}
          onEdit={isManager ? (v) => { closeDetail(); openEdit(v); } : null}
        />
      )}
    </div>
  );
}
