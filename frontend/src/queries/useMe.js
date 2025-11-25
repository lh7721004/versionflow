import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

async function fetchMe({ signal }) {
  const res = await api.get("/users/me", { signal });
  // backend returns { data: { ...user } }
  return res.data?.data;
}

export function useMe() {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    onError: () => {
      navigate("/login");
    }
  });
}

