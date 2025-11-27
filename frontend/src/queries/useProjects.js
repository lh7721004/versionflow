import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export function useProjects(params = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: async () => {
      const res = await api.get("/projects", { params });
      return res.data?.data;
    },
  });
}

export function useMyProjects(params = {}) {
  return useQuery({
    queryKey: ["projects", "me", params],
    queryFn: async () => {
      const res = await api.get("/projects/me?includeTree=true", { params });
      return res.data?.data; // { owned, member }
    },
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ["projects", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data?.data;
    },
  });
}

export function useProjectMembersByProject(id) {
  return useQuery({
    queryKey: ["projects", id, "members"],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/projects/${id}/members`);
      return res.data?.data;
    },
  });
}

export function useUpdateProjectMemberRole(projectId) {
  const qc = useQueryClient();
  return useMutation({
    /**
     * @param {{userId:string, role:'owner'|'maintainer'|'member'}} payload
     */
    mutationFn: async ({ userId, role }) => {
      const res = await api.patch(`/projects/${projectId}/members/${userId}`, { role });
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "members"] });
    },
  });
}

export function useRemoveProjectMember(projectId) {
  const qc = useQueryClient();
  return useMutation({
    /**
     * @param {{userId:string}} payload
     */
    mutationFn: async ({ userId }) => {
      const res = await api.delete(`/projects/${projectId}/members/${userId}`);
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "members"] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    /** @param {string} projectId */
    mutationFn: async (projectId) => {
      const res = await api.delete(`/projects/${projectId}`);
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", "me"] });
    }
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    /** @param {string} folderId */
    mutationFn: async (folderId) => {
      const res = await api.delete(`/folders/${folderId}`);
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", "me"] });
    }
  });
}
export async function fetchFolder(projectId){
  const res = await api.get(`/projects/${projectId}/folders`);
  return res.data?.data;
}

export function useFolder(projectId) {
  return useQuery({
    queryKey: ["projectId", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/folders`);
      return res.data?.data;
    },
  });
}

export function useProjectMembers(userId) {
  return useQuery({
    queryKey: ["projects", userId, "user"],
    enabled: !!userId,
    queryFn: async () => {
      const res = await api.get(`/projects/user/${userId}?includeTree=true`);
      return res.data?.data;
    },
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    /**
     * @param {{projectId:string, name:string, parentFolderId?:string}} payload
     */
    mutationFn: async (payload) => {
      const res = await api.post('/folders', payload);
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", "me"] });
      if (variables?.projectId) {
        qc.invalidateQueries({ queryKey: ["projectId", variables.projectId] });
      }
    }
  });
}
