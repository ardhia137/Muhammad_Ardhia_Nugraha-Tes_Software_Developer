import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "./components/ConfirmDialog";
import DetailPanel from "./components/DetailPanel";
import EntityFormPanel from "./components/EntityFormPanel";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import { useEntities, useEntityMutations } from "./hooks";
import type { EntityInput } from "./types";

type Mode = "view" | "create" | "edit";
type Coords = { latitude: number; longitude: number };

export default function App() {
  const [filters, setFilters] = useState({ q: "", status: "", type: "" });
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<Mode>("view");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editEntityId, setEditEntityId] = useState<number | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(filters.q), 300);
    return () => clearTimeout(timer);
  }, [filters.q]);

  const params = { q: search, status: filters.status, type: filters.type };
  const { data, isLoading, error } = useEntities(params);
  const entities = data ?? [];
  const { create, update, remove } = useEntityMutations();

  const selected = useMemo(
    () => entities.find((entity) => entity.id === selectedId) ?? null,
    [entities, selectedId],
  );
  const editEntity = useMemo(
    () => entities.find((entity) => entity.id === editEntityId) ?? null,
    [entities, editEntityId],
  );
  const confirmTarget = useMemo(
    () => entities.find((entity) => entity.id === confirmTargetId) ?? null,
    [entities, confirmTargetId],
  );

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setMode("view");
  };

  const handleMapClick = (latitude: number, longitude: number) => {
    setCoords({ latitude, longitude });
    if (mode === "view") setMode("create");
  };

  const handleCreateClick = () => {
    setCoords(null);
    setMode("create");
  };

  const handleClosePanel = () => {
    setMode("view");
    setCoords(null);
    setEditEntityId(null);
  };

  const handleEdit = () => {
    if (!selected) return;
    setEditEntityId(selected.id);
    setCoords(null);
    setMode("edit");
  };

  const submitCreate = async (input: EntityInput) => {
    const created = await create.mutateAsync(input);
    setMode("view");
    setCoords(null);
    setSelectedId(created.id);
  };

  const submitUpdate = async (input: EntityInput) => {
    if (editEntityId == null) return;
    await update.mutateAsync({ id: editEntityId, input });
    setMode("view");
    setEditEntityId(null);
  };

  const confirmDelete = async () => {
    if (confirmTargetId == null) return;
    await remove.mutateAsync(confirmTargetId);
    setConfirmTargetId(null);
    setSelectedId(null);
    setMode("view");
    setCoords(null);
    setEditEntityId(null);
  };

  let panel: React.ReactNode = null;
  if (mode === "create") {
    panel = (
      <EntityFormPanel
        mode="create"
        entity={null}
        coords={coords}
        submitting={create.isPending}
        onSubmit={submitCreate}
        onClose={handleClosePanel}
      />
    );
  } else if (mode === "edit" && editEntity) {
    panel = (
      <EntityFormPanel
        mode="edit"
        entity={editEntity}
        coords={coords}
        submitting={update.isPending}
        onSubmit={submitUpdate}
        onClose={handleClosePanel}
      />
    );
  } else if (selected) {
    panel = (
      <DetailPanel
        entity={selected}
        onEdit={handleEdit}
        onDelete={() => setConfirmTargetId(selected.id)}
        onClose={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar
        filters={filters}
        onFiltersChange={setFilters}
        entities={entities}
        isLoading={isLoading}
        loadError={error ? "Gagal memuat data." : null}
        selectedId={selectedId}
        onSelect={handleSelect}
        onCreate={handleCreateClick}
      />

      <main className="map-area">
        <MapView
          entities={entities}
          selected={selected}
          onSelect={handleSelect}
          onMapClick={handleMapClick}
        />
        {panel}
        {confirmTarget && (
          <ConfirmDialog
            title="Hapus entity"
            message={`Yakin ingin menghapus "${confirmTarget.name}"? Tindakan ini tidak bisa dibatalkan.`}
            busy={remove.isPending}
            onConfirm={confirmDelete}
            onCancel={() => setConfirmTargetId(null)}
          />
        )}
      </main>
    </div>
  );
}
