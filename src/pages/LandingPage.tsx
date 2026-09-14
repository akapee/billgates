import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Phone, Zap, ShieldCheck, BarChart3, Users } from 'lucide-react';

const NAV_LINKS = ['Beranda', 'Tentang', 'Fitur', 'Kontak'];

const FEATURES = [
  { icon: Zap, label: 'Deteksi Instan\n< 30 Detik' },
  { icon: ShieldCheck, label: 'Akurasi Tinggi\ndengan AI' },
  { icon: BarChart3, label: 'Mendukung\nEfisiensi JKN' },
  { icon: Users, label: 'Human-in-the-Loop\nKeputusan Tetap di Tangan Verifikator' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const base = import.meta.env.BASE_URL;

  return (
    <div className="min-h-screen w-full bg-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 py-5">
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
            
              key={link}
              href="#"
              className={
                i === 0
                  ? 'px-5 py-2 text-sm font-semibold text-bpjs-700 bg-white rounded-full shadow-sm'
                  : 'px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full transition-colors'
              }
            >
              {link}
            </a>
          ))}
        </nav>

        <button className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-bpjs-600 hover:bg-bpjs-700 text-white text-sm font-semibold rounded-full shadow-md shadow-bpjs-600/20 transition-colors">
          <Phone size={16} />
          Hubungi Kami
        </button>
      </header>

      {/* Hero: text kiri, gambar full-bleed kanan */}
      <main className="grid lg:grid-cols-2 items-center">
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

            <button className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-700 border-2 border-slate-200 hover:border-bpjs-400 hover:text-bpjs-700 text-sm lg:text-base font-semibold rounded-xl transition-all">
              Pelajari Lebih Lanjut
            </button>
          </div>

          {/* Feature row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {FEATURES.map(({ icon: Icon, label }) => (
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

        {/* Right column: gambar full-bleed, tanpa kartu tambahan (semua info sudah ada di gambar) */}
        <div className="order-1 lg:order-2 w-full h-[280px] sm:h-[380px] lg:h-[calc(100vh-88px)]">
          <img
            src={`${base}images/header.png`}
            alt="Bill Gates - Command Center Deteksi Fraud JKN"
            className="w-full h-full object-cover object-left lg:rounded-l-[2.5rem]"
          />
        </div>
      </main>
    </div>
  );
}
