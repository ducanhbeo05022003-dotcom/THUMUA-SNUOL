'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Ruler,
  FileSpreadsheet,
  FileText,
  ShoppingBag,
  CheckSquare,
  FileCheck,
  Warehouse,
  CreditCard,
  PieChart,
  List,
  History,
  LogOut,
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'PURCHASER' | 'APPROVER';
}

interface SidebarProps {
  user?: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Tổng quan', icon: BarChart3 },
    { href: '/norms', label: 'Định mức', icon: Ruler },
    { href: '/demands', label: 'Nhu cầu', icon: FileSpreadsheet },
    { href: '/requests', label: 'Đề xuất', icon: FileText },
    { href: '/orders', label: 'Đơn hàng', icon: ShoppingBag },
    { href: '/approvals', label: 'Phê duyệt', icon: CheckSquare },
    { href: '/quotes', label: 'Báo giá & HĐ', icon: FileCheck },
    { href: '/inventory', label: 'Kho', icon: Warehouse },
    { href: '/payables', label: 'Công nợ', icon: CreditCard },
    { href: '/reports', label: 'Báo cáo', icon: PieChart },
    { href: '/masters', label: 'Danh mục', icon: List },
    { href: '/audit', label: 'Nhật ký', icon: History },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen fixed left-0 top-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xs">
            QLMH
          </div>
          <span className="font-semibold text-slate-700 text-sm">KLH</span>
        </div>
        {user && (
          <div className="text-xs">
            <p className="font-medium text-slate-800">{user.name}</p>
            <p className="text-slate-500">{user.role === 'ADMIN' ? 'Quản trị' : user.role === 'PURCHASER' ? 'Mua hàng' : 'Phê duyệt'}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition text-sm ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
