import { useMemo } from 'react';
import { findDuplicatePairs, type DuplicatePair } from '../lib/detection';
import { POOL_THRESHOLD, buildSeriesIndex, pairFeatures, predictProbability, isDuplicate, trainModel, type LabeledSample } from '../lib/learning';
import { useDecisions } from './useDecisions';
import { decisionKey } from '../services/audit';
import type { DatabaseClaim } from './useClaims';

type Pair = DuplicatePair<DatabaseClaim>;

/**
 * Melatih model dari keputusan verifikator (koleksi `decisions`, kind=verification)
 * pada klaim yang menjadi "klaim belakangan" di kolam kandidat V2.
 * Setujui = sah (0), Tolak = duplikat (1). Dilatih ulang di browser setiap data berubah.
 */
export function useLearnedModel(claims: DatabaseClaim[]) {
  const { decisions } = useDecisions();

  return useMemo(() => {
    const pool: Pair[] = findDuplicatePairs(claims, POOL_THRESHOLD);
    const series = buildSeriesIndex(claims);
    const samples: LabeledSample[] = [];
    for (const p of pool) {
      const d = decisions.get(decisionKey('verification', p.later.id));
      if (d && (d.decision === 'approved' || d.decision === 'rejected')) {
        samples.push({ x: pairFeatures(p, series), y: d.decision === 'rejected' ? 1 : 0 });
      }
    }
    const model = trainModel(samples);
    const flagged = pool.filter((p) => isDuplicate(model, p, series));
    const ruleFlagged = pool.filter((p) => p.score >= 80);
    const candidates = flagged.map((p) => ({
      claim: p.later,
      match: p.earlier,
      similarity: p.score,
      reasons: p.reasons,
      probability: model.active ? predictProbability(model, pairFeatures(p, series)) : undefined,
    }));
    return { model, pool, candidates, flaggedCount: flagged.length, ruleCount: ruleFlagged.length, labelCount: samples.length };
  }, [claims, decisions]);
}
