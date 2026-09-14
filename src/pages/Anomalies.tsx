import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { useClaims, type DatabaseClaim } from '../hooks/useClaims';
import { formatCurrency } from '../lib/utils';
import { RiskBadge } from '../components/ui/Badge';
import type { AnomalyType } from '../types';
import { updateDocument } from '../services/firebase/db';

const anomalyLabels: Record<AnomalyType, string> = { duplicate_billing: 'Tagihan Ganda', repeat_billing: 'Tagihan Berulang', cost_anomaly: 'Anomali Biaya', diagnosis_anomaly: 'Anomali Diagnosis', procedure_anomaly: 'Anomali Prosedur', upcoding: 'Dugaan Upcoding', unbundling: 'Unbundling', other: 'Lainnya' };
type ResolvableClaim = DatabaseClaim & { anomalyResolved?: boolean };

export function Anomalies() {
  const { claims, loading, error } = useClaims();
  const [type, setType] = useState<'all' | AnomalyType>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const flaggedClaims = useMemo(() => claims.filter(claim => claim.anomalyFlags.length > 0), [claims]);
  const visibleClaims = useMemo(() => flaggedClaims.filter(claim => type === 'all' || claim.anomalyFlags.includes(type)), [flaggedClaims, type]);
  const counts = flaggedClaims.flatMap(claim => claim.anomalyFlags).reduce<Record<string, number>>((total, flag) => ({ ...total, [flag]: (total[flag] || 0) + 1 }), {});
  const resolve = async (claim: ResolvableClaim) => { setSavingId(claim.firestoreId); try { await updateDocument('claims', claim.firestoreId, { anomalyResolved: true, anomalyResolvedAt: new Date() }); } finally { setSavingId(null); } };
  const resolvedCount = flaggedClaims.filter(claim => (claim as ResolvableClaim).anomalyResolved).length;
  if (error) return <div className="p-6"><div className="card p-5 text-red-700 bg-red-50">Gagal memuat Firestore: {error}</div></div>;
  if (loading) return <div className="p-6"><div className="card p-10 text-center text-slate-500">Memuat data anomali dari Firestore...</div></div>;
  return <div className="p-6 max-w-[1600px] mx-auto"><div className="mb-6"><h2 className="text-2xl font-bold">Deteksi Anomali</h2><p className="mt-1.5 text-sm text-slate-500">Identifikasi dan tindak lanjuti pola klaim yang tidak wajar.</p></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><Metric label="Klaim Beranomali" value={flaggedClaims.length.toString()} color="text-red-600" /><Metric label="Jenis Anomali" value={Object.keys(counts).length.toString()} color="text-orange-600" /><Metric label="Sudah Ditindaklanjuti" value={resolvedCount.toString()} color="text-emerald-600" /></div><div className="card p-4 mb-4"><div className="flex flex-wrap gap-2 items-center"><Filter size={16} className="text-slate-400" /><button onClick={() => setType('all')} className={`px-3 py-1.5 text-xs font-semibold rounded-full ${type === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Semua ({flaggedClaims.length})</button>{Object.entries(counts).map(([flag, count]) => <button key={flag} onClick={() => setType(flag as AnomalyType)} className={`px-3 py-1.5 text-xs font-semibold rounded-full ${type === flag ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{anomalyLabels[flag as AnomalyType]} ({count})</button>)}</div></div><div className="card overflow-hidden"><div className="divide-y divide-slate-100">{visibleClaims.map(claim => { const done = (claim as ResolvableClaim).anomalyResolved; return <div key={claim.id} className="p-5 flex flex-col md:flex-row gap-4 md:items-center"><div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0"><AlertTriangle size={20} /></div><div className="flex-1"><div className="flex flex-wrap gap-2 items-center"><p className="font-semibold">{claim.id} · {claim.patientName}</p><RiskBadge level={claim.riskLevel} /></div><p className="mt-1 text-sm text-slate-500">{claim.providerName} · {claim.diagnosisCode} · {formatCurrency(claim.amount)}</p><div className="flex flex-wrap gap-2 mt-2">{claim.anomalyFlags.map(flag => <span key={flag} className="px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded">{anomalyLabels[flag]}</span>)}</div></div>{done ? <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700"><CheckCircle2 size={16} /> Ditindaklanjuti</span> : <button disabled={savingId === (claim as ResolvableClaim).firestoreId} onClick={() => resolve(claim as ResolvableClaim)} className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">{savingId === (claim as ResolvableClaim).firestoreId ? 'Menyimpan...' : 'Tindak Lanjuti'}</button>}</div>; })}</div>{visibleClaims.length === 0 && <p className="p-10 text-center text-sm text-slate-500">Tidak ada anomali pada kategori ini.</p>}</div></div>;
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) { return <div className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div>; }
