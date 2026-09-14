import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Phone,
  Zap,
  ShieldCheck,
  BarChart3,
  Users,
  Menu,
  X,
  Target,
  Eye,
  FileSearch,
  LayoutDashboard,
  UserCheck,
  LockKeyhole,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  ArrowUp,
  XCircle,
  Percent,
  TrendingUp,
  FileText,
  ScanSearch,
  Gauge,
  CircleDollarSign,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Beranda', id: 'beranda' },
  { label: 'Tentang', id: 'tentang' },
  { label: 'Kenapa', id: 'kenapa' },
  { label: 'Alur', id: 'alur' },
  { label: 'Fitur', id: 'fitur' },
  { label: 'Prototype', id: 'prototype' },
  { label: 'Validasi', id: 'validasi' },
  { label: 'Tim', id: 'tim' },
  { label: 'Kontak', id: 'kontak' },
];

const HERO_FEATURES = [
  { icon: Zap, label: 'Penapisan (Screening)\nInstan < 30 Detik' },
  { icon: ShieldCheck, label: 'Rule-based &\nExplainable' },
  { icon: BarChart3, label: 'Mendukung\nEfisiensi JKN' },
  { icon: Users, label: 'Human-in-the-Loop\nKeputusan Tetap di Tangan Verifikator' },
];

// Skala masalah yang mendasari BILL GATES (Bagian 2 — Masalah & Urgensi)
const ABOUT_STATS = [
  { value: '175.774', label: 'Klaim FKRTL terindikasi fraud (KPK, per Juni 2015)' },
  { value: 'Rp440 M', label: 'Nilai klaim bermasalah pada periode yang sama' },
  { value: 'Rp20 T', label: 'Estimasi kerugian fraud kesehatan nasional / tahun (KPK, 2024)' },
  { value: '106,6%', label: 'Rasio klaim JKN terhadap iuran, April 2025 (Kompas.id)' },
];

// Perbandingan model pasca-bayar vs pra-bayar (Bagian 2 — Urgensi Pencegahan)
const AUDIT_ISSUES = [
  'Dana sudah cair ke faskes sebelum masalah terdeteksi',
  'Proses penarikan kembali dana rumit & berpotensi sengketa hukum',
  'Verifikator memeriksa riwayat klaim secara manual — memakan waktu',
  'Klaim ganda baru ketahuan saat audit berkala, bukan saat pengajuan',
];

const BILLGATES_ADVANTAGES = [
  'Klaim disaring otomatis sebelum disetujui, bukan setelah dibayar',
  'Sinyal risiko & alasannya muncul dalam hitungan detik',
  'Verifikator fokus hanya pada klaim berisiko tinggi/kritis',
  'Dana JKN tidak sempat keluar untuk klaim yang terindikasi bermasalah',
];

// Alur kerja klaim melalui BILL GATES, dari pengajuan faskes hingga pembayaran (Bagian 3-4 proposal)
const WORKFLOW_STEPS = [
  {
    icon: FileText,
    step: '1',
    title: 'Klaim Diajukan Faskes',
    desc: 'Faskes mengajukan klaim ke sistem BPJS seperti proses normal — belum ada dana yang cair.',
  },
  {
    icon: ScanSearch,
    step: '2',
    title: 'Screening Otomatis < 30 Detik',
    desc: 'BILL GATES merekonsiliasi klaim baru terhadap basis data historis sebelum klaim disetujui.',
  },
  {
    icon: Gauge,
    step: '3',
    title: 'Similarity Scoring & Kategori Risiko',
    desc: 'Skor 0–100 dari ID pasien, ICD-10, jenis tindakan, rentang waktu, faskes & nilai klaim → dikategorikan Rendah/Sedang/Tinggi/Kritis.',
  },
  {
    icon: UserCheck,
    step: '4',
    title: 'Eskalasi ke Verifikator',
    desc: 'Hanya klaim risiko Tinggi/Kritis yang diteruskan ke verifikator manusia; sisanya lanjut otomatis.',
  },
  {
    icon: CircleDollarSign,
    step: '5',
    title: 'Keputusan & Pembayaran',
    desc: 'Verifikator memutuskan setuju/tolak/tinjau ulang. Dana JKN cair hanya untuk klaim yang lolos verifikasi.',
  },
];

