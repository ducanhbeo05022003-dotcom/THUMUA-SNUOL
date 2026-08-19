'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  unit: string;
  category: string;
  stage?: string;
  techSpec?: string;
  norm?: number;
  normUnit?: string;
}

const CATEGORIES = [
  'Vườn ươm',
  'Chăm sóc vườn - Phân bón',
  'BVTV & Vi sinh',
  'Thức ăn chăn nuôi',
  'An sinh đời sống'
];

const WORKFLOW_STEPS = [
  { num: 1, label: 'Định mức', active: true },
  { num: 2, label: 'Nhu cầu' },
  { num: 3, label: 'Tổng hợp → Đề xuất' },
  { num: 9, label: 'Đóng đơn' }
];

export default function NormsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/materials');
      if (res.ok) {
        setMaterials(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(m => m.category === activeCategory);

  const handleSave = async () => {
    if (!formData.name) return;

    try {
      const url = editingId
        ? `/api/materials/${editingId}`
        : `/api/materials`;

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchData();
        setShowModal(false);
        setEditingId(null);
        setFormData({
          name: '', unit: 'Kg', category: activeCategory, norm: 1, normUnit: 'Kg/cây', stage: '', techSpec: ''
        });
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xác nhận xóa?')) {
      try {
        await fetch(`/api/materials/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        name: '', unit: 'Kg', category: activeCategory, norm: 1, normUnit: 'Kg/cây', stage: '', techSpec: ''
      });
    }
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Định mức vật tư</h1>
        <p className="text-slate-500">Định mức trên 1 đơn vị sản lượng • dùng để tính nhu cầu tự động</p>
      </div>

      {/* Workflow Diagram */}
      <div className="mb-6 bg-slate-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          {WORKFLOW_STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition ${
                  step.active
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-600'
                }`}
              >
                {step.num}
              </div>
              <span className={`ml-2 font-medium text-sm ${step.active ? 'text-blue-600' : 'text-slate-600'}`}>
                {step.label}
              </span>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div className="flex-1 h-1 mx-4 bg-slate-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 border-b border-slate-200 flex gap-6 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pb-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
              activeCategory === cat
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Action Button */}
      <div className="mb-4">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
        >
          <Plus className="w-4 h-4" />
          Thêm định mức
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Tên vật tư</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">ĐVT</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Định mức</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">ĐVT định mức</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Giai đoạn</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Tiêu chuẩn KT</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">Chưa có dữ liệu trong danh mục này</td>
                </tr>
              ) : (
                filteredMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-900 font-semibold">{m.name}</td>
                    <td className="px-4 py-3 text-slate-600">{m.unit}</td>
                    <td className="px-4 py-3 text-right text-slate-900 font-medium">
                      {m.norm || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.normUnit || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{m.stage || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-xs truncate" title={m.techSpec}>
                      {m.techSpec || '—'}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => openModal(m)}
                        className="inline-block p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="inline-block p-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800">
                {editingId ? 'Chỉnh sửa' : 'Thêm mới'} định mức
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên vật tư *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ĐVT *</label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giai đoạn</label>
                  <input
                    type="text"
                    value={formData.stage || ''}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Định mức</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.norm || ''}
                    onChange={(e) => setFormData({ ...formData, norm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Đơn vị định mức</label>
                <input
                  type="text"
                  value={formData.normUnit || ''}
                  onChange={(e) => setFormData({ ...formData, normUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Kg/cây"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu chuẩn kỹ thuật</label>
                <textarea
                  rows={2}
                  value={formData.techSpec || ''}
                  onChange={(e) => setFormData({ ...formData, techSpec: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
