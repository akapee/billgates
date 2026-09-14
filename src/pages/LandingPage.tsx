import React, { useState } from 'react';
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
  FileClock,
  LockKeyhole,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Kontak', href: '#kontak' },
];

const HERO_FEATURES = [
  { icon: Zap, label: 'Deteksi Instan\n< 30 Detik' },
  { icon: ShieldCheck, label: 'Akurasi Tinggi\ndengan AI' },
  { icon: BarChart3, label: 'Mendukung\nEfisiensi JKN' },
  { icon: Users, label: 'Human-in-the-Loop\nKeputusan Tetap di Tangan Verifikator' },
];

const ABOUT_STATS = [
  { value: '2.481', label: 'Klaim Dianalisis' },
  { value: '99,3%', label: 'Akurasi Deteksi' },
  { value: '34', label: 'Provinsi Terjangkau' },
  { value: '2.842', label: 'Faskes Terhubung' },
];

const FEATURES = [
  {
    icon: FileSearch,
    title: 'Deteksi Klaim Ganda Real-time',
    desc: 'Memindai setiap klaim yang masuk secara otomatis untuk menemukan indikasi duplikasi sebelum klaim dibayarkan.',
  },
  {
    icon: BarChart3,
    title: 'Analisis Pola Anomali AI',
    desc: 'Model AI mempelajari pola klaim historis untuk mengenali pola tidak wajar dan potensi fraud secara dini.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Command Center',
    desc: 'Pantau tren klaim, distribusi risiko, dan status verifikasi dalam satu tampilan yang komprehensif.',
  },
  {
    icon: UserCheck,
    title: 'Human-in-the-Loop',
    desc: 'Rekomendasi dari sistem tetap diverifikasi oleh petugas sebelum keputusan akhir diambil.',
  },
  {
    icon: FileClock,
    title: 'Riwayat & Audit Trail',
    desc: 'Setiap proses deteksi dan verifikasi tercatat rapi sehingga mudah ditelusuri kapan pun dibutuhkan.',
  },
  {
    icon: LockKeyhole,
    title: 'Keamanan Data Terjamin',
    desc: 'Data klaim dan pasien dienkripsi serta diproses sesuai standar keamanan data kesehatan.',
  },
];

const CONTACT_INFO = [
  { icon: Phone, label: 'Telepon', value: '(021) 500-400' },
  { icon: Mail, label: 'Email', value: 'kontak@billgates-jkn.id' },
  { icon: MapPin, label: 'Alamat', value: 'Jakarta, Indonesia' },
  { icon: Clock, label: 'Jam Layanan', value: 'Senin - Jumat, 08.00 - 17.00' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const base = import.meta.env.BASE_URL;
  const [menuOpen, setMenuOpen] = useState(false);

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

          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                className={
                  i === 0
                    ? 'px-5 py-2 text-sm font-semibold text-bpjs-700 bg-white rounded-full shadow-sm'
                    : 'px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full transition-colors'
                }
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="#kontak"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm font-semibold rounded-full shadow-md shadow-bpjs-600/20 transition-colors"
          >
            <Phone size={16} />
            Hubungi Kami
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700"
            aria-label="Buka menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-1 bg-slate-50 rounded-2xl border border-slate-200 p-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white hover:text-bpjs-700 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#kontak"
              onClick={() => setMenuOpen(false)}
              className="mt-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-bpjs-600 text-white text-sm font-semibold rounded-xl"
            >
              <Phone size={16} />
              Hubungi Kami
            </a>
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

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm lg:text-base font-bold rounded-xl shadow-lg shadow-bpjs-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              Masuk Command Center
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#tentang"
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-700 border-2 border-slate-200 hover:border-bpjs-400 hover:text-bpjs-700 text-sm lg:text-base font-semibold rounded-xl transition-all text-center"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>

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

        {/* Right column: gambar full-bleed */}
        <div className="order-1 lg:order-2 w-full h-[280px] sm:h-[380px] lg:h-[calc(100vh-88px)]">
          <img
            src={`${base}images/header.png`}
            alt="Bill Gates - Command Center Deteksi Fraud JKN"
            className="w-full h-full object-cover object-left lg:rounded-l-[2.5rem]"
          />
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
              Melindungi Dana JKN dengan Teknologi AI
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
    </div>
  );
}
