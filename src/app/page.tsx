import { requireAuth } from '@/lib/auth';
import DashboardOverview from '@/components/DashboardOverview';

export default async function Home() {
  await requireAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tổng quan</h1>
        <p className="text-slate-500 mt-2">Dòng tiền và tiến độ mua hàng theo thời gian thực</p>
      </div>

      <DashboardOverview />
    </div>
  );
}
