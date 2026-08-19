'use client';

import { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';

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
}

export default function RequestsPage() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    note: '',
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
          note: '',
          items: [{ name: '', unit: 'Kg', quantity: 1 }],
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Đề xuất mua hàng</h1>
        <p className="text-slate-500">Tạo và quản lý yêu cầu mua hàng</p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
        >
          <Plus className="w-4 h-4" />
          Tạo đề xuất mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Phòng ban</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Người yêu cầu</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày tạo</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : prs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">Chưa có đề xuất nào</td>
                </tr>
              ) : (
                prs.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{pr.code}</td>
                    <td className="px-4 py-3 text-slate-600">{pr.department || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{pr.requester.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pr.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                        pr.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        pr.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {new Date(pr.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="inline-block p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800">Tạo đề xuất mua hàng</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">✕</button>
            </div>
            <form className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phòng ban</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  placeholder="VD: Vườn ươm, Chăm sóc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
