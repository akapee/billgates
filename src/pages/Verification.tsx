import React, { useState } from 'react';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { useClaims } from '../hooks/useClaims';
import { useDecisions } from '../hooks/useDecisions';
import { useAuth } from '../auth/AuthContext';
import { decisionKey, recordDecision } from '../services/audit';
import { formatCurrency } from '../lib/utils';
import { RiskBadge } from '../components/ui/Badge';

// Keputusan verifikator kini DISIMPAN (koleksi `decisions`) bersama alasan dan
// entri log audit, sehingga tidak hilang saat halaman di-refresh.
export function Verification() {
  const { claims, loading, error } = useClaims();
  const { decisions } = useDecisions();
  const { canDecide } = useAuth();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const queue = claims.filter((claim) => claim.riskScore >= 60);
  const decisionOf = (id: string) => decisions.get(decisionKey('verification', id));
  const pending = queue.filter((claim) => !decisionOf(claim.id));
  const approved = queue.filter((claim) => decisionOf(claim.id)?.decision === 'approved').length;
  const rejected = queue.filter((claim) => decisionOf(claim.id)?.decision === 'rejected').length;

  const decide = async (claimId: string, decision: 'approved' | 'rejected') => {
    setBusyId(claimId); setSaveError(null);
    try { await recordDecision({ claimId, kind: 'verification', decision, reason: reasons[claimId] ?? '' }); }
    catch (err) { setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan keputusan'); }
    finally { setBusyId(null); }
  };

  if (error) return <div className="p-6"><div className="card p-5 text-red-700 bg-red-50">Gagal memuat Firestore: {error}</div></div>;
  if (loading) return <div className="p-6"><div className="card p-10 text-center text-slate-500">Memuat antrean verifikasi...</div></div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Pusat Verifikasi</h2>
        <p className="mt-1.5 text-sm text-slate-500">Tinjau bukti dan ambil keputusan atas klaim dengan risiko tinggi. Setiap keputusan wajib disertai alasan dan tercatat di log audit.</p>
      </div>
      {!canDecide && <div className="mb-4 p-3 rounded-lg bg-slate-100 text-sm text-slate-600">Peran Anda hanya dapat melihat antrean. Keputusan dibuat oleh Verifikator.</div>}
      {saveError && <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-700">{saveError}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Metric label="Menunggu Verifikasi" value={pending.length.toString()} color="text-orange-600" />
        <Metric label="Disetujui" value={approved.toString()} color="text-emerald-600" />
        <Metric label="Ditolak" value={rejected.toString()} color="text-red-600" />
      </div>
      <div className="space-y-4">
        {queue.map((claim) => {
          const rec = decisionOf(claim.id);
          const reason = reasons[claim.id] ?? '';
          const reasonOk = reason.trim().length >= 5;
          return (
            <div key={claim.id} className="card p-5 flex flex-col lg:flex-row gap-5 lg:items-center">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><FileText size={21} /></div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <h3 className="font-semibold">{claim.id}</h3>
                  <RiskBadge level={claim.riskLevel} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{claim.patientName} · {claim.providerName}</p>
                <p className="mt-1 text-xs text-slate-400">{claim.diagnosisCode} · {formatCurrency(claim.amount)} · Skor risiko {claim.riskScore}/100</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {claim.anomalyFlags.map((flag) => <span key={flag} className="px-2 py-1 rounded text-xs bg-orange-50 text-orange-700">{flag.replace('_', ' ')}</span>)}
                </div>
              </div>
              {rec ? (
                <div className="text-sm">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold ${rec.decision === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {rec.decision === 'approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {rec.decision === 'approved' ? 'Klaim Disetujui' : 'Klaim Ditolak'}
                  </span>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs">oleh {rec.email} — “{rec.reason}”</p>
                </div>
              ) : canDecide ? (
                <div className="flex flex-col gap-2 w-full lg:w-72">
                  <input value={reason} onChange={(e) => setReasons((r) => ({ ...r, [claim.id]: e.target.value }))} placeholder="Alasan keputusan (min. 5 karakter)"
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  <div className="flex gap-2">
                    <button disabled={!reasonOk || busyId === claim.id} onClick={() => decide(claim.id, 'approved')} className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50">Setujui</button>
                    <button disabled={!reasonOk || busyId === claim.id} onClick={() => decide(claim.id, 'rejected')} className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-red-200 hover:bg-red-50 text-red-700 disabled:opacity-50">Tolak</button>
                  </div>
                </div>
              ) : <span className="text-xs text-slate-400">Menunggu verifikator</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Metric({ label, value, color }: { label: string; value: string; color: string }) { return <div className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div>; }
