import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/admin";

export function useStaffRoles() {
  const query = useQuery({
    queryKey: ["staff-roles"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return { userId: null as string | null, roles: [] as AppRole[] };
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      if (error) throw error;
      return { userId, roles: (data ?? []).map((r) => r.role as AppRole) };
    },
    staleTime: 60_000,
  });

  return {
    ...query,
    roles: query.data?.roles ?? [],
    userId: query.data?.userId ?? null,
  };
}
