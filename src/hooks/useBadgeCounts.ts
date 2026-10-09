import { useMemo } from 'react';
import { useClaims } from './useClaims';
import { useDecisions } from './useDecisions';
import { useLearnedModel } from './useLearnedModel';
import { decisionKey } from '../services/audit';

/**
 * Menghitung badge count untuk setiap menu sidebar secara real-time
 * berdasarkan data aktual dari Firestore.
 *
 * - claims:       klaim dengan riskScore >= 60 (perlu tinjauan)
 * - duplicates:   kandidat duplikat yang belum ditinjau
 * - anomalies:    klaim beranomali yang belum ditindaklanjuti
 * - verification: klaim risiko tinggi yang belum diputuskan
 */
export function useBadgeCounts() {
  const { claims, loading } = useClaims();
  const { decisions } = useDecisions();
  const { candidates } = useLearnedModel(claims);

  return useMemo(() => {
    if (loading) return { claims: 0, duplicates: 0, anomalies: 0, verification: 0 };

    // Monitoring Klaim: klaim dengan riskScore >= 60
    const claimsBadge = claims.filter((c) => c.riskScore >= 60).length;

    // Deteksi Tagihan Ganda: kandidat duplikat belum ditinjau
    const duplicatesBadge = candidates.filter(
      (item) => !decisions.has(decisionKey('duplicate_review', item.claim.id))
    ).length;

    // Deteksi Anomali: klaim beranomali belum ditindaklanjuti
    const flaggedClaims = claims.filter((c) => c.anomalyFlags.length > 0);
    const anomaliesBadge = flaggedClaims.filter(
      (c) => !decisions.has(decisionKey('anomaly_followup', c.id))
    ).length;

    // Pusat Verifikasi: antrean belum diputuskan (riskScore >= 60)
    const queue = claims.filter((c) => c.riskScore >= 60);
    const verificationBadge = queue.filter(
      (c) => !decisions.has(decisionKey('verification', c.id))
    ).length;

    return {
      claims: claimsBadge,
      duplicates: duplicatesBadge,
      anomalies: anomaliesBadge,
      verification: verificationBadge,
    };
  }, [claims, candidates, decisions, loading]);
}
