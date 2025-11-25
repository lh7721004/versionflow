import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/projects", payload);
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }) => {
      const res = await api.patch(`/projects/${id}`, patch);
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, userId, role }) => {
      const res = await api.post(`/projects/${projectId}/members`, { userId, role });
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["projects", variables.projectId] });
    },
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, userId, role }) => {
      const res = await api.patch(`/projects/${projectId}/members/${userId}`, { role });
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["projects", variables.projectId] });
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, userId }) => {
      const res = await api.delete(`/projects/${projectId}/members/${userId}`);
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["projects", variables.projectId] });
    },
  });
}

export function useUploadAndCommit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, file, authorId, message, branch, folderPath, authorName, authorEmail }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("authorId", authorId);
      form.append("message", message);
      if (branch) form.append("branch", branch);
      if (folderPath) form.append("folderPath", folderPath);
      if (authorName) form.append("authorName", authorName);
      if (authorEmail) form.append("authorEmail", authorEmail);
      const res = await api.post(`/projects/${projectId}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["projects", variables.projectId] });
      qc.invalidateQueries({ queryKey: ["files", variables.projectId] });
      qc.invalidateQueries({ queryKey: ["versions"] });
    },
  });
}

