import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { useClaims, type DatabaseClaim } from '../hooks/useClaims';
import { useDecisions } from '../hooks/useDecisions';
import { useAuth } from '../auth/AuthContext';
import { decisionKey, recordDecision } from '../services/audit';
import { formatCurrency } from '../lib/utils';
import { RiskBadge } from '../components/ui/Badge';
import type { AnomalyType } from '../types';

const labels: Record<AnomalyType, string> = { duplicate_billing: 'Tagihan Ganda', repeat_billing: 'Tagihan Berulang', cost_anomaly: 'Anomali Biaya', diagnosis_anomaly: 'Anomali Diagnosis', procedure_anomaly: 'Anomali Prosedur', upcoding: 'Dugaan Upcoding', unbundling: 'Unbundling', other: 'Lainnya' };

export function Anomalies() {
  const { claims, loading, error } = useClaims();
  const { decisions } = useDecisions();
  const { canDecide } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<'all' | AnomalyType>('all');
  const [page, setPage] = useState(1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const all = useMemo(() => claims.filter(claim => claim.anomalyFlags.length > 0), [claims]);
  const visible = useMemo(() => all.filter(claim => type === 'all' || claim.anomalyFlags.includes(type)), [all, type]);
  const counts = all.flatMap(claim => claim.anomalyFlags).reduce<Record<string, number>>((result, flag) => ({ ...result, [flag]: (result[flag] || 0) + 1 }), {});
  const queued = (id: string) => decisions.has(decisionKey('verification_request', id));
  const pageSize = 10;
  const totalPages = Math.ceil(visible.length / pageSize);
  const rows = visible.slice((page - 1) * pageSize, page * pageSize);
  const openVerification = async (claim: DatabaseClaim) => {
    setSaveError(null);
    try {
      await recordDecision({ claimId: claim.id, kind: 'verification_request', decision: 'pending', reason: 'Klaim anomali diajukan untuk verifikasi' });
      navigate('/verification', { state: { claimId: claim.id, source: 'anomaly' } });
    } catch (reason) { setSaveError(reason instanceof Error ? reason.message : 'Gagal mengajukan verifikasi'); }
  };
  if (error) return <div className="p-6"><div className="card p-5 text-red-700 bg-red-50">Gagal memuat Firestore: {error}</div></div>;
  if (loading) return <div className="p-6"><div className="card p-10 text-center text-slate-500">Memuat data anomali dari Firestore...</div></div>;
  return <div className="p-6 max-w-[1600px] mx-auto"><div className="mb-6"><h2 className="text-2xl font-bold">Deteksi Anomali</h2><p className="mt-1.5 text-sm text-slate-500">Pilih klaim anomali, lalu ajukan ke Pusat Verifikasi untuk keputusan final.</p></div>{saveError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-700">{saveError}</div>}<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><Metric label="Klaim Beranomali" value={all.length} color="text-red-600" /><Metric label="Jenis Anomali" value={Object.keys(counts).length} color="text-orange-600" /><Metric label="Menunggu Verifikasi" value={all.filter(claim => queued(claim.id)).length} color="text-blue-600" /></div><div className="card p-4 mb-4 flex flex-wrap gap-2 items-center"><Filter size={16} className="text-slate-400" /><button onClick={() => { setType('all'); setPage(1); }} className={`px-3 py-1.5 text-xs font-semibold rounded-full ${type === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Semua ({all.length})</button>{Object.entries(counts).map(([flag, count]) => <button key={flag} onClick={() => { setType(flag as AnomalyType); setPage(1); }} className={`px-3 py-1.5 text-xs font-semibold rounded-full ${type === flag ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{labels[flag as AnomalyType]} ({count})</button>)}</div><div className="card overflow-hidden divide-y divide-slate-100">{rows.map(claim => <div key={claim.firestoreId} className="p-5 flex flex-col md:flex-row gap-4 md:items-center"><span className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 grid place-items-center"><AlertTriangle size={20} /></span><div className="flex-1"><div className="flex gap-2 items-center flex-wrap"><p className="font-semibold">{claim.id} · {claim.patientName}</p><RiskBadge level={claim.riskLevel} /></div><p className="mt-1 text-sm text-slate-500">{claim.providerName} · {claim.diagnosisCode} · {formatCurrency(claim.amount)}</p><div className="mt-2 flex flex-wrap gap-2">{claim.anomalyFlags.map(flag => <span key={flag} className="px-2 py-1 text-xs font-medium rounded bg-orange-50 text-orange-700">{labels[flag]}</span>)}</div></div>{queued(claim.id) ? <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700"><CheckCircle2 size={16} /> Menunggu Verifikasi</span> : !canDecide ? <span className="text-xs text-slate-400">Hanya verifikator</span> : <button onClick={() => void openVerification(claim)} className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Tindak Lanjuti</button>}</div>)}{visible.length === 0 && <p className="p-10 text-center text-sm text-slate-500">Tidak ada anomali pada kategori ini.</p>}</div>{totalPages > 1 && <div className="flex items-center justify-between px-1 py-4"><span className="text-xs text-slate-500">Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, visible.length)} dari {visible.length} anomali</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(value => value - 1)} className="px-4 py-2 text-xs border rounded-md disabled:opacity-50">Sebelumnya</button><button disabled={page === totalPages} onClick={() => setPage(value => value + 1)} className="px-4 py-2 text-xs border rounded-md disabled:opacity-50">Selanjutnya</button></div></div>}</div>;
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) { return <div className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div>; }
