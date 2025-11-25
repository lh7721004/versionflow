import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export function useRollbacks(projectId, params = {}) {
  return useQuery({
    queryKey: ["rollbacks", projectId, params],
    enabled: !!projectId,
    queryFn: async () => {
      const res = await api.get("/rollbacks", { params: { ...params, projectId } });
      return res.data?.data;
    },
  });
}

export function useCreateRollback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/rollbacks", payload);
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["rollbacks", variables.projectId] });
    },
  });
}

export function useExecuteRollback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/rollbacks/execute", payload);
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["rollbacks", variables.projectId] });
      qc.invalidateQueries({ queryKey: ["versions"] });
    },
  });
}