// Dua titik data riil dari Bagian 2 proposal saja (bukan deret waktu rekaan)
const RATIO_TREND = [
  { label: 'April 2025 (aktual)', value: 106.6 },
  { label: 'Desember 2025 (proyeksi)', value: 111.8 },
];

// Modul yang sudah berfungsi di prototype (Bagian 5 proposal)
const PROTOTYPE_MODULES = [
  'Monitoring Klaim',
  'Deteksi Tagihan Ganda',
  'Radar Risiko Faskes',
  'Pusat Verifikasi',
  'Investigasi & Riwayat',
  'Laporan (Ekspor CSV)',
];

// Fitur nyata sesuai Bagian 3-5 proposal (bukan generic AI marketing)
const FEATURES = [
  {
    icon: FileSearch,
    title: 'Penapisan (Screening) Klaim Ganda Pra-Bayar',
    desc: 'Setiap klaim baru direkonsiliasi terhadap basis data historis secara langsung, memberi sinyal peringatan dalam < 30 detik sebelum klaim disetujui.',
  },
  {
    icon: Percent,
    title: 'Similarity Scoring yang Transparan',
    desc: 'Skor kemiripan 0–100 dihitung dari ID pasien, kode ICD-10, jenis tindakan, rentang waktu, faskes, dan nilai klaim — rule-based & explainable, bukan black-box.',
  },
  {
    icon: TrendingUp,
    title: 'Deteksi Indikasi Upcoding',
    desc: 'Selain klaim ganda, sistem menandai deviasi biaya per diagnosis sebagai sinyal tambahan potensi upcoding.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Command Center',
    desc: 'Monitoring Klaim, Deteksi Tagihan Ganda, Radar Risiko Faskes, Pusat Verifikasi, Investigasi, dan Laporan dalam satu alur kerja verifikator.',
  },
  {
    icon: UserCheck,
    title: 'Human-in-the-Loop',
    desc: 'AI hanya berperan sebagai instrumen pendukung keputusan — persetujuan, penolakan, atau peninjauan ulang klaim tetap di tangan verifikator BPJS.',
  },
  {
    icon: LockKeyhole,
    title: 'Privasi Data Terjamin',
    desc: 'Pengembangan & pengujian 100% memakai data sintetis/anonim, tanpa menyimpan data riil peserta JKN tanpa enkripsi & izin resmi — selaras UU PDP.',
  },
];

// Hasil uji internal (Bagian 5 — Validasi), dengan disclaimer jujur seperti di proposal
const VALIDATION_STATS = [
  { value: '100%', label: 'Pasangan phantom/repeat billing uji berhasil terdeteksi' },
  { value: '100%', label: 'Kasus dugaan upcoding uji berhasil terdeteksi' },
  { value: '42%', label: 'Klaim uji diprioritaskan otomatis ke verifikator' },
];

// Data kontak dummy untuk keperluan demo prototype — ganti dengan kontak aktif sebelum rilis produksi
const CONTACT_INFO = [
  { icon: Phone, label: 'Telepon', value: '(0322) XXX-XXXX' },
  { icon: Mail, label: 'Email', value: 'admin@billgates.id' },
  { icon: MapPin, label: 'Alamat', value: 'Jalan Tlogoretno, Gedung SMK Negeri 1 Brondong, Lamongan, Jawa Timur' },
  { icon: Clock, label: 'Jam Layanan', value: 'Senin - Jumat, 08.00 - 17.00' },
];


