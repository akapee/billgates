import { addDoc, collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ─────────────────────────────────────────────
// Log audit (append-only) + keputusan verifikator.
// Aturan di firestore.rules: auditLogs hanya boleh DIBUAT (tidak bisa diubah/dihapus),
// dan uid wajib sama dengan pengguna yang login; waktu diisi server.
// ─────────────────────────────────────────────

export type AuditAction =
  | 'login'
  | 'logout'
  | 'session_timeout'
  | 'view_claim'
  | 'export_csv'
  | 'decision';

export type DecisionKind = 'verification' | 'duplicate_review' | 'anomaly_followup';
export type DecisionValue = 'approved' | 'rejected' | 'reviewed' | 'resolved';

export interface DecisionRecord {
  firestoreId?: string;
  claimId: string;
  kind: DecisionKind;
  decision: DecisionValue;
  reason: string;
  uid: string;
  email: string;
}

export const decisionKey = (kind: DecisionKind, claimId: string) => `${kind}__${claimId}`;

/** Catat peristiwa (best-effort: kegagalan log tidak menghentikan tampilan). */
export async function logAudit(action: AuditAction, details: { claimId?: string; detail?: string } = {}) {
  const user = auth.currentUser || { uid: 'mock-user-123', email: 'demo@bpjs.go.id' };
  try {
    await addDoc(collection(db, 'auditLogs'), {
      uid: user.uid,
      email: user.email ?? '',
      action,
      claimId: details.claimId ?? null,
      detail: details.detail ?? null,
      at: serverTimestamp(),
    });
  } catch (err) {
    console.error('Gagal menulis log audit', err);
  }
}

/**
 * Simpan keputusan + entri audit secara ATOMIK (keduanya berhasil atau keduanya gagal).
 * Keputusan tidak bisa dibuat tanpa jejak audit.
 */
export async function recordDecision(input: { claimId: string; kind: DecisionKind; decision: DecisionValue; reason: string }) {
  const user = auth.currentUser || { uid: 'mock-user-123', email: 'demo@bpjs.go.id' };
  const reason = input.reason.trim();
  if (reason.length < 5) throw new Error('Alasan minimal 5 karakter');

  const batch = writeBatch(db);
  batch.set(doc(db, 'decisions', decisionKey(input.kind, input.claimId)), {
    claimId: input.claimId,
    kind: input.kind,
    decision: input.decision,
    reason,
    uid: user.uid,
    email: user.email ?? '',
    at: serverTimestamp(),
  });
  batch.set(doc(collection(db, 'auditLogs')), {
    uid: user.uid,
    email: user.email ?? '',
    action: 'decision',
    claimId: input.claimId,
    detail: `${input.kind}:${input.decision} — ${reason}`,
    at: serverTimestamp(),
  });
  await batch.commit();
}
