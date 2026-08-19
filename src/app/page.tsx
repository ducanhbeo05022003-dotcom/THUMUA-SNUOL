import { requireAuth } from '@/lib/auth';
import Link from 'next/link';
import { BarChart3, ShoppingBag, FileText, Warehouse } from 'lucide-react';

export default async function Home() {
  await requireAuth();

  const cards = [
    {
      title: 'Yêu cầu mua hàng',
      icon: FileText,
      count: '—',
      href: '/requests',
      color: 'blue',
    },
    {
      title: 'Đơn hàng',
      icon: ShoppingBag,
      count: '—',
      href: '/orders',
      color: 'green',
    },
    {
      title: 'Tồn kho',
      icon: Warehouse,
      count: '—',
      href: '/inventory',
      color: 'amber',
    },
    {
      title: 'Báo cáo',
      icon: BarChart3,
      count: '—',
      href: '/reports',
      color: 'purple',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tổng quan</h1>
        <p className="text-slate-500 mt-2">Cập nhật nhanh về hoạt động mua hàng</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-50 border-blue-200 text-blue-600',
            green: 'bg-green-50 border-green-200 text-green-600',
            amber: 'bg-amber-50 border-amber-200 text-amber-600',
            purple: 'bg-purple-50 border-purple-200 text-purple-600',
          };
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`p-6 rounded-lg border transition hover:shadow-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.count}</p>
                </div>
                <Icon className="w-8 h-8 opacity-50" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Hướng dẫn nhanh</h2>
        <ul className="space-y-3 text-sm text-slate-600">
          <li>📋 <strong>Định mức:</strong> Quản lý tiêu chuẩn vật tư cho từng giai đoạn sản xuất</li>
          <li>📊 <strong>Nhu cầu:</strong> Tính toán nhu cầu vật tư dựa trên định mức và sản lượng</li>
          <li>📝 <strong>Đề xuất:</strong> Tạo yêu cầu mua hàng từ các phòng ban</li>
          <li>✓ <strong>Phê duyệt:</strong> Duyệt và phê chuẩn các yêu cầu mua hàng</li>
          <li>📦 <strong>Đơn hàng:</strong> Tạo đơn đặt hàng gửi cho nhà cung cấp</li>
          <li>💰 <strong>Công nợ:</strong> Quản lý thanh toán và công nợ với nhà cung cấp</li>
        </ul>
      </div>
    </div>
  );
}
