import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Optician } from "@/types/queue";

type OpticianRow = Database["public"]["Tables"]["opticians"]["Row"];

const mapOptician = (row: OpticianRow): Optician => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  address: row.address,
  mapLink: row.map_link,
  isActive: row.is_active,
  createdAt: row.created_at,
});

const sortOpticians = (items: Optician[]) =>
  [...items].sort(
    (a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name),
  );

const getOpticianErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "Failed to fetch opticians";

interface UseOpticiansOptions {
  enabled?: boolean;
}

export const useOpticians = ({ enabled = true }: UseOpticiansOptions = {}) => {
  const [opticians, setOpticians] = useState<Optician[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchOpticians = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("opticians")
        .select("*")
        .order("is_active", { ascending: false })
        .order("name", { ascending: true });

      if (err) throw err;

      const mappedOpticians = sortOpticians((data ?? []).map(mapOptician));
      setOpticians(mappedOpticians);
      return mappedOpticians;
    } catch (e) {
      const message = getOpticianErrorMessage(e);
      setError(message);
      throw (e instanceof Error ? e : new Error(message));
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    void fetchOpticians().catch(() => {});
  }, [enabled, fetchOpticians]);

  const addOptician = useCallback(
    async (data: {
      name: string;
      phone: string;
      address: string;
      mapLink: string;
    }) => {
      const { data: insertedOptician, error: err } = await supabase
        .from("opticians")
        .insert({
          name: data.name.trim(),
          phone: data.phone.trim(),
          address: data.address.trim(),
          map_link: data.mapLink.trim(),
          is_active: true,
        })
        .select("*")
        .single();

      if (err) throw err;

      setOpticians((current) =>
        sortOpticians([
          ...current.filter((optician) => optician.id !== insertedOptician.id),
          mapOptician(insertedOptician),
        ]),
      );
      setError(null);

      void fetchOpticians().catch(() => {});
    },
    [fetchOpticians],
  );

  const toggleOptician = useCallback(
    async (id: string, isActive: boolean) => {
      const { data: updatedOptician, error: err } = await supabase
        .from("opticians")
        .update({ is_active: isActive })
        .eq("id", id)
        .select("*")
        .single();

      if (err) throw err;

      setOpticians((current) =>
        sortOpticians(
          [
            ...current.filter((optician) => optician.id !== id),
            mapOptician(updatedOptician),
          ],
        ),
      );
      setError(null);

      void fetchOpticians().catch(() => {});
    },
    [fetchOpticians],
  );

  const deleteOptician = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from("opticians").delete().eq("id", id);

      if (err) throw err;

      setOpticians((current) => current.filter((optician) => optician.id !== id));
      setError(null);

      void fetchOpticians().catch(() => {});
    },
    [fetchOpticians],
  );

  return {
    opticians,
    isLoading,
    error,
    refresh: fetchOpticians,
    addOptician,
    toggleOptician,
    deleteOptician,
  };
};
