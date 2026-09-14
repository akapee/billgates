import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import type { DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from '../config/firebase';

const memoryCache = new Map<string, unknown[]>();

export function useFirestore<T = DocumentData>(
  collectionName: string, 
  queryConstraints: QueryConstraint[] = []
) {
  const cacheKey = `${collectionName}:${JSON.stringify(queryConstraints)}`;
  const cached = memoryCache.get(cacheKey) as T[] | undefined;
  const [data, setData] = useState<T[]>(cached ?? []);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const previous = memoryCache.get(cacheKey) as T[] | undefined;
    if (previous) {
      setData(previous);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    const q = query(collection(db, collectionName), ...queryConstraints);

    getDocs(q)
      .then((snapshot) => {
        if (!active) return;
        const results: T[] = [];
        snapshot.forEach((doc) => {
          results.push({ firestoreId: doc.id, ...doc.data() } as T);
        });
        memoryCache.set(cacheKey, results);
        setData(results);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Firestore subscription error:", err);
        setError(err.message);
        setLoading(false);
      });

    return () => { active = false; };
  }, [cacheKey]);

  return { data, loading, error };
}
