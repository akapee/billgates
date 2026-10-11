import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Brain,
  BrainCircuit,
  Check,
  Clock,
  Cpu,
  Download,
  FileSearch,
  FileText,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  ScanSearch,
  Share2,
  ShieldCheck,
  UserCheck,
  UsersRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { evalEvidence } from '../data/evalEvidence';
import { learningEvidence } from '../data/learningEvidence';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Masalah', id: 'tentang' },
  { label: 'Alur', id: 'alur' },
  { label: 'Fitur', id: 'fitur' },
  { label: 'Validasi', id: 'validasi' },
  { label: 'Data', id: 'data' },
  { label: 'Peran', id: 'peran' },
  { label: 'Tim', id: 'tim' },
  { label: 'Kontak', id: 'kontak' },
];

// Profil sampel dihitung dari src/data/claims.ts (Data Sampel BPJS Kesehatan: FKRTL + Non-Kapitasi, nilai > Rp0).
// Hasil mesin dihitung dengan menjalankan src/lib/detection.ts, fraudAnalytics.ts pada data yang sama.
// Jika claims.ts atau aturan deteksi berubah, perbarui blok SAMPLE dan ENGINE di bawah.
// Tidak ada ID klaim atau baris individual yang ditampilkan di halaman ini.
const SAMPLE = {
  rows: 3917, // baris klaim (satu klaim bisa memuat beberapa baris tindakan)
  uniqueClaims: 3338, // nomor klaim unik
  patients: 2896, // ID pasien unik (dipseudonimkan, format PAT-xxxxx)
  units: 572, // unit faskes = jenis (RSUD/Puskesmas) x kabupaten/kota
  totalValue: 'Rp2,70 miliar',
};

const ENGINE = {
  risk: [
    { key: 'low', label: 'Rendah', n: 2720, bar: 'bg-bpjs-500', dot: 'bg-bpjs-500', text: 'text-bpjs-700' },
    { key: 'medium', label: 'Sedang', n: 81, bar: 'bg-amber-400', dot: 'bg-amber-400', text: 'text-amber-600' },
    { key: 'high', label: 'Tinggi', n: 15, bar: 'bg-orange-500', dot: 'bg-orange-500', text: 'text-orange-600' },
    { key: 'critical', label: 'Kritis', n: 1101, bar: 'bg-red-500', dot: 'bg-red-500', text: 'text-red-600' },
  ],
  signals: [
    { label: 'Kandidat pasangan tagihan ganda (skor ≥ 80)', n: 155 },
    { label: 'Baris bertanda tagihan ganda', n: 728 },
    { label: 'Baris bertanda dugaan upcoding', n: 442 },
    { label: 'Baris bertanda anomali biaya', n: 79 },
    { label: 'Baris bertanda tagihan berulang', n: 6 },
  ],
  priorityUnits: 22, // unit faskes dengan skor prioritas >= 60
  priorityHigh: 9, // skor prioritas >= 75
};

// Nomor klaim unik per bulan 2023 (2 klaim lain bertanggal Des 2022 tidak ditampilkan)
const MONTHLY = [
  { m: 'Jan', n: 225 },
  { m: 'Feb', n: 243 },
  { m: 'Mar', n: 245 },
  { m: 'Apr', n: 172 },
  { m: 'Mei', n: 310 },
  { m: 'Jun', n: 337 },
  { m: 'Jul', n: 256 },
  { m: 'Agu', n: 294 },
  { m: 'Sep', n: 281 },
  { m: 'Okt', n: 258 },
  { m: 'Nov', n: 332 },
  { m: 'Des', n: 383 },
];

const TOP_DX = [
  { code: 'E11', label: 'Diabetes melitus tipe 2', n: 1019 },
  { code: 'I10', label: 'Hipertensi esensial', n: 677 },
  { code: 'D56', label: 'Talasemia', n: 392 },
  { code: 'Z30', label: 'Pengelolaan kontrasepsi', n: 157 },
  { code: 'Z34', label: 'Pengawasan kehamilan normal', n: 155 },
];

const fmt = (n: number) => n.toLocaleString('id-ID');
const pct = (x: number, d = 1) => (x * 100).toFixed(d).replace('.', ',') + '%';
const RISK_TOTAL = ENGINE.risk.reduce((s, r) => s + r.n, 0);

// Hasil evaluasi (scripts/eval) — dibaca dari file bukti, bukan ditulis tangan
const _v1 = evalEvidence.methods.find((m) => m.name.startsWith('V1'))!;
const _v2 = evalEvidence.methods.find((m) => m.name.startsWith('V2'))!;
const _k200 = learningEvidence.rows.find((r) => r.k === 200)!;
const _big = evalEvidence.latency.find((l) => l.n === 100000);
const _sec = _big ? (_big.v2 / 1000).toFixed(1).replace('.', ',') : '2,4';
const LEARN_ROWS = learningEvidence.rows.filter((r) => [0, 50, 100, 200, 400].includes(r.k));

// Skala masalah nasional (bukan hasil operasional BILL GATES)
const ABOUT_STATS = [
  { value: '175.774', label: 'Klaim FKRTL terindikasi fraud (KPK, per Juni 2015)' },
  { value: 'Rp440 M', label: 'Nilai klaim bermasalah pada periode yang sama' },
  { value: 'Rp20 T', label: 'Estimasi kerugian fraud kesehatan nasional / tahun (KPK, 2024)' },
  { value: '106,6%', label: 'Rasio klaim JKN terhadap iuran, April 2025 (Kompas.id)' },
];

const AUDIT_ISSUES = [
  'Klaim ganda bisa lolos bila ID pasien salah ketik atau diajukan di faskes berbeda',
  'Dana yang sudah cair sulit ditarik kembali dan berpotensi sengketa hukum',
  'Alasan sebuah klaim ditandai perlu transparan agar verifikator bisa menilai',
  'Klaim sah yang mirip (mis. sesi dialisis berulang) berisiko ikut ditandai',
];

const BILLGATES_ADVANTAGES = [
  'Klaim ditandai sebelum disetujui, bukan setelah dibayar',
  'Skor 0–100 dengan alasan per atribut (ID pasien, diagnosis, tindakan, jarak waktu)',
  'Faskes diprioritaskan lewat analitik AI lokal yang temuannya bisa dibaca',
  'Setiap keputusan wajib beralasan, tercatat di log audit, dan menjadi bahan belajar sistem',
];

