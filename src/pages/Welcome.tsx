import { ArrowRight, BrainCircuit, Info, ShieldCheck, UserCheck, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../auth/AuthContext';

type RoleInfo = { role: Role; title: string; summary: string; access: string; icon: typeof UserCheck; accent: string };

const roles: RoleInfo[] = [
  { role: 'verifikator', title: 'Verifikator', summary: 'Menilai klaim yang diajukan dari hasil deteksi.', access: 'Monitoring Klaim, Deteksi Tagihan Ganda, Deteksi Anomali, dan Pusat Verifikasi.', icon: UserCheck, accent: 'bg-blue-50 text-blue-700 border-blue-200' },
  { role: 'auditor', title: 'Auditor', summary: 'Menganalisis pola fraud dan melakukan telaah investigatif.', access: 'Radar Risiko Fraud, Jaringan Fraud, dan Investigasi.', icon: ShieldCheck, accent: 'bg-purple-50 text-purple-700 border-purple-200' },
  { role: 'supervisor', title: 'Supervisor', summary: 'Memantau proses, laporan, serta keputusan lintas unit.', access: 'Menu operasional, analitik, laporan, log audit, dan pengaturan; tanpa Manajemen User.', icon: BrainCircuit, accent: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { role: 'superadmin', title: 'Super Admin', summary: 'Mengelola sistem dan akses pengguna secara menyeluruh.', access: 'Seluruh akses Supervisor, termasuk Manajemen User.', icon: UsersRound, accent: 'bg-orange-50 text-orange-700 border-orange-200' },
];

export function Welcome() {
  const navigate = useNavigate();
  const { role, setMockRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>(role || 'superadmin');
  const [showInfo, setShowInfo] = useState(false);
  const enterDashboard = () => { setMockRole(selectedRole); navigate('/dashboard'); };
  return <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-5 py-10 sm:px-8 grid place-items-center">
    <section className="w-full max-w-xl">
      <div className="text-center"><div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white grid place-items-center shadow-lg shadow-blue-600/25"><BrainCircuit size={32} /></div><h1 className="mt-5 text-5xl sm:text-6xl font-black tracking-tight"><span className="text-slate-900">BILL </span><span className="text-blue-600">GATES</span></h1><p className="mt-3 text-sm sm:text-base text-slate-500">BILLing Ganda &amp; Anomali TerEliminasi Sistem</p></div>
      <div className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-300/30"><p className="text-xs font-bold tracking-[0.16em] text-blue-600">MASUK COMMAND CENTER</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Pilih role akses</h2><p className="mt-2 text-sm leading-6 text-slate-500">Pilih peran untuk menampilkan menu dan ruang kerja yang sesuai.</p><label className="block mt-6 text-sm font-semibold text-slate-700" htmlFor="role-access">Role akses</label><select id="role-access" value={selectedRole} onChange={event => setSelectedRole(event.target.value as Role)} className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"><option value="verifikator">Verifikator</option><option value="auditor">Auditor</option><option value="supervisor">Supervisor</option><option value="superadmin">Super Admin</option></select><button onClick={enterDashboard} className="mt-4 w-full inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20">Masuk ke Dashboard <ArrowRight size={17} /></button><button onClick={() => setShowInfo(true)} className="mt-3 w-full inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"><Info size={17} /> Informasi Role Akses</button></div>
      <p className="mt-5 text-center text-xs text-slate-500">Mode demo: role dapat diubah kembali melalui pilihan role pada aplikasi.</p>
    </section>
    {showInfo && <RoleInfoModal onClose={() => setShowInfo(false)} />}
  </main>;
}

function RoleInfoModal({ onClose }: { onClose: () => void }) { return <div className="fixed inset-0 z-50 px-5 py-8 bg-slate-900/50 backdrop-blur-sm grid place-items-center" role="dialog" aria-modal="true" aria-label="Informasi role akses" onClick={onClose}><div className="w-full max-w-2xl max-h-full overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-7" onClick={event => event.stopPropagation()}><div className="flex justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.16em] text-blue-600">INFORMASI ROLE AKSES</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Peran dalam sistem</h2></div><button onClick={onClose} aria-label="Tutup popup" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-500"><X size={20} /></button></div><div className="mt-6 space-y-3">{roles.map(info => { const Icon = info.icon; return <article key={info.role} className="p-4 rounded-xl border border-slate-200"><div className="flex gap-3"><span className={`w-10 h-10 rounded-lg border grid place-items-center shrink-0 ${info.accent}`}><Icon size={20} /></span><div><h3 className="font-bold text-slate-900">{info.title}</h3><p className="mt-1 text-sm text-slate-600">{info.summary}</p><p className="mt-2 text-xs leading-5 text-slate-500"><b className="text-slate-700">Akses:</b> {info.access}</p></div></div></article>; })}</div><button onClick={onClose} className="mt-6 w-full px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">Tutup</button></div></div>; }
