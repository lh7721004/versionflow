import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export function useFiles(projectId, params = {}) {
  return useQuery({
    queryKey: ["files", projectId, params],
    enabled: !!projectId,
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/files`, { params: { ...params, projectId } });
      return res.data?.data;
    },
  });
}

export function useCreateFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, path }) => {
      const res = await api.post(`/projects/${projectId}/files`, { projectId, path });
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["files", variables.projectId] });
    },
  });
}

export function useUpdateFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch, projectId }) => {
      const res = await api.patch(`/projects/${projectId}/files/${id}`, patch);
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["files", variables.projectId] });
    },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }) => {
      const res = await api.delete(`/projects/${projectId}/files/${id}`);
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["files", variables.projectId] });
    },
  });
}

