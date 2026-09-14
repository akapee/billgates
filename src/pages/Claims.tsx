import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { claims } from '../data/claims';
import { formatCurrency } from '../lib/utils';
import { RiskBadge, StatusBadge } from '../components/ui/Badge';
import type { ClaimData, RiskLevel } from '../types';

const riskOptions: { value: 'all' | RiskLevel; label: string }[] = [
  { value: 'all', label: 'Semua Risiko' }, { value: 'critical', label: 'Kritis' },
  { value: 'high', label: 'Tinggi' }, { value: 'medium', label: 'Sedang' }, { value: 'low', label: 'Rendah' },
];

export function Claims() {
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<'all' | RiskLevel>('all');
  const [selected, setSelected] = useState<ClaimData | null>(null);
  const filteredClaims = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    return claims.filter((claim) => {
      const matches = !keyword || [claim.id, claim.patientName, claim.providerName, claim.diagnosis].some(value => value.toLowerCase().includes(keyword));
      return matches && (risk === 'all' || claim.riskLevel === risk);
    });
  }, [query, risk]);

  return <div className="p-6 max-w-[1600px] mx-auto">
    <div className="mb-6"><h2 className="text-2xl font-bold text-slate-900">Monitoring Klaim</h2><p className="mt-1.5 text-sm text-slate-500">Pantau dan telaah klaim JKN yang masuk secara real-time.</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Stat label="Total Klaim" value={claims.length.toString()} /><Stat label="Perlu Tinjauan" value={claims.filter(c => c.riskScore >= 60).length.toString()} color="text-orange-600" /><Stat label="Nilai Klaim Ditampilkan" value={formatCurrency(claims.reduce((sum, claim) => sum + claim.amount, 0))} color="text-emerald-600" />
    </div>
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari ID klaim, pasien, atau faskes..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
        <div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-slate-400" /><select value={risk} onChange={e => setRisk(e.target.value as 'all' | RiskLevel)} className="py-2.5 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none">{riskOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="text-left px-5 py-3">Klaim</th><th className="text-left px-5 py-3">Pasien & Faskes</th><th className="text-left px-5 py-3">Diagnosis</th><th className="text-right px-5 py-3">Nilai</th><th className="text-center px-5 py-3">Risiko</th><th className="text-center px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredClaims.map(claim => <tr key={claim.id} onClick={() => setSelected(claim)} className="hover:bg-blue-50/50 cursor-pointer"><td className="px-5 py-4"><p className="font-semibold">{claim.id}</p><p className="text-xs text-slate-400">{claim.date.toLocaleDateString('id-ID')}</p></td><td className="px-5 py-4"><p className="font-medium">{claim.patientName}</p><p className="text-xs text-slate-400 truncate max-w-[220px]">{claim.providerName}</p></td><td className="px-5 py-4"><p>{claim.diagnosisCode}</p><p className="text-xs text-slate-400 truncate max-w-[180px]">{claim.diagnosis}</p></td><td className="px-5 py-4 text-right font-semibold">{formatCurrency(claim.amount)}</td><td className="px-5 py-4 text-center"><RiskBadge level={claim.riskLevel} /></td><td className="px-5 py-4 text-center"><StatusBadge status={claim.status} /></td></tr>)}</tbody></table></div>
      {filteredClaims.length === 0 && <p className="p-10 text-center text-sm text-slate-500">Tidak ada klaim yang sesuai dengan pencarian.</p>}
    </div>
    {selected && <ClaimPanel claim={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function Stat({ label, value, color = 'text-slate-900' }: { label: string; value: string; color?: string }) { return <div className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div>; }
function ClaimPanel({ claim, onClose }: { claim: ClaimData; onClose: () => void }) { return <div className="fixed inset-0 z-50 bg-slate-900/30 flex justify-end" onClick={onClose}><aside onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto"><div className="flex justify-between items-start mb-6"><div><p className="text-xs text-slate-400">Detail Klaim</p><h3 className="font-bold text-lg">{claim.id}</h3></div><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button></div><div className="space-y-4 text-sm"><Detail label="Pasien" value={`${claim.patientName} · ${claim.patientId}`} /><Detail label="Fasilitas Kesehatan" value={claim.providerName} /><Detail label="Diagnosis" value={`${claim.diagnosisCode} — ${claim.diagnosis}`} /><Detail label="Prosedur" value={claim.procedure} /><div className="grid grid-cols-2 gap-3"><Detail label="Nilai Klaim" value={formatCurrency(claim.amount)} /><Detail label="Skor Risiko" value={`${claim.riskScore}/100`} /></div>{claim.anomalyFlags.length > 0 && <div><p className="text-slate-400 mb-2">Penanda Anomali</p><div className="flex flex-wrap gap-2">{claim.anomalyFlags.map(flag => <span key={flag} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium">{flag.replace('_', ' ')}</span>)}</div></div>}</div></aside></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-slate-400">{label}</p><p className="font-medium text-slate-800">{value}</p></div>; }
