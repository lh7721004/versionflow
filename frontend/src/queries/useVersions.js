import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export function useVersions(params = {}, options = {}) {
  return useQuery({
    queryKey: ["versions", params],
    queryFn: async () => {
      const res = await api.get("/versions", { params });
      return res.data?.data;
    },
    ...options,
  });
}

export function useApproveVersion(versionId) {
  const qc = useQueryClient();
  return useMutation({
    /**
     * @param {{ userId: string, comment?: string }} payload
     */
    mutationFn: async ({ userId, comment }) => {
      const res = await api.post(`/versions/${versionId}/approvals`, {
        userId,
        decision: "approve",
        comment,
      });
      await api.post(`/versions/${versionId}/status`, { status: "approved" });
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["versions"] });
    },
  });
}

export function useRejectVersion(versionId) {
  const qc = useQueryClient();
  return useMutation({
    /**
     * @param {{ userId: string, comment?: string }} payload
     */
    mutationFn: async ({ userId, comment }) => {
      const res = await api.post(`/versions/${versionId}/approvals`, {
        userId,
        decision: "reject",
        comment,
      });
      await api.post(`/versions/${versionId}/status`, { status: "rejected" });
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["versions"] });
    },
  });
}

export function useVersion(id) {
  return useQuery({
    queryKey: ["versions", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/versions/${id}`);
      return res.data?.data;
    },
  });
}
