import { useState, useEffect, useCallback, useRef } from 'react';

export function useAsyncData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchRef.current()
      .then(result => { if (!cancelled) setData(result); })
      .catch(e => { if (!cancelled) setError(e.message || 'Failed to load data'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, deps);

  const refetch = useCallback(() => {
    setLoading(true);
    setError('');
    return fetchRef.current()
      .then(result => { setData(result); return result; })
      .catch(e => { setError(e.message || 'Failed to load data'); throw e; });
  }, []);

  return { data, loading, error, refetch, setData };
}
