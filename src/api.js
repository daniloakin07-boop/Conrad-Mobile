import { useCallback, useEffect, useState } from "react";

// Hook simples: carrega dados, expõe loading/erro e refetch (pull-to-refresh).
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setData(await fn());
    } catch (e) {
      setError(e.message || "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}