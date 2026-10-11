import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Brain,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Download,
  FileSearch,
  FileText,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Phone,
  ScanSearch,
  Share2,
  ShieldCheck,
  Target,
  UserCheck,
  UsersRound,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { evalEvidence } from '../data/evalEvidence';
import { learningEvidence } from '../data/learningEvidence';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Beranda', id: 'beranda' },
  { label: 'Tentang', id: 'tentang' },
  { label: 'Alur', id: 'alur' },
  { label: 'Fitur', id: 'fitur' },
  { label: 'Peran', id: 'peran' },
  { label: 'Data', id: 'data' },
  { label: 'Validasi', id: 'validasi' },
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

const VALIDATION_STATS = [
  { value: `${pct(_v1.precision)} → ${pct(_v2.precision)}`, label: 'Precision: algoritma lama (V1) → perbaikan (V2)' },
  { value: `${pct(_v2.precision)} → ${pct(_k200.precision)}`, label: 'Precision setelah belajar dari 200 keputusan verifikator (simulasi)' },
  { value: `${pct(_v1.workloadPct)} → ${pct(_v2.workloadPct)}`, label: 'Porsi klaim yang harus ditinjau verifikator (V1 → V2)' },
  { value: `${_sec} dtk`, label: 'Memproses 100.000 klaim sekaligus (uji batch, 1 core)' },
];

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

