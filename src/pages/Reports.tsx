import React, { useMemo } from 'react';
import { BarChart2, CalendarDays, Download, FileText } from 'lucide-react';
import { useClaims } from '../hooks/useClaims';
import { formatCurrency } from '../lib/utils';
import { logAudit } from '../services/audit';

function formatDateRange(claims: { date: Date }[]): string {
  if (claims.length === 0) return '2015-2026';
  const dates = claims.map(claim => claim.date.getTime());
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${new Date(Math.min(...dates)).toLocaleDateString('id-ID', opts)} – ${new Date(Math.max(...dates)).toLocaleDateString('id-ID', opts)}`;
}

export function Reports() {
  const { claims, loading, error } = useClaims();
  const period = 'Semua Data (2015-2026)';
  const filteredClaims = useMemo(() => claims, [claims]);

  // Hitung metrik dari klaim yang sudah difilter
  const summary = useMemo(() => ({
    total:    filteredClaims.length,
    highRisk: filteredClaims.filter(c => c.riskScore >= 60).length,
    anomalies: filteredClaims.filter(c => c.anomalyFlags.length > 0).length,
    value:    filteredClaims.reduce((sum, c) => sum + c.amount, 0),
  }), [filteredClaims]);

  const exportReport = () => {
    void logAudit('export_csv', { detail: `${filteredClaims.length} baris (${period})` });
    const rows = [
      ['ID Klaim', 'Pasien', 'Faskes', 'Tanggal', 'Nilai Klaim', 'Skor Risiko', 'Status'],
      ...filteredClaims.map(c => [
        c.id, c.patientName, c.providerName,
        c.date.toLocaleDateString('id-ID'),
        c.amount.toString(), c.riskScore.toString(), c.status,
      ]),
    ];
    const csv = rows.map(row => row.map(v => `"${v.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-klaim-bill-gates-${period.replace(/ /g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (error)   return <div className="p-6"><div className="card p-5 text-red-700 bg-red-50">Gagal memuat Firestore: {error}</div></div>;
  if (loading) return <div className="p-6"><div className="card p-10 text-center text-slate-500">Memuat laporan dari Firestore...</div></div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Laporan</h2>
          <p className="mt-1.5 text-sm text-slate-500">Ringkasan analitik klaim dan risiko fraud untuk kebutuhan tindak lanjut.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportReport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Download size={16} /> Ekspor CSV
          </button>
        </div>
      </div>

      {/* Info rentang tanggal aktif */}
      <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl w-fit text-sm text-blue-700">
        <CalendarDays size={15} className="flex-shrink-0" />
        <span>
          Menampilkan <strong>{summary.total}</strong> klaim dari <strong>{formatDateRange(filteredClaims)}</strong>
          {' '}
          <span className="text-blue-500">({filteredClaims.length} dari {claims.length} total)</span>
        </span>
      </div>

      {/* Metrik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Metric label="Periode Laporan"    value={period} />
        <Metric label="Total Klaim"        value={summary.total.toString()} />
        <Metric label="Klaim Risiko Tinggi" value={summary.highRisk.toString()}   color="text-orange-600" />
        <Metric label="Total Nilai Klaim"  value={formatCurrency(summary.value)} color="text-emerald-600" />
      </div>

      {/* Grafik & Rekomendasi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="card p-5">
          <div className="flex gap-2 items-center mb-5">
            <BarChart2 size={20} className="text-blue-600" />
            <h3 className="font-semibold">Ringkasan Risiko</h3>
          </div>
          {summary.total === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Tidak ada klaim dalam periode ini.</p>
          ) : (
            <div className="space-y-4">
              <Progress label="Klaim beranomali"          value={summary.anomalies}                    total={summary.total} color="bg-red-500"    />
              <Progress label="Klaim risiko tinggi"       value={summary.highRisk}                     total={summary.total} color="bg-orange-500" />
              <Progress label="Klaim risiko rendah/sedang" value={summary.total - summary.highRisk}    total={summary.total} color="bg-green-500"  />
            </div>
          )}
        </section>

        <section className="card p-5">
          <div className="flex gap-2 items-center mb-4">
            <FileText size={20} className="text-purple-600" />
            <h3 className="font-semibold">Rekomendasi Tindakan</h3>
          </div>
          {summary.total === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Tidak ada data untuk periode ini.</p>
          ) : (
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="p-3 bg-red-50 rounded-lg">
                Prioritaskan verifikasi terhadap <strong>{summary.highRisk}</strong> klaim dengan skor risiko tinggi atau kritis.
              </li>
              <li className="p-3 bg-orange-50 rounded-lg">
                Tindak lanjuti <strong>{summary.anomalies}</strong> klaim yang memiliki penanda anomali.
              </li>
              <li className="p-3 bg-blue-50 rounded-lg">
                Gunakan ekspor CSV untuk dokumentasi dan analisis lanjutan (<strong>{period}</strong>).
              </li>
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, color = 'text-slate-900' }: { label: string; value: string; color?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Progress({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value} ({percentage}%)</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
