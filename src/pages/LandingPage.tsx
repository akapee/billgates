import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, ChevronRight, Phone } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Background with Green Gradient and Patterns */}
      <div className="absolute inset-0 gradient-bpjs z-0" />
      <div className="absolute inset-0 pattern-dots opacity-20 z-0" />
      
      {/* Decorative Plus Icons */}
      <div className="absolute top-20 left-32 z-0 opacity-10 hidden lg:block">
        <Plus size={64} className="text-white" />
      </div>
      <div className="absolute bottom-32 left-1/3 z-0 opacity-10 hidden lg:block">
        <Plus size={48} className="text-white" />
      </div>
      <div className="absolute top-1/4 right-1/4 z-0 opacity-10 hidden lg:block">
        <Plus size={80} className="text-white" />
      </div>

      {/* Decorative Circles */}
      <div className="absolute -bottom-40 -left-40 w-96 h-96 border-[40px] border-white/5 rounded-full z-0 hidden lg:block" />
      <div className="absolute top-20 -right-20 w-72 h-72 border-[20px] border-white/5 rounded-full z-0 hidden lg:block" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto px-6 w-full">
        
        {/* Navbar */}
        <header className="flex items-center justify-between py-4 lg:py-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-bpjs-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-wide leading-none">BILL GATES</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20">
            <a href="#" className="px-5 py-2 text-sm font-medium text-bpjs-700 bg-white rounded-full shadow-sm">Beranda</a>
            <a href="#" className="px-5 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-full transition-colors">Tentang</a>
            <a href="#" className="px-5 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-full transition-colors">Fitur</a>
            <a href="#" className="px-5 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-full transition-colors">Kontak</a>
          </nav>

          <button className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full border border-white/20 backdrop-blur-md transition-all">
            <Phone size={16} />
            Hubungi Kami
          </button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-between py-6 lg:py-0 gap-8 lg:gap-12 min-h-0">
          
          {/* Left Column: Text & Buttons */}
          <div className="flex-1 max-w-2xl text-center lg:text-left pt-4 lg:pt-0 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-4 lg:mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              Sistem Deteksi Fraud AI
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 lg:mb-6 text-balance">
              BILL GATES
              <span className="block text-xl sm:text-2xl lg:text-3xl xl:text-4xl mt-1 lg:mt-2 font-medium text-green-100">
                (BILLing Ganda & Anomali TerEliminasi Sistem)
              </span>
            </h1>
            
            <p className="text-base lg:text-lg text-green-50 mb-6 lg:mb-10 leading-relaxed text-balance max-w-xl mx-auto lg:mx-0">
              Platform Command Center berbasis Artificial Intelligence untuk mendeteksi dan mencegah anomali klaim kesehatan JKN secara real-time dan komprehensif.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 lg:gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-3 lg:px-8 lg:py-4 bg-white text-bpjs-700 hover:bg-slate-50 text-sm lg:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Masuk Command Center
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="w-full sm:w-auto px-6 py-3 lg:px-8 lg:py-4 bg-transparent text-white border-2 border-white/30 hover:border-white hover:bg-white/10 text-sm lg:text-base font-semibold rounded-xl transition-all">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="flex-1 relative w-full flex justify-center lg:justify-end min-h-0 h-full max-h-[50vh] lg:max-h-full items-center">
            {/* Soft glow behind image */}
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full max-w-md mx-auto" />
            
            <img 
              src={`${import.meta.env.BASE_URL}tim.png`}
              alt="Tim Dokter dan Perawat" 
              className="relative z-10 w-full lg:w-auto h-full max-h-[40vh] lg:max-h-[70vh] rounded-2xl shadow-2xl border-4 border-white/20 object-cover lg:object-contain"
            />
            
            {/* Floating Info Card */}
            <div className="absolute bottom-10 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 z-20 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Deteksi Fraud</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Monitoring Aktif 24/7</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
