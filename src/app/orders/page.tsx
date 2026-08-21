'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useColumnResize } from '@/hooks/useColumnResize';
import Pagination from '@/components/Pagination';

const PAGE_SIZE = 10;

const ORDER_COLUMNS = [
  'Số đơn hàng', 'Ngày', 'Diễn giải', 'Nhà cung cấp', 'Công ty',
  'Tổng tiền', 'Người lập', 'Trạng thái', 'Chi tiết',
];
const ORDER_COL_DEFAULTS = [160, 100, 320, 200, 90, 140, 160, 130, 90];

interface OrderItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  code: string;
  status: string;
  note?: string;
  createdAt: string;
  orderDate?: string;
  company?: string;
  goodsAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  currency?: string;
  exchangeRate?: number;
  creatorName?: string;
  categoryCode?: string;
  categoryName?: string;
  supplier: { name: string };
  creator: { name: string };
  items: OrderItem[];
}

function fmtMoney(n?: number, currency?: string) {
  if (n === undefined || n === null) return '—';
  return `${n.toLocaleString('vi-VN')} ${currency || ''}`.trim();
}

function fmtDate(d?: string) {
  return d ? new Date(d).toLocaleDateString('vi-VN') : '—';
}

const statusLabel: Record<string, string> = {
  DRAFT: 'Nháp',
  SENT: 'Đã gửi',
  CONFIRMED: 'Đã xác nhận',
  PARTIALLY_RECEIVED: 'Nhận một phần',
  RECEIVED: 'Đã hoàn thiện',
  CANCELLED: 'Đã hủy',
};