const WORKFLOW_STEPS = [
  { icon: LayoutDashboard, title: 'Pantau Klaim', desc: 'Klaim ditampilkan lengkap: ID, pasien, faskes, diagnosis, nilai, skor risiko, dan status di Monitoring Klaim.' },
  { icon: ScanSearch, title: 'Analisis Sinyal', desc: 'Deteksi Tagihan Ganda, Deteksi Anomali, dan Radar Risiko memunculkan sinyal untuk ditelaah, bukan keputusan otomatis.' },
  { icon: UserCheck, title: 'Telaah & Verifikasi', desc: 'Klaim berskor ≥ 60 masuk antrean Pusat Verifikasi. Auditor menelusuri kasus lewat Investigasi dan Jaringan Fraud.' },
  { icon: ShieldCheck, title: 'Keputusan Berjejak', desc: 'Setujui atau Tolak wajib disertai alasan. Keputusan dan entri log audit disimpan bersamaan.' },
  { icon: Brain, title: 'Awasi & Belajar', desc: 'Supervisor memantau laporan; keputusan verifikator menjadi bahan Model Belajar agar penandaan berikutnya lebih tepat.' },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string; tag: string }[] = [
  {
    icon: FileSearch,
    tag: 'Verifikator',
    title: 'Deteksi Tagihan Ganda',
    desc: `Pasangan klaim dibandingkan lewat pengelompokan, jendela 21 hari, dan ID pasien yang mirip. Skor 0–100 selalu disertai alasan. Pada sampel demo: ${ENGINE.signals[0].n} kandidat pasangan.`,
  },
  {
    icon: AlertTriangle,
    tag: 'Verifikator',
    title: 'Deteksi Anomali',
    desc: 'Penanda tagihan ganda, tagihan berulang, anomali biaya, dan dugaan upcoding, dengan filter per jenis dan tombol Tindak Lanjuti. Ini sinyal untuk ditelaah; anomali biaya dan upcoding belum divalidasi.',
  },
  {
    icon: BrainCircuit,
    tag: 'Auditor',
    title: 'Analitik AI Lokal: Radar Risiko',
    desc: `Memprioritaskan faskes dari skor risiko klaim, rasio tagihan ganda, dan lonjakan volume, lengkap dengan temuan yang bisa dibaca. Dihitung di browser, tanpa API atau layanan AI eksternal. Pada sampel: ${ENGINE.priorityUnits} dari ${SAMPLE.units} unit faskes jadi prioritas.`,
  },
  {
    icon: Share2,
    tag: 'Auditor',
    title: 'Jaringan Fraud',
    desc: 'Graf hubungan faskes, diagnosis, dan pasien (nomor disamarkan) dari klaim berisiko. Klik simpul untuk melihat detail dan menelusuri pola.',
  },
  {
    icon: Brain,
    tag: 'Supervisor',
    title: 'Model Belajar',
    desc: `Model kecil dengan bobot yang bisa dibaca belajar dari Setujui/Tolak untuk membedakan duplikat dari klaim sah yang mirip. Pada simulasi, precision naik dari ${pct(_v2.precision, 0)} ke ${pct(_k200.precision, 0)} (200 keputusan); recall turun ke ±84%.`,
  },
  {
    icon: ShieldCheck,
    tag: 'Verifikator',
    title: 'Pusat Verifikasi',
    desc: 'Antrean klaim berskor ≥ 60. Setujui/Tolak wajib beralasan (minimal 5 karakter), dan keputusan serta log audit disimpan bersamaan: tidak ada keputusan tanpa jejak.',
  },
  {
    icon: Gauge,
    tag: 'Auditor & Supervisor',
    title: 'Investigasi & Laporan',
    desc: 'Telusuri klaim berdasarkan ID, pasien, atau faskes beserta riwayat terkait. Laporan ringkas dapat diekspor ke CSV, dan setiap ekspor tercatat di log audit.',
  },
  {
    icon: FileText,
    tag: 'Supervisor',
    title: 'Log Audit & Pengaturan',
    desc: 'Log append-only mencatat siapa melakukan apa dan kapan. Entri tidak dapat diubah atau dihapus dari aplikasi. Pengaturan memuat preferensi notifikasi dan tampilan.',
  },
  {
    icon: UsersRound,
    tag: 'Super Admin',
    title: 'Akses Berbasis Peran & Manajemen User',
    desc: 'Empat peran dengan menu sesuai kewenangan. Manajemen User memandu pembuatan akun dan penetapan peran lewat Firebase Console atau Admin SDK, bukan dari browser.',
  },
];

const ROLES = [
  { icon: UserCheck, name: 'Verifikator', summary: 'Menilai klaim dari hasil deteksi dan mengambil keputusan Setujui/Tolak.', accent: 'bg-blue-50 text-blue-700' },
  { icon: ShieldCheck, name: 'Auditor', summary: 'Menganalisis pola fraud: Radar Risiko, Jaringan Fraud, dan Investigasi.', accent: 'bg-purple-50 text-purple-700' },
  { icon: BrainCircuit, name: 'Supervisor', summary: 'Memantau proses, laporan, log audit, dan pengaturan lintas unit.', accent: 'bg-emerald-50 text-emerald-700' },
  { icon: UsersRound, name: 'Super Admin', summary: 'Akses penuh, termasuk Manajemen User untuk akun dan peran.', accent: 'bg-orange-50 text-orange-700' },
];

// Urutan kolom: Verifikator, Auditor, Supervisor, Super Admin (mengikuti hak akses menu di aplikasi)
const ACCESS_MATRIX: { module: string; access: [boolean, boolean, boolean, boolean] }[] = [
  { module: 'Dashboard', access: [true, true, true, true] },
  { module: 'Monitoring Klaim', access: [true, false, true, true] },
  { module: 'Deteksi Tagihan Ganda & Anomali', access: [true, false, true, true] },
  { module: 'Pusat Verifikasi (Setujui/Tolak)', access: [true, false, true, true] },
  { module: 'Radar Risiko & Jaringan Fraud', access: [false, true, true, true] },
  { module: 'Investigasi', access: [false, true, true, true] },
  { module: 'Laporan & Ekspor CSV', access: [false, false, true, true] },
  { module: 'Model Belajar, Log Audit, Pengaturan', access: [false, false, true, true] },
  { module: 'Manajemen User', access: [false, false, false, true] },
];

