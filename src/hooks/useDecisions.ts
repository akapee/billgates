import { useMemo } from 'react';
import { useFirestore } from './useFirestore';
import { decisionKey, type DecisionRecord } from '../services/audit';

/** Keputusan verifikator yang tersimpan di Firestore (bertahan setelah refresh). */
export function useDecisions() {
  const { data, loading, error } = useFirestore<DecisionRecord>('decisions');
  const decisions = useMemo(() => new Map(data.map((d) => [decisionKey(d.kind, d.claimId), d])), [data]);
  return { decisions, loading, error };
}
