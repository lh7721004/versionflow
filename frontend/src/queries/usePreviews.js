import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

export function usePreviews(projectId, params = {}) {
  return useQuery({
    queryKey: ["previews", projectId, params],
    enabled: !!projectId,
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/previews`, { params: { ...params, projectId } });
      return res.data?.data;
    },
  });
}

export function usePreviewByVersion(versionId) {
  return useQuery({
    queryKey: ["preview", "version", versionId],
    enabled: !!versionId,
    queryFn: async () => {
      throw new Error("usePreviewByVersion requires projectId; please use usePreviews or create a project-specific request.");
    },
  });
}

export function useLatestPreviewForFile(projectId, fileId) {
  return useQuery({
    queryKey: ["preview", "file", projectId, fileId],
    enabled: !!fileId && !!projectId,
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/previews/file/${fileId}/latest`);
      return res.data?.data;
    },
  });
}
