import { KeyRound, ShieldCheck, UserCog, UsersRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function UserManagement() {
  const { role } = useAuth();

  if (role !== 'superadmin') {
    return (
      <div className="p-6">
        <div className="card p-6 text-sm text-slate-600">
          Halaman ini hanya dapat diakses oleh Super Admin.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          <UsersRound size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manajemen User</h2>
          <p className="mt-1.5 text-sm text-slate-500">Kelola akun yang dapat mengakses sistem dan tetapkan perannya.</p>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
        Demi keamanan, pembuatan akun dan perubahan peran tidak dilakukan langsung dari browser. Lakukan perubahan melalui Firebase Console atau Admin SDK menggunakan akun administrator yang berwenang.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GuideCard
          icon={<UserCog size={20} />}
          title="Buat akun"
          description="Tambahkan pengguna melalui Firebase Authentication dengan metode Email/Password."
          step="Authentication → Users → Add user"
        />
        <GuideCard
          icon={<ShieldCheck size={20} />}
          title="Tetapkan peran"
          description="Buat dokumen staff dengan ID berupa UID pengguna, lalu tetapkan peran yang sesuai."
          step="Firestore → staff/{uid} → role"
        />
        <GuideCard
          icon={<KeyRound size={20} />}
          title="Pilihan peran"
          description="Gunakan salah satu peran aplikasi yang tersedia untuk menentukan akses pengguna."
          step="verifikator, auditor, supervisor, atau superadmin"
        />
      </div>
    </div>
  );
}

function GuideCard({ icon, title, description, step }: { icon: React.ReactNode; title: string; description: string; step: string }) {
  return (
    <section className="card p-5">
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">{icon}</div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
      <p className="mt-4 px-3 py-2 rounded-lg bg-slate-50 text-xs font-medium text-slate-700 break-words">{step}</p>
    </section>
  );
}