const PROTOTYPE_MODULES = [
  'Dashboard',
  'Monitoring Klaim',
  'Deteksi Tagihan Ganda',
  'Deteksi Anomali',
  'Radar Risiko Fraud (AI lokal)',
  'Jaringan Fraud',
  'Model Belajar',
  'Pusat Verifikasi',
  'Investigasi',
  'Laporan & Ekspor CSV',
  'Log Audit',
  'Pengaturan',
  'Manajemen User',
];

const TEAM = [
  { img: 'team-nailul.jpg', name: 'Nailul Authar, S.Kom.', role: 'Ketua / Educator & Analyst' },
  { img: 'team-andy.jpg', name: 'Andy Kris Perdawan, A.Md.T.', role: 'Tech Lead' },
  { img: 'team-maruf.jpg', name: "Ma'ruf Budi Utomo, S.M.", role: 'UI/UX Designer' },
];

// Data kontak dummy untuk keperluan demo prototype — ganti dengan kontak aktif sebelum rilis produksi
const CONTACT_INFO = [
  { icon: Phone, label: 'Telepon', value: '(0322) XXX-XXXX' },
  { icon: Mail, label: 'Email', value: 'admin@billgates.id' },
  { icon: MapPin, label: 'Alamat', value: 'Jalan Tlogoretno, Gedung SMK Negeri 1 Brondong, Lamongan, Jawa Timur' },
  { icon: Clock, label: 'Jam Layanan', value: 'Senin - Jumat, 08.00 - 17.00' },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

// Satu lebar kolom untuk seluruh halaman (sebelumnya max-w-7xl terasa melebar di layar besar)
const WRAP = 'mx-auto w-full max-w-6xl px-5 sm:px-8';

// Tipografi: Bricolage Grotesque (judul) + Public Sans (isi, dirancang untuk layanan publik).
// Lebih rapi bila <link> font dipindah ke index.html; di sini disuntik agar file ini berdiri sendiri.
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Public+Sans:wght@400..700&display=swap';

const BASE_CSS = `
.bg-root{font-family:'Public Sans',ui-sans-serif,system-ui,sans-serif;--bg-focus:#047857}
.bg-head{font-family:'Bricolage Grotesque','Public Sans',ui-sans-serif,system-ui,sans-serif;letter-spacing:-0.02em}
.bg-num{font-variant-numeric:tabular-nums}
.bg-root :is(a,button,input,textarea):focus-visible{outline:2px solid var(--bg-focus);outline-offset:2px}
@media (prefers-reduced-motion:reduce){.bg-root *{transition:none!important;animation:none!important}}
`;

function Section({ id, tint = false, children }: { id: string; tint?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-14 ${tint ? 'border-y border-slate-200/70 bg-slate-50' : ''}`}>
      <div className={`${WRAP} py-12 lg:py-20`}>{children}</div>
    </section>
  );
}

// Judul rata kiri, deskripsi di kolom kanan pada layar lebar: hemat tinggi dan terasa editorial.
function SectionHeader({ title, desc }: { title: string; desc?: ReactNode }) {
  return (
    <div className="mb-8 grid items-end gap-3 lg:mb-12 lg:grid-cols-12 lg:gap-10">
      <h2 className="bg-head text-balance text-2xl font-bold leading-[1.15] text-bpjs-950 sm:text-[2rem] lg:col-span-6">{title}</h2>
      {desc && <p className="max-w-[62ch] text-[15px] leading-relaxed text-slate-600 lg:col-span-6">{desc}</p>}
    </div>
  );
}

function Note({ children, tone = 'amber' }: { children: ReactNode; tone?: 'amber' | 'green' }) {
  const amber = tone === 'amber';
  const Icon = amber ? AlertTriangle : Cpu;
  return (
    <div className={`flex items-start gap-3 rounded-lg border-l-4 px-4 py-3.5 ${amber ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-bpjs-500 bg-bpjs-50 text-slate-700'}`}>
      <Icon size={16} className={`mt-0.5 shrink-0 ${amber ? 'text-amber-600' : 'text-bpjs-600'}`} aria-hidden="true" />
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

// Deretan angka tanpa kotak: garis tipis sebagai pemisah, angka sebagai pusat perhatian.
function Figures({ items, compact = false }: { items: { value: string; label: string }[]; compact?: boolean }) {
  return (
    <dl className={`grid grid-cols-2 gap-y-6 border-t border-slate-200 lg:grid-cols-4 ${compact ? 'pt-6' : 'pt-8'}`}>
      {items.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col-reverse justify-end gap-1 pr-3 ${i % 2 === 1 ? 'border-l border-slate-200 pl-5' : ''} ${i > 0 ? 'lg:border-l lg:border-slate-200 lg:pl-6' : ''}`}
        >
          <dt className="text-sm leading-snug text-slate-600">{s.label}</dt>
          <dd className={`bg-head bg-num font-bold ${s.value.length <= 8 ? 'whitespace-nowrap' : ''} ${compact ? 'text-2xl text-bpjs-950' : 'text-3xl text-bpjs-700 lg:text-[2rem]'}`}>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RiskBar() {
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-sm bg-slate-100">
      {ENGINE.risk.map((r) => (
        <div key={r.key} className={r.bar} style={{ width: `${(r.n / RISK_TOTAL) * 100}%` }} title={`${r.label}: ${fmt(r.n)} baris`} />
      ))}
    </div>
  );
}

// Hanya bulan tertinggi dan terendah yang diberi angka; sisanya lewat tooltip agar grafik tidak ramai.
function MonthlyChart() {
  const max = Math.max(...MONTHLY.map((x) => x.n));
  const min = Math.min(...MONTHLY.map((x) => x.n));
  return (
    <div>
      <div className="flex h-56 items-end gap-1">
        {MONTHLY.map((x) => {
          const mark = x.n === max || x.n === min;
          return (
            <div key={x.m} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${x.m} 2023: ${x.n} nomor klaim`}>
              <span className={`bg-num text-xs font-semibold text-slate-700 ${mark ? '' : 'invisible'}`}>{x.n}</span>
              <div className={`w-full rounded-t-sm ${x.n === max ? 'bg-bpjs-700' : 'bg-bpjs-400'}`} style={{ height: `${(x.n / max) * 80}%` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1">
        {MONTHLY.map((x) => (
          <span key={x.m} className="flex-1 text-center text-xs text-slate-500">
            {x.m}
          </span>
        ))}
      </div>
    </div>
  );
}

// Dua batang berdampingan (sebelum/sesudah) jauh lebih cepat dibaca daripada "3,5% → 56,2%".
function Compare({ label, a, b }: { label: string; a: { name: string; v: number }; b: { name: string; v: number } }) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-800">{label}</p>
      <div className="space-y-2">
        {[a, b].map((r, i) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-xs text-slate-600">{r.name}</span>
            <div className="h-3 flex-1 rounded-sm bg-slate-100">
              <div className={`h-full rounded-sm ${i === 0 ? 'bg-slate-400' : 'bg-bpjs-600'}`} style={{ width: `${Math.max(r.v * 100, 1.5)}%` }} />
            </div>
            <span className="w-14 text-right text-sm font-semibold text-slate-900 bg-num">{pct(r.v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Momen utama halaman: satu klaim yang ditandai, lengkap dengan alasan, ambang antrean, dan aturan "keputusan wajib beralasan".
// Isinya ilustrasi (ID dimasker); tidak memuat ID atau baris klaim sebenarnya.
function FlagDemo() {
  const SCORE = 92;
  const [shown, setShown] = useState(false);
  const [decision, setDecision] = useState<null | 'Setujui' | 'Tolak'>(null);
  const [reason, setReason] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShown(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  const canSave = reason.trim().length >= 5;
  const reset = () => {
    setDecision(null);
    setReason('');
    setSaved(false);
  };

  const reasons = [
    { k: 'ID pasien', v: 'Mirip, beda 1 karakter' },
    { k: 'Diagnosis', v: 'Sama (E11)' },
    { k: 'Tindakan', v: 'Sama' },
    { k: 'Jarak waktu', v: '3 hari, dalam jendela 21 hari' },
  ];

  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_48px_-28px_rgba(2,44,34,0.45)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
            Kandidat tagihan ganda
          </p>
          <span className="text-xs text-slate-500">Ilustrasi</span>
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="grid flex-1 grid-cols-2 gap-3 text-sm sm:order-first order-last">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Klaim A</p>
                <p className="bg-num whitespace-nowrap font-semibold text-slate-800">PAT-•••17</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Klaim B</p>
                <p className="bg-num whitespace-nowrap font-semibold text-slate-800">PAT-•••71</p>
              </div>
            </div>
            <p className="bg-head bg-num shrink-0 self-end text-5xl font-extrabold leading-none text-red-600 sm:self-auto">
              {SCORE}
              <span className="ml-1 text-base font-semibold text-slate-400">/100</span>
            </p>
          </div>

          <div className="relative mt-5 pb-6">
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-red-500 transition-[width] duration-1000 ease-out"
                style={{ width: shown ? `${SCORE}%` : '0%' }}
                role="img"
                aria-label={`Skor risiko ${SCORE} dari 100`}
              />
            </div>
            {[
              { at: 60, text: 'antrean', end: true },
              { at: 80, text: 'kandidat', end: false },
            ].map((t) => (
              <span key={t.at} className="absolute top-0" style={{ left: `${t.at}%` }}>
                <span className="block h-2 w-px bg-slate-400" aria-hidden="true" />
                <span className={`mt-1 block whitespace-nowrap text-xs text-slate-500 ${t.end ? '-translate-x-full pr-1.5' : 'pl-1.5'}`}>
                  {t.at} {t.text}
                </span>
              </span>
            ))}
          </div>

          <ul className="divide-y divide-slate-100 border-y border-slate-100 text-sm">
            {reasons.map((r) => (
              <li key={r.k} className="flex items-center gap-3 py-2">
                <Check size={15} className="shrink-0 text-red-500" aria-hidden="true" />
                <span className="w-24 shrink-0 text-slate-500">{r.k}</span>
                <span className="font-medium text-slate-800">{r.v}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 min-h-[4.5rem]">
            {!decision && (
              <>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setDecision('Tolak')} className="flex-1 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50">
                    Tolak
                  </button>
                  <button type="button" onClick={() => setDecision('Setujui')} className="flex-1 rounded-lg border border-bpjs-300 px-4 py-2.5 text-sm font-semibold text-bpjs-800 transition-colors hover:bg-bpjs-50">
                    Setujui
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Coba sendiri: setiap keputusan wajib disertai alasan.</p>
              </>
            )}

            {decision && !saved && (
              <div>
                <label htmlFor="demo-alasan" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Alasan {decision === 'Tolak' ? 'menolak' : 'menyetujui'} <span className="font-normal text-slate-500">(minimal 5 karakter)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="demo-alasan"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Mis. tanggal dan tindakan identik"
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={!canSave}
                    onClick={() => setSaved(true)}
                    className="rounded-lg bg-bpjs-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-bpjs-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    Simpan
                  </button>
                </div>
                <button type="button" onClick={reset} className="mt-2 text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800">
                  Batal
                </button>
              </div>
            )}

            {decision && saved && (
              <div role="status" className="flex items-start justify-between gap-3 rounded-lg bg-bpjs-50 px-4 py-3 text-sm text-bpjs-800">
                <p className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    Keputusan <strong>{decision}</strong> tersimpan bersama entri log audit.
                  </span>
                </p>
                <button type="button" onClick={reset} className="shrink-0 text-xs font-semibold underline underline-offset-2">
                  Ulangi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-slate-500">Ilustrasi alur penandaan dengan ID dimasker, bukan klaim sebenarnya.</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  const navigate = useNavigate();
  const base = import.meta.env.BASE_URL;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [formNotice, setFormNotice] = useState(false);
  const [active, setActive] = useState('beranda');
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    if (document.getElementById('bg-fonts')) return;
    const l = document.createElement('link');
    l.id = 'bg-fonts';
    l.rel = 'stylesheet';
    l.href = FONT_HREF;
    document.head.appendChild(l);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menandai menu aktif sesuai bagian yang sedang dilihat
  useEffect(() => {
    const els = NAV_LINKS.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-bpjs-500';
  const guideHref = `${base}buku_panduan_pengguna.pdf`;
  const role = ROLES[roleIdx];
  const roleModules = ACCESS_MATRIX.map((r) => ({ module: r.module, ok: r.access[roleIdx] }));
  const roleCount = roleModules.filter((m) => m.ok).length;

  return (
    <div className="bg-root min-h-screen w-full overflow-x-hidden bg-white text-slate-700 antialiased">
      <style>{BASE_CSS}</style>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className={`${WRAP} flex h-14 items-center justify-between gap-6`}>
          <button type="button" onClick={() => scrollToSection('beranda')} className="flex shrink-0 items-center gap-2.5">
            <img src={`${base}images/logo.png`} alt="" className="h-8 w-8 rounded-lg object-contain" />
            <span className="bg-head text-lg font-extrabold leading-none text-bpjs-950">BILL GATES</span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                aria-current={active === link.id ? 'true' : undefined}
                className={`relative whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${
                  active === link.id
                    ? 'font-semibold text-bpjs-700 after:absolute after:inset-x-3 after:-bottom-[9px] after:h-0.5 after:bg-bpjs-600'
                    : 'font-medium text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => navigate('/welcome')}
            className="hidden shrink-0 items-center gap-2 rounded-lg bg-bpjs-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-bpjs-800 lg:inline-flex"
          >
            Masuk Demo
            <ArrowRight size={15} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <div className={`${WRAP} flex flex-col py-2`}>
              {NAV_LINKS.map((link) => (
                <button key={link.id} type="button" onClick={() => scrollToSection(link.id)} className="border-b border-slate-100 py-3 text-left text-[15px] font-medium text-slate-700 last:border-0">
                  {link.label}
                </button>
              ))}
              <button type="button" onClick={() => navigate('/welcome')} className="my-2 inline-flex items-center justify-center gap-2 rounded-lg bg-bpjs-700 px-4 py-3 text-sm font-semibold text-white">
                Masuk Demo
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <div id="beranda" className="scroll-mt-14 border-b border-bpjs-100 bg-bpjs-50/60">
          <div className={`${WRAP} grid items-center gap-10 pb-10 pt-10 lg:grid-cols-12 lg:gap-14 lg:pb-14 lg:pt-12`}>
            <div className="lg:col-span-6">
              <h1 className="bg-head text-5xl font-extrabold leading-none text-bpjs-950 sm:text-6xl lg:text-[4.25rem]">BILL GATES</h1>
              <p className="mt-3 text-base text-slate-600 sm:text-lg" aria-label="BILLing Ganda dan Anomali TerEliminasi Sistem">
                <span aria-hidden="true">
                  <b className="font-bold text-bpjs-700">BILL</b>ing <b className="font-bold text-bpjs-700">G</b>anda &amp; <b className="font-bold text-bpjs-700">A</b>nomali <b className="font-bold text-bpjs-700">T</b>er
                  <b className="font-bold text-bpjs-700">E</b>liminasi <b className="font-bold text-bpjs-700">S</b>istem
                </span>
              </p>
              <h2 className="bg-head mt-7 max-w-[22ch] text-balance text-2xl font-bold leading-tight text-bpjs-950 sm:text-3xl">Tangkap klaim ganda JKN sebelum dibayar.</h2>
              <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-slate-600">
                Deteksi tagihan ganda dan anomali dengan skor yang bisa dijelaskan, radar risiko faskes lewat analitik AI lokal tanpa API eksternal, dan jejak audit di setiap keputusan. Didemokan pada {fmt(SAMPLE.rows)} klaim sampel BPJS Kesehatan.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/welcome')}
                  className="inline-flex items-center gap-2 rounded-lg bg-bpjs-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bpjs-800"
                >
                  Coba Command Center (Demo)
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => scrollToSection('data')} className="text-sm font-semibold text-bpjs-800 underline decoration-bpjs-300 underline-offset-4 hover:decoration-bpjs-700">
                  Lihat data sampel
                </button>
              </div>
              <p className="mt-4 max-w-[52ch] text-xs leading-relaxed text-slate-500">Mode demo: pilih peran di halaman awal, tanpa login. Angka akurasi diukur terpisah pada data sintetis.</p>
            </div>

            <div className="lg:col-span-6">
              <FlagDemo />
            </div>
          </div>

          <div className={`${WRAP} pb-10`}>
            <Figures
              compact
              items={[
                { value: fmt(SAMPLE.rows), label: 'klaim sampel BPJS Kesehatan' },
                { value: fmt(SAMPLE.units), label: 'unit faskes dianalisis' },
                { value: '4 peran', label: 'akses sesuai kewenangan' },
                { value: '12 modul', label: 'dari deteksi sampai audit' },
              ]}
            />
          </div>
        </div>

        {/* Tentang */}
        <Section id="tentang">
          <SectionHeader
            title="Melindungi dana JKN sebelum klaim dibayarkan"
            desc="BILL GATES melengkapi proses verifikasi yang ada dengan penapisan duplikat dan analitik risiko yang bisa dijelaskan, sebelum klaim disetujui. Mencegah lebih murah daripada menagih kembali."
          />
          <Figures items={ABOUT_STATS} />
          <p className="mt-4 text-xs text-slate-500">Sumber: KPK (2015, 2024), Kompas.id (2025). Angka skala masalah nasional, bukan hasil operasional BILL GATES.</p>

          <div className="mt-12 grid overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-2">
            <div className="p-6 lg:p-8">
              <h3 className="bg-head mb-4 text-lg font-semibold text-slate-900">Tantangan yang dijawab</h3>
              <ul className="space-y-3">
                {AUDIT_ISSUES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-600">
                    <X size={16} className="mt-1 shrink-0 text-red-500" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-slate-200 bg-bpjs-50/70 p-6 lg:border-l lg:border-t-0 lg:p-8">
              <h3 className="bg-head mb-4 text-lg font-semibold text-slate-900">Penapisan pra-bayar yang bisa dijelaskan</h3>
              <ul className="space-y-3">
                {BILLGATES_ADVANTAGES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-600">
                    <Check size={16} className="mt-1 shrink-0 text-bpjs-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Alur Kerja */}
        <Section id="alur" tint>
          <SectionHeader title="Dari klaim masuk sampai keputusan berjejak" desc="Lima langkah yang konsisten antar peran: klaim ditandai sebelum disetujui, dan setiap keputusan dapat ditelusuri." />

          <ol className="grid lg:grid-cols-5">
            {WORKFLOW_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <li key={title} className="flex gap-4 lg:block">
                <div className="flex flex-col items-center lg:mb-4 lg:flex-row lg:gap-3">
                  <span className="bg-num grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bpjs-950 text-sm font-semibold text-white">{i + 1}</span>
                  {i < WORKFLOW_STEPS.length - 1 && <span aria-hidden="true" className="mt-2 w-px flex-1 bg-slate-300 lg:mt-0 lg:h-px lg:w-auto" />}
                </div>
                <div className="pb-8 lg:pb-0 lg:pr-5">
                  <h3 className="bg-head mb-1.5 flex items-center gap-2 text-base font-semibold text-bpjs-950">
                    <Icon size={16} className="shrink-0 text-bpjs-600" aria-hidden="true" />
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-4 rounded-xl border border-bpjs-100 bg-bpjs-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-slate-700">
              <strong className="font-semibold text-slate-900">Sinyal bukan vonis.</strong> Deteksi duplikat dan anomali adalah bahan penelaahan, bukan keputusan penolakan otomatis. Keputusan akhir tetap di tangan petugas.
            </p>
            <a
              href={guideHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-bpjs-200 bg-white px-4 py-2.5 text-sm font-semibold text-bpjs-800 transition-colors hover:bg-bpjs-50"
            >
              <Download size={16} aria-hidden="true" />
              Unduh panduan (PDF)
            </a>
          </div>
        </Section>

        {/* Fitur */}
        <Section id="fitur">
          <SectionHeader title="Sembilan kemampuan, satu alur kerja" desc="Semua fitur di bawah sudah berjalan di prototype. Label di samping judul menunjukkan peran utama pengguna fitur tersebut." />

          <ul className="grid gap-x-14 border-t border-slate-200 md:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, desc, tag }) => (
              <li key={title} className="flex gap-4 border-b border-slate-200 py-6">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bpjs-50 text-bpjs-700">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <h3 className="bg-head text-base font-semibold text-bpjs-950">{title}</h3>
                    <span className="text-xs font-medium text-bpjs-700">{tag}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Note tone="green">
              <strong className="font-semibold text-slate-900">Rencana integrasi:</strong> BILL GATES dirancang untuk terhubung ke sistem klaim BPJS Kesehatan yang sudah berjalan (mis. Vclaim) lewat API, dijadwalkan pada Fase 3 roadmap pengembangan. Bukan menggantikan sistem yang ada, melainkan menjadi lapisan penapisan tambahan sebelum klaim disetujui.
            </Note>
          </div>
        </Section>

        {/* Validasi */}
        <Section id="validasi" tint>
          <SectionHeader
            title="Diuji, bukan hanya diklaim"
            desc={`Diuji pada ${fmt(evalEvidence.testClaims)} klaim sintetis berkunci jawaban (100 duplikat disisipkan, ditambah klaim sah yang mirip seperti kontrol kronis dan sesi berulang). Ambang dipilih pada data tuning terpisah, lalu diuji pada data baru.`}
          />

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="space-y-9 lg:col-span-7">
              <Compare label="Precision: seberapa sering tanda duplikat memang benar" a={{ name: 'Algoritma lama (V1)', v: _v1.precision }} b={{ name: 'Perbaikan (V2)', v: _v2.precision }} />
              <Compare label="Precision setelah belajar dari 200 keputusan verifikator (simulasi)" a={{ name: 'Perbaikan (V2)', v: _v2.precision }} b={{ name: 'Setelah 200 keputusan', v: _k200.precision }} />
              <Compare label="Porsi klaim yang harus ditinjau verifikator (makin kecil makin ringan)" a={{ name: 'Algoritma lama (V1)', v: _v1.workloadPct }} b={{ name: 'Perbaikan (V2)', v: _v2.workloadPct }} />
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="bg-head text-base font-semibold text-slate-900">Precision seiring jumlah keputusan</h3>
                <p className="mt-1 text-xs text-slate-500">Simulasi, verifikator simulasi keliru 5%.</p>
                <div className="mt-5 flex h-36 items-end gap-3">
                  {LEARN_ROWS.map((r) => (
                    <div key={r.k} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                      <span className="bg-num text-xs font-semibold text-slate-700">{pct(r.precision, 0)}</span>
                      <div className={`w-full rounded-t-sm ${r.k === 200 ? 'bg-bpjs-700' : 'bg-bpjs-300'}`} style={{ height: `${r.precision * 72}%` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex gap-3">
                  {LEARN_ROWS.map((r) => (
                    <span key={r.k} className="bg-num flex-1 text-center text-xs text-slate-500">
                      {r.k === 0 ? 'Awal' : r.k}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">Sumbu bawah: jumlah keputusan verifikator yang dipelajari model.</p>
              </div>

              <div className="mt-4 flex items-baseline gap-3 rounded-xl border border-slate-200 bg-white px-6 py-5">
                <p className="bg-head bg-num shrink-0 whitespace-nowrap text-3xl font-bold text-bpjs-700">{_sec} dtk</p>
                <p className="text-sm leading-snug text-slate-600">memproses 100.000 klaim sekaligus (uji batch, 1 core)</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Note>
              <strong className="font-semibold">Keterbatasan:</strong> semua angka di bagian ini berasal dari data sintetis (terpisah dari klaim sampel BPJS pada demo) dan verifikator simulasi (keliru 5%), bukan data atau verifikator BPJS sungguhan. Pada 200 keputusan, precision naik tetapi recall turun ke ±84%, sehingga sebagian duplikat asli ikut tersaring. Deteksi anomali biaya (upcoding) belum divalidasi. Parameter akan dikalibrasi dengan Data Sampel BPJS dan diuji pada fase pilot.
            </Note>
          </div>
        </Section>

        {/* Prototype CTA */}
        <section id="prototype" className="scroll-mt-14 bg-bpjs-950 text-white">
          <div className={`${WRAP} grid items-center gap-8 py-12 lg:grid-cols-12 lg:gap-14 lg:py-20`}>
            <div className="lg:col-span-6">
              <h2 className="bg-head text-balance text-2xl font-bold leading-[1.15] sm:text-[2rem]">Coba Command Center dengan {fmt(SAMPLE.rows)} klaim sampel</h2>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-bpjs-100">Bukan sekadar mockup. Pilih peran, lalu jelajahi deteksi, radar risiko, verifikasi, dan log audit pada data sampel BPJS Kesehatan.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/welcome')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-bpjs-950 transition-colors hover:bg-bpjs-50"
                >
                  Masuk Command Center (Demo)
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
                <a
                  href={guideHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <Download size={16} aria-hidden="true" />
                  Panduan (PDF)
                </a>
              </div>
              <p className="mt-4 text-xs text-bpjs-200">Mode demo dengan data klaim sampel. Pilih peran tanpa login.</p>
            </div>

            {/* Daftar modul dibuat menyerupai menu samping aplikasi */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-white/15 bg-white/5 p-2">
                <p className="px-3 pb-2 pt-2 text-xs text-bpjs-200">{PROTOTYPE_MODULES.length} modul di Command Center</p>
                <ul className="grid grid-cols-2 gap-1">
                  {PROTOTYPE_MODULES.map((item, i) => (
                    <li key={item} className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] leading-snug sm:gap-2.5 sm:px-3 sm:text-sm ${i === 0 ? 'bg-white/10 font-semibold text-white' : 'text-bpjs-100'}`}>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${i === 0 ? 'bg-bpjs-300' : 'bg-white/30'}`} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sampel */}
        <Section id="data">
          <SectionHeader
            title={`${fmt(SAMPLE.rows)} klaim sampel yang dipakai di demo`}
            desc="Command Center memuat klaim dari Data Sampel BPJS Kesehatan (FKRTL dan Non-Kapitasi, nilai klaim di atas Rp0) dengan ID pasien dipseudonimkan. Di bawah ini gambaran isinya dan apa yang ditemukan mesin deteksi."
          />

          <Figures
            items={[
              { value: fmt(SAMPLE.uniqueClaims), label: 'nomor klaim unik' },
              { value: fmt(SAMPLE.patients), label: 'pasien unik (ID dipseudonimkan)' },
              { value: fmt(SAMPLE.units), label: 'unit faskes (jenis × kabupaten/kota)' },
              { value: SAMPLE.totalValue, label: 'total nilai klaim pada sampel' },
            ]}
          />
          <p className="mt-4 text-xs text-slate-500">
            Sumber: Data Sampel BPJS Kesehatan lewat{' '}
            <a href="https://data.bpjs-kesehatan.go.id/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-slate-800">
              Portal Data JKN (data.bpjs-kesehatan.go.id)
            </a>
            .
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h3 className="bg-head text-base font-semibold text-slate-900">Sebaran risiko hasil mesin deteksi</h3>
                <span className="bg-num text-xs text-slate-500">{fmt(RISK_TOTAL)} baris klaim</span>
              </div>
              <RiskBar />
              <ul className="mt-4 divide-y divide-slate-100">
                {ENGINE.risk.map((r) => (
                  <li key={r.key} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${r.dot}`} aria-hidden="true" />
                    <span className="flex-1 text-slate-700">{r.label}</span>
                    <span className="bg-num font-semibold text-slate-900">{fmt(r.n)}</span>
                    <span className="bg-num w-14 text-right text-slate-500">{pct(r.n / RISK_TOTAL)}</span>
                  </li>
                ))}
              </ul>

              <h4 className="mb-2 mt-6 border-t border-slate-100 pt-5 text-sm font-semibold text-slate-800">Sinyal yang ditemukan</h4>
              <ul className="space-y-2">
                {ENGINE.signals.map((s) => (
                  <li key={s.label} className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="text-slate-600">{s.label}</span>
                    <span className="bg-num font-semibold text-slate-900">{fmt(s.n)}</span>
                  </li>
                ))}
                <li className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-slate-600">Unit faskes jadi prioritas investigasi (skor ≥ 60)</span>
                  <span className="bg-num font-semibold text-slate-900">
                    {ENGINE.priorityUnits} dari {fmt(SAMPLE.units)}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h3 className="bg-head text-base font-semibold text-slate-900">Nomor klaim per bulan</h3>
                <span className="text-xs text-slate-500">2023</span>
              </div>
              <MonthlyChart />
              <p className="mt-4 text-xs text-slate-500">2 klaim lain bertanggal Des 2022, tidak ditampilkan.</p>
            </div>
          </div>

          <div className="mt-6 grid divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            <div className="p-6">
              <h3 className="bg-head mb-4 text-base font-semibold text-slate-900">Diagnosis terbanyak (ICD-10)</h3>
              <div className="space-y-3">
                {TOP_DX.map((d) => (
                  <div key={d.code}>
                    <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-slate-600">
                        <span className="font-semibold text-slate-900">{d.code}</span> {d.label}
                      </span>
                      <span className="bg-num font-semibold text-slate-800">{fmt(d.n)}</span>
                    </div>
                    <div className="h-1.5 rounded-sm bg-slate-100">
                      <div className="h-full rounded-sm bg-bpjs-500" style={{ width: `${(d.n / TOP_DX[0].n) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              <h3 className="bg-head mb-4 text-base font-semibold text-slate-900">Catatan data</h3>
              <ul className="space-y-3 text-sm leading-relaxed text-slate-600">
                <li className="flex gap-2.5">
                  <Check size={16} className="mt-0.5 shrink-0 text-bpjs-600" aria-hidden="true" />
                  <span>
                    Satu nomor klaim bisa memuat beberapa baris tindakan: {fmt(SAMPLE.rows)} baris untuk {fmt(SAMPLE.uniqueClaims)} nomor klaim.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>Nama faskes dibentuk dari jenis dan kabupaten/kota (mis. Puskesmas + wilayah), bukan fasilitas individual.</span>
                </li>
                <li className="flex gap-2.5">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>Data Sampel BPJS Kesehatan berisi lebih dari 50 ribu baris, sedangkan prototype di Firebase hanya menampung sebagian. Demo memuat {fmt(SAMPLE.rows)} baris yang dipilih dari klaim bernilai di atas Rp0 dengan pola tagihan ganda atau upcoding. Karena itu kasus identik dan nilai ekstrem lebih banyak daripada data aslinya, dan proporsinya bukan cerminan JKN nasional.</span>
                </li>
              </ul>
            </div>

            <div className="bg-bpjs-50/60 p-6">
              <h3 className="bg-head mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
                <LockKeyhole size={16} className="text-bpjs-600" aria-hidden="true" />
                Privasi
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Pasien tampil sebagai PAT-xxxxx dan disamarkan pada Jaringan Fraud. Analitik dihitung di browser tanpa mengirim data ke layanan AI eksternal. Halaman ini hanya menampilkan agregat.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Note>
              <strong className="font-semibold">Perlu dibaca dengan benar:</strong> angka pada bagian ini adalah keluaran mesin deteksi pada sampel demo, bukan angka akurasi dan bukan temuan fraud yang terbukti. Akurasi diukur terpisah pada data sintetis berkunci jawaban (lihat bagian Validasi).
            </Note>
          </div>
        </Section>

        {/* Peran */}
        <Section id="peran" tint>
          <SectionHeader title="Setiap peran melihat yang menjadi tugasnya" desc="Menu di aplikasi mengikuti peran aktif. Pilih peran untuk melihat modul yang bisa diakses; ini mengikuti pengaturan menu pada prototype." />

          <div role="tablist" aria-label="Pilih peran" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ROLES.map(({ icon: Icon, name }, i) => (
              <button
                key={name}
                type="button"
                role="tab"
                id={`tab-${i}`}
                aria-selected={roleIdx === i}
                aria-controls="panel-peran"
                onClick={() => setRoleIdx(i)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  roleIdx === i ? 'border-bpjs-700 bg-bpjs-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-bpjs-300'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {name}
              </button>
            ))}
          </div>

          <div id="panel-peran" role="tabpanel" aria-labelledby={`tab-${roleIdx}`} className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-1 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <p className="text-[15px] leading-relaxed text-slate-700">
                <strong className="bg-head mr-1.5 text-lg font-semibold text-bpjs-950">{role.name}</strong>
                {role.summary}
              </p>
              <p className="bg-num shrink-0 text-sm text-slate-500">
                {roleCount} dari {ACCESS_MATRIX.length} modul
              </p>
            </div>
            <ul className="grid sm:grid-cols-2">
              {roleModules.map((m) => (
                <li key={m.module} className="flex items-center gap-3 border-b border-slate-100 px-6 py-3 text-sm last:border-b-0 sm:odd:border-r">
                  {m.ok ? <Check size={16} className="shrink-0 text-bpjs-600" aria-label="Dapat diakses" /> : <Minus size={16} className="shrink-0 text-slate-400" aria-label="Tidak dapat diakses" />}
                  <span className={m.ok ? 'font-medium text-slate-900' : 'text-slate-500'}>{m.module}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <Note tone="green">
              <strong className="font-semibold text-slate-900">Tentang akses di mode demo:</strong> peran dipilih di halaman awal tanpa login, agar juri dapat mencoba setiap sudut pandang. Autentikasi akun (Firebase Authentication) dengan sesi yang habis otomatis disiapkan untuk fase pilot, dan pembuatan akun hanya lewat Firebase Console atau Admin SDK, tidak dari browser.
            </Note>
          </div>
        </Section>

        {/* Tim */}
        <Section id="tim">
          <SectionHeader title="Tim Gelombang Utara" desc="Tiga peran yang saling melengkapi, dari konsep hingga eksekusi teknis." />
          <ul className="grid gap-6 sm:grid-cols-3">
            {TEAM.map((m) => (
              <li key={m.name} className="flex items-center gap-4">
                <img src={`${base}images/${m.img}`} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-bpjs-100" />
                <div>
                  <p className="bg-head font-semibold leading-snug text-bpjs-950">{m.name}</p>
                  <p className="text-sm text-slate-600">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* Kontak */}
        <Section id="kontak" tint>
          <SectionHeader title="Ada pertanyaan seputar BILL GATES?" desc="Tim kami siap membantu Anda memahami sistem deteksi klaim ganda JKN." />

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <dl className="divide-y divide-slate-200 border-y border-slate-200">
                {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-4 py-4">
                    <Icon size={18} className="mt-0.5 shrink-0 text-bpjs-600" aria-hidden="true" />
                    <div>
                      <dt className="text-sm text-slate-500">{label}</dt>
                      <dd className="text-[15px] font-medium text-slate-900">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-slate-500">Kontak di atas adalah data dummy untuk keperluan demo prototype Healthkathon 2026.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFormNotice(true);
              }}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7 lg:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cf-nama" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nama
                  </label>
                  <input id="cf-nama" name="nama" type="text" autoComplete="name" placeholder="Nama Anda" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input id="cf-email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="cf-instansi" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Instansi
                </label>
                <input id="cf-instansi" name="instansi" type="text" autoComplete="organization" placeholder="Nama instansi / faskes" className={inputCls} />
              </div>
              <div>
                <label htmlFor="cf-pesan" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Pesan
                </label>
                <textarea id="cf-pesan" name="pesan" rows={4} placeholder="Tuliskan pertanyaan atau kebutuhan Anda..." className={`${inputCls} resize-none`} />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-bpjs-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-bpjs-800 sm:w-auto"
              >
                Kirim Pesan
              </button>
              {formNotice && (
                <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Mode demo: formulir ini belum terhubung ke layanan pengiriman, sehingga pesan tidak terkirim.
                </p>
              )}
            </form>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className={`${WRAP} flex flex-col items-center justify-between gap-3 py-8 sm:flex-row`}>
          <div className="flex items-center gap-3">
            <img src={`${base}images/logo.png`} alt="" className="h-7 w-7 rounded-lg object-contain" />
            <p className="bg-head font-bold text-bpjs-950">BILL GATES</p>
          </div>
          <p className="text-xs italic text-slate-500">&ldquo;Detect Smarter, Protect JKN&rdquo;</p>
          <p className="text-xs text-slate-500">&copy; 2026 Tim Gelombang Utara. Prototype Healthkathon 2026.</p>
        </div>
      </footer>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas"
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-bpjs-700 text-white shadow-lg transition-colors hover:bg-bpjs-800"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
