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
import { MeasuredResults } from '../components/landing/MeasuredResults';
import { evalEvidence } from '../data/evalEvidence';
import { learningEvidence } from '../data/learningEvidence';

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
  { icon: Zap, label: 'Skala Teruji\n100.000 Klaim ≈ 2 Detik (Uji Batch)' },
  { icon: ShieldCheck, label: 'Skor Bisa Dijelaskan\n& Belajar dari Verifikator' },
  { icon: BarChart3, label: 'Salah Tandai Turun\n(Terukur pada Simulasi)' },
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

// Alur kerja klaim melalui BILL GATES, dari pengajuan faskes hingga pembayaran (Bagian 3-4 proposal)
const WORKFLOW_STEPS = [
  { icon: FileText, step: '1', title: 'Klaim Diajukan Faskes', desc: 'Faskes mengajukan klaim ke sistem BPJS seperti proses normal — belum ada dana yang cair.' },
  { icon: ScanSearch, step: '2', title: 'Penapisan Otomatis Pra-Bayar', desc: 'Klaim baru dibandingkan dengan klaim sebelumnya (dikelompokkan per diagnosis/tindakan, jendela 21 hari) sebelum disetujui.' },
  { icon: Gauge, step: '3', title: 'Skor Kemiripan yang Bisa Dijelaskan', desc: 'Skor 0–100 dari ID pasien, ICD-10, tindakan, faskes, jarak waktu & nilai klaim. Model belajar menyaring klaim sah yang mirip.' },
  { icon: UserCheck, step: '4', title: 'Eskalasi ke Verifikator', desc: 'Hanya kandidat duplikat yang diteruskan ke verifikator, lengkap dengan alasan dan peluang duplikat.' },
  { icon: CircleDollarSign, step: '5', title: 'Keputusan, Audit & Belajar', desc: 'Setujui/Tolak wajib beralasan dan tercatat di log audit; keputusan itu menjadi bahan belajar sistem.' },
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
  'Pusat Verifikasi (beralasan)',
  'Model Belajar',
  'Log Audit & Login Peran',
];

// Fitur nyata sesuai Bagian 3-5 proposal (bukan generic AI marketing)
const FEATURES = [
  { icon: FileSearch, title: 'Penapisan Klaim Ganda Pra-Bayar', desc: 'Klaim baru dibandingkan dengan klaim sebelumnya lewat pengelompokan (blocking), sehingga 100.000 klaim diproses sekitar 2 detik pada uji batch — bukan membandingkan semua pasangan.' },
  { icon: Percent, title: 'Skor Kemiripan yang Transparan', desc: 'Skor 0–100 dari ID pasien (wajib sama/mirip), ICD-10, tindakan, faskes, jarak waktu, dan nilai klaim — setiap skor disertai alasannya, bukan black-box.' },
  { icon: TrendingUp, title: 'Indikasi Anomali Biaya (Belum Divalidasi)', desc: 'Deviasi biaya per diagnosis ditandai sebagai sinyal tambahan. Akurasinya belum diukur dan akan divalidasi pada fase pilot.' },
  { icon: LayoutDashboard, title: 'Dashboard Command Center', desc: 'Monitoring Klaim, Deteksi Tagihan Ganda, Radar Risiko, Pusat Verifikasi, Investigasi, Model Belajar, dan Log Audit dalam satu alur kerja.' },
  { icon: UserCheck, title: 'Belajar dari Keputusan Verifikator', desc: 'Model kecil dengan bobot yang bisa dibaca belajar dari Setujui/Tolak untuk membedakan duplikat dari klaim sah yang mirip. Pada simulasi, precision naik dari 56% ke 86% (200 keputusan); recall turun ke ±84%.' },
  { icon: LockKeyhole, title: 'Akses Terkontrol & Teraudit', desc: 'Login dengan peran (Verifikator, Auditor, Administrator), sesi habis otomatis, keputusan wajib beralasan, dan log audit append-only. Data demo 100% sintetis.' },
];

