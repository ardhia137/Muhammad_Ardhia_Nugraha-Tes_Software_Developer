import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from "../status";
import type { Entity } from "../types";

interface DetailPanelProps {
  entity: Entity;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function DetailPanel({ entity, onEdit, onDelete, onClose }: DetailPanelProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Detail Entity</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Tutup">
          ×
        </button>
      </header>

      <div className="panel-body">
        <h3>{entity.name}</h3>

        <dl className="detail-grid">
          <dt>Type</dt>
          <dd>{TYPE_LABELS[entity.type]}</dd>

          <dt>Status</dt>
          <dd>
            <span className="status-badge" style={{ background: STATUS_COLORS[entity.status] }}>
              {STATUS_LABELS[entity.status]}
            </span>
          </dd>

          <dt>Latitude</dt>
          <dd>{entity.latitude}</dd>

          <dt>Longitude</dt>
          <dd>{entity.longitude}</dd>

          <dt>Deskripsi</dt>
          <dd>{entity.description || <span className="muted">-</span>}</dd>

          <dt>Dibuat</dt>
          <dd>{formatDate(entity.created_at)}</dd>

          <dt>Diperbarui</dt>
          <dd>{formatDate(entity.updated_at)}</dd>
        </dl>
      </div>

      <footer className="panel-footer">
        <button type="button" className="button button--primary" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="button button--danger" onClick={onDelete}>
          Hapus
        </button>
      </footer>
    </section>
  );
}
