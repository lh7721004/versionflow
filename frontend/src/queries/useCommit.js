import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

function useCommitFiles() {
  return useMutation({
    mutationFn: async (params) => {
      const { projectId, folderPath, commitMessage, files } = params;

      const formData = new FormData();
      files.forEach((f) => {
        // backend에서 field 이름을 files[]로 받을지, file들로 받을지에 맞춰 조정
        formData.append('files', f.file);
      });

      formData.append('commitMessage', commitMessage);
      formData.append('folderPath', folderPath);

      // 백엔드 API 경로는 너가 만든 거에 맞춰 바꿔줘
      const res = await axios.post(
        `/api/projects/${projectId}/commits`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      return res.data;
    },
  });
}
