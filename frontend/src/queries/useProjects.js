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
      const res = await api.get("/projects/me", { params });
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

