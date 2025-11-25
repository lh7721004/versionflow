import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export function useVersions(params = {}) {
  return useQuery({
    queryKey: ["versions", params],
    queryFn: async () => {
      const res = await api.get("/versions", { params });
      return res.data?.data;
    },
  });
}

export function useVersion(id) {
  return useQuery({
    queryKey: ["versions", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/versions/${id}`);
      return res.data?.data;
    },
  });
}

export function useCreateVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/versions", payload);
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["versions"] });
    },
  });
}

export function useAddVersionApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, decision, comment }) => {
      const res = await api.post(`/versions/${id}/approvals`, { userId, decision, comment });
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["versions", variables.id] });
      qc.invalidateQueries({ queryKey: ["versions"] });
    },
  });
}

export function useSetVersionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.post(`/versions/${id}/status`, { status });
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["versions", variables.id] });
      qc.invalidateQueries({ queryKey: ["versions"] });
    },
  });
}

