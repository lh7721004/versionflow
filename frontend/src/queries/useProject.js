import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
const getProjects = async ({ limit = 20, offset = 0 }) => {
  const res = await api.get("/projects", { params: { limit, offset } });
  return res.data.data;
};
export function useProjects({ limit = 20, offset = 0 }) {
  return useQuery({
    queryKey: ["Projects", { limit, offset }],
    queryFn: () => getProjects({ limit, offset }),
    staleTime: 10_000,
  });
}