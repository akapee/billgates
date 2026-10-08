import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUp,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Cpu,
  Database,
  FileSearch,
  FileText,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Percent,
  Phone,
  ScanSearch,
  ShieldCheck,
  Target,
  TrendingUp,
  UserCheck,
  Users,
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
  { label: 'Data', id: 'data' },
  { label: 'Fitur', id: 'fitur' },
  { label: 'Validasi', id: 'validasi' },
  { label: 'Tim', id: 'tim' },
  { label: 'Kontak', id: 'kontak' },
];

// Angka di bawah ini dihitung dari src/data/claims.ts (2.000 klaim FKRTL, Data Sampel BPJS Kesehatan).
// Jika file claims.ts diganti, perbarui blok ini. Tidak ada ID klaim/baris individual yang ditampilkan.
const SAMPLE = {
  total: 2000,
  patients: 1706, // ID pasien unik (sudah dipseudonimkan, format PAT-xxxxxx)
  facilities: 370, // faskes unik
  multiClaimPatients: 274, // pasien dengan >= 2 klaim
  normal: 1400,
  identical: 500, // kasus identik (disusun saat membuat sampel demo)
  extreme: 100, // nilai ekstrem (disusun saat membuat sampel demo)
  groups: 250, // kelompok klaim dengan pasien + diagnosis + tanggal yang sama
  crossFacility: 84, // dari kelompok di atas, yang lintas faskes
  amountFilled: 109, // klaim dengan nilai klaim > 0
  procedureEmpty: 773, // klaim tanpa kode tindakan
};

const MONTHLY = [
  { m: 'Jan', n: 154 },
  { m: 'Feb', n: 148 },
  { m: 'Mar', n: 181 },
  { m: 'Apr', n: 140 },
  { m: 'Mei', n: 185 },
  { m: 'Jun', n: 150 },
  { m: 'Jul', n: 150 },
  { m: 'Agu', n: 157 },
  { m: 'Sep', n: 185 },
  { m: 'Okt', n: 187 },
  { m: 'Nov', n: 155 },
  { m: 'Des', n: 207 },
];

const TOP_DX = [
  { code: 'Z09', label: 'Pemeriksaan lanjutan', n: 180 },
  { code: 'D56', label: 'Talasemia', n: 96 },
  { code: 'I21', label: 'Infark miokard akut', n: 71 },
  { code: 'K30', label: 'Dispepsia', n: 66 },
  { code: 'R10', label: 'Nyeri perut & panggul', n: 61 },
];

const COMPOSITION = [
  { key: 'normal', label: 'Normal', n: SAMPLE.normal, bar: 'bg-bpjs-500', dot: 'bg-bpjs-500', text: 'text-bpjs-700' },
  { key: 'identical', label: 'Kasus identik', n: SAMPLE.identical, bar: 'bg-red-500', dot: 'bg-red-500', text: 'text-red-600' },
  { key: 'extreme', label: 'Nilai ekstrem', n: SAMPLE.extreme, bar: 'bg-amber-400', dot: 'bg-amber-400', text: 'text-amber-600' },
];

const fmt = (n: number) => n.toLocaleString('id-ID');
const pct = (x: number, d = 1) => (x * 100).toFixed(d).replace('.', ',') + '%';

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
  'ID pasien yang mirip (salah ketik) dan duplikat lintas faskes ikut terdeteksi',
  'Belajar dari keputusan Setujui/Tolak verifikator untuk menekan salah tandai',
];

const WORKFLOW_STEPS = [
  { icon: FileText, title: 'Klaim Diajukan Faskes', desc: 'Faskes mengajukan klaim ke sistem BPJS seperti proses normal — belum ada dana yang cair.' },
  { icon: ScanSearch, title: 'Penapisan Otomatis Pra-Bayar', desc: 'Klaim baru dibandingkan dengan klaim sebelumnya (dikelompokkan per diagnosis/tindakan, jendela 21 hari) sebelum disetujui.' },
  { icon: Gauge, title: 'Skor Kemiripan yang Bisa Dijelaskan', desc: 'Skor 0–100 dari ID pasien, ICD-10, tindakan, faskes, jarak waktu & nilai klaim. Model belajar menyaring klaim sah yang mirip.' },
  { icon: UserCheck, title: 'Eskalasi ke Verifikator', desc: 'Hanya kandidat duplikat yang diteruskan ke verifikator, lengkap dengan alasan dan peluang duplikat.' },
  { icon: CircleDollarSign, title: 'Keputusan, Audit & Belajar', desc: 'Setujui/Tolak wajib beralasan dan tercatat di log audit; keputusan itu menjadi bahan belajar sistem.' },
];

