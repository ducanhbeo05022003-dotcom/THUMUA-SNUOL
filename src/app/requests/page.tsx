'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface PRItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

interface PurchaseRequest {
  id: string;
  code: string;
  department?: string;
  status: string;
  note?: string;
  createdAt: string;
  requester: { name: string };
  items: PRItem[];
  proposalCode?: string;
  senderName?: string;
  receivedDate?: string;
  company?: string;
  requiredTime?: string;
  deliveryPlan?: string;
  priorityLevel?: number;
  purchaseStaff?: string;
  supplierName?: string;
  poNumber?: string;
  orderStatus?: string;
  accountingMaterial?: string;
  taxStatus?: string;
  accountingPayment?: string;
  paymentStatus?: string;
  receivedStatus?: string;
  warehouseConfirm?: string;
  surplusShortage?: string;
}

function statusBadgeClass(status?: string) {
  if (!status) return 'bg-slate-100 text-slate-500';
  if (status.includes('Hoàn thành')) return 'bg-green-100 text-green-700';
  if (status.includes('Thanh Toán') || status.includes('Thanh toán')) return 'bg-blue-100 text-blue-700';
  if (status.includes('KT kiểm tra')) return 'bg-amber-100 text-amber-700';
  if (status.includes('Chưa lên đơn')) return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-600';
}

export default function RequestsPage() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<PurchaseRequest | null>(null);
  const [formData, setFormData] = useState({
    department: '',
    company: '',
    note: '',
    requiredTime: '',
    deliveryPlan: '',
    priorityLevel: '2',
    items: [{ name: '', unit: 'Kg', quantity: 1 }],
  });

  useEffect(() => {
    fetchPRs();
  }, []);

  const fetchPRs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/purchase-requests');
      if (res.ok) {
        setPrs(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchPRs();
        setShowModal(false);
        setFormData({
          department: '',
          company: '',
          note: '',
          requiredTime: '',
          deliveryPlan: '',
          priorityLevel: '2',
          items: [{ name: '', unit: 'Kg', quantity: 1 }],
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đề xuất mua hàng</h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi tiến độ phiếu đề xuất · tạo đề xuất mới trực tuyến</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Tạo đề xuất mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[13px] font-semibold text-slate-700">
                <th className="py-3 px-4">Số phiếu đề xuất</th>
                <th className="py-3 px-4">Người gửi</th>
                <th className="py-3 px-4">Ngày nhận</th>
                <th className="py-3 px-4">Nội dung</th>
                <th className="py-3 px-4">Công ty</th>
                <th className="py-3 px-4">Đơn vị</th>
                <th className="py-3 px-4">NCC</th>
                <th className="py-3 px-4">Số ĐH</th>
                <th className="py-3 px-4">Tình trạng đơn hàng</th>
                <th className="py-3 px-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : prs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-slate-500">Chưa có đề xuất nào</td>
                </tr>
              ) : (
                prs.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{pr.proposalCode || pr.code}</td>
                    <td className="py-3 px-4 text-slate-600">{pr.senderName || pr.requester.name}</td>
                    <td className="py-3 px-4 text-slate-500">{fmtDate(pr.receivedDate || pr.createdAt)}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={pr.note}>{pr.note || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{pr.company || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{pr.department || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{pr.supplierName || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{pr.poNumber || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(pr.orderStatus)}`}>
                        {pr.orderStatus || pr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setDetail(pr)}
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
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          Hiển thị <strong>{prs.length}</strong> đề xuất
        </div>
      </div>

      {/* Modal: Tạo đề xuất mới */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-slate-50">
              <h3 className="font-bold text-slate-800">Tạo đề xuất mua hàng mới</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Công ty</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="VD: ERC-B, BP, SV"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn vị / Phòng ban</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="VD: ERC, ASDS, BP3"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung đề xuất</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Mô tả hàng hoá / dịch vụ cần mua"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian yêu cầu hoàn thành</label>
                  <input
                    type="text"
                    value={formData.requiredTime}
                    onChange={(e) => setFormData({ ...formData, requiredTime: e.target.value })}
                    placeholder="VD: 31/7/2026"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cấp độ yêu cầu</label>
                  <select
                    value={formData.priorityLevel}
                    onChange={(e) => setFormData({ ...formData, priorityLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="1">1 - Khẩn cấp</option>
                    <option value="2">2 - Bình thường</option>
                    <option value="3">3 - Không gấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kế hoạch giao hàng</label>
                <input
                  type="text"
                  value={formData.deliveryPlan}
                  onChange={(e) => setFormData({ ...formData, deliveryPlan: e.target.value })}
                  placeholder="VD: GD1: 31/7, GD2: 10/8"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Gửi đề xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chi tiết tiến độ */}
      {detail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {detail.proposalCode || detail.code}
              </h3>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <p className="text-slate-700"><strong>Nội dung:</strong> {detail.note || '—'}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500">Người gửi:</span> <span className="font-medium">{detail.senderName || detail.requester.name}</span></div>
                <div><span className="text-slate-500">Ngày nhận:</span> <span className="font-medium">{fmtDate(detail.receivedDate || detail.createdAt)}</span></div>
                <div><span className="text-slate-500">Công ty:</span> <span className="font-medium">{detail.company || '—'}</span></div>
                <div><span className="text-slate-500">Đơn vị:</span> <span className="font-medium">{detail.department || '—'}</span></div>
                <div><span className="text-slate-500">Thời gian yêu cầu:</span> <span className="font-medium">{detail.requiredTime || '—'}</span></div>
                <div><span className="text-slate-500">Kế hoạch giao hàng:</span> <span className="font-medium">{detail.deliveryPlan || '—'}</span></div>
                <div><span className="text-slate-500">Cấp độ:</span> <span className="font-medium">{detail.priorityLevel ?? '—'}</span></div>
                <div><span className="text-slate-500">Nhân sự TM phụ trách:</span> <span className="font-medium">{detail.purchaseStaff || '—'}</span></div>
                <div><span className="text-slate-500">NCC:</span> <span className="font-medium">{detail.supplierName || '—'}</span></div>
                <div><span className="text-slate-500">Số đơn hàng:</span> <span className="font-medium">{detail.poNumber || '—'}</span></div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Tiến độ xử lý</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Kế toán vật tư</span>
                    <span className="font-medium">{detail.accountingMaterial || '—'}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Thuế</span>
                    <span className="font-medium">{detail.taxStatus || '—'}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Kế toán thanh toán</span>
                    <span className="font-medium">{detail.accountingPayment || '—'}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Nhận hàng</span>
                    <span className="font-medium">{detail.receivedStatus || '—'}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Xác nhận kho</span>
                    <span className="font-medium">{detail.warehouseConfirm || '—'}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Thừa/thiếu</span>
                    <span className="font-medium">{detail.surplusShortage || '—'}</span>
                  </div>
                </div>
                {detail.paymentStatus && (
                  <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                    <strong>Ghi chú thanh toán:</strong> {detail.paymentStatus}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass(detail.orderStatus)}`}>
                  {detail.orderStatus || detail.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
