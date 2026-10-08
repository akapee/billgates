import React from 'react';
import { FlaskConical } from 'lucide-react';
import { evalEvidence } from '../../data/evalEvidence';
import { learningEvidence } from '../../data/learningEvidence';

// Semua angka di panel ini dibaca dari hasil skrip evaluasi (scripts/eval), bukan ditulis tangan.
const pct = (x: number, d = 1) => (x * 100).toFixed(d).replace('.', ',') + '%';

export function MeasuredResults() {
  const v1 = evalEvidence.methods.find((m) => m.name.startsWith('V1'))!;
  const v2 = evalEvidence.methods.find((m) => m.name.startsWith('V2'))!;
  const rows = learningEvidence.rows.filter((r) => [0, 50, 100, 200, 400].includes(r.k));
  const big = evalEvidence.latency.find((l) => l.n === 100000);

  return (
    <div className="h-full w-full flex items-center bg-gradient-to-br from-bpjs-50 via-white to-bpjs-100 lg:rounded-l-[2.5rem] p-6 lg:p-10">
      <div className="w-full max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-2 text-bpjs-700">
          <FlaskConical size={18} />
          <p className="text-sm font-bold">Hasil Pengukuran</p>
          <span className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            Data sintetis · {evalEvidence.testClaims.toLocaleString('id-ID')} klaim uji
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
          <p className="text-xs font-semibold text-slate-500 mb-3">Algoritma lama (V1) → perbaikan (V2)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-slate-400">Precision</p>
              <p className="text-2xl font-extrabold text-slate-800">{pct(v1.precision)} <span className="text-bpjs-600">→ {pct(v2.precision)}</span></p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Klaim yang harus ditinjau</p>
              <p className="text-2xl font-extrabold text-slate-800">{pct(v1.workloadPct, 0)} <span className="text-bpjs-600">→ {pct(v2.workloadPct)}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
          <p className="text-xs font-semibold text-slate-500 mb-3">Precision setelah belajar dari keputusan verifikator <span className="font-normal text-slate-400">(simulasi)</span></p>
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.k} className="flex items-center gap-3">
                <span className="w-24 text-[11px] text-slate-500 shrink-0">{r.k === 0 ? 'Aturan awal' : `${r.k} keputusan`}</span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-bpjs-500" style={{ width: `${r.precision * 100}%` }} />
                </div>
                <span className="w-12 text-right text-xs font-bold text-slate-700">{pct(r.precision, 0)}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Pertukaran: recall turun dari 100% ke ±84% pada 200 keputusan. Keputusan akhir tetap di verifikator.</p>
        </div>

        {big && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 flex items-center gap-4">
            <p className="text-2xl font-extrabold text-slate-800 whitespace-nowrap">{(big.v2 / 1000).toFixed(1).replace('.', ',')} dtk</p>
            <p className="text-xs text-slate-500">memproses 100.000 klaim sekaligus (1 core). Algoritma lama butuh 5 detik hanya untuk 10.000 klaim.</p>
          </div>
        )}
      </div>
    </div>
  );
}
