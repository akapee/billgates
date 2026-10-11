import React, { useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../auth/AuthContext';

interface AuditRow { firestoreId: string; uid: string; email: string; action: string; claimId: string | null; detail: string | null; at?: { toDate: () => Date } }

const ACTION_LABEL: Record<string, string> = {
  login: 'Masuk', logout: 'Keluar', session_timeout: 'Sesi habis', view_claim: 'Membuka klaim', export_csv: 'Ekspor CSV', decision: 'Keputusan',
};

export function AuditLog() {
  const { canInvestigate: canAudit } = useAuth();
  const { data, loading, error } = useFirestore<AuditRow>('auditLogs', [orderBy('at', 'desc'), limit(300)]);
  const [filter, setFilter] = useState('all');
  const rows = useMemo(() => data.filter((r) => filter === 'all' || r.action === filter), [data, filter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  React.useEffect(() => { setCurrentPage(1); }, [filter]);
  const totalPages = Math.ceil(rows.length / pageSize);
  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (!canAudit) return <div className="p-6"><div className="card p-6 text-sm text-slate-600">Halaman ini hanya untuk peran Auditor dan Administrator.</div></div>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6 flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><ScrollText size={20} /></span>
        <div>
          <h2 className="text-2xl font-bold">Log Audit</h2>
          <p className="mt-1 text-sm text-slate-500">Catatan append-only: siapa melakukan apa dan kapan. Entri tidak dapat diubah atau dihapus dari aplikasi.</p>
        </div>
      </div>
      <div className="card p-3 mb-4 flex flex-wrap gap-2">
        {['all', ...Object.keys(ACTION_LABEL)].map((a) => (
          <button key={a} onClick={() => setFilter(a)} className={`px-3 py-1.5 text-xs font-semibold rounded-full ${filter === a ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {a === 'all' ? 'Semua' : ACTION_LABEL[a]}
          </button>
        ))}
      </div>
      {error ? <div className="card p-5 text-sm text-red-700 bg-red-50">Gagal memuat: {error}</div> : loading ? <div className="card p-10 text-center text-sm text-slate-500">Memuat log...</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 border-b border-slate-100"><tr><th className="p-3">Waktu</th><th className="p-3">Pengguna</th><th className="p-3">Aksi</th><th className="p-3">Klaim</th><th className="p-3">Keterangan</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.map((r) => (
                <tr key={r.firestoreId}>
                  <td className="p-3 whitespace-nowrap text-slate-500">{r.at ? r.at.toDate().toLocaleString('id-ID') : '—'}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3 font-medium">{ACTION_LABEL[r.action] ?? r.action}</td>
                  <td className="p-3">{r.claimId ?? '—'}</td>
                  <td className="p-3 text-slate-600">{r.detail ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-10 text-center text-sm text-slate-500">Belum ada entri.</p>}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, rows.length)} dari {rows.length} entri
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-4 py-2 text-xs font-medium border border-slate-200 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-4 py-2 text-xs font-medium border border-slate-200 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
