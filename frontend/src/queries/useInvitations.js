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
    /** 
     * @param {{projectId:string, inviterId:string, inviteeEmail:string, role:'owner'|'maintainer'|'member', expiresAt?:string, token?:string}} payload 
     */
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

/**
 * @typedef {Object} AcceptInvitationVariables
 * @property {string} token
 * @property {string} userId
 */

/**
 * @returns {import('@tanstack/react-query').UseMutationResult<any, unknown, AcceptInvitationVariables>}
 */
export function useAcceptInvitationByToken() {
  const qc = useQueryClient();
  return useMutation({
    /** @param {AcceptInvitationVariables} param0 */
    mutationFn: async ({ token, userId }) => {
      console.log("Accepting invitation with token:", token, "and userId:", userId);
      const res = await api.post(`/invitations/accept/token`, { token, userId });
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invitations"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