const PROTOTYPE_MODULES = [
  'Monitoring Klaim',
  'Deteksi Tagihan Ganda',
  'Deteksi Anomali & Tindak Lanjut',
  'Radar Risiko Faskes (berbasis aturan)',
  'Pusat Verifikasi (beralasan)',
  'Investigasi Riwayat Klaim',
  'Model Belajar',
  'Laporan & Ekspor CSV',
  'Log Audit & Login Berperan',
  'Pengaturan Ambang',
];

const FEATURES = [
  { icon: FileSearch, title: 'Penapisan Klaim Ganda Pra-Bayar', desc: `Klaim baru dibandingkan dengan klaim sebelumnya lewat pengelompokan (blocking), sehingga 100.000 klaim diproses sekitar ${_sec} detik pada uji batch (1 core) — bukan membandingkan semua pasangan.` },
  { icon: Percent, title: 'Skor Kemiripan yang Transparan', desc: 'Skor 0–100 dari ID pasien (wajib sama/mirip), ICD-10, tindakan, faskes, jarak waktu, dan nilai klaim — setiap skor disertai alasannya, bukan black-box.' },
  { icon: TrendingUp, title: 'Indikasi Anomali Biaya (Belum Divalidasi)', desc: `Deviasi biaya per diagnosis ditandai sebagai sinyal tambahan. Akurasinya belum diukur; pada sampel demo nilai klaim hanya terisi di ${fmt(SAMPLE.amountFilled)} dari ${fmt(SAMPLE.total)} klaim, sehingga validasinya menunggu fase pilot.` },
  { icon: LayoutDashboard, title: 'Dashboard Command Center', desc: 'Monitoring Klaim, Deteksi Tagihan Ganda, Deteksi Anomali, Radar Risiko, Pusat Verifikasi, Investigasi, Laporan (ekspor CSV), Model Belajar, dan Log Audit dalam satu alur kerja.' },
  { icon: UserCheck, title: 'Belajar dari Keputusan Verifikator', desc: `Model kecil dengan bobot yang bisa dibaca belajar dari Setujui/Tolak untuk membedakan duplikat dari klaim sah yang mirip. Pada simulasi, precision naik dari ${pct(_v2.precision, 0)} ke ${pct(_k200.precision, 0)} (200 keputusan); recall turun ke ±84%.` },
  { icon: LockKeyhole, title: 'Akses Terkontrol & Teraudit', desc: 'Login berbasis peran (verifikator, auditor, dan pengelola sistem), sesi habis otomatis setelah 15 menit, keputusan wajib beralasan, dan log audit append-only. Tidak ada identitas peserta: ID pasien dipseudonimkan.' },
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

function CompositionBar({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-slate-100 ${tall ? 'h-4' : 'h-3'}`}>
      {COMPOSITION.map((c) => (
        <div
          key={c.key}
          className={c.bar}
          style={{ width: `${(c.n / SAMPLE.total) * 100}%` }}
          title={`${c.label}: ${fmt(c.n)} klaim`}
        />
      ))}
    </div>
  );
}

function MonthlyChart({ compact = false }: { compact?: boolean }) {
  const max = Math.max(...MONTHLY.map((x) => x.n));
  return (
    <div>
      <div className={`flex items-end gap-1.5 ${compact ? 'h-20' : 'h-40'}`}>
        {MONTHLY.map((x) => (
          <div key={x.m} className="flex-1 h-full flex flex-col justify-end items-center gap-1" title={`${x.m} 2023: ${x.n} klaim`}>
            {!compact && <span className="text-[10px] font-semibold text-slate-500">{x.n}</span>}
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-bpjs-600 to-bpjs-400"
              style={{ height: `${(x.n / max) * (compact ? 100 : 78)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {MONTHLY.map((x) => (
          <span key={x.m} className="flex-1 text-center text-[10px] text-slate-400">
            {compact ? x.m.charAt(0) : x.m}
          </span>
        ))}
      </div>
    </div>
  );
}

// Pratinjau Command Center — dibangun dari angka sampel, bukan gambar statis
function CommandCenterPreview() {
  const kpis = [
    { label: 'Total klaim', value: fmt(SAMPLE.total), cls: 'text-slate-900' },
    { label: 'Normal', value: fmt(SAMPLE.normal), cls: 'text-bpjs-600' },
    { label: 'Kasus identik', value: fmt(SAMPLE.identical), cls: 'text-red-600' },
    { label: 'Nilai ekstrem', value: fmt(SAMPLE.extreme), cls: 'text-amber-600' },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-bpjs-200/60 via-transparent to-navy-200/40 blur-2xl" aria-hidden="true" />
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-bpjs-300" />
          <span className="ml-3 text-xs font-semibold text-slate-500">Pusat Kendali</span>
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">MODE DEMO</span>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-100 bg-white p-3">
                <p className={`text-xl lg:text-2xl font-extrabold leading-none ${k.cls}`}>{k.value}</p>
                <p className="text-[11px] text-slate-500 mt-1.5">{k.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600">Komposisi sampel</p>
              <p className="text-[11px] text-slate-400">{fmt(SAMPLE.total)} klaim</p>
            </div>
            <CompositionBar />
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {COMPOSITION.map((c) => (
                <span key={c.key} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  {c.label} {pct(c.n / SAMPLE.total, 0)}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Klaim per bulan (2023)</p>
            <MonthlyChart compact />
          </div>
        </div>
      </div>

      <div className="hidden sm:flex absolute -bottom-5 -left-5 items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-xl px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-800 leading-none">{SAMPLE.groups} kelompok identik</p>
          <p className="text-[11px] text-slate-500 mt-1">{SAMPLE.crossFacility} di antaranya lintas faskes</p>
        </div>
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

  return (
    <div className="min-h-screen w-full bg-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => scrollToSection('beranda')} className="flex items-center gap-3">
              <img src={`${base}images/logo.png`} alt="Bill Gates Logo" className="w-10 h-10 rounded-xl object-contain" />
              <span className="text-slate-900 font-black text-lg tracking-wide leading-none">BILL GATES</span>
            </button>

            <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-full border border-slate-200">
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
              onClick={() => navigate('/login')}
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm font-semibold rounded-full shadow-md shadow-bpjs-600/20 transition-colors shrink-0"
            >
              Masuk Demo
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700"
              aria-label="Buka menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {menuOpen && (
            <div className="lg:hidden mt-3 flex flex-col gap-1 bg-slate-50 rounded-2xl border border-slate-200 p-2">
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
                onClick={() => navigate('/login')}
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
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 lg:pt-20 pb-16 lg:pb-24 grid lg:grid-cols-2 gap-14 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-bpjs-500 animate-pulse" />
              Deteksi Klaim Ganda yang Bisa Dijelaskan
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.02] mb-3">
              <span className="text-slate-900">BILL </span>
              <span className="text-bpjs-600">GATES</span>
            </h1>
            <p className="text-base sm:text-lg font-semibold text-slate-500 mb-6 text-balance">
              (BILLing Ganda &amp; Anomali TerEliminasi Sistem)
            </p>

            <p className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 text-balance">
              Tangkap klaim ganda JKN sebelum dibayar.
            </p>
            <p className="text-sm lg:text-base text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 text-balance">
              Command Center untuk verifikator BPJS: menandai klaim ganda dengan skor yang bisa dijelaskan, lalu belajar dari keputusan verifikator agar klaim sah yang mirip tidak ikut tertahan. Didemokan pada {fmt(SAMPLE.total)} klaim sampel FKRTL dari Data Sampel BPJS Kesehatan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm lg:text-base font-bold rounded-xl shadow-lg shadow-bpjs-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Coba Command Center (Demo)
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('data')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-700 border-2 border-slate-200 hover:border-bpjs-400 hover:text-bpjs-700 text-sm lg:text-base font-semibold rounded-xl transition-all text-center"
              >
                Lihat Data Sampel
              </button>
            </div>
            <p className="text-xs text-slate-400 text-balance">
              *Mode Demo, login diperlukan. ID pasien dipseudonimkan; angka akurasi diukur terpisah pada data sintetis.
            </p>
          </div>

          <CommandCenterPreview />
        </div>

        {/* Ringkasan data sampel */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl border border-slate-200 bg-white shadow-sm divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {[
              { value: fmt(SAMPLE.total), label: 'klaim FKRTL pada sampel demo' },
              { value: fmt(SAMPLE.patients), label: 'pasien unik (ID dipseudonimkan)' },
              { value: fmt(SAMPLE.facilities), label: 'fasilitas kesehatan' },
              { value: 'Des 2022 – Des 2023', label: 'rentang tanggal klaim' },
            ].map((s) => (
              <div key={s.label} className="px-5 py-5 text-center">
                <p className="text-xl lg:text-2xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Tentang + Kenapa */}
      <section id="tentang" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <SectionHeader
          icon={Target}
          badge="Tentang BILL GATES"
          title="Melindungi Dana JKN Sebelum Klaim Dibayarkan"
          desc="BILL GATES melengkapi proses verifikasi yang ada dengan penapisan duplikat yang bisa dijelaskan, sebelum klaim disetujui. Mencegah lebih murah daripada menagih kembali."
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
            title="Dari Klaim Diajukan Sampai Dana Cair"
            desc="Lima langkah: klaim ditandai sebelum disetujui, dan keputusan verifikator menjadi bahan belajar sistem."
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

          <div className="flex items-start gap-3 bg-bpjs-50/60 border border-bpjs-100 rounded-2xl p-5 mt-8">
            <ShieldCheck size={18} className="text-bpjs-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Titik krusial ada di Langkah 2 dan 5:</span> klaim ditandai sebelum pembayaran, dan setiap keputusan verifikator tercatat serta membuat penandaan berikutnya lebih tepat.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sampel */}
      <section id="data" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <SectionHeader
          icon={Database}
          badge="Data Sampel BPJS"
          title={`${fmt(SAMPLE.total)} Klaim Sampel BPJS yang Dipakai di Demo`}
          desc="Prototype tidak berjalan di atas data karangan: Command Center memuat sampel klaim FKRTL dari Data Sampel BPJS Kesehatan dengan ID pasien dipseudonimkan. Berikut gambaran isinya."
        />

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-white shadow-sm p-6 lg:p-8">
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800">Komposisi sampel demo</h3>
              <span className="text-xs text-slate-400">{fmt(SAMPLE.total)} klaim</span>
            </div>
            <CompositionBar tall />
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              {COMPOSITION.map((c) => (
                <div key={c.key} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                    <span className="text-xs font-semibold text-slate-500">{c.label}</span>
                  </div>
                  <p className={`text-2xl font-extrabold ${c.text}`}>{fmt(c.n)}</p>
                  <p className="text-[11px] text-slate-400">{pct(c.n / SAMPLE.total, 0)} dari sampel</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mt-6">
              <span className="font-semibold text-slate-700">Kasus identik</span> adalah klaim dengan pasien, diagnosis, dan tanggal yang sama. Pada sampel terdapat {SAMPLE.groups} kelompok seperti itu, dan {SAMPLE.crossFacility} di antaranya diajukan di faskes berbeda. <span className="font-semibold text-slate-700">Nilai ekstrem</span> adalah klaim dengan nilai jauh di atas pola umum.
            </p>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm p-6 lg:p-8">
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800">Klaim per bulan</h3>
              <span className="text-xs text-slate-400">2023</span>
            </div>
            <MonthlyChart />
            <p className="text-[11px] text-slate-400 mt-4">1 klaim lain bertanggal 27 Des 2022, tidak ditampilkan.</p>
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
                    <span className="text-xs font-bold text-slate-700">{d.n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-bpjs-500" style={{ width: `${(d.n / TOP_DX[0].n) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">Catatan kualitas data</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2.5">
                <CheckCircle2 size={16} className="text-bpjs-500 shrink-0 mt-0.5" />
                <span>{fmt(SAMPLE.multiClaimPatients)} pasien punya lebih dari satu klaim pada sampel.</span>
              </li>
              <li className="flex gap-2.5">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Nilai klaim hanya terisi pada {fmt(SAMPLE.amountFilled)} klaim (±{Math.round((SAMPLE.amountFilled / SAMPLE.total) * 100)}%), jadi demo berfokus pada pola identitas, diagnosis, dan waktu, bukan biaya.</span>
              </li>
              <li className="flex gap-2.5">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Kode tindakan kosong pada ±{Math.round((SAMPLE.procedureEmpty / SAMPLE.total) * 100)}% klaim ({fmt(SAMPLE.procedureEmpty)}).</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-bpjs-100 bg-bpjs-50/60 p-6">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
              <LockKeyhole size={18} className="text-bpjs-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Privasi</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ID pasien ditampilkan sebagai PAT-xxxxxx. Halaman ini hanya menampilkan agregat; tidak ada ID klaim atau baris data individual.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Note>
            <span className="font-bold">Perlu dibaca dengan benar:</span> komposisi 1.400 / 500 / 100 adalah susunan sampel demo, bukan hasil deteksi dan bukan angka akurasi. Akurasi diukur terpisah pada data sintetis berkunci jawaban (lihat bagian Validasi).
          </Note>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="scroll-mt-24 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <SectionHeader
            icon={Zap}
            badge="Fitur Unggulan"
            title="Fitur yang Sudah Berjalan di Prototype"
            desc="Dari penapisan klaim hingga keputusan yang tercatat dan menjadi bahan belajar, dalam satu platform."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-bpjs-50 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-bpjs-600" />
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
                Coba Command Center dengan {fmt(SAMPLE.total)} klaim sampel
              </h2>
              <p className="text-bpjs-100 leading-relaxed mb-8 text-balance">
                Bukan sekadar mockup. Masuk memerlukan akun berperan; akun demo diberikan kepada juri/penguji.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3.5 bg-white hover:bg-bpjs-50 text-bpjs-800 text-sm lg:text-base font-bold rounded-xl shadow-lg transition-all inline-flex items-center justify-center gap-2 group"
              >
                Masuk Command Center (Demo)
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-bpjs-200 mt-3">*Berjalan dalam Mode Demo dengan data klaim sampel. Login diperlukan.</p>
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

      {/* Validasi */}
      <section id="validasi" className="scroll-mt-24 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <SectionHeader
            icon={BarChart3}
            badge="Diuji, Bukan Hanya Diklaim"
            title="Hasil Pengukuran pada Data Sintetis"
            desc={`Diuji pada ${fmt(evalEvidence.testClaims)} klaim sintetis berkunci jawaban (100 duplikat disisipkan, ditambah klaim sah yang mirip seperti kontrol kronis dan sesi berulang). Ambang dipilih pada data tuning terpisah, lalu diuji pada data baru.`}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {VALIDATION_STATS.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
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
            <span className="font-bold">Kejujuran soal keterbatasan:</span> semua angka di bagian ini berasal dari data sintetis (terpisah dari klaim sampel pada demo) dan verifikator simulasi (keliru 5%), bukan data atau verifikator BPJS sungguhan. Pada 200 keputusan, precision naik tetapi recall turun ke ±84% — sebagian duplikat asli ikut tersaring. Deteksi anomali biaya (upcoding) belum divalidasi. Parameter akan dikalibrasi dengan Data Sampel BPJS dan diuji pada fase pilot.
          </Note>
        </div>
      </section>

      {/* Tim */}
      <section id="tim" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <SectionHeader
          icon={Users}
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
      </section>

      {/* Kontak */}
      <section id="kontak" className="scroll-mt-24 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
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