export function LandingPage() {
  const navigate = useNavigate();
  const base = import.meta.env.BASE_URL;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="relative max-w-7xl mx-auto px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${base}images/logo.png`}
              alt="Bill Gates Logo"
              className="w-11 h-11 rounded-xl object-contain shadow-sm"
            />
            <span className="text-slate-900 font-black text-xl tracking-wide leading-none">
              BILL GATES
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-full border border-slate-200">
            {NAV_LINKS.map((link, i) => (
              <button
                key={link.label}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className={
                  i === 0
                    ? 'px-3.5 py-2 text-sm font-semibold text-bpjs-700 bg-white rounded-full shadow-sm whitespace-nowrap'
                    : 'px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap'
                }
              >
                {link.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => scrollToSection('kontak')}
            className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm font-semibold rounded-full shadow-md shadow-bpjs-600/20 transition-colors shrink-0"
          >
            <Phone size={16} />
            Hubungi Kami
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700"
            aria-label="Buka menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="lg:hidden mt-4 flex flex-col gap-1 bg-slate-50 rounded-2xl border border-slate-200 p-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white hover:text-bpjs-700 rounded-xl transition-colors text-left"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollToSection('kontak')}
              className="mt-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-bpjs-600 text-white text-sm font-semibold rounded-xl"
            >
              <Phone size={16} />
              Hubungi Kami
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <main id="beranda" className="grid lg:grid-cols-2 items-center scroll-mt-24">
        {/* Left column */}
        <div className="px-6 lg:pl-8 lg:pr-12 py-8 lg:py-10 text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-bpjs-500 animate-pulse" />
            Sistem Deteksi Fraud AI
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.05] mb-3 text-balance">
            <span className="text-slate-900">BILL </span>
            <span className="text-bpjs-600">GATES</span>
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-slate-500 mb-6 text-balance">
            (BILLing Ganda &amp; Anomali TerEliminasi Sistem)
          </p>

          <p className="text-lg font-bold text-slate-800 mb-4 text-balance">
            Gerbang Pintar Deteksi Klaim Ganda JKN Sebelum Terbayar
          </p>

          <p className="text-sm lg:text-base text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 text-balance">
            Platform Command Center berbasis Artificial Intelligence untuk mendeteksi dan mencegah anomali klaim kesehatan JKN secara real-time dan komprehensif.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm lg:text-base font-bold rounded-xl shadow-lg shadow-bpjs-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              Coba Command Center (Demo)
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('tentang')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-700 border-2 border-slate-200 hover:border-bpjs-400 hover:text-bpjs-700 text-sm lg:text-base font-semibold rounded-xl transition-all text-center"
            >
              Pelajari Lebih Lanjut
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-8 text-balance">
            *Command Center berjalan dalam Mode Demo dengan data klaim simulasi untuk keperluan Healthkathon 2026.
          </p>

          {/* Feature row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {HERO_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-left">
                <div className="w-11 h-11 rounded-xl bg-bpjs-50 border border-bpjs-100 flex items-center justify-center">
                  <Icon size={20} className="text-bpjs-600" />
                </div>
                <p className="text-xs font-semibold text-slate-600 leading-snug whitespace-pre-line">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-3">
            <span className="w-8 h-0.5 bg-bpjs-500" />
            <p className="text-sm italic text-slate-400 font-medium">
              &ldquo;Deteck Smarter, Protect JKN&rdquo;
            </p>
          </div>
        </div>

        {/* Right column: gambar full-bleed + kartu mengambang */}
        <div className="order-1 lg:order-2 relative w-full h-[280px] sm:h-[380px] lg:h-[calc(100vh-88px)]">
          <img
            src={`${base}images/header.png`}
            alt="Bill Gates - Command Center Deteksi Fraud JKN"
            className="w-full h-full object-cover object-left lg:rounded-l-[2.5rem]"
          />

          {/* Accuracy badge — angka sama dengan hasil uji internal di section Validasi */}
          <div className="hidden sm:flex absolute top-6 right-6 lg:right-10 bg-white/95 backdrop-blur px-4 py-3 rounded-2xl shadow-xl border border-slate-100 items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-bpjs-500 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-extrabold text-bpjs-700">100%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 leading-tight">Deteksi Uji Internal</p>
              <p className="text-[10px] text-slate-400 leading-tight">*24 klaim simulasi</p>
            </div>
          </div>

          {/* Potensi tagihan ganda pill — angka sama dengan prototype dashboard di section Prototype */}
          <div className="hidden sm:flex absolute top-1/2 left-4 sm:left-8 lg:left-12 -translate-y-1/2 bg-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-100 items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-extrabold text-slate-800 leading-none">43</p>
              <p className="text-[10px] text-slate-500 font-medium">Potensi Tagihan Ganda (Demo)</p>
            </div>
          </div>

          {/* Command Center card — mengikuti modul nyata di dashboard, bukan daftar generik */}
          <div className="hidden lg:block absolute bottom-8 left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 w-60">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-bpjs-600 flex items-center justify-center shrink-0">
                <Cpu size={16} className="text-white" />
              </div>
              <p className="text-sm font-bold text-slate-800">Command Center</p>
            </div>
            <ul className="space-y-1.5">
              {['Monitoring Klaim Real-time', 'Similarity Scoring Klaim', 'Radar Risiko Faskes'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 size={13} className="text-bpjs-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Tentang */}
      <section id="tentang" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-4">
              <Target size={14} />
              Tentang Kami
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 text-balance">
              Melindungi Dana JKN Sebelum Klaim Dibayarkan
            </h2>
            <p className="text-slate-500 leading-relaxed mb-4 text-balance">
              BILL GATES (BILLing Ganda &amp; Anomali TerEliminasi Sistem) adalah platform Command Center yang dirancang untuk membantu verifikator dan pengelola JKN mendeteksi klaim ganda serta anomali penagihan sebelum klaim dibayarkan.
            </p>
            <p className="text-slate-500 leading-relaxed text-balance">
              Dengan kombinasi Artificial Intelligence dan pengawasan manusia (human-in-the-loop), sistem ini membantu menjaga data klaim tetap bersih, proses verifikasi lebih cepat, dan anggaran kesehatan lebih tepat sasaran.
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-3 mt-6">
              <div className="w-10 h-10 rounded-full bg-bpjs-50 flex items-center justify-center shrink-0">
                <Eye size={18} className="text-bpjs-600" />
              </div>
              <p className="text-sm text-slate-600 text-left">
                <span className="font-bold text-slate-800">Visi kami:</span> Data lebih bersih, JKN lebih sehat, Indonesia lebih kuat.
              </p>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-4">
              {ABOUT_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center lg:text-left"
                >
                  <p className="text-3xl font-extrabold text-bpjs-600 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center lg:text-left">
              Sumber: KPK (2015, 2024), Kompas.id (2025) &mdash; angka skala masalah nasional, bukan hasil operasional BILL GATES.
            </p>

            {/* Mini trend: rasio klaim JKN terhadap iuran */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 mt-4">
              <p className="text-xs font-semibold text-slate-500 mb-4">
                Rasio Klaim JKN terhadap Iuran
              </p>
              <div className="space-y-3">
                {RATIO_TREND.map((point) => (
                  <div key={point.label}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-slate-500">{point.label}</span>
                      <span className="text-sm font-bold text-slate-800">{point.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-bpjs-500"
                        style={{ width: `${(point.value / 120) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Skala batang 0–120%. Sumber: Kompas.id (2025) — dua titik data yang tersedia, bukan proyeksi jangka panjang.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="kenapa" className="scroll-mt-24 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-4">
              <ShieldCheck size={14} />
              Kenapa BILL GATES?
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 text-balance">
              Audit Pasca-Bayar Sudah Terlambat
            </h2>
            <p className="text-slate-500 text-balance">
              BILL GATES menggeser titik deteksi dari setelah klaim dibayar, menjadi sebelum klaim disetujui.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Kondisi saat ini */}
            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                  <XCircle size={20} className="text-red-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Kondisi Saat Ini: Audit Pasca-Bayar</h3>
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

            {/* BILL GATES */}
            <div className="bg-bpjs-50/60 border border-bpjs-100 rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-bpjs-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">BILL GATES: Penapisan (Screening) Pra-Bayar</h3>
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
        </div>
      </section>

      {/* Alur Kerja */}
      <section id="alur" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-4">
            <ScanSearch size={14} />
            Alur Kerja
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 text-balance">
            Dari Klaim Diajukan Sampai Dana Cair
          </h2>
          <p className="text-slate-500 text-balance">
            Lima langkah — dan dana JKN tidak sempat keluar untuk klaim yang masih ditandai berisiko.
          </p>
        </div>

        <div className="relative grid gap-6 lg:grid-cols-5">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-slate-200" />

          {WORKFLOW_STEPS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-bpjs-600 flex items-center justify-center shadow-lg shadow-bpjs-600/25 mb-4">
                <Icon size={26} className="text-white" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-bpjs-600 text-bpjs-700 text-xs font-extrabold flex items-center justify-center">
                  {step}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1.5">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 bg-bpjs-50/60 border border-bpjs-100 rounded-2xl p-5 mt-10">
          <ShieldCheck size={18} className="text-bpjs-600 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800">Titik krusial ada di Langkah 1–2:</span> berbeda dari audit konvensional yang memeriksa klaim setelah dana cair, BILL GATES menahan klaim bermasalah sebelum sampai ke tahap pembayaran.
          </p>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="scroll-mt-24 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-4">
              <Zap size={14} />
              Fitur Unggulan
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 text-balance">
              Semua yang Dibutuhkan untuk Deteksi Fraud Klaim
            </h2>
            <p className="text-slate-500 text-balance">
              Dari pemindaian klaim hingga verifikasi akhir, seluruh proses terintegrasi dalam satu platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-bpjs-50 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-bpjs-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 bg-bpjs-50/60 border border-bpjs-100 rounded-2xl p-5 mt-6">
            <Cpu size={18} className="text-bpjs-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Rencana integrasi:</span> BILL GATES dirancang untuk terhubung ke sistem klaim BPJS Kesehatan yang sudah berjalan (mis. Vclaim) lewat API, dijadwalkan pada Fase 3 roadmap pengembangan — bukan menggantikan sistem yang ada, melainkan menjadi lapisan penapisan tambahan sebelum klaim disetujui.
            </p>
          </div>
        </div>
      </section>

      {/* Prototype / Dashboard */}
      <section id="prototype" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy + CTA */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-4">
                <LayoutDashboard size={14} />
                Prototype Fungsional
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 text-balance">
                Command Center yang Sudah Bisa Dicoba
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6 text-balance">
                Bukan sekadar mockup — ini tangkapan layar prototype BILL GATES yang berjalan dengan data simulasi, lengkap dengan modul yang sudah berfungsi.
              </p>

              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-8 max-w-md mx-auto lg:mx-0">
                {PROTOTYPE_MODULES.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={15} className="text-bpjs-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-3.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm lg:text-base font-bold rounded-xl shadow-lg shadow-bpjs-600/25 hover:shadow-xl transition-all inline-flex items-center justify-center gap-2 group"
              >
                Masuk Command Center (Demo)
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-slate-400 mt-3">
                *Berjalan dalam Mode Demo dengan data klaim simulasi.
              </p>
            </div>

            {/* Right: dashboard screenshot */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-xl">
              <img
                src={`${base}images/dashboard.png`}
                alt="Dashboard Pusat Kendali BILL GATES - Mode Demo dengan data klaim simulasi"
                className="w-full object-cover"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-10">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <span className="font-bold">Soal skala data di atas:</span> volume klaim yang tampil di dashboard (mis. 12.458 total klaim) adalah dataset demo untuk menunjukkan tampilan &amp; performa antarmuka pada skala besar, bukan klaim bahwa seluruh volume tersebut sudah melalui validasi akurasi manual. Validasi akurasi (Bagian 5) dilakukan secara terkontrol pada 24 klaim simulasi berlabel, dan akan diperluas pada fase pilot dengan data riil (Bagian 6).
            </p>
          </div>
      </section>

      {/* Validasi */}
      <section id="validasi" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-4">
            <CheckCircle2 size={14} />
            Diuji, Bukan Hanya Diklaim
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 text-balance">
            Hasil Uji Internal Prototype
          </h2>
          <p className="text-slate-500 text-balance">
            Diuji pada 24 klaim simulasi: klaim wajar bercampur dengan 3 pasang phantom/repeat billing dan 2 kasus dugaan upcoding yang sengaja disisipkan tim untuk menguji algoritma.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-6">
          {VALIDATION_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center"
            >
              <p className="text-4xl font-extrabold text-bpjs-600 mb-2">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-bold">Kejujuran soal keterbatasan:</span> hasil di atas adalah uji internal pada data simulasi, bukan hasil di lingkungan produksi. 1 dari 24 klaim wajar sempat ikut ter-flag &ldquo;Tinggi&rdquo; akibat variasi acak — sebabnya keputusan akhir tetap di tangan verifikator manusia. Ambang batas & bobot algoritma akan dikalibrasi ulang memakai data riil BPJS Kesehatan pada fase pilot.
          </p>
        </div>
      </section>

      {/* Tim Kami */}
      <section id="tim" className="scroll-mt-24 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-4">
              <Users size={14} />
              Tim Kami
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 text-balance">
              Tim Gelombang Utara
            </h2>
            <p className="text-slate-500 text-balance">
              Tiga peran yang saling melengkapi, dari konsep hingga eksekusi teknis.
            </p>
          </div>

          <img
            src={`${base}images/tim.png`}
            alt="Tim Gelombang Utara - Nailul Authar (Ketua/Educator & Analyst), Andy Kris Perdawan (Tech Lead), Ma'ruf Budi Utomo (UI/UX Designer)"
            className="w-full rounded-2xl shadow-lg border border-slate-100 object-cover"
          />
        </div>
      </section>

      {/* Kontak */}
      <section id="kontak" className="scroll-mt-24 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bpjs-50 border border-bpjs-200 text-bpjs-700 text-xs font-semibold mb-4">
            <Mail size={14} />
            Hubungi Kami
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3 text-balance">
            Ada Pertanyaan Seputar BILL GATES?
          </h2>
          <p className="text-slate-500 text-balance">
            Tim kami siap membantu Anda memahami dan mengimplementasikan sistem deteksi fraud klaim JKN.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-bpjs-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-400 px-1">
              *Kontak di atas adalah data dummy untuk keperluan demo prototype Healthkathon 2026.
            </p>
          </div>

          {/* Contact form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 lg:p-8 shadow-sm space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama</label>
                <input
                  type="text"
                  placeholder="Nama Anda"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bpjs-500/30 focus:border-bpjs-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bpjs-500/30 focus:border-bpjs-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Instansi</label>
              <input
                type="text"
                placeholder="Nama instansi / faskes"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bpjs-500/30 focus:border-bpjs-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pesan</label>
              <textarea
                rows={4}
                placeholder="Tuliskan pertanyaan atau kebutuhan Anda..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bpjs-500/30 focus:border-bpjs-400 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm font-bold rounded-xl shadow-md shadow-bpjs-600/20 transition-colors flex items-center justify-center gap-2"
            >
              Kirim Pesan
              <ChevronRight size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <p className="text-center text-xs text-slate-400">
          &copy; 2026 Tim Gelombang Utara.
        </p>
      </footer>

      {/* Back to top button */}
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
