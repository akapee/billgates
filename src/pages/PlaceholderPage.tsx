import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

// ─────────────────────────────────────────────
// Placeholder Page
// ─────────────────────────────────────────────

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  phase?: string;
}

export function PlaceholderPage({
  title,
  description,
  icon,
  phase = 'Tahap 2',
}: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
          {icon || <Construction size={36} className="text-blue-400" />}
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Coming in {phase}
        </span>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 max-w-md mb-2">{description}</p>
        <p className="text-sm text-slate-400 max-w-md mb-8">
          Halaman ini sedang dalam pengembangan dan akan tersedia pada fase pengembangan berikutnya.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 w-full max-w-xl">
          {['Data Analysis', 'AI Detection', 'Report Export'].map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm text-sm text-slate-500"
            >
              <span className="w-2 h-2 rounded-full bg-blue-200" />
              {feature}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
