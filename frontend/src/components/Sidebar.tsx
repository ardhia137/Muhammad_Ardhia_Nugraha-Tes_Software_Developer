import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from "../status";
import { ENTITY_STATUSES, ENTITY_TYPES } from "../types";
import type { Entity, EntityStatus, EntityType } from "../types";

interface Filters {
  q: string;
  status: string;
  type: string;
}

interface SidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  entities: Entity[];
  isLoading: boolean;
  loadError: string | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreate: () => void;
}

export default function Sidebar({
  filters,
  onFiltersChange,
  entities,
  isLoading,
  loadError,
  selectedId,
  onSelect,
  onCreate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Entity Geo-Lokasi</h1>
        <button type="button" className="button button--primary" onClick={onCreate}>
          + Tambah
        </button>
      </div>

      <div className="sidebar-filters">
        <input
          type="search"
          placeholder="Cari nama..."
          value={filters.q}
          onChange={(event) => onFiltersChange({ ...filters, q: event.target.value })}
        />
        <div className="filter-row">
          <select
            value={filters.status}
            onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}
          >
            <option value="">Semua status</option>
            {ENTITY_STATUSES.map((status: EntityStatus) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(event) => onFiltersChange({ ...filters, type: event.target.value })}
          >
            <option value="">Semua type</option>
            {ENTITY_TYPES.map((type: EntityType) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sidebar-list">
        {isLoading && <p className="muted">Memuat...</p>}
        {loadError && <p className="field-error">{loadError}</p>}
        {!isLoading && !loadError && entities.length === 0 && (
          <p className="muted">Tidak ada entity yang cocok.</p>
        )}
        <ul>
          {entities.map((entity) => (
            <li key={entity.id}>
              <button
                type="button"
                className={`list-item${selectedId === entity.id ? " list-item--selected" : ""}`}
                onClick={() => onSelect(entity.id)}
              >
                <span
                  className="status-dot"
                  style={{ background: STATUS_COLORS[entity.status] }}
                />
                <span className="list-item-body">
                  <span className="list-item-name">{entity.name}</span>
                  <span className="list-item-meta">
                    {TYPE_LABELS[entity.type]} · {STATUS_LABELS[entity.status]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
