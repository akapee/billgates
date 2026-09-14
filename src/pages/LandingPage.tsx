import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Phone,
  Zap,
  ShieldCheck,
  BarChart3,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

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
      {/* subtle background wash */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-bpjs-50/60 via-white to-white -z-10" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Navbar */}
        <header className="flex items-center justify-between py-5">
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

        {/* Hero */}
        <main className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center py-8 lg:py-14">
          {/* Left column */}
          <div className="text-center lg:text-left">
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

          {/* Right column: hero image + floating cards */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
              <img
                src={`${base}images/header.png`}
                alt="Tim Bill Gates - Command Center Deteksi Fraud JKN"
                className="w-full h-[320px] sm:h-[420px] lg:h-[560px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bpjs-900/10 via-transparent to-transparent" />
            </div>

            {/* Claim scanning stat card */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 items-center gap-4 animate-fade-in max-w-[220px]">
              <div className="w-11 h-11 rounded-full bg-bpjs-50 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-bpjs-600" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-800 leading-none">2,481</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Klaim Dianalisis</p>
              </div>
            </div>

            {/* Detection accuracy badge */}
            <div className="hidden sm:flex absolute top-5 -right-4 bg-white/95 backdrop-blur px-4 py-3 rounded-2xl shadow-xl border border-slate-100 items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-full border-4 border-bpjs-500 flex items-center justify-center">
                <span className="text-[10px] font-extrabold text-bpjs-700">99%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 leading-tight">Akurasi</p>
                <p className="text-xs text-slate-400 leading-tight">Deteksi</p>
              </div>
            </div>

            {/* AI risk detection card */}
            <div className="hidden lg:block absolute -bottom-10 right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-fade-in w-56">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-bpjs-600 flex items-center justify-center">
                  <Cpu size={16} className="text-white" />
                </div>
                <p className="text-sm font-bold text-slate-800">AI Risk Detection</p>
              </div>
              <ul className="space-y-1.5">
                {['Analisis Pola Klaim', 'Pencocokan Data Historis', 'Peringatan Anomali'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 size={13} className="text-bpjs-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* potential fraud alert pill */}
            <div className="hidden lg:flex absolute top-1/2 -left-8 -translate-y-1/2 bg-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-100 items-center gap-2 animate-fade-in">
              <AlertTriangle size={16} className="text-amber-500" />
              <div>
                <p className="text-sm font-extrabold text-slate-800 leading-none">17</p>
                <p className="text-[10px] text-slate-500 font-medium">Potensi Duplikasi</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
