import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export function useInvitations(params = {}) {
  return useQuery({
    queryKey: ["invitations", params],
    queryFn: async () => {
      const res = await api.get("/invitations", { params });
      return res.data?.data;
    },
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/invitations", payload);
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations"] }),
  });
}

export function useRespondInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision }) => {
      const res = await api.post(`/invitations/${id}/respond`, { decision });
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations"] }),
  });
}