// Hasil uji internal (Bagian 5 — Validasi), dengan disclaimer jujur seperti di proposal
const _v1 = evalEvidence.methods.find((m) => m.name.startsWith('V1'))!;
const _v2 = evalEvidence.methods.find((m) => m.name.startsWith('V2'))!;
const _k200 = learningEvidence.rows.find((r) => r.k === 200)!;
const _p = (x: number) => (x * 100).toFixed(1).replace('.', ',') + '%';
const VALIDATION_STATS = [
  { value: `${_p(_v1.precision)} → ${_p(_v2.precision)}`, label: 'Precision: algoritma lama (V1) → perbaikan (V2)' },
  { value: `${_p(_v2.precision)} → ${_p(_k200.precision)}`, label: 'Precision setelah belajar dari 200 keputusan verifikator (simulasi)' },
  { value: `${_p(_v1.workloadPct)} → ${_p(_v2.workloadPct)}`, label: 'Porsi klaim yang harus ditinjau verifikator (V1 → V2)' },
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
            Deteksi Klaim Ganda yang Bisa Dijelaskan
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
            Command Center untuk verifikator BPJS: menandai klaim ganda sebelum dibayar dengan skor yang bisa dijelaskan, dan belajar dari keputusan verifikator untuk mengurangi klaim sah yang salah ditandai.
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
              &ldquo;Detect Smarter, Protect JKN&rdquo;
            </p>
          </div>
        </div>

        {/* Right column: panel hasil pengukuran (angka dibaca dari scripts/eval) */}
        <div className="order-1 lg:order-2 relative w-full lg:h-[calc(100vh-88px)]">
          <MeasuredResults />
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
              Mencegah Lebih Murah daripada Menagih Kembali
            </h2>
            <p className="text-slate-500 text-balance">
              BILL GATES melengkapi proses verifikasi yang ada dengan penapisan duplikat yang bisa dijelaskan, sebelum klaim disetujui.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Kondisi saat ini */}
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

            {/* BILL GATES */}
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
            Lima langkah: klaim ditandai sebelum disetujui, dan keputusan verifikator menjadi bahan belajar sistem.
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
            <span className="font-bold text-slate-800">Titik krusial ada di Langkah 2 dan 5:</span> klaim ditandai sebelum pembayaran, dan setiap keputusan verifikator tercatat serta membuat penandaan berikutnya lebih tepat.
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
              Fitur yang Sudah Berjalan di Prototype
            </h2>
            <p className="text-slate-500 text-balance">
              Dari penapisan klaim hingga keputusan yang tercatat dan menjadi bahan belajar, dalam satu platform.
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
                Bukan sekadar mockup — prototype BILL GATES berjalan dengan data sintetis. Masuk memerlukan akun berperan (lihat dashboard peserta untuk akun demo juri).
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
                *Berjalan dalam Mode Demo dengan data klaim sintetis. Login diperlukan.
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
              <span className="font-bold">Soal angka di tangkapan layar:</span> angka pada dashboard (mis. 12.458 klaim) adalah tampilan demo, bukan hasil pengukuran. Hasil pengukuran yang sebenarnya ada pada bagian Validasi di bawah, dari skrip evaluasi yang bisa dijalankan ulang (<code>npm run eval</code>).
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
            Hasil Pengukuran pada Data Sintetis
          </h2>
          <p className="text-slate-500 text-balance">
            Diuji pada 5.026 klaim sintetis berkunci jawaban (100 duplikat disisipkan, ditambah klaim sah yang mirip seperti kontrol kronis dan sesi berulang). Ambang dipilih pada data tuning terpisah, lalu diuji pada data baru.
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
            <span className="font-bold">Kejujuran soal keterbatasan:</span> semua angka berasal dari data sintetis dan verifikator simulasi (keliru 5%), bukan data atau verifikator BPJS sungguhan. Pada 200 keputusan, precision naik tetapi recall turun ke ±84% — sebagian duplikat asli ikut tersaring. Deteksi anomali biaya (upcoding) belum divalidasi. Parameter akan dikalibrasi dengan Data Sampel BPJS dan diuji pada fase pilot.</p>
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

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { img: 'team-nailul.jpg', name: 'Nailul Authar, S.Kom.', role: 'Ketua / Educator & Analyst' },
              { img: 'team-andy.jpg', name: 'Andy Kris Perdawan, A.Md.T.', role: 'Tech Lead' },
              { img: 'team-maruf.jpg', name: "Ma'ruf Budi Utomo, S.M.", role: 'UI/UX Designer' },
            ].map((m) => (
              <div key={m.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
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
