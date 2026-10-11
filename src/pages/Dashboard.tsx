import React from 'react';
import { ArrowRight, BrainCircuit, FileSearch, Radar, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RiskOverview } from '../components/dashboard/RiskOverview';
import { ClaimTrend } from '../components/dashboard/ClaimTrend';
import { AnomalyBreakdown } from '../components/dashboard/AnomalyBreakdown';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { QuickActions } from '../components/dashboard/QuickActions';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../auth/AuthContext';
import type { KpiCardData } from '../types';
import { Loader2 } from 'lucide-react';

const roleLabels = { verifikator: 'Verifikator', auditor: 'Auditor', supervisor: 'Supervisor', superadmin: 'Super Admin' };

export function Dashboard() {
  const navigate = useNavigate();
  const { data: kpiCards, loading } = useFirestore<KpiCardData>('kpi_cards');
  const { role, canDecide, canInvestigate } = useAuth();
  const roleLabel = roleLabels[role || 'superadmin'];
  const actionTiles = [
    { label: 'Tagihan Ganda', hint: 'Tinjau kandidat duplikasi', icon: FileSearch, route: '/duplicate-detection', color: 'bg-orange-100 text-orange-600', visible: canDecide },
    { label: 'Deteksi Anomali', hint: 'Pola klaim tidak wajar', icon: Radar, route: '/anomalies', color: 'bg-rose-100 text-rose-600', visible: canDecide },
    { label: 'Pusat Verifikasi', hint: 'Ambil keputusan final', icon: ShieldCheck, route: '/verification', color: 'bg-blue-100 text-blue-600', visible: canDecide },
    { label: 'Analitik AI', hint: 'Radar dan jaringan fraud', icon: BrainCircuit, route: '/risk-radar', color: 'bg-violet-100 text-violet-600', visible: canInvestigate },
  ].filter(tile => tile.visible);

  return <div className="p-4 sm:p-6 max-w-[1450px] mx-auto">
    <section className="rounded-[28px] bg-[#F7F7FF] p-3 sm:p-5 space-y-7">
      <div className="relative overflow-hidden rounded-2xl px-6 pt-4 pb-7 sm:px-9 sm:pt-5 sm:pb-8 md:pb-0 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #15803D 0%, #16A34A 55%, #22C55E 100%)' }}>
        <div className="absolute -right-12 -bottom-20 h-72 w-72 rounded-full border-[32px] border-white/10" /><div className="absolute right-24 top-5 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:min-h-[292px] md:justify-center md:pr-64 lg:pr-72"><div><p className="text-sm font-semibold text-blue-100">BILL GATES Command Center</p><h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Selamat datang, {roleLabel}</h1><p className="mt-3 max-w-xl text-sm sm:text-base leading-6 text-blue-100">Pusat kendali untuk menemukan pola fraud, memprioritaskan risiko, dan menjaga keputusan klaim tetap terukur.</p><button onClick={() => navigate(canDecide ? '/verification' : canInvestigate ? '/risk-radar' : '/reports')} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-50">Mulai tinjau sekarang <ArrowRight size={16} /></button></div><div className="hidden md:block absolute right-0 -bottom-12 w-56 lg:w-64 pointer-events-none dashboard-hero-illustration"><img src={`${import.meta.env.BASE_URL}images/fraud-analyst-hero.png`} alt="Analis fraud digital" className="block w-full h-auto object-contain drop-shadow-2xl" /></div></div>
      </div>

      <section><div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-bold text-slate-900">Menu prioritas</h2><p className="mt-0.5 text-sm text-slate-500">Akses cepat ke proses penanganan fraud</p></div>{canInvestigate && <button onClick={() => navigate('/risk-radar')} className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700">Lihat Analitik AI <ArrowRight size={14} /></button>}</div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{actionTiles.map(tile => { const Icon = tile.icon; return <button key={tile.label} onClick={() => navigate(tile.route)} className="rounded-xl bg-white border border-slate-100 p-4 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"><span className={`w-10 h-10 rounded-xl grid place-items-center ${tile.color}`}><Icon size={20} /></span><p className="mt-4 text-sm font-bold text-slate-800">{tile.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{tile.hint}</p></button>; })}</div></section>

      <section><div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-bold text-slate-900">Ringkasan sistem</h2><p className="mt-0.5 text-sm text-slate-500">Metrik utama dari data klaim yang dipantau</p></div><span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Sistem aktif</span></div>{loading ? <div className="rounded-xl bg-white py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div> : <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">{kpiCards.map(card => <KpiCard key={card.id} data={card} />)}</div>}</section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4"><div className="lg:col-span-2"><RiskOverview /></div><div className="lg:col-span-3"><ClaimTrend /></div></section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2"><AnomalyBreakdown /></div><div><QuickActions /></div></section>
      <section><div className="flex items-center gap-2 mb-3"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /><h2 className="text-base font-bold text-slate-900">Peringatan terbaru</h2></div><RecentAlerts /></section>
    </section>
  </div>;
}

