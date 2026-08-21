'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PurchaseOrder {
  id: string;
  code: string;
  status: string;
  orderDate?: string;
  createdAt: string;
  company?: string;
  totalAmount?: number;
  currency?: string;
  exchangeRate?: number;
  supplier: { name: string };
  note?: string;
}

interface PurchaseRequest {
  id: string;
  code: string;
  status: string;
  orderStatus?: string;
  createdAt: string;
  receivedDate?: string;
  company?: string;
}

const DEFAULT_KHR_RATE = 0.0002439;

function toUSD(o: PurchaseOrder): number {
  const amount = o.totalAmount || 0;
  if (o.currency === 'USD') return amount;
  if (o.currency === 'KHR') return amount * (o.exchangeRate || DEFAULT_KHR_RATE);
  return amount;
}

function fmtUSD(n: number) {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

const COMPANY_COLORS: Record<string, string> = {
  ERC: '#2563eb',
  BP: '#16a34a',
  SV: '#d97706',
};
const FALLBACK_COLOR = '#64748b';

const STATUS_COLORS: Record<string, string> = {
  'Hoàn thành': '#16a34a',
  'Thanh Toán': '#2563eb',
  'Thanh Toán, Trình ký BLD và NCC': '#2563eb',
  'KT kiểm tra': '#d97706',
  'Chưa lên đơn hàng': '#dc2626',
};

export default function DashboardOverview() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/purchase-orders').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/purchase-requests').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([o, r]) => {
        setOrders(o);
        setRequests(r);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 text-sm">
        Đang tải dữ liệu...
      </div>
    );
  }

  const totalUSDEquivalent = orders.reduce((sum, o) => sum + toUSD(o), 0);
  const totalOrders = orders.length;
  const totalRequests = requests.length;

  // Spend by company (USD equivalent)
  const companies = Array.from(new Set(orders.map((o) => o.company).filter(Boolean))) as string[];
  const spendByCompany = companies
    .map((c) => ({ company: c, amount: orders.filter((o) => o.company === c).reduce((s, o) => s + toUSD(o), 0) }))
    .sort((a, b) => b.amount - a.amount);
  const maxCompanySpend = Math.max(...spendByCompany.map((c) => c.amount), 1);

  // Monthly cash flow (USD equivalent), last 6 months present in data
  const monthKey = (d?: string) => {
    if (!d) return null;
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  };
  const monthMap = new Map<string, number>();
  orders.forEach((o) => {
    const key = monthKey(o.orderDate || o.createdAt);
    if (!key) return;
    monthMap.set(key, (monthMap.get(key) || 0) + toUSD(o));
  });
  const months = Array.from(monthMap.keys()).sort();
  const monthlyData = months.map((m) => ({ month: m, amount: monthMap.get(m) || 0 }));
  const maxMonthly = Math.max(...monthlyData.map((m) => m.amount), 1);

  // Request progress by orderStatus
  const statusMap = new Map<string, number>();
  requests.forEach((r) => {
    const key = r.orderStatus || r.status;
    statusMap.set(key, (statusMap.get(key) || 0) + 1);
  });
  const statusEntries = Array.from(statusMap.entries()).sort((a, b) => b[1] - a[1]);
  const totalStatusCount = requests.length || 1;

  // Recent activity: merge orders+requests by date, take 6
  const recent = [
    ...orders.map((o) => ({
      type: 'order' as const,
      date: o.orderDate || o.createdAt,
      label: o.note || o.code,
      code: o.code,
      company: o.company,
      extra: fmtUSD(toUSD(o)),
    })),
    ...requests.map((r) => ({
      type: 'request' as const,
      date: r.receivedDate || r.createdAt,
      label: r.orderStatus || r.status,
      code: r.code,
      company: r.company,
      extra: r.orderStatus || r.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500">Tổng giá trị đơn hàng (quy đổi USD)</p>
          <p className="text-2xl font-bold text-slate-800 mt-2 font-mono">{fmtUSD(totalUSDEquivalent)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500">Tổng số đơn hàng</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500">Tổng số đề xuất</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{totalRequests}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500">Số công ty đang theo dõi</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{companies.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash flow by month */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Dòng tiền theo tháng</h3>
          <p className="text-xs text-slate-400 mb-4">Quy đổi USD tương đương · theo ngày đặt hàng</p>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {monthlyData.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <span className="text-[10px] font-semibold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition absolute -top-5">
                    {fmtUSD(m.amount)}
                  </span>
                  <div
                    className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all"
                    style={{ height: `${Math.max((m.amount / maxMonthly) * 100, 3)}%` }}
                  />
                  <span className="text-[10px] text-slate-500 mt-2">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spend by company */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Chi tiêu theo công ty</h3>
          <p className="text-xs text-slate-400 mb-4">Quy đổi USD tương đương</p>
          {spendByCompany.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-4">
              {spendByCompany.map((c) => (
                <div key={c.company}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{c.company}</span>
                    <span className="font-mono text-slate-600">{fmtUSD(c.amount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${Math.max((c.amount / maxCompanySpend) * 100, 2)}%`,
                        backgroundColor: COMPANY_COLORS[c.company] || FALLBACK_COLOR,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress by status (donut-ish stacked bar) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Tiến độ đề xuất</h3>
          <p className="text-xs text-slate-400 mb-4">Theo tình trạng đơn hàng</p>
          {statusEntries.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <>
              <div className="w-full h-4 rounded-full overflow-hidden flex mb-4">
                {statusEntries.map(([status, count]) => (
                  <div
                    key={status}
                    style={{
                      width: `${(count / totalStatusCount) * 100}%`,
                      backgroundColor: STATUS_COLORS[status] || FALLBACK_COLOR,
                    }}
                    title={`${status}: ${count}`}
                  />
                ))}
              </div>
              <div className="space-y-2">
                {statusEntries.map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[status] || FALLBACK_COLOR }}
                      />
                      <span className="text-slate-600 truncate" title={status}>{status}</span>
                    </div>
                    <span className="font-semibold text-slate-700 shrink-0 ml-2">
                      {count} ({Math.round((count / totalStatusCount) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Hoạt động gần đây</h3>
          <p className="text-xs text-slate-400 mb-4">Đơn hàng & đề xuất mới nhất</p>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {recent.map((r, i) => (
                <Link
                  key={i}
                  href={r.type === 'order' ? '/orders' : '/requests'}
                  className="flex items-center justify-between gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0 hover:bg-slate-50/60 -mx-2 px-2 py-1 rounded-lg transition"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{r.code}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{r.label}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      r.type === 'order' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {r.type === 'order' ? 'Đơn hàng' : 'Đề xuất'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.company || '—'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
