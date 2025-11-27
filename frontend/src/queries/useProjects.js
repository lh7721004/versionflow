import { useQuery } from "@tanstack/react-query";
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