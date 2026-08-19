'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { requireAuth } from '@/lib/auth';

interface Supplier {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Material {
  id: string;
  name: string;
  unit: string;
  category: string;
}

export default function MastersPage() {
  const [tab, setTab] = useState<'suppliers' | 'materials'>('suppliers');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'suppliers') {
        const res = await fetch('/api/suppliers');
        if (res.ok) {
          setSuppliers(await res.json());
        }
      } else {
        const res = await fetch('/api/materials');
        if (res.ok) {
          setMaterials(await res.json());
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) return;

    try {
      const url = editingId
        ? `/api/${tab}/${editingId}`
        : `/api/${tab}`;

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchData();
        setShowModal(false);
        setEditingId(null);
        setFormData({});
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xác nhận xóa?')) {
      try {
        await fetch(`/api/${tab}/${id}`, { method: 'DELETE' });
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
      setFormData(tab === 'suppliers'
        ? { code: '', name: '', email: '', phone: '' }
        : { name: '', unit: 'Kg', category: '' }
      );
    }
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Danh mục</h1>
        <p className="text-slate-500">Quản lý nhà cung cấp và vật tư</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        {(['suppliers', 'materials'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-2 font-medium border-b-2 transition ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t === 'suppliers' ? 'Nhà cung cấp' : 'Vật tư'}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="mb-4">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
        >
          <Plus className="w-4 h-4" />
          {tab === 'suppliers' ? 'Thêm NCC' : 'Thêm vật tư'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {tab === 'suppliers' ? (
                  <>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Tên</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Điện thoại</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Hành động</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Tên</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">ĐVT</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Danh mục</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Hành động</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    Đang tải...
                  </td>
                </tr>
              ) : tab === 'suppliers' ? (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">{s.code}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.phone || '—'}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => openModal(s)}
                        className="inline-block p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="inline-block p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                materials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-slate-600">{m.unit}</td>
                    <td className="px-4 py-3 text-slate-600">{m.category}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => openModal(m)}
                        className="inline-block p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="inline-block p-1 text-red-600 hover:bg-red-50 rounded"
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {editingId ? 'Chỉnh sửa' : 'Thêm mới'} {tab === 'suppliers' ? 'nhà cung cấp' : 'vật tư'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form className="p-4 space-y-3">
              {tab === 'suppliers' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Mã NCC</label>
                    <input
                      type="text"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Tên</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Tên vật tư</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ĐVT</label>
                    <input
                      type="text"
                      value={formData.unit || ''}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Danh mục</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}
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
