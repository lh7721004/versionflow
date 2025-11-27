import { useMutation } from "@tanstack/react-query";
import { api } from "../api/api";

/**
 * 프로젝트 버전 관리 설정을 업데이트합니다.
 */
export function useUpdateVersioning(projectId) {
  return useMutation({
    /**
     * @param {{namingScheme:'date-major'|'major-minor'|'semver', reviewRequired:boolean, minApprovals:number}} payload
     */
    mutationFn: async (payload) => {
      const res = await api.patch(`/projects/${projectId}/settings/versioning`, payload);
      return res.data?.data;
    },
  });
}