function statusBadgeClass(status: string) {
  switch (status) {
    case 'RECEIVED':
      return 'bg-green-100 text-green-700';
    case 'CONFIRMED':
    case 'SENT':
      return 'bg-blue-100 text-blue-700';
    case 'PARTIALLY_RECEIVED':
      return 'bg-amber-100 text-amber-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export default function OrdersPage() {
  const { widths, startResize, resetWidths } = useColumnResize('orders-table-widths', ORDER_COL_DEFAULTS);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<PurchaseOrder | null>(null);
  const [companyFilter, setCompanyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [companies, setCompanies] = useState<string[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    supplierName: '',
    company: 'ERC',
    note: '',
    goodsAmount: '',
    taxAmount: '',
    totalAmount: '',
    currency: 'KHR',
    categoryName: '',
  });

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, companyFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (companyFilter) params.set('company', companyFilter);
      const res = await fetch(`/api/purchase-orders?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
        setCompanies(json.companies);
        setTotals(json.totals);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchOrders();
        setShowModal(false);
        setFormData({
          supplierName: '', company: 'ERC', note: '', goodsAmount: '',
          taxAmount: '', totalAmount: '', currency: 'KHR', categoryName: '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const totalUSD = totals.USD || 0;
  const totalKHR = totals.KHR || 0;

  const handleCompanyFilter = (c: string) => {
    setCompanyFilter(c);
    setPage(1);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đơn hàng</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý đơn đặt hàng mua ngoài và trạng thái giao hàng</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Tạo đơn hàng mới
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
          <button
            onClick={() => handleCompanyFilter('')}
            className={`px-2.5 py-1 rounded-lg font-medium ${companyFilter === '' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Tất cả
          </button>
          {companies.map((c) => (
            <button
              key={c}
              onClick={() => handleCompanyFilter(c)}
              className={`px-2.5 py-1 rounded-lg font-medium ${companyFilter === c ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 text-xs">
          {totalUSD > 0 && (
            <span className="px-3 py-2 bg-green-50 border border-green-100 rounded-xl font-semibold text-green-700">
              Tổng USD: {totalUSD.toLocaleString('vi-VN')} $
            </span>
          )}
          {totalKHR > 0 && (
            <span className="px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl font-semibold text-amber-700">
              Tổng KHR: {totalKHR.toLocaleString('vi-VN')} ៛
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse" style={{ tableLayout: 'fixed', width: widths.reduce((a, b) => a + b, 0) }}>
            <colgroup>
              {widths.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[13px] font-semibold text-slate-700">
                {ORDER_COLUMNS.map((label, i) => (
                  <th
                    key={label}
                    className={`relative py-3 px-4 select-none overflow-hidden text-ellipsis whitespace-nowrap ${i === 5 ? 'text-right' : i === 8 ? 'text-center' : ''}`}
                  >
                    {label}
                    <span
                      onMouseDown={startResize(i)}
                      className="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-blue-300/50 active:bg-blue-400/60"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600">
              {loading ? (
                <tr><td colSpan={9} className="p-4 text-center text-slate-500">Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="p-4 text-center text-slate-500">Chưa có đơn hàng nào</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 overflow-hidden text-ellipsis whitespace-nowrap" title={o.code}>{o.code}</td>
                    <td className="py-3 px-4 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">{fmtDate(o.orderDate || o.createdAt)}</td>
                    <td className="py-3 px-4 text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap" title={o.note}>{o.note || '—'}</td>
                    <td className="py-3 px-4 text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap" title={o.supplier.name}>{o.supplier.name}</td>
                    <td className="py-3 px-4 text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap">{o.company || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap">{fmtMoney(o.totalAmount, o.currency)}</td>
                    <td className="py-3 px-4 text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap" title={o.creatorName || o.creator.name}>{o.creatorName || o.creator.name}</td>
                    <td className="py-3 px-4 overflow-hidden text-ellipsis whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(o.status)}`}>
                        {statusLabel[o.status] || o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center overflow-hidden">
                      <button
                        onClick={() => setDetail(o)}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs text-slate-500">
            Trang <strong>{page}</strong>/{totalPages} · Tổng <strong>{total}</strong> đơn hàng
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          <button onClick={resetWidths} className="text-xs text-slate-400 hover:text-blue-600 underline underline-offset-2">
            Đặt lại độ rộng cột
          </button>
        </div>
      </div>

      {/* Modal: Tạo đơn hàng mới */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-slate-50">
              <h3 className="font-bold text-slate-800">Tạo đơn hàng mới</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="Tên nhà cung cấp"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Công ty</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tiền tệ</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="KHR">KHR</option>
                    <option value="USD">USD</option>
                    <option value="VND">VND</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diễn giải</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tiền hàng</label>
                  <input
                    type="number"
                    value={formData.goodsAmount}
                    onChange={(e) => setFormData({ ...formData, goodsAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tiền thuế</label>
                  <input
                    type="number"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tổng tiền</label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại hàng</label>
                <input
                  type="text"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  placeholder="VD: Vật tư hàng hóa nông nghiệp"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
                <button type="button" onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm">Tạo đơn hàng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chi tiết đơn hàng */}
      {detail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-slate-50">
              <h3 className="font-bold text-slate-800">{detail.code}</h3>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <p className="text-slate-700"><strong>Diễn giải:</strong> {detail.note || '—'}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500">Ngày:</span> <span className="font-medium">{fmtDate(detail.orderDate || detail.createdAt)}</span></div>
                <div><span className="text-slate-500">Công ty:</span> <span className="font-medium">{detail.company || '—'}</span></div>
                <div><span className="text-slate-500">Nhà cung cấp:</span> <span className="font-medium">{detail.supplier.name}</span></div>
                <div><span className="text-slate-500">Người lập:</span> <span className="font-medium">{detail.creatorName || detail.creator.name}</span></div>
                <div><span className="text-slate-500">Tiền hàng:</span> <span className="font-medium">{fmtMoney(detail.goodsAmount, detail.currency)}</span></div>
                <div><span className="text-slate-500">Tiền thuế:</span> <span className="font-medium">{fmtMoney(detail.taxAmount, detail.currency)}</span></div>
                <div><span className="text-slate-500">Tỷ giá:</span> <span className="font-medium">{detail.exchangeRate ?? '—'}</span></div>
                <div><span className="text-slate-500">Phân loại:</span> <span className="font-medium">{detail.categoryName || '—'}</span></div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 text-xs">Tổng tiền</span>
                <span className="font-mono font-bold text-lg text-slate-800">{fmtMoney(detail.totalAmount, detail.currency)}</span>
              </div>
              <div className="pt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass(detail.status)}`}>
                  {statusLabel[detail.status] || detail.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