function SectionHeader({
  icon: Icon,
  badge,
  title,
  desc,
  light = false,
}: {
  icon: LucideIcon;
  badge: string;
  title: string;
  desc?: ReactNode;
  light?: boolean;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <div
        className={
          light
            ? 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-4'
            : 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-4'
        }
      >
        <Icon size={14} />
        {badge}
      </div>
      <h2 className={`text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 text-balance ${light ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h2>
      {desc && <p className={`text-balance leading-relaxed ${light ? 'text-bpjs-100' : 'text-slate-500'}`}>{desc}</p>}
    </div>
  );
}

function Note({ children, tone = 'amber' }: { children: ReactNode; tone?: 'amber' | 'green' }) {
  const cls =
    tone === 'amber'
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : 'bg-bpjs-50/70 border-bpjs-100 text-slate-600';
  const icon =
    tone === 'amber' ? (
      <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
    ) : (
      <Cpu size={18} className="text-bpjs-600 shrink-0 mt-0.5" />
    );
  return (
    <div className={`flex items-start gap-3 border rounded-2xl p-5 ${cls}`}>
      {icon}
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function RiskBar() {
  return (
    <div className="flex w-full h-4 overflow-hidden rounded-full bg-slate-100">
      {ENGINE.risk.map((r) => (
        <div key={r.key} className={r.bar} style={{ width: `${(r.n / RISK_TOTAL) * 100}%` }} title={`${r.label}: ${fmt(r.n)} baris`} />
      ))}
    </div>
  );
}

function MonthlyChart() {
  const max = Math.max(...MONTHLY.map((x) => x.n));
  return (
    <div>
      <div className="flex items-end gap-1.5 h-40">
        {MONTHLY.map((x) => (
          <div key={x.m} className="flex-1 h-full flex flex-col justify-end items-center gap-1" title={`${x.m} 2023: ${x.n} nomor klaim`}>
            <span className="text-[10px] font-semibold text-slate-500">{x.n}</span>
            <div className="w-full rounded-t-md bg-gradient-to-t from-bpjs-600 to-bpjs-400" style={{ height: `${(x.n / max) * 78}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {MONTHLY.map((x) => (
          <span key={x.m} className="flex-1 text-center text-[10px] text-slate-400">
            {x.m}
          </span>
        ))}
      </div>
    </div>
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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const inputCls =
    'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bpjs-500/30 focus:border-bpjs-400';

  const guideHref = `${base}buku_panduan_pengguna.pdf`;

  return (
    <div className="min-h-screen w-full bg-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => scrollToSection('beranda')} className="flex items-center gap-3 shrink-0">
              <img src={`${base}images/logo.png`} alt="Bill Gates Logo" className="w-10 h-10 rounded-xl object-contain" />
              <span className="text-slate-900 font-black text-lg tracking-wide leading-none">BILL GATES</span>
            </button>

            <nav className="hidden xl:flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-full border border-slate-200">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={
                    active === link.id
                      ? 'px-3.5 py-1.5 text-sm font-semibold text-bpjs-700 bg-white rounded-full shadow-sm whitespace-nowrap'
                      : 'px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap'
                  }
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => navigate('/welcome')}
              className="hidden xl:flex items-center gap-2 px-5 py-2.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm font-semibold rounded-full shadow-md shadow-bpjs-600/20 transition-colors shrink-0"
            >
              Masuk Demo
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="xl:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700"
              aria-label="Buka menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {menuOpen && (
            <div className="xl:hidden mt-3 flex flex-col gap-1 bg-slate-50 rounded-2xl border border-slate-200 p-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white hover:text-bpjs-700 rounded-xl transition-colors text-left"
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => navigate('/welcome')}
                className="mt-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-bpjs-600 text-white text-sm font-semibold rounded-xl"
              >
                Masuk Demo
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <main id="beranda" className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-bpjs-50/70 via-white to-white">
        <div
          className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 lg:pt-16 pb-14 lg:pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-bpjs-500 animate-pulse" />
              Analitik AI Lokal · Deteksi Klaim Pra-Bayar
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.02] mb-3">
              <span className="text-slate-900">BILL </span>
              <span className="text-bpjs-600">GATES</span>
            </h1>
            <p className="text-base sm:text-lg font-semibold text-slate-500 mb-6 text-balance">
              (BILLing Ganda &amp; Anomali TerEliminasi Sistem)
            </p>

            <p className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 text-balance">
              Satu Command Center untuk menangkap klaim ganda JKN sebelum dibayar.
            </p>
            <p className="text-sm lg:text-base text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 text-balance">
              Deteksi tagihan ganda dan anomali dengan skor yang bisa dijelaskan, radar risiko faskes lewat analitik AI lokal tanpa API eksternal, alur verifikasi berbasis peran, dan jejak audit di setiap keputusan. Didemokan pada {fmt(SAMPLE.rows)} klaim sampel BPJS Kesehatan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-4">
              <button
                onClick={() => navigate('/welcome')}
                className="w-full sm:w-auto px-6 py-3.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm lg:text-base font-bold rounded-xl shadow-lg shadow-bpjs-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Masuk Command Center (Demo)
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href={guideHref}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-700 border-2 border-slate-200 hover:border-bpjs-400 hover:text-bpjs-700 text-sm lg:text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Panduan Alur Kerja (PDF)
              </a>
            </div>
            <p className="text-xs text-slate-400 text-balance">
              *Mode Demo: pilih peran di halaman awal, tanpa login. Angka akurasi diukur terpisah pada data sintetis.
            </p>
          </div>

          <figure>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-bpjs-200/60 via-transparent to-navy-200/40 blur-2xl" aria-hidden="true" />
              <img
                src={`${base}images/header.png`}
                alt="Ilustrasi Command Center BILL GATES: petugas verifikasi didampingi asisten analitik di depan dashboard deteksi klaim"
                width={1536}
                height={1024}
                className="relative w-full h-auto rounded-3xl shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200"
              />
            </div>
            <figcaption className="mt-3 text-center text-[11px] text-slate-400 text-balance">
              Ilustrasi konsep. Angka pada gambar bukan data sistem; angka sebenarnya ada di bagian Data Sampel.
            </figcaption>
          </figure>
        </div>

        {/* Ringkasan */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-slate-200 bg-white shadow-sm divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {[
              { value: fmt(SAMPLE.rows), label: 'klaim sampel BPJS Kesehatan' },
              { value: fmt(SAMPLE.units), label: 'unit faskes dianalisis' },
              { value: '4 peran', label: 'akses sesuai kewenangan' },
              { value: '12 modul', label: 'dari deteksi sampai audit' },
            ].map((s) => (
              <div key={s.label} className="px-5 py-5 text-center">
                <p className="text-xl lg:text-2xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Tentang */}
      <section id="tentang" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <SectionHeader
          icon={Target}
          badge="Tentang BILL GATES"
          title="Melindungi Dana JKN Sebelum Klaim Dibayarkan"
          desc="BILL GATES melengkapi proses verifikasi yang ada dengan penapisan duplikat dan analitik risiko yang bisa dijelaskan, sebelum klaim disetujui. Mencegah lebih murah daripada menagih kembali."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ABOUT_STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <p className="text-3xl font-extrabold text-bpjs-600 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Sumber: KPK (2015, 2024), Kompas.id (2025) &mdash; angka skala masalah nasional, bukan hasil operasional BILL GATES.
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mt-10">
          <div className="bg-red-50/60 border border-red-100 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                <XCircle size={20} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Tantangan yang Dijawab</h3>
            </div>
            <ul className="space-y-3">
              {AUDIT_ISSUES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-bpjs-50/60 border border-bpjs-100 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-bpjs-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">BILL GATES: Penapisan Pra-Bayar yang Bisa Dijelaskan</h3>
            </div>
            <ul className="space-y-3">
              {BILLGATES_ADVANTAGES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-bpjs-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Alur Kerja */}
      <section id="alur" className="scroll-mt-24 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <SectionHeader
            icon={ScanSearch}
            badge="Alur Kerja"
            title="Dari Klaim Masuk Sampai Keputusan Berjejak"
            desc="Lima langkah yang konsisten antar peran: klaim ditandai sebelum disetujui, dan setiap keputusan dapat ditelusuri."
          />

          <div className="relative grid gap-5 lg:grid-cols-5">
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-slate-200" aria-hidden="true" />
            {WORKFLOW_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-bpjs-600 flex items-center justify-center shadow-lg shadow-bpjs-600/25 mb-4">
                  <Icon size={24} className="text-white" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-bpjs-600 text-bpjs-700 text-xs font-extrabold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-bpjs-50/60 border border-bpjs-100 rounded-2xl p-5 mt-8">
            <div className="flex items-start gap-3 flex-1">
              <ShieldCheck size={18} className="text-bpjs-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Sinyal bukan vonis:</span> deteksi duplikat dan anomali adalah bahan penelaahan, bukan keputusan penolakan otomatis. Keputusan akhir tetap di tangan petugas.
              </p>
            </div>
            <a
              href={guideHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-bpjs-200 text-bpjs-700 text-sm font-semibold rounded-xl hover:bg-bpjs-50 transition-colors shrink-0"
            >
              <Download size={16} />
              Unduh panduan (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <SectionHeader
          icon={Zap}
          badge="Fitur Unggulan"
          title="Sembilan Kemampuan, Satu Alur Kerja"
          desc="Semua fitur di bawah sudah berjalan di prototype. Label di kartu menunjukkan peran utama pengguna fitur tersebut."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, tag }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-bpjs-50 flex items-center justify-center">
                  <Icon size={22} className="text-bpjs-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">{tag}</span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Note tone="green">
            <span className="font-bold text-slate-800">Rencana integrasi:</span> BILL GATES dirancang untuk terhubung ke sistem klaim BPJS Kesehatan yang sudah berjalan (mis. Vclaim) lewat API, dijadwalkan pada Fase 3 roadmap pengembangan — bukan menggantikan sistem yang ada, melainkan menjadi lapisan penapisan tambahan sebelum klaim disetujui.
          </Note>
        </div>
      </section>

      {/* Peran */}
      <section id="peran" className="scroll-mt-24 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <SectionHeader
            icon={UsersRound}
            badge="Akses Berbasis Peran"
            title="Setiap Peran Melihat yang Menjadi Tugasnya"
            desc="Menu di aplikasi mengikuti peran aktif. Hak akses di bawah mengikuti pengaturan menu pada prototype."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {ROLES.map(({ icon: Icon, name, summary, accent }) => (
              <div key={name} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1.5">{name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{summary}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-5 py-3.5 font-semibold text-slate-500">Modul</th>
                  {ROLES.map((r) => (
                    <th key={r.name} className="px-3 py-3.5 font-semibold text-slate-700 text-center whitespace-nowrap">
                      {r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACCESS_MATRIX.map((row) => (
                  <tr key={row.module} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 text-slate-700">{row.module}</td>
                    {row.access.map((ok, i) => (
                      <td key={ROLES[i].name} className="px-3 py-3 text-center">
                        {ok ? <CheckCircle2 size={18} className="text-bpjs-600 inline-block" aria-label="Dapat diakses" /> : <span className="text-slate-300" aria-label="Tidak dapat diakses">–</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Note tone="green">
              <span className="font-bold text-slate-800">Tentang akses di mode demo:</span> peran dipilih di halaman awal tanpa login, agar juri dapat mencoba setiap sudut pandang. Autentikasi akun (Firebase Authentication) dengan sesi yang habis otomatis disiapkan untuk fase pilot, dan pembuatan akun hanya lewat Firebase Console atau Admin SDK, tidak dari browser.
            </Note>
          </div>
        </div>
      </section>

      {/* Prototype CTA */}
      <section id="prototype" className="scroll-mt-24 px-6 lg:px-8 py-16 lg:py-24">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-bpjs-700 via-bpjs-800 to-bpjs-950 p-8 lg:p-14">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-bpjs-400/20 blur-3xl" aria-hidden="true" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-4">
                <LayoutDashboard size={14} />
                Prototype Fungsional
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4 text-balance">
                Coba Command Center dengan {fmt(SAMPLE.rows)} klaim sampel
              </h2>
              <p className="text-bpjs-100 leading-relaxed mb-8 text-balance">
                Bukan sekadar mockup. Pilih peran, lalu jelajahi deteksi, radar risiko, verifikasi, dan log audit pada data sampel BPJS Kesehatan.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/welcome')}
                  className="px-6 py-3.5 bg-white hover:bg-bpjs-50 text-bpjs-800 text-sm lg:text-base font-bold rounded-xl shadow-lg transition-all inline-flex items-center justify-center gap-2 group"
                >
                  Masuk Command Center (Demo)
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href={guideHref}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/25 text-white text-sm lg:text-base font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Panduan (PDF)
                </a>
              </div>
              <p className="text-xs text-bpjs-200 mt-3">*Mode Demo dengan data klaim sampel. Pilih peran tanpa login.</p>
            </div>

            <ul className="flex flex-wrap gap-2.5">
              {PROTOTYPE_MODULES.map((item) => (
                <li key={item} className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-2 text-sm text-white">
                  <CheckCircle2 size={15} className="text-bpjs-300 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Data Sampel */}
      <section id="data" className="scroll-mt-24 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <SectionHeader
            icon={Database}
            badge="Data Sampel BPJS"
            title={`${fmt(SAMPLE.rows)} Klaim Sampel yang Dipakai di Demo`}
            desc="Command Center memuat klaim dari Data Sampel BPJS Kesehatan (FKRTL dan Non-Kapitasi, nilai klaim di atas Rp0) dengan ID pasien dipseudonimkan. Di bawah ini gambaran isinya dan apa yang ditemukan mesin deteksi."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { value: fmt(SAMPLE.uniqueClaims), label: 'nomor klaim unik' },
              { value: fmt(SAMPLE.patients), label: 'pasien unik (ID dipseudonimkan)' },
              { value: fmt(SAMPLE.units), label: 'unit faskes (jenis × kabupaten/kota)' },
              { value: SAMPLE.totalValue, label: 'total nilai klaim pada sampel' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-white shadow-sm p-6 lg:p-8">
              <div className="flex items-baseline justify-between mb-5">
                <h3 className="text-base font-bold text-slate-800">Sebaran risiko hasil mesin deteksi</h3>
                <span className="text-xs text-slate-400">{fmt(RISK_TOTAL)} baris klaim</span>
              </div>
              <RiskBar />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {ENGINE.risk.map((r) => (
                  <div key={r.key} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${r.dot}`} />
                      <span className="text-xs font-semibold text-slate-500">{r.label}</span>
                    </div>
                    <p className={`text-xl font-extrabold ${r.text}`}>{fmt(r.n)}</p>
                    <p className="text-[11px] text-slate-400">{pct(r.n / RISK_TOTAL)} dari sampel</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-3">Sinyal yang ditemukan</p>
                <ul className="space-y-2">
                  {ENGINE.signals.map((s) => (
                    <li key={s.label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-600">{s.label}</span>
                      <span className="font-bold text-slate-800">{fmt(s.n)}</span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-600">Unit faskes jadi prioritas investigasi (skor ≥ 60)</span>
                    <span className="font-bold text-slate-800">
                      {ENGINE.priorityUnits} dari {fmt(SAMPLE.units)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm p-6 lg:p-8">
              <div className="flex items-baseline justify-between mb-5">
                <h3 className="text-base font-bold text-slate-800">Nomor klaim per bulan</h3>
                <span className="text-xs text-slate-400">2023</span>
              </div>
              <MonthlyChart />
              <p className="text-[11px] text-slate-400 mt-4">2 klaim lain bertanggal Des 2022, tidak ditampilkan.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4">Diagnosis terbanyak (ICD-10)</h3>
              <div className="space-y-3">
                {TOP_DX.map((d) => (
                  <div key={d.code}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-slate-600">
                        <span className="font-bold text-slate-800">{d.code}</span> · {d.label}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{fmt(d.n)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-bpjs-500" style={{ width: `${(d.n / TOP_DX[0].n) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4">Catatan data</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2.5">
                  <CheckCircle2 size={16} className="text-bpjs-500 shrink-0 mt-0.5" />
                  <span>Satu nomor klaim bisa memuat beberapa baris tindakan: {fmt(SAMPLE.rows)} baris untuk {fmt(SAMPLE.uniqueClaims)} nomor klaim.</span>
                </li>
                <li className="flex gap-2.5">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>Nama faskes dibentuk dari jenis dan kabupaten/kota (mis. Puskesmas + wilayah), bukan fasilitas individual.</span>
                </li>
                <li className="flex gap-2.5">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>Sampel disusun untuk demonstrasi dan memuat kasus identik serta nilai ekstrem, jadi proporsinya bukan cerminan JKN nasional.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-bpjs-100 bg-bpjs-50/60 p-6">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                <LockKeyhole size={18} className="text-bpjs-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Privasi</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pasien tampil sebagai PAT-xxxxx dan disamarkan pada Jaringan Fraud. Analitik dihitung di browser tanpa mengirim data ke layanan AI eksternal. Halaman ini hanya menampilkan agregat.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Note>
              <span className="font-bold">Perlu dibaca dengan benar:</span> angka pada bagian ini adalah keluaran mesin deteksi pada sampel demo, bukan angka akurasi dan bukan temuan fraud yang terbukti. Akurasi diukur terpisah pada data sintetis berkunci jawaban (lihat bagian Validasi).
            </Note>
          </div>
        </div>
      </section>

      {/* Validasi */}
      <section id="validasi" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <SectionHeader
          icon={BarChart3}
          badge="Diuji, Bukan Hanya Diklaim"
          title="Hasil Pengukuran pada Data Sintetis"
          desc={`Diuji pada ${fmt(evalEvidence.testClaims)} klaim sintetis berkunci jawaban (100 duplikat disisipkan, ditambah klaim sah yang mirip seperti kontrol kronis dan sesi berulang). Ambang dipilih pada data tuning terpisah, lalu diuji pada data baru.`}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {VALIDATION_STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
              <p className="text-3xl font-extrabold text-bpjs-600 mb-2">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 lg:p-8 mb-6">
          <p className="text-sm font-bold text-slate-800 mb-1">Precision setelah belajar dari keputusan verifikator</p>
          <p className="text-xs text-slate-400 mb-5">Simulasi, verifikator simulasi keliru 5%.</p>
          <div className="space-y-3 max-w-2xl">
            {LEARN_ROWS.map((r) => (
              <div key={r.k} className="flex items-center gap-3">
                <span className="w-28 text-xs text-slate-500 shrink-0">{r.k === 0 ? 'Aturan awal' : `${r.k} keputusan`}</span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-bpjs-500" style={{ width: `${r.precision * 100}%` }} />
                </div>
                <span className="w-12 text-right text-xs font-bold text-slate-700">{pct(r.precision, 0)}</span>
              </div>
            ))}
          </div>
        </div>

        <Note>
          <span className="font-bold">Kejujuran soal keterbatasan:</span> semua angka di bagian ini berasal dari data sintetis (terpisah dari klaim sampel BPJS pada demo) dan verifikator simulasi (keliru 5%), bukan data atau verifikator BPJS sungguhan. Pada 200 keputusan, precision naik tetapi recall turun ke ±84% — sebagian duplikat asli ikut tersaring. Deteksi anomali biaya (upcoding) belum divalidasi. Parameter akan dikalibrasi dengan Data Sampel BPJS dan diuji pada fase pilot.
        </Note>
      </section>

      {/* Tim */}
      <section id="tim" className="scroll-mt-24 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <SectionHeader
            icon={UserCheck}
            badge="Tim Kami"
            title="Tim Gelombang Utara"
            desc="Tiga peran yang saling melengkapi, dari konsep hingga eksekusi teknis."
          />
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TEAM.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center hover:shadow-lg transition-shadow">
                <img src={`${base}images/${m.img}`} alt={m.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 ring-4 ring-bpjs-100" />
                <p className="font-bold text-slate-800">{m.name}</p>
                <p className="text-sm text-slate-500">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontak */}
      <section id="kontak" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <SectionHeader
          icon={Mail}
          badge="Hubungi Kami"
          title="Ada Pertanyaan Seputar BILL GATES?"
          desc="Tim kami siap membantu Anda memahami sistem deteksi klaim ganda JKN."
        />

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-bpjs-50 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-bpjs-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-400 px-1">*Kontak di atas adalah data dummy untuk keperluan demo prototype Healthkathon 2026.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFormNotice(true);
            }}
            className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 lg:p-8 shadow-sm space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama</label>
                <input type="text" placeholder="Nama Anda" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                <input type="email" placeholder="nama@email.com" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Instansi</label>
              <input type="text" placeholder="Nama instansi / faskes" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pesan</label>
              <textarea rows={4} placeholder="Tuliskan pertanyaan atau kebutuhan Anda..." className={`${inputCls} resize-none`} />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm font-bold rounded-xl shadow-md shadow-bpjs-600/20 transition-colors flex items-center justify-center gap-2"
            >
              Kirim Pesan
              <ChevronRight size={18} />
            </button>
            {formNotice && (
              <p role="status" className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Mode demo: formulir ini belum terhubung ke layanan pengiriman, sehingga pesan tidak terkirim.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={`${base}images/logo.png`} alt="" className="w-8 h-8 rounded-lg object-contain" />
            <p className="text-sm font-bold text-slate-700">BILL GATES</p>
          </div>
          <p className="text-xs italic text-slate-400">&ldquo;Detect Smarter, Protect JKN&rdquo;</p>
          <p className="text-xs text-slate-400">&copy; 2026 Tim Gelombang Utara. Prototype Healthkathon 2026.</p>
        </div>
      </footer>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas"
          className="fixed bottom-6 right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-bpjs-600 hover:bg-bpjs-700 text-white shadow-lg shadow-bpjs-600/30 transition-all animate-fade-in"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
