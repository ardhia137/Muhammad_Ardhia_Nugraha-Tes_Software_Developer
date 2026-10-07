import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEntity, deleteEntity, listEntities, updateEntity } from "./api";
import type { Entity, EntityInput, ListParams } from "./types";

export function useEntities(params: ListParams) {
  return useQuery<Entity[]>({
    queryKey: ["entities", params.q ?? "", params.status ?? "", params.type ?? ""],
    queryFn: () => listEntities(params),
  });
}

export function useEntityMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["entities"] });

  const create = useMutation({
    mutationFn: (input: EntityInput) => createEntity(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: EntityInput }) => updateEntity(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteEntity(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
