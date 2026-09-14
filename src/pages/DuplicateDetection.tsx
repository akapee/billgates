import React, { useMemo, useState } from 'react';
import { Copy, CheckCircle2, Search } from 'lucide-react';
import { claims } from '../data/claims';
import { formatCurrency } from '../lib/utils';
import { RiskBadge } from '../components/ui/Badge';
import { findDuplicateCandidates } from '../lib/detection';

// Kandidat duplikat dihitung dari algoritma similarity (ID Pasien, ICD-10,
// jenis tindakan, rentang waktu) — bukan pasangan acak.
const candidates = findDuplicateCandidates(claims, 50);

export function DuplicateDetection() {
  const [query, setQuery] = useState('');
  const [reviewed, setReviewed] = useState<string[]>([]);
  const visibleCandidates = useMemo(
    () =>
      candidates.filter((item) =>
        [item.claim.id, item.claim.patientName, item.claim.providerName].some((value) =>
          value.toLowerCase().includes(query.toLowerCase())
        )
      ),
    [query]
  );
  const review = (id: string) => setReviewed((current) => (current.includes(id) ? current : [...current, id]));

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Deteksi Tagihan Ganda</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Kandidat dihitung otomatis dari kesamaan ID pasien, kode diagnosis (ICD-10), jenis tindakan, dan
          rentang waktu pengajuan — perlu diverifikasi oleh analis sebelum klaim disetujui.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Metric label="Kandidat Ditemukan" value={candidates.length.toString()} color="text-red-600" />
        <Metric
          label="Belum Ditinjau"
          value={(candidates.length - reviewed.length).toString()}
          color="text-orange-600"
        />
        <Metric label="Sudah Ditinjau" value={reviewed.length.toString()} color="text-emerald-600" />
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kandidat tagihan ganda..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {visibleCandidates.map((item) => {
            const done = reviewed.includes(item.claim.id);
            return (
              <div
                key={item.claim.id}
                className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto] gap-4 items-center"
              >
                <ClaimSummary
                  title="Klaim Utama"
                  id={item.claim.id}
                  patient={item.claim.patientName}
                  provider={item.claim.providerName}
                  amount={item.claim.amount}
                />
                <div className="text-center">
                  <Copy size={20} className="mx-auto text-orange-500" />
                  <p className="mt-1 text-lg font-bold text-orange-600">{item.similarity}%</p>
                  <p className="text-xs text-slate-400">kemiripan</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1 max-w-[170px]">
                    {item.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-[10px] font-medium"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
                <ClaimSummary
                  title="Klaim Pembanding"
                  id={item.match.id}
                  patient={item.match.patientName}
                  provider={item.match.providerName}
                  amount={item.match.amount}
                />
                <div className="flex flex-col items-center gap-2">
                  <RiskBadge level={item.claim.riskLevel} />
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 size={14} /> Ditinjau
                    </span>
                  ) : (
                    <button
                      onClick={() => review(item.claim.id)}
                      className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Tinjau Kandidat
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {visibleCandidates.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">Kandidat tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ClaimSummary({
  title,
  id,
  patient,
  provider,
  amount,
}: {
  title: string;
  id: string;
  patient: string;
  provider: string;
  amount: number;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase">{title}</p>
      <p className="mt-1 font-semibold text-slate-800">
        {id} · {patient}
      </p>
      <p className="text-sm text-slate-500 truncate">{provider}</p>
      <p className="mt-1 text-sm font-bold">{formatCurrency(amount)}</p>
    </div>
  );
}
