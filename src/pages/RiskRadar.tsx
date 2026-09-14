import React, { useMemo, useState } from 'react';
import { ScanLine, MapPin, Building2 } from 'lucide-react';
import { useClaims } from '../hooks/useClaims';
import { formatCurrency } from '../lib/utils';
import { RiskBadge } from '../components/ui/Badge';
import type { RiskLevel } from '../types';

type ProviderRisk = { name: string; region: string; claims: number; totalAmount: number; averageRisk: number; level: RiskLevel };
const levelFromScore = (score: number): RiskLevel => score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

export function RiskRadar() {
  const { claims, loading, error } = useClaims();
  const providers = useMemo(() => {
    const groups = new Map<string, ProviderRisk>();
    claims.forEach(claim => {
      const current = groups.get(claim.providerName) || { name: claim.providerName, region: claim.region, claims: 0, totalAmount: 0, averageRisk: 0, level: 'low' as RiskLevel };
      current.claims += 1; current.totalAmount += claim.amount; current.averageRisk += claim.riskScore;
      groups.set(claim.providerName, current);
    });
    return [...groups.values()].map(item => ({ ...item, averageRisk: Math.round(item.averageRisk / item.claims), level: levelFromScore(item.averageRisk / item.claims) })).sort((a, b) => b.averageRisk - a.averageRisk);
  }, [claims]);
  const [selected, setSelected] = useState<ProviderRisk | null>(null);
  const highRisk = providers.filter(provider => provider.averageRisk >= 60).length;

  if (error) return <div className="p-6"><div className="card p-5 text-red-700 bg-red-50">Gagal memuat Firestore: {error}</div></div>;
  if (loading) return <div className="p-6"><div className="card p-10 text-center text-slate-500">Memuat radar dari Firestore...</div></div>;
  return <div className="p-6 max-w-[1600px] mx-auto"><div className="mb-6"><h2 className="text-2xl font-bold">Radar Risiko Fraud</h2><p className="mt-1.5 text-sm text-slate-500">Prioritaskan fasilitas kesehatan berdasarkan pola dan skor risiko klaim.</p></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><Metric label="Faskes Terpantau" value={providers.length.toString()} color="text-blue-600" /><Metric label="Risiko Tinggi / Kritis" value={highRisk.toString()} color="text-red-600" /><Metric label="Wilayah Terdeteksi" value={new Set(providers.map(p => p.region)).size.toString()} color="text-emerald-600" /></div><div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5"><div className="card p-5"><div className="flex items-center gap-2 mb-5"><ScanLine size={20} className="text-blue-600" /><div><h3 className="font-semibold">Peta Prioritas Faskes</h3><p className="text-xs text-slate-500">Semakin panjang bar, semakin tinggi skor risiko rata-rata.</p></div></div><div className="space-y-4">{providers.map(provider => <button key={provider.name} onClick={() => setSelected(provider)} className={`w-full text-left p-3 rounded-xl border transition-colors ${selected?.name === provider.name ? 'border-blue-300 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}><div className="flex justify-between gap-3 mb-2"><div className="min-w-0"><p className="font-medium text-sm truncate">{provider.name}</p><p className="text-xs text-slate-400">{provider.region} · {provider.claims} klaim</p></div><RiskBadge level={provider.level} /></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={provider.averageRisk >= 80 ? 'h-full bg-red-500' : provider.averageRisk >= 60 ? 'h-full bg-orange-500' : provider.averageRisk >= 30 ? 'h-full bg-yellow-500' : 'h-full bg-green-500'} style={{ width: `${provider.averageRisk}%` }} /></div><p className="mt-1 text-xs font-semibold text-right">Skor {provider.averageRisk}/100</p></button>)}</div></div><div className="card p-5 h-fit">{selected ? <><div className="flex items-center gap-2"><Building2 size={20} className="text-blue-600" /><div><p className="text-xs text-slate-400">Profil Risiko Faskes</p><h3 className="font-semibold">{selected.name}</h3></div></div><div className="mt-5 grid grid-cols-2 gap-3"><Info label="Wilayah" value={selected.region} icon={<MapPin size={15} />} /><Info label="Skor Risiko" value={`${selected.averageRisk}/100`} /><Info label="Jumlah Klaim" value={selected.claims.toString()} /><Info label="Nilai Klaim" value={formatCurrency(selected.totalAmount)} /></div><div className="mt-5 p-3 rounded-lg bg-slate-50 text-sm text-slate-600">Faskes ini masuk prioritas <b>{selected.level === 'critical' ? 'kritis' : selected.level === 'high' ? 'tinggi' : 'pemantauan'}</b> berdasarkan rata-rata skor risiko klaim.</div></> : <p className="text-sm text-slate-500">Pilih faskes untuk melihat detail.</p>}</div></div></div>;
}
function Metric({ label, value, color }: { label: string; value: string; color: string }) { return <div className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div>; }
function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div className="p-3 rounded-lg bg-slate-50"><p className="text-xs text-slate-400 flex gap-1 items-center">{icon}{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>; }
