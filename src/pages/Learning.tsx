import React from 'react';
import { Brain, FlaskConical } from 'lucide-react';
import { useClaims } from '../hooks/useClaims';
import { useLearnedModel } from '../hooks/useLearnedModel';
import { FEATURE_NAMES, FEATURE_LABELS, MIN_LABELS } from '../lib/learning';
import { learningEvidence } from '../data/learningEvidence';

const pct = (x: number) => (x * 100).toFixed(1) + '%';

export function Learning() {
  const { claims, loading, error } = useClaims();
  const { model, pool, flaggedCount, ruleCount, labelCount } = useLearnedModel(claims);

  if (error) return <div className="p-6"><div className="card p-5 text-red-700 bg-red-50">Gagal memuat: {error}</div></div>;
  if (loading) return <div className="p-6"><div className="card p-10 text-center text-slate-500">Memuat...</div></div>;

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Brain size={20} /></span>
        <div>
          <h2 className="text-2xl font-bold">Model Belajar</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sistem belajar dari keputusan Setujui/Tolak verifikator untuk membedakan duplikat dari klaim sah yang kebetulan mirip.
            Bobotnya bisa dibaca; verifikator tetap pengambil keputusan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Stat label="Mode" value={model.active ? 'Terlatih' : 'Aturan awal (V2)'} sub={model.active ? 'memakai bobot hasil belajar' : `aktif setelah ${MIN_LABELS} keputusan`} />
        <Stat label="Keputusan dipakai melatih" value={labelCount.toString()} sub="dari klaim di kolam kandidat" />
        <Stat label="Kandidat di kolam" value={pool.length.toString()} sub="skor V2 ≥ 70" />
        <Stat label="Ditandai sekarang" value={`${flaggedCount}`} sub={`aturan tetap akan menandai ${ruleCount}`} />
      </div>

      <section className="card p-5">
        <h3 className="font-semibold">Bobot fitur: awal vs sekarang</h3>
        <p className="text-xs text-slate-500 mt-1">Bobot awal = aturan V2. Bobot positif menaikkan peluang "duplikat", negatif menurunkannya.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 border-b border-slate-100"><tr><th className="py-2">Fitur</th><th>Awal</th><th>Sekarang</th><th>Perubahan</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {FEATURE_NAMES.map((n, i) => {
                const delta = model.weights[i] - model.prior[i];
                return (
                  <tr key={n}>
                    <td className="py-2">{FEATURE_LABELS[n]}</td>
                    <td>{model.prior[i].toFixed(2)}</td>
                    <td className="font-semibold">{model.weights[i].toFixed(2)}</td>
                    <td className={Math.abs(delta) < 0.05 ? 'text-slate-400' : delta > 0 ? 'text-orange-600' : 'text-emerald-600'}>{Math.abs(delta) < 0.05 ? '—' : (delta > 0 ? '+' : '') + delta.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center gap-2"><FlaskConical size={18} className="text-purple-600" /><h3 className="font-semibold">Bukti simulasi (data sintetis)</h3></div>
        <p className="text-xs text-slate-500 mt-1">
          Verifikator disimulasikan (keliru {learningEvidence.labelNoise * 100}%). Dilatih pada satu set data, diuji pada data baru
          ({learningEvidence.testClaims.toLocaleString('id-ID')} klaim, {learningEvidence.testDuplicates} duplikat). Rata-rata {learningEvidence.repeats} pengulangan.
          Ini membuktikan mekanismenya, bukan hasil pada verifikator BPJS sungguhan.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 border-b border-slate-100"><tr><th className="py-2">Keputusan</th><th>Precision</th><th>Recall</th><th>F1</th><th>Sah salah tandai</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {learningEvidence.rows.map((r) => (
                <tr key={r.k}><td className="py-2">{r.k}{r.k < MIN_LABELS ? ' (aturan awal)' : ''}</td><td>{pct(r.precision)}</td><td>{pct(r.recall)}</td><td className="font-semibold">{pct(r.f1)}</td><td>{r.fp.toFixed(1)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
          Pertukaran yang jujur: model menyaring kandidat sehingga precision naik, tetapi sebagian duplikat asli ikut tersaring (recall turun).
          Karena itu hasil model ditampilkan sebagai peluang, dan keputusan akhir tetap di tangan verifikator.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p><p className="text-[11px] text-slate-400 mt-0.5">{sub}</p></div>;
}
