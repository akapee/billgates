import { useMemo } from 'react';
import { useFirestore } from './useFirestore';
import type { ClaimData } from '../types';

type FirestoreDate = Date | { toDate: () => Date } | string | number;
type FirestoreClaim = Omit<ClaimData, 'date'> & { date: FirestoreDate; firestoreId: string };
export type DatabaseClaim = ClaimData & { firestoreId: string };

function normalizeDate(value: FirestoreDate): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  return new Date(value as string | number);
}

export function useClaims() {
  const result = useFirestore<FirestoreClaim>('claims');
  const claims = useMemo<DatabaseClaim[]>(
    () => result.data.map((claim) => ({ ...claim, date: normalizeDate(claim.date) })),
    [result.data]
  );
  return { ...result, claims };
}
